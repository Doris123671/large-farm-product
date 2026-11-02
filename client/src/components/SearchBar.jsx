import { useEffect, useState } from 'react';

export default function SearchBar({ value, onChange, delay = 400 }) {
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  useEffect(() => {
    if (draft === value) return undefined;
    const timeout = window.setTimeout(() => onChange(draft), delay);
    return () => window.clearTimeout(timeout);
  }, [draft, delay, onChange, value]);

  return (
    <label className="search-control">
      <span className="control-label">Find a book</span>
      <span className="search-input-wrap">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="10.8" cy="10.8" r="6.8" />
          <path d="m16 16 4.5 4.5" />
        </svg>
        <input
          type="search"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Title or author..."
          aria-label="Search by title or author"
        />
        {draft && (
          <button className="clear-search" type="button" onClick={() => setDraft('')} aria-label="Clear search">
            ×
          </button>
        )}
      </span>
    </label>
  );
}
