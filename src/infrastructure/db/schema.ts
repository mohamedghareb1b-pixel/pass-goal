import { pgTable, text, timestamp, integer, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";

export const matchStatusEnum = pgEnum("match_status", ["upcoming", "live", "finished"]);

// Static reference table — 20 PL clubs, seeded once, edited manually.
export const teams = pgTable("teams", {
  id: text("id").primaryKey(), // slug, e.g. "arsenal"
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  crestUrl: text("crest_url").notNull(), // webp
  primaryColor: text("primary_color").notNull(),
});

// Synced from the sports API on a variable-frequency cron (see pollTier()).
export const matches = pgTable("matches", {
  id: text("id").primaryKey(), // matchId from the API
  homeTeamId: text("home_team_id").notNull().references(() => teams.id),
  awayTeamId: text("away_team_id").notNull().references(() => teams.id),
  kickoffUtc: timestamp("kickoff_utc", { withTimezone: true }).notNull(),
  venue: text("venue").notNull(),
  city: text("city").notNull(),
  status: matchStatusEnum("status").notNull().default("upcoming"),
  liveMinute: integer("live_minute"),
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  // The ONLY manually-entered field on this table — never from the API.
  ticketUrl: text("ticket_url"),
  linkedArticleSlug: text("linked_article_slug"),
  lastPolledAt: timestamp("last_polled_at", { withTimezone: true }).notNull().defaultNow(),
});

// Authors — name, short bio, photo. Articles link to one via authorId.
export const authors = pgTable("authors", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  bio: text("bio").notNull().default(""),
  avatarUrl: text("avatar_url").notNull().default(""),
});

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

// One article per big match — all fields entered manually by the admin.
export const articles = pgTable("articles", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  authorName: text("author_name").notNull().default("Shindy"),
  authorAvatarUrl: text("author_avatar_url").notNull(),
  authorId: text("author_id").references(() => authors.id),
  categoryId: text("category_id").notNull().references(() => categories.id),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  metaTitle: text("meta_title").notNull(),
  metaDescription: text("meta_description").notNull(),
  quickAnswer: text("quick_answer").notNull(),
  imageOneUrl: text("image_one_url").notNull(), // webp
  imageTwoUrl: text("image_two_url").notNull(), // webp
  bodyPartOne: text("body_part_one").notNull(),
  bodyPartTwo: text("body_part_two").notNull(),
  faq: jsonb("faq").$type<{ question: string; answer: string }[]>().notNull().default([]),
  linkedMatchId: text("linked_match_id").references(() => matches.id),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  subscribedAt: timestamp("subscribed_at", { withTimezone: true }).notNull().defaultNow(),
});

// Impact/affiliate tracking code, entered manually by the admin (section 8/10 of brief).
export const affiliateSettings = pgTable("affiliate_settings", {
  id: text("id").primaryKey().default("impact"),
  trackingCode: text("tracking_code").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
