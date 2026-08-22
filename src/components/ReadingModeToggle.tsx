"use client";

import { useState } from "react";

/** Emoji-only toggle, no text label — see project brief section 6. */
export default function ReadingModeToggle() {
  const [active, setActive] = useState(false);

  function toggle() {
    const next = !active;
    setActive(next);
    document.documentElement.classList.toggle("reading-mode", next);
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle reading mode"
      aria-pressed={active}
      className={`w-9 h-9 rounded-full flex items-center justify-center text-lg border ${
        active ? "bg-gold border-gold" : "bg-paper border-line"
      }`}
    >
      📖
    </button>
  );
}
