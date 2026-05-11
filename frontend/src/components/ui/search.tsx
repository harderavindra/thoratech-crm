import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Search, X, Clock, Loader2 } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type SearchSize = "sm" | "md" | "lg";

export interface SearchResult {
  id: string;
  label: string;
  sublabel?: string;
  type?: string;
  initials?: string;
  avatarColor?: string;
}

export interface SearchFilter {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "onChange" | "results"> {
  /** Input size token */
  size?: SearchSize;
  /** Show animated spinner (e.g. while debounce fetch is in flight) */
  loading?: boolean;
  /** Keyboard shortcut displayed on the right (e.g. "/" or "⌘K") */
  shortcut?: string;
  /** Controlled value */
  value?: string;
  /** Called on every keystroke */
  onChange?: (value: string) => void;
  /** Called when the clear button is clicked */
  onClear?: () => void;
  /** Dropdown results — renders result list when provided and non-empty */
  searchResults?: SearchResult[];
  /** Called when a result is selected */
  onSelectResult?: (result: SearchResult) => void;
  /** Recent searches — rendered at the bottom of the dropdown */
  recentSearches?: string[];
  /** Called when a recent search is removed */
  onRemoveRecent?: (query: string) => void;
  /** Filter chips rendered below the input */
  filters?: SearchFilter[];
  /** Currently active filter key */
  activeFilter?: string;
  /** Called when a filter chip is toggled */
  onFilterChange?: (key: string) => void;
  /** Shown inside the dropdown when searchResults is an empty array */
  emptyMessage?: string;
  /** Extra className on the root wrapper */
  className?: string;
}

// ─────────────────────────────────────────────────────────────
// Size maps
// ─────────────────────────────────────────────────────────────

const INPUT_SIZE: Record<SearchSize, string> = {
  sm: "h-[30px] text-[12.5px]",
  md: "h-9      text-[13.5px]",
  lg: "h-[42px] text-[14.5px]",
};

const ICON_SIZE: Record<SearchSize, number> = { sm: 14, md: 16, lg: 18 };
const ICON_LEFT: Record<SearchSize, string>  = { sm: "left-2",    md: "left-2.5",  lg: "left-3"   };
const PAD_LEFT:  Record<SearchSize, string>  = { sm: "pl-[28px]", md: "pl-[34px]", lg: "pl-[40px]" };

// ─────────────────────────────────────────────────────────────
// Highlight — wraps matched chars in <mark>
// ─────────────────────────────────────────────────────────────

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-rose-50 text-rose-500 rounded-[2px] px-px not-italic">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// ResultItem
// ─────────────────────────────────────────────────────────────

function ResultItem({
  result,
  query,
  active,
  onSelect,
}: {
  result: SearchResult;
  query: string;
  active: boolean;
  onSelect: (r: SearchResult) => void;
}) {
  return (
    <div
      role="option"
      aria-selected={active}
      onClick={() => onSelect(result)}
      className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors ${
        active ? "bg-gray-50 dark:bg-gray-800" : "hover:bg-gray-50 dark:hover:bg-gray-800"
      }`}
    >
      {result.initials && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium shrink-0"
          style={{ background: result.avatarColor ?? "#FFF0F5", color: "#FF2D78" }}
        >
          {result.initials}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-gray-900 dark:text-gray-100 m-0 truncate">
          <Highlight text={result.label} query={query} />
        </p>
        {result.sublabel && (
          <p className="text-[11px] text-gray-400 dark:text-gray-500 m-0 truncate">
            {result.sublabel}
          </p>
        )}
      </div>
      {result.type && (
        <span className="text-[11px] text-gray-400 dark:text-gray-500 shrink-0">{result.type}</span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FilterChip
// ─────────────────────────────────────────────────────────────

function FilterChip({
  filter,
  active,
  onClick,
}: {
  filter: SearchFilter;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={active}
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2.5 py-[3px] rounded-full text-[11.5px] font-medium border transition-colors duration-100 cursor-pointer whitespace-nowrap ${
        active
          ? "bg-rose-50 text-rose-500 border-rose-200"
          : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
      }`}
    >
      {filter.icon && <span className="flex items-center">{filter.icon}</span>}
      {filter.label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// SearchInput
// ─────────────────────────────────────────────────────────────

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      size = "md",
      loading = false,
      shortcut,
      value: controlledValue,
      onChange,
      onClear,
      searchResults,
      onSelectResult,
      recentSearches,
      onRemoveRecent,
      filters,
      activeFilter,
      onFilterChange,
      emptyMessage = "No results found",
      className = "",
      placeholder = "Search…",
      ...rest
    },
    ref,
  ) => {
    const inputId = useId();
    const listId  = useId();
    const wrapRef = useRef<HTMLDivElement>(null);

    const [internalValue, setInternalValue] = useState("");
    const value = controlledValue ?? internalValue;

    const [open, setOpen]         = useState(false);
    const [activeIdx, setActiveIdx] = useState(-1);

    const hasResults  = Array.isArray(searchResults);
    const showDropdown = open && (hasResults || (recentSearches && recentSearches.length > 0));
    const hasValue     = value.length > 0;
    const showClear    = hasValue && !loading;
    const showShortcut = !hasValue && !loading && shortcut;

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        if (controlledValue === undefined) setInternalValue(v);
        onChange?.(v);
        setOpen(true);
        setActiveIdx(-1);
      },
      [controlledValue, onChange],
    );

    const handleClear = useCallback(() => {
      if (controlledValue === undefined) setInternalValue("");
      onChange?.("");
      onClear?.();
      setOpen(false);
      setActiveIdx(-1);
    }, [controlledValue, onChange, onClear]);

    const handleSelect = useCallback(
      (result: SearchResult) => {
        if (controlledValue === undefined) setInternalValue(result.label);
        onChange?.(result.label);
        onSelectResult?.(result);
        setOpen(false);
      },
      [controlledValue, onChange, onSelectResult],
    );

    // Close on outside click
    useEffect(() => {
      const handler = (e: MouseEvent) => {
        if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Keyboard / shortcut
    useEffect(() => {
      if (!shortcut) return;
      const handler = (e: KeyboardEvent) => {
        if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
          e.preventDefault();
          document.getElementById(inputId)?.focus();
        }
      };
      document.addEventListener("keydown", handler);
      return () => document.removeEventListener("keydown", handler);
    }, [shortcut, inputId]);

    const allResults = searchResults ?? [];

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showDropdown) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, allResults.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, -1));
      } else if (e.key === "Enter" && activeIdx >= 0 && allResults[activeIdx]) {
        handleSelect(allResults[activeIdx]);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };

    const iconSize    = ICON_SIZE[size];
    const iconLeftCls = ICON_LEFT[size];
    const padLeftCls  = PAD_LEFT[size];
    const padRight    = showClear || showShortcut || loading ? "pr-9" : "pr-3";

    return (
      <div ref={wrapRef} className={`flex flex-col gap-2 ${className}`}>
        {/* Input row */}
        <div className="relative">
          {/* Left icon */}
          <Search
            size={iconSize}
            className={`absolute ${iconLeftCls} top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none`}
            aria-hidden="true"
          />

          <input
            id={inputId}
            ref={ref}
            type="search"
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls={showDropdown ? listId : undefined}
            aria-autocomplete="list"
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            className={[
              "w-full rounded-lg border border-gray-200 dark:border-gray-700",
              "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
              "placeholder:text-gray-400 dark:placeholder:text-gray-500",
              "outline-none transition-all duration-150",
              "focus:border-rose-500 focus:ring-[3px] focus:ring-rose-500/10",
              "[&::-webkit-search-cancel-button]:hidden",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              INPUT_SIZE[size],
              padLeftCls,
              padRight,
            ].join(" ")}
            {...rest}
          />

          {/* Right slot */}
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {loading && (
              <Loader2
                size={14}
                className="animate-spin text-rose-500"
                aria-label="Searching…"
              />
            )}
            {showClear && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search"
                className="flex items-center justify-center p-0.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors bg-transparent border-none cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
            {showShortcut && (
              <kbd className="inline-flex items-center h-5 min-w-[20px] px-1 font-mono text-[11px] bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-gray-400 dark:text-gray-500">
                {shortcut}
              </kbd>
            )}
          </div>
        </div>

        {/* Filter chips */}
        {filters && filters.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {filters.map((f) => (
              <FilterChip
                key={f.key}
                filter={f}
                active={activeFilter === f.key}
                onClick={() => onFilterChange?.(f.key)}
              />
            ))}
          </div>
        )}

        {/* Dropdown */}
        {showDropdown && (
          <div
            id={listId}
            role="listbox"
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
          >
            {/* Results */}
            {allResults.length > 0 ? (
              <>
                <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-gray-400 dark:text-gray-500 px-3 pt-2 pb-1 m-0">
                  Results
                </p>
                {allResults.map((r, i) => (
                  <ResultItem
                    key={r.id}
                    result={r}
                    query={value}
                    active={i === activeIdx}
                    onSelect={handleSelect}
                  />
                ))}
              </>
            ) : hasResults ? (
              /* Empty state */
              <div className="flex flex-col items-center py-6 px-3 text-center">
                <Search size={24} className="text-gray-300 dark:text-gray-600 mb-2" aria-hidden="true" />
                <p className="text-[13px] text-gray-500 dark:text-gray-400 m-0">
                  No results for <strong>"{value}"</strong>
                </p>
                <p className="text-[12px] text-gray-400 dark:text-gray-500 m-0 mt-1">
                  {emptyMessage}
                </p>
              </div>
            ) : null}

            {/* Recent searches */}
            {recentSearches && recentSearches.length > 0 && (
              <>
                {allResults.length > 0 && (
                  <hr className="border-gray-100 dark:border-gray-800 m-0" />
                )}
                <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-gray-400 dark:text-gray-500 px-3 pt-2 pb-1 m-0">
                  Recent
                </p>
                {recentSearches.map((q) => (
                  <div
                    key={q}
                    className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => {
                      if (controlledValue === undefined) setInternalValue(q);
                      onChange?.(q);
                      setOpen(false);
                    }}
                  >
                    <Clock size={14} className="text-gray-400 dark:text-gray-500 shrink-0" aria-hidden="true" />
                    <span className="flex-1 text-[13px] text-gray-700 dark:text-gray-300 truncate">{q}</span>
                    {onRemoveRecent && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onRemoveRecent(q); }}
                        aria-label={`Remove "${q}" from recent searches`}
                        className="text-gray-300 hover:text-gray-500 bg-transparent border-none cursor-pointer p-0 flex items-center"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </>
            )}

            {/* Footer */}
            {value && (
              <>
                <hr className="border-gray-100 dark:border-gray-800 m-0" />
                <div className="px-3 py-2">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-transparent border-none cursor-pointer p-0 transition-colors"
                    onClick={() => onSelectResult?.({ id: "__all__", label: value })}
                  >
                    <Search size={13} aria-hidden="true" />
                    Search all for "{value}"
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";

export default SearchInput;