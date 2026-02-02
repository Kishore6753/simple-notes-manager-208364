import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import NotesList from "./components/NotesList";
import NoteEditor from "./components/NoteEditor";
import StatusBanner from "./components/StatusBanner";
import { createNote, deleteNote, listNotes, updateNote } from "./api/notesApi";

function sortNotes(notes) {
  // Prefer updated_at/created_at if present; otherwise keep stable id sort.
  return [...notes].sort((a, b) => {
    const aTime = a.updated_at || a.created_at || "";
    const bTime = b.updated_at || b.created_at || "";
    if (aTime && bTime) return String(bTime).localeCompare(String(aTime));
    return String(b.id).localeCompare(String(a.id));
  });
}

// PUBLIC_INTERFACE
function App() {
  /** Notes manager app entry component (retro theme + backend CRUD integration). */
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const apiBase = useMemo(
    () => process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || "",
    []
  );

  const refresh = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const data = await listNotes();
      const normalized = Array.isArray(data) ? data : [];
      setNotes(sortNotes(normalized));

      // If selected note no longer exists, clear selection.
      if (selectedNote) {
        const stillThere = normalized.find((n) => String(n.id) === String(selectedNote.id));
        setSelectedNote(stillThere || null);
      }
    } catch (e) {
      setLoadError(e.message || "Failed to load notes.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (noteInput) => {
    setIsSaving(true);
    setSaveError("");
    try {
      const created = await createNote(noteInput);
      // Optimistic update, then refresh to stay consistent with backend schema.
      setNotes((prev) => sortNotes([created, ...prev]));
      setSelectedNote(created);
      await refresh();
    } catch (e) {
      setSaveError(e.message || "Failed to create note.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (noteToSave) => {
    setIsSaving(true);
    setSaveError("");
    try {
      const updated = await updateNote(noteToSave.id, {
        title: noteToSave.title,
        content: noteToSave.content,
      });

      setNotes((prev) =>
        sortNotes(prev.map((n) => (String(n.id) === String(updated.id) ? updated : n)))
      );
      setSelectedNote(updated);
      await refresh();
    } catch (e) {
      setSaveError(e.message || "Failed to update note.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (note) => {
    setDeleteError("");
    const ok = window.confirm(`Delete "${note.title}"? This cannot be undone.`);
    if (!ok) return;

    setDeletingId(note.id);
    try {
      await deleteNote(note.id);

      setNotes((prev) => prev.filter((n) => String(n.id) !== String(note.id)));
      if (selectedNote && String(selectedNote.id) === String(note.id)) {
        setSelectedNote(null);
      }
      await refresh();
    } catch (e) {
      setDeleteError(e.message || "Failed to delete note.");
    } finally {
      setDeletingId(null);
    }
  };

  const editorMode = selectedNote ? "edit" : "create";

  return (
    <div className="App">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            ⬣
          </div>
          <div>
            <div className="brand-title">Retro Notes</div>
            <div className="brand-subtitle">A tiny notes manager with big CRT energy</div>
          </div>
        </div>

        <div className="topbar-meta">
          <div className="pill" title="Backend base URL">
            API: <span className="mono">{apiBase || "(not set)"}</span>
          </div>
          <button className="linklike" type="button" onClick={refresh} disabled={isLoading}>
            Refresh
          </button>
        </div>
      </header>

      <main className="layout">
        <aside className="sidebar" aria-label="Notes sidebar">
          <div className="sidebar-header">
            <div className="sidebar-title">Notes</div>
            <div className="sidebar-count">{notes.length}</div>
          </div>

          {isLoading ? (
            <div className="panel panel-muted">
              <div className="panel-title">Loading…</div>
              <div className="panel-text">Dialing the backend like it’s 1999.</div>
            </div>
          ) : null}

          {loadError ? (
            <StatusBanner
              kind="error"
              title="Could not load notes"
              message={loadError}
            />
          ) : null}

          {deleteError ? (
            <StatusBanner
              kind="error"
              title="Delete failed"
              message={deleteError}
            />
          ) : null}

          {!isLoading && !loadError ? (
            <NotesList
              notes={notes}
              selectedId={selectedNote?.id ?? null}
              onSelect={(n) => setSelectedNote(n)}
              onDelete={handleDelete}
              isDeletingId={deletingId}
            />
          ) : null}
        </aside>

        <section className="content" aria-label="Editor section">
          {saveError ? (
            <StatusBanner kind="error" title="Save failed" message={saveError} />
          ) : null}

          <NoteEditor
            mode={editorMode}
            note={selectedNote}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onCancelEdit={() => setSelectedNote(null)}
            isSaving={isSaving}
          />

          <footer className="footer">
            <div className="footer-left">
              <span className="mono">CRUD</span> over REST •{" "}
              <span className="mono">Loading</span>/<span className="mono">Error</span> states •{" "}
              <span className="mono">Validation</span> on submit
            </div>
            <div className="footer-right">
              {selectedNote ? (
                <span className="pill">
                  Editing: <span className="mono">{selectedNote.id}</span>
                </span>
              ) : (
                <span className="pill">Create mode</span>
              )}
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default App;
