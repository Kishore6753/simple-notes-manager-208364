// PUBLIC_INTERFACE
export function validateNoteInput({ title, content }) {
  /** Validate note input for create/update. Returns { ok, errors }. */
  const errors = {};

  const titleTrimmed = (title ?? "").trim();
  const contentTrimmed = (content ?? "").trim();

  if (!titleTrimmed) errors.title = "Title is required.";
  if (titleTrimmed.length > 80) errors.title = "Title must be 80 characters or less.";

  if (!contentTrimmed) errors.content = "Content is required.";
  if (contentTrimmed.length > 5000) errors.content = "Content must be 5000 characters or less.";

  return { ok: Object.keys(errors).length === 0, errors };
}
