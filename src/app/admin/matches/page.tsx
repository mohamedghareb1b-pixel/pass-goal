"use client";

import { useEffect, useState } from "react";

interface MatchRow {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  kickoffUtc: string;
  venue: string;
  city: string;
  status: "upcoming" | "live" | "finished";
  ticketUrl: string | null;
  linkedArticleSlug: string | null;
}

interface TeamRow {
  id: string;
  name: string;
}

export default function MatchesManagementPage() {
  const [rows, setRows] = useState<MatchRow[]>([]);
  const [teamsById, setTeamsById] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savingArticleId, setSavingArticleId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [articleDrafts, setArticleDrafts] = useState<Record<string, string>>({});
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [crestSyncing, setCrestSyncing] = useState(false);
  const [crestMessage, setCrestMessage] = useState<string | null>(null);

  function loadMatches() {
    fetch("/api/admin/matches")
      .then((r) => r.json())
      .then((data: { matches: MatchRow[]; teams: TeamRow[] }) => {
        setRows(data.matches);
        setTeamsById(Object.fromEntries(data.teams.map((t) => [t.id, t.name])));
      });
  }

  useEffect(() => {
    loadMatches();
  }, []);

  async function syncNow() {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch("/api/admin/sync-now", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");
      setSyncMessage(`Synced — ${data.updated} updated, ${data.skipped} skipped`);
      loadMatches();
    } catch (err: any) {
      setSyncMessage(err.message);
    }
    setSyncing(false);
  }

  async function syncCrests() {
    setCrestSyncing(true);
    setCrestMessage(null);
    try {
      const res = await fetch("/api/admin/sync-crests", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Crest sync failed");
      setCrestMessage(
        `Updated ${data.updated} crests${data.failures?.length ? ` — ${data.failures.length} failed` : ""}`
      );
    } catch (err: any) {
      setCrestMessage(err.message);
    }
    setCrestSyncing(false);
  }

  async function saveTicketUrl(matchId: string) {
    setSavingId(matchId);
    const ticketUrl = drafts[matchId] ?? "";
    await fetch("/api/admin/matches", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, ticketUrl }),
    });
    setRows((prev) => prev.map((r) => (r.id === matchId ? { ...r, ticketUrl } : r)));
    setSavingId(null);
  }

  async function saveArticleSlug(matchId: string) {
    setSavingArticleId(matchId);
    const linkedArticleSlug = articleDrafts[matchId] ?? "";
    await fetch("/api/admin/matches", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, linkedArticleSlug: linkedArticleSlug || null }),
    });
    setRows((prev) => prev.map((r) => (r.id === matchId ? { ...r, linkedArticleSlug: linkedArticleSlug || null } : r)));
    setSavingArticleId(null);
  }

  // Display team name — fall back gracefully if ID not in our map
  function teamName(id: string): string {
    return teamsById[id] ?? id;
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-1">
        <h1 className="font-display text-2xl">Matches Management</h1>
        <div className="text-right space-y-2">
          <div className="flex gap-2 justify-end">
            <button
              onClick={syncNow}
              disabled={syncing}
              className="bg-purple text-white text-xs font-bold rounded-lg px-4 py-2 disabled:opacity-50"
            >
              {syncing ? "Syncing…" : "Sync now from API"}
            </button>
            <button
              onClick={syncCrests}
              disabled={crestSyncing}
              className="bg-pitch text-white text-xs font-bold rounded-lg px-4 py-2 disabled:opacity-50"
            >
              {crestSyncing ? "Syncing crests…" : "Sync team crests"}
            </button>
          </div>
          {syncMessage && <p className="text-xs text-ink-soft">{syncMessage}</p>}
          {crestMessage && <p className="text-xs text-ink-soft">{crestMessage}</p>}
        </div>
      </div>
      <p className="text-sm text-ink-soft mb-6">
        Fixtures sync automatically from the sports API. Edit the Ticket Link and Article Link columns manually.
      </p>

      <div className="bg-paper border border-line rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-chalk text-ink-soft text-xs uppercase font-mono">
            <tr>
              <th className="text-left px-4 py-3">Match</th>
              <th className="text-left px-4 py-3">Kickoff (UK)</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Ticket Link</th>
              <th className="px-4 py-3"></th>
              <th className="text-left px-4 py-3">Article Slug</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id} className="border-t border-line">
                <td className="px-4 py-3 font-medium">
                  {teamName(m.homeTeamId)} vs {teamName(m.awayTeamId)}
                  <div className="text-xs text-ink-soft font-normal">
                    {m.venue} · {m.city}
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {new Intl.DateTimeFormat("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "Europe/London",
                  }).format(new Date(m.kickoffUtc))}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-mono px-2 py-1 rounded ${
                      m.status === "live"
                        ? "bg-live text-white"
                        : m.status === "finished"
                        ? "bg-line text-ink-soft"
                        : "bg-pitch-bright/15 text-pitch"
                    }`}
                  >
                    {m.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="url"
                    disabled={m.status !== "upcoming"}
                    placeholder={m.status === "upcoming" ? "https://ticketnetwork.com/..." : "Hidden — match not upcoming"}
                    value={drafts[m.id] ?? m.ticketUrl ?? ""}
                    onChange={(e) => setDrafts((d) => ({ ...d, [m.id]: e.target.value }))}
                    className="w-56 border border-line rounded-lg px-2.5 py-1.5 text-xs disabled:bg-chalk disabled:text-line"
                  />
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => saveTicketUrl(m.id)}
                    disabled={m.status !== "upcoming" || savingId === m.id}
                    className="text-xs font-bold text-white bg-purple rounded-lg px-3 py-1.5 disabled:opacity-40"
                  >
                    {savingId === m.id ? "Saving…" : "Save"}
                  </button>
                </td>
                {/* Article Slug — links a published article to this match */}
                <td className="px-4 py-3">
                  <input
                    type="text"
                    placeholder="article-slug"
                    value={articleDrafts[m.id] ?? m.linkedArticleSlug ?? ""}
                    onChange={(e) => setArticleDrafts((d) => ({ ...d, [m.id]: e.target.value }))}
                    className="w-48 border border-line rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => saveArticleSlug(m.id)}
                    disabled={savingArticleId === m.id}
                    className="text-xs font-bold text-white bg-pitch rounded-lg px-3 py-1.5 disabled:opacity-40"
                  >
                    {savingArticleId === m.id ? "Saving…" : "Save"}
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-ink-soft text-sm">
                  No matches synced yet — run the sports API sync cron.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
