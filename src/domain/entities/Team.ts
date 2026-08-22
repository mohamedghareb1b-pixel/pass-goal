/**
 * Static reference entity — the 20 Premier League clubs.
 * NOT pulled from the sports API on every request; seeded once and
 * maintained manually (crest URL, official name, brand color).
 */
export interface Team {
  id: string; // stable slug, e.g. "arsenal"
  name: string; // official name, e.g. "Arsenal"
  shortName: string; // e.g. "ARS"
  crestUrl: string; // webp, stored in Supabase Storage
  primaryColor: string; // hex, used for the crest badge background
}
