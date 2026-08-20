import type { Team } from "@/domain/entities/Team";

/**
 * Static reference data for the 20 Premier League clubs (2025/26 season).
 * `crestUrl` values are placeholders — replace with the real WebP crest
 * uploaded to Supabase Storage for each club before going live (brief
 * section 5.5 — crests are a fixed table maintained manually, not pulled
 * from the sports API on every request).
 */
export const PREMIER_LEAGUE_TEAMS: Team[] = [
  { id: "arsenal", name: "Arsenal", shortName: "ARS", crestUrl: "/crests/arsenal.webp", primaryColor: "#EF0107" },
  { id: "aston-villa", name: "Aston Villa", shortName: "AVL", crestUrl: "/crests/aston-villa.webp", primaryColor: "#670E36" },
  { id: "bournemouth", name: "Bournemouth", shortName: "BOU", crestUrl: "/crests/bournemouth.webp", primaryColor: "#DA291C" },
  { id: "brentford", name: "Brentford", shortName: "BRE", crestUrl: "/crests/brentford.webp", primaryColor: "#E30613" },
  { id: "brighton", name: "Brighton & Hove Albion", shortName: "BHA", crestUrl: "/crests/brighton.webp", primaryColor: "#0057B8" },
  { id: "burnley", name: "Burnley", shortName: "BUR", crestUrl: "/crests/burnley.webp", primaryColor: "#6C1D45" },
  { id: "chelsea", name: "Chelsea", shortName: "CHE", crestUrl: "/crests/chelsea.webp", primaryColor: "#034694" },
  { id: "crystal-palace", name: "Crystal Palace", shortName: "CRY", crestUrl: "/crests/crystal-palace.webp", primaryColor: "#1B458F" },
  { id: "everton", name: "Everton", shortName: "EVE", crestUrl: "/crests/everton.webp", primaryColor: "#003399" },
  { id: "fulham", name: "Fulham", shortName: "FUL", crestUrl: "/crests/fulham.webp", primaryColor: "#000000" },
  { id: "leeds", name: "Leeds United", shortName: "LEE", crestUrl: "/crests/leeds.webp", primaryColor: "#FFCD00" },
  { id: "liverpool", name: "Liverpool", shortName: "LIV", crestUrl: "/crests/liverpool.webp", primaryColor: "#C8102E" },
  { id: "man-city", name: "Manchester City", shortName: "MCI", crestUrl: "/crests/man-city.webp", primaryColor: "#6CABDD" },
  { id: "man-united", name: "Manchester United", shortName: "MUN", crestUrl: "/crests/man-united.webp", primaryColor: "#DA020E" },
  { id: "newcastle", name: "Newcastle United", shortName: "NEW", crestUrl: "/crests/newcastle.webp", primaryColor: "#241F20" },
  { id: "nottingham-forest", name: "Nottingham Forest", shortName: "NFO", crestUrl: "/crests/nottingham-forest.webp", primaryColor: "#DD0000" },
  { id: "sunderland", name: "Sunderland", shortName: "SUN", crestUrl: "/crests/sunderland.webp", primaryColor: "#EB172B" },
  { id: "tottenham", name: "Tottenham Hotspur", shortName: "TOT", crestUrl: "/crests/tottenham.webp", primaryColor: "#132257" },
  { id: "west-ham", name: "West Ham United", shortName: "WHU", crestUrl: "/crests/west-ham.webp", primaryColor: "#7A263A" },
  { id: "wolves", name: "Wolverhampton Wanderers", shortName: "WOL", crestUrl: "/crests/wolves.webp", primaryColor: "#FDB913" },
];
