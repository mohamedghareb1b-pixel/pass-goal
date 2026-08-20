"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [trackingCode, setTrackingCode] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setTrackingCode(d.trackingCode ?? ""));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackingCode }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl mb-6">Settings</h1>
      <form onSubmit={save} className="space-y-3">
        <label className="block text-sm font-medium">Impact tracking code</label>
        <p className="text-xs text-ink-soft">
          Paste the code Impact/TicketNetwork gives you. Entered manually, no automation involved.
        </p>
        <textarea
          className="w-full border border-line rounded-lg px-3 py-2 text-sm font-mono"
          rows={6}
          value={trackingCode}
          onChange={(e) => setTrackingCode(e.target.value)}
          placeholder="<script>...</script>"
        />
        <button type="submit" className="bg-purple text-white font-bold rounded-lg px-5 py-2.5 text-sm">
          {saved ? "Saved ✓" : "Save"}
        </button>
      </form>
    </div>
  );
}
