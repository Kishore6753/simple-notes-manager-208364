const DEFAULT_TIMEOUT_MS = 15000;

function getApiBaseUrl() {
  // CRA exposes env vars at build time. This is already present in the container .env.
  return (
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_BACKEND_URL ||
    "http://localhost:3001"
  );
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

async function parseJsonSafely(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function buildErrorMessage(status, payload) {
  if (payload && typeof payload === "object") {
    // Common FastAPI validation error shape: { detail: [...] } or { detail: "..." }
    if (payload.detail) {
      if (Array.isArray(payload.detail)) return payload.detail.map((d) => d.msg).join(", ");
      if (typeof payload.detail === "string") return payload.detail;
    }
    if (payload.message && typeof payload.message === "string") return payload.message;
  }
  if (typeof payload === "string" && payload.trim()) return payload;
  return `Request failed (HTTP ${status})`;
}

async function requestJson(path, options = {}) {
  const base = getApiBaseUrl();
  const url = `${base}${path}`;

  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : null),
    ...(options.headers || null),
  };

  let response;
  try {
    response = await fetchWithTimeout(url, { ...options, headers });
  } catch (err) {
    const message =
      err?.name === "AbortError"
        ? "Request timed out. Please try again."
        : "Network error. Please check your connection and backend URL.";
    const e = new Error(message);
    e.cause = err;
    throw e;
  }

  const payload = await parseJsonSafely(response);

  if (!response.ok) {
    const e = new Error(buildErrorMessage(response.status, payload));
    e.status = response.status;
    e.payload = payload;
    throw e;
  }

  return payload;
}

// PUBLIC_INTERFACE
export async function listNotes() {
  /** Fetch all notes from the backend. */
  return requestJson("/notes", { method: "GET" });
}

// PUBLIC_INTERFACE
export async function createNote(noteInput) {
  /** Create a new note. Expects { title, content }. */
  return requestJson("/notes", { method: "POST", body: JSON.stringify(noteInput) });
}

// PUBLIC_INTERFACE
export async function updateNote(noteId, noteInput) {
  /** Update an existing note by id. Expects { title, content }. */
  return requestJson(`/notes/${encodeURIComponent(noteId)}`, {
    method: "PUT",
    body: JSON.stringify(noteInput),
  });
}

// PUBLIC_INTERFACE
export async function deleteNote(noteId) {
  /** Delete a note by id. */
  return requestJson(`/notes/${encodeURIComponent(noteId)}`, { method: "DELETE" });
}
