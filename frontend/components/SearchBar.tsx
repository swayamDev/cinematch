"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { searchTitles } from "@/lib/api";

interface SearchBarProps {
  onSearch: (title: string) => void;
  loading: boolean;
}

export default function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); return; }
    const results = await searchTitles(q);
    setSuggestions(results);
    setShowSuggestions(results.length > 0);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 280);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [value, fetchSuggestions]);

  const commit = (title: string) => {
    setValue(title);
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveIdx(-1);
    onSearch(title);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && suggestions[activeIdx]) commit(suggestions[activeIdx]);
      else if (value.trim()) commit(value.trim());
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative flex items-center gap-4">
        <input
          ref={inputRef}
          className="search-input flex-1"
          placeholder="e.g. Inception, Parasite, Toy Story…"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setActiveIdx(-1);
            if (e.target.value === "") setShowSuggestions(false);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          autoComplete="off"
          spellCheck={false}
          aria-label="Movie title"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
        />
        <button
          className="btn-primary"
          onClick={() => value.trim() && commit(value.trim())}
          disabled={loading || !value.trim()}
        >
          {loading ? (
            <>
              <span
                style={{
                  display: "inline-block",
                  width: 14,
                  height: 14,
                  border: "2.5px solid rgba(223,241,64,0.3)",
                  borderTopColor: "var(--primary)",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                }}
              />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              Searching
            </>
          ) : (
            "Recommend →"
          )}
        </button>
      </div>

      {showSuggestions && (
        <ul
          role="listbox"
          className="suggestions-dropdown"
        >
          {suggestions.map((title, i) => (
            <li
              key={title}
              role="option"
              aria-selected={i === activeIdx}
              onMouseDown={() => commit(title)}
              className={`suggestion-item${i === activeIdx ? " suggestion-item--active" : ""}`}
            >
              {title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
