"use client";

import { useState, KeyboardEvent } from "react";

interface TagInputProps {
  label: string;
  placeholder: string;
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ label, placeholder, tags, onChange }: TagInputProps) {
  const [input, setInput] = useState("");

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      addTag();
    }
  }

  function addTag() {
    const trimmed = input.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  }

  function removeTag(index: number) {
    onChange(tags.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label className="label text-xs sm:text-sm block mb-3">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="input text-sm sm:text-base flex-1"
        />
        <button
          type="button"
          onClick={addTag}
          className="btn-secondary text-xs sm:text-sm px-3 sm:px-4 shrink-0"
        >
          Add
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-4">
          {tags.map((tag, index) => (
            <span key={index} className="tag text-xs sm:text-sm">
              {tag}
              <button
                onClick={() => removeTag(index)}
                className="ml-1.5 sm:ml-2 hover:text-accent"
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
