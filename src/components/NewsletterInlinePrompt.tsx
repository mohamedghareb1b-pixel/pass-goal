"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "pg_newsletter_dismissed_at";
const SUBSCRIBED_KEY = "pg_newsletter_subscribed";
const REAPPEAR_AFTER_DAYS = 4;

/**
 * Appears after the article's second image (see brief section 6.5).
 * Dismiss (X) hides it for this visit and stores the dismiss date in
 * localStorage; it reappears after 4 days. A real subscribe suppresses
 * it permanently.
 */
export default function NewsletterInlinePrompt() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(SUBSCRIBED_KEY) === "true") return;

    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (!dismissedAt) {
      setVisible(true);
      return;
    }

    const daysSince = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
    if (daysSince >= REAPPEAR_AFTER_DAYS) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  }

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    localStorage.setItem(SUBSCRIBED_KEY, "true");
    setSubmitted(true);
  }

  if (!visible) return null;

  return (
    <div className="relative bg-purple text-white rounded-2xl p-5 my-6">
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center opacity-70 hover:opacity-100"
      >
        ✕
      </button>
      {submitted ? (
        <p className="text-sm">Subscribed — thanks for joining.</p>
      ) : (
        <form onSubmit={subscribe} className="flex gap-2 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <p className="font-display text-base mb-2">Get Premier League news in your inbox</p>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm placeholder:text-white/50"
            />
          </div>
          <button type="submit" className="self-end bg-gold text-purple-deep font-bold rounded-lg px-4 py-2 text-sm">
            Subscribe
          </button>
        </form>
      )}
    </div>
  );
}
