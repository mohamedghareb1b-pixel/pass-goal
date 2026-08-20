"use client";

import { useEffect, useState } from "react";
import FilterBar, { QuickFilter } from "@/components/FilterBar";
import MatchCard from "@/components/MatchCard";
import type { Match } from "@/domain/entities/Match";
import type { Team } from "@/domain/entities/Team";

export default function FixturesPage() {
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("today");
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teamsById, setTeamsById] = useState<Record<string, Team>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    else if (quickFilter) params.set("pill", quickFilter);

    // Guard against a hung request (bad DB connection, slow network, etc.)
    // so the UI never gets stuck showing "Loading…" forever.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    fetch(`/api/matches?${params.toString()}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`Request failed (${r.status})`);
        return r.json();
      })
      .then((data: { matches: Match[]; teams: Team[] }) => {
        if (cancelled) return;
        setMatches(data.matches);
        setTeamsById(Object.fromEntries(data.teams.map((t) => [t.id, t])));
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.name === "AbortError" ? "Timed out loading fixtures — try again." : "Couldn't load fixtures — try again.");
      })
      .finally(() => {
        clearTimeout(timeout);
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [quickFilter, searchQuery]);

  function handleSearch(raw: string) {
    if (!raw.trim()) {
      setSearchQuery(null);
      return;
    }
    setQuickFilter(null);
    setSearchQuery(raw);
  }

  function handleQuickFilter(filter: QuickFilter) {
    setSearchQuery(null);
    setQuickFilter(filter);
  }

  // Group by day for the section labels shown in the approved mockup.
  const grouped = matches.reduce<Record<string, Match[]>>((acc, m) => {
    const day = new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "Europe/London",
    }).format(new Date(m.kickoffUtc));
    (acc[day] ??= []).push(m);
    return acc;
  }, {});

  return (
    <main className="max-w-4xl mx-auto px-5 py-7">
      <p className="font-mono text-[13px] uppercase tracking-wider text-pitch-bright font-bold">
        Pass Goal · Premier League
      </p>
      <h1 className="font-display text-3xl sm:text-4xl mb-7 mt-2">Fixtures &amp; Results</h1>

      <FilterBar onSearch={handleSearch} onQuickFilter={handleQuickFilter} activeQuickFilter={quickFilter} />

      {loading && (
        <div className="space-y-3 mt-6" aria-label="Loading fixtures" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="bg-paper border border-line rounded-2xl px-4 py-4 grid grid-cols-[50px_1fr_auto] sm:grid-cols-[62px_1fr_auto] gap-3 sm:gap-4 items-center"
            >
              <div className="h-8 w-full rounded pg-shimmer" />
              <div className="space-y-2">
                <div className="h-3.5 w-3/5 rounded pg-shimmer" />
                <div className="h-3.5 w-2/5 rounded pg-shimmer" />
              </div>
              <div className="h-3 w-14 rounded pg-shimmer" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="bg-live/10 border border-live/30 text-live text-sm rounded-2xl px-4 py-3 mt-4">{error}</div>
      )}

      {!loading && !error && matches.length === 0 && (
        <p className="text-sm text-ink-soft mt-6">No matches found.</p>
      )}

      {!loading &&
        Object.entries(grouped).map(([day, dayMatches]) => (
          <div key={day}>
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-ink-soft mt-6 mb-2.5 pb-2 border-b border-line">
              {day}
            </p>
            <div className="space-y-3">
              {dayMatches.map((match, i) => (
                <div key={match.id} className="pg-fade-up" style={{ animationDelay: `${Math.min(i, 6) * 50}ms` }}>
                  <MatchCard match={match} homeTeam={teamsById[match.homeTeamId]} awayTeam={teamsById[match.awayTeamId]} />
                </div>
              ))}
            </div>
          </div>
        ))}
    </main>
  );
}
