import { and, gte, lt, eq, or } from "drizzle-orm";
import { db } from "@/infrastructure/db/client";
import { matches, teams } from "@/infrastructure/db/schema";
import type { Match, MatchStatus } from "@/domain/entities/Match";
import type { MatchesRepository, TeamsRepository } from "@/application/use-cases/GetFilteredMatches";
import type { Team } from "@/domain/entities/Team";

function toDomainMatch(row: typeof matches.$inferSelect): Match {
  return {
    id: row.id,
    homeTeamId: row.homeTeamId,
    awayTeamId: row.awayTeamId,
    kickoffUtc: row.kickoffUtc.toISOString(),
    venue: row.venue,
    city: row.city,
    status: row.status as MatchStatus,
    liveMinute: row.liveMinute ?? undefined,
    score:
      row.homeScore !== null && row.awayScore !== null
        ? { home: row.homeScore, away: row.awayScore }
        : undefined,
    ticketUrl: row.ticketUrl,
    linkedArticleSlug: row.linkedArticleSlug,
    lastPolledAt: row.lastPolledAt.toISOString(),
  };
}

export class DrizzleMatchesRepository implements MatchesRepository {
  async findByDateRange(startIso: string, endIso: string): Promise<Match[]> {
    const rows = await db
      .select()
      .from(matches)
      .where(and(gte(matches.kickoffUtc, new Date(startIso)), lt(matches.kickoffUtc, new Date(endIso))))
      .orderBy(matches.kickoffUtc);
    return rows.map(toDomainMatch);
  }

  async findByDate(dateIso: string): Promise<Match[]> {
    const start = new Date(dateIso);
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 1);
    return this.findByDateRange(start.toISOString(), end.toISOString());
  }

  async findByTeam(teamId: string): Promise<Match[]> {
    const rows = await db
      .select()
      .from(matches)
      .where(or(eq(matches.homeTeamId, teamId), eq(matches.awayTeamId, teamId)))
      .orderBy(matches.kickoffUtc);
    return rows.map(toDomainMatch);
  }

  /**
   * Same as findByTeam, but matches against every team row sharing the
   * given name (case-insensitive) — a safety net for when the same club
   * ended up with more than one row (e.g. our seeded slug id AND an
   * auto-created row from a sync-time ID mismatch).
   */
  async findByTeamName(name: string): Promise<Match[]> {
    const allTeams = await db.select().from(teams);
    const lower = name.trim().toLowerCase();
    const matchingIds = allTeams.filter((t) => t.name.toLowerCase() === lower).map((t) => t.id);
    if (matchingIds.length === 0) return [];

    const rows = await db.select().from(matches).orderBy(matches.kickoffUtc);
    const filtered = rows.filter(
      (r) => matchingIds.includes(r.homeTeamId) || matchingIds.includes(r.awayTeamId)
    );
    return filtered.map(toDomainMatch);
  }

  /** All matches whose poll tier is due — used by the sync cron. */
  async findAll(): Promise<Match[]> {
    const rows = await db.select().from(matches).orderBy(matches.kickoffUtc);
    return rows.map(toDomainMatch);
  }

  /**
   * Auto-creates a minimal team row if one doesn't already exist for this
   * ID — a safety net for when the manually-maintained Football-Data ID
   * map (teamIdMap.ts) is missing or wrong for a given club. Crest/color
   * are placeholders until someone fixes them up in the admin/reference data.
   */
  async ensureTeam(id: string, name: string): Promise<void> {
    const existing = await db.select({ id: teams.id }).from(teams).where(eq(teams.id, id)).limit(1);
    if (existing.length > 0) return;

    await db.insert(teams).values({
      id,
      name,
      shortName: name.slice(0, 3).toUpperCase(),
      crestUrl: "/crests/placeholder.webp",
      primaryColor: "#6B6577",
    });
  }

  async upsertTicketUrl(matchId: string, ticketUrl: string | null): Promise<void> {
    await db.update(matches).set({ ticketUrl }).where(eq(matches.id, matchId));
  }

  async upsertLinkedArticle(matchId: string, slug: string | null): Promise<void> {
    await db.update(matches).set({ linkedArticleSlug: slug }).where(eq(matches.id, matchId));
  }
}

export class DrizzleTeamsRepository implements TeamsRepository {
  async findAll(): Promise<Team[]> {
    return db.select().from(teams);
  }

  async findByNameQuery(query: string): Promise<Team | null> {
    const lower = query.trim().toLowerCase();
    const all = await db.select().from(teams);
    return (
      all.find(
        (t) => t.name.toLowerCase().includes(lower) || t.shortName.toLowerCase() === lower || t.id === lower
      ) ?? null
    );
  }
}
