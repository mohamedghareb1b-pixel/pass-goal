import Link from "next/link";
import type { Match } from "@/domain/entities/Match";
import type { Team } from "@/domain/entities/Team";
import { isTicketLinkVisible } from "@/domain/entities/Match";

function formatUkTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  }).format(new Date(iso));
}

export function TeamCrest({ team }: { team: Team }) {
  return (
    <span
      className="w-[22px] h-[22px] rounded-[5px] flex items-center justify-center text-[10px] font-extrabold text-white flex-shrink-0"
      style={{ backgroundColor: team.primaryColor }}
    >
      {team.shortName}
    </span>
  );
}

export default function MatchCard({
  match,
  homeTeam,
  awayTeam,
}: {
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
}) {
  const showTicket = isTicketLinkVisible(match);
  const body = (
    <div
      className={`bg-paper border rounded-2xl px-4 py-4 grid grid-cols-[50px_1fr_auto] sm:grid-cols-[62px_1fr_auto] gap-3 sm:gap-4 items-center transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
        match.status === "live" ? "border-live/40" : "border-line hover:border-pitch-bright/40"
      }`}
    >
      {/* Status column */}
      <div className="flex flex-col items-center justify-center font-mono">
        {match.status === "live" && (
          <span className="bg-live text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
            <span className="relative flex w-[6px] h-[6px]">
              <span className="absolute inline-flex h-full w-full rounded-full bg-white pg-live-ring" />
              <span className="relative inline-flex rounded-full h-[6px] w-[6px] bg-white" />
            </span>
            {match.liveMinute}&apos;
          </span>
        )}
        {match.status === "finished" && (
          <span className="bg-line text-ink-soft text-[10px] font-bold px-2 py-1 rounded">FT</span>
        )}
        {match.status === "upcoming" && (
          <>
            <span className="text-[15px] font-bold">{formatUkTime(match.kickoffUtc)}</span>
            <span className="text-[9px] text-ink-soft mt-0.5">UK</span>
          </>
        )}
      </div>

      {/* Teams column */}
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[13.5px] sm:text-[15px] font-semibold my-0.5">
          <TeamCrest team={homeTeam} />
          {homeTeam.name}
          {match.score && <span className="ml-auto font-mono font-bold pl-2.5">{match.score.home}</span>}
        </div>
        <div className="flex items-center gap-2 text-[13.5px] sm:text-[15px] font-semibold my-0.5">
          <TeamCrest team={awayTeam} />
          {awayTeam.name}
          {match.score && <span className="ml-auto font-mono font-bold pl-2.5">{match.score.away}</span>}
        </div>
        <div className="text-[11px] text-ink-soft mt-1.5 font-mono uppercase">
          {match.venue}
          {match.city ? ` · ${match.city}` : ""}
        </div>
      </div>

      {/* Action column */}
      <div className="text-right">
        {showTicket && (
          <a
            href={match.ticketUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11.5px] sm:text-[12.5px] leading-tight whitespace-nowrap"
          >
            Get tickets
            <br />
            <span className="underline underline-offset-2 font-bold text-pitch">click here</span>
          </a>
        )}
        {match.status === "finished" && (
          <div className="font-mono text-[10px] text-gold font-bold flex items-center gap-1 justify-end">
            📌 FINAL
          </div>
        )}
        {match.status === "upcoming" && !showTicket && (
          <span className="font-mono text-[12px] text-line">Not available</span>
        )}
        {match.status === "live" && <span className="text-line">—</span>}
      </div>
    </div>
  );

  return match.linkedArticleSlug ? (
    <Link href={`/articles/${match.linkedArticleSlug}`}>{body}</Link>
  ) : (
    body
  );
}
