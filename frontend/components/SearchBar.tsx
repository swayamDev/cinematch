"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FaMagnifyingGlass, FaSpinner } from "react-icons/fa6";
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
  const [autocompleteLoading, setAutocompleteLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectingRef = useRef(false);
  // When true, the next debounce tick is skipped (set after commit)
  const suppressRef = useRef(false);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (suppressRef.current) {
      suppressRef.current = false;
      return;
    }
    if (q.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setAutocompleteLoading(true);
    const results = await searchTitles(q);
    setAutocompleteLoading(false);
    setSuggestions(results);
    setShowSuggestions(results.length > 0);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 280);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, fetchSuggestions]);

  const commit = (title: string) => {
    // Cancel pending debounce and suppress the next one triggered by setValue
    if (debounceRef.current) clearTimeout(debounceRef.current);
    suppressRef.current = true;
    selectingRef.current = false;
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
      if (activeIdx >= 0 && suggestions[activeIdx])
        commit(suggestions[activeIdx]);
      else if (value.trim()) commit(value.trim());
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div className="search-bar-layout">
        <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
          <label htmlFor="movie-search" className="sr-only">
            Search for a movie
          </label>

          <input
            ref={inputRef}
            id="movie-search"
            name="movie-search"
            className="search-input"
            placeholder="e.g. Inception, Parasite, Toy Story"
            value={value}
            onChange={(e) => {
              suppressRef.current = false; // user is typing again — allow suggestions
              setValue(e.target.value);
              setActiveIdx(-1);
              if (e.target.value === "") {
                setSuggestions([]);
                setShowSuggestions(false);
              }
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => {
              if (selectingRef.current) return;
              setShowSuggestions(false);
            }}
            autoComplete="off"
            spellCheck={false}
            aria-label="Movie title"
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
          />

          {autocompleteLoading && (
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                right: 8,
                bottom: 14,
                color: "var(--muted-2)",
                fontSize: 11,
                animation: "spin 0.7s linear infinite",
                display: "inline-block",
              }}
            >
              ◌
            </span>
          )}
        </div>

        <button
          className="btn-primary search-bar-btn"
          onClick={() => value.trim() && commit(value.trim())}
          disabled={loading || !value.trim()}
        >
          {loading ? (
            <>
              <FaSpinner style={{ animation: "spin 0.7s linear infinite" }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              Searching
            </>
          ) : (
            <>
              <FaMagnifyingGlass size={13} />
              Recommend
            </>
          )}
        </button>
      </div>

      {showSuggestions && (
        <ul role="listbox" className="suggestions-dropdown">
          {suggestions.map((title, i) => (
            <li
              key={title}
              role="option"
              aria-selected={i === activeIdx}
              onMouseDown={() => {
                selectingRef.current = true;
              }}
              onMouseUp={() => commit(title)}
              onMouseLeave={() => {
                selectingRef.current = false;
              }}
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
