"use client";

import { useState, useRef, useEffect } from "react";

interface InlineEditorProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  tag?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}

export default function InlineEditor({
  value,
  onSave,
  tag: Tag = "p",
  className = "",
  placeholder = "Click to edit...",
  multiline = true,
}: InlineEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  function handleClick() {
    setEditing(true);
    setDraft(value);
  }

  function handleBlur() {
    if (draft !== value) {
      setSaving(true);
      onSave(draft).finally(() => {
        setSaving(false);
        setEditing(false);
      });
    } else {
      setEditing(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!multiline && e.key === "Enter") {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
    if (e.key === "Escape") {
      setDraft(value);
      setEditing(false);
    }
  }

  if (editing) {
    if (multiline) {
      return (
        <textarea
          ref={ref as any}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`w-full bg-white border-2 border-[#004527] rounded-lg p-2 outline-none resize-y ${className}`}
          rows={Math.max(3, draft.split("\n").length)}
          autoFocus
        />
      );
    }
    return (
      <input
        ref={ref as any}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`w-full bg-white border-2 border-[#004527] rounded-lg p-1 outline-none ${className}`}
        autoFocus
      />
    );
  }

  return (
    <Tag
      ref={ref as any}
      onClick={handleClick}
      className={`cursor-pointer hover:bg-[#004527]/5 hover:rounded px-1 -mx-1 transition-colors group relative ${className}`}
      title="Click to edit"
    >
      {value || <span className="text-on-surface-variant/50 italic">{placeholder}</span>}
      {saving && (
        <span className="absolute -right-6 top-1/2 -translate-y-1/2">
          <span className="material-symbols-outlined text-[12px] text-[#004527] animate-spin">progress_activity</span>
        </span>
      )}
      <span className="material-symbols-outlined text-[10px] text-on-surface-variant/0 group-hover:text-on-surface-variant/50 absolute -right-5 top-1/2 -translate-y-1/2 transition-colors">
        edit
      </span>
    </Tag>
  );
}
