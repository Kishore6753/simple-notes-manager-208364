import React, { useEffect, useMemo, useState } from "react";
import Button from "./Button";
import TextInput from "./TextInput";
import TextArea from "./TextArea";
import { validateNoteInput } from "../utils/validation";

// PUBLIC_INTERFACE
export default function NoteEditor({
  mode, // "create" | "edit"
  note,
  onCreate,
  onUpdate,
  onCancelEdit,
  isSaving,
}) {
  /** Note creation/editing form. Controlled inputs with basic validation. */
  const initial = useMemo(
    () => ({
      title: mode === "edit" ? note?.title ?? "" : "",
      content: mode === "edit" ? note?.content ?? "" : "",
    }),
    [mode, note]
  );

  const [title, setTitle] = useState(initial.title);
  const [content, setContent] = useState(initial.content);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setTitle(initial.title);
    setContent(initial.content);
    setErrors({});
  }, [initial.title, initial.content]);

  const submitLabel = mode === "edit" ? "Save changes" : "Create note";
  const header = mode === "edit" ? "Edit note" : "New note";

  const onSubmit = async (e) => {
    e.preventDefault();

    const validation = validateNoteInput({ title, content });
    if (!validation.ok) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    if (mode === "edit") {
      await onUpdate({ ...note, title: title.trim(), content: content.trim() });
      return;
    }

    await onCreate({ title: title.trim(), content: content.trim() });
    setTitle("");
    setContent("");
  };

  return (
    <section className="panel editor" aria-label="Note editor">
      <div className="panel-header">
        <div>
          <div className="panel-title">{header}</div>
          <div className="panel-text">
            {mode === "edit"
              ? "Update your note, then save."
              : "Write something memorable. Keep it retro."}
          </div>
        </div>

        {mode === "edit" ? (
          <Button variant="ghost" size="sm" onClick={onCancelEdit} disabled={isSaving}>
            Exit edit
          </Button>
        ) : null}
      </div>

      <form onSubmit={onSubmit}>
        <TextInput
          id="note-title"
          label="Title"
          value={title}
          onChange={setTitle}
          placeholder="E.g. Shopping list"
          error={errors.title}
          maxLength={80}
          required
          autoFocus={mode !== "edit"}
          disabled={isSaving}
        />

        <TextArea
          id="note-content"
          label="Content"
          value={content}
          onChange={setContent}
          placeholder="Write your note here..."
          error={errors.content}
          maxLength={5000}
          required
          rows={10}
          disabled={isSaving}
        />

        <div className="editor-actions">
          <Button type="submit" variant="primary" isLoading={isSaving}>
            {submitLabel}
          </Button>
          <div className="editor-hint">
            Tip: Use short titles (max 80 chars). Content up to 5000.
          </div>
        </div>
      </form>
    </section>
  );
}
