"use client";

import { useState } from "react";

export type QuickFilter = "yesterday" | "today" | "tomorrow" | null;

export default function FilterBar({
  onSearch,
  onQuickFilter,
  activeQuickFilter,
}: {
  onSearch: (raw: string) => void;
  onQuickFilter: (filter: QuickFilter) => void;
  activeQuickFilter: QuickFilter;
}) {
  const [value, setValue] = useState("");

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") onSearch(value);
  }

  function togglePill(pill: QuickFilter) {
    onQuickFilter(activeQuickFilter === pill ? null : pill);
  }

  return (
    <div className="bg-purple rounded-2xl p-5 flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-[220px]">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-60"
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth={2}
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          type="text"
          placeholder="Search by team or date — e.g. 16/8/2026"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-white/10 border border-white/20 rounded-xl pl-11 pr-4 py-3.5 text-white text-base placeholder:text-white/50 transition-colors focus:bg-white/15 focus:border-gold/60 focus:outline-none"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {(["yesterday", "today", "tomorrow"] as const).map((pill) => (
          <button
            key={pill}
            onClick={() => togglePill(pill)}
            className={`font-mono text-sm font-medium px-4 py-3.5 rounded-xl whitespace-nowrap border transition-all duration-200 ${
              activeQuickFilter === pill
                ? "bg-gold text-purple-deep border-gold font-bold scale-[1.03] shadow-md"
                : "bg-white/10 text-white/75 border-white/15 hover:bg-white/15 hover:text-white"
            }`}
          >
            {pill[0].toUpperCase() + pill.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
