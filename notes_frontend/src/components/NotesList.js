import React from "react";
import Button from "./Button";

// PUBLIC_INTERFACE
export default function NotesList({
  notes,
  selectedId,
  onSelect,
  onDelete,
  isDeletingId,
}) {
  /** Sidebar list of notes with selection and delete buttons. */
  if (!notes || notes.length === 0) {
    return (
      <div className="panel panel-muted">
        <div className="panel-title">No notes yet</div>
        <div className="panel-text">Create your first note on the right.</div>
      </div>
    );
  }

  return (
    <ul className="notes-list" aria-label="Notes list">
      {notes.map((note) => {
        const isSelected = String(note.id) === String(selectedId);
        return (
          <li
            key={note.id}
            className={`note-row ${isSelected ? "note-row-selected" : ""}`}
          >
            <button
              type="button"
              className="note-row-main"
              onClick={() => onSelect(note)}
              aria-label={`Open note ${note.title}`}
            >
              <div className="note-title">{note.title}</div>
              <div className="note-meta">
                {note.updated_at ? `Updated ${new Date(note.updated_at).toLocaleString()}` : ""}
              </div>
            </button>

            <div className="note-row-actions">
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete(note)}
                isLoading={String(isDeletingId) === String(note.id)}
                ariaLabel={`Delete note ${note.title}`}
              >
                Delete
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
