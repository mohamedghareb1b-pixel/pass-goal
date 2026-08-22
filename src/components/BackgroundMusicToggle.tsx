"use client";

import { useRef, useState } from "react";

/** Emoji-only toggle, no text label — sits next to ReadingModeToggle in a row. */
export default function BackgroundMusicToggle({ src }: { src: string }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function toggle() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  }

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="none" />
      <button
        onClick={toggle}
        aria-label="Toggle background music"
        aria-pressed={playing}
        className={`w-9 h-9 rounded-full flex items-center justify-center text-lg border ${
          playing ? "bg-gold border-gold" : "bg-paper border-line"
        }`}
      >
        🎵
      </button>
    </>
  );
}
