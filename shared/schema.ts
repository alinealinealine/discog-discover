import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const musicReleases = pgTable("music_releases", {
  id: serial("id").primaryKey(),
  discogsId: text("discogs_id").notNull().unique(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  year: text("year"),
  label: text("label"),
  format: text("format"),
  genre: text("genre"),
  style: text("style").notNull(),
  wantCount: integer("want_count").default(0),
  collectCount: integer("collect_count").default(0),
  thumbnailUrl: text("thumbnail_url"),
});

export const musicStyles = pgTable("music_styles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
});

export const insertMusicReleaseSchema = createInsertSchema(musicReleases).omit({
  id: true,
});

export const insertMusicStyleSchema = createInsertSchema(musicStyles).omit({
  id: true,
});

export type InsertMusicRelease = z.infer<typeof insertMusicReleaseSchema>;
export type MusicRelease = typeof musicReleases.$inferSelect;
export type InsertMusicStyle = z.infer<typeof insertMusicStyleSchema>;
export type MusicStyle = typeof musicStyles.$inferSelect;

// API response schemas
export const discogsReleaseSchema = z.object({
  id: z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseInt(val, 10) : val),
  title: z.string(),
  year: z.union([z.number(), z.string()]).optional(),
  format: z.array(z.string()).optional(),
  label: z.array(z.string()).optional(),
  genre: z.array(z.string()).optional(),
  style: z.array(z.string()).optional(),
  thumb: z.string().optional(),
  community: z.object({
    want: z.number().optional(),
    have: z.number().optional(),
  }).optional(),
  basic_information: z.object({
    title: z.string(),
    year: z.union([z.number(), z.string()]).optional(),
    formats: z.array(z.object({
      name: z.string(),
    })).optional(),
    labels: z.array(z.object({
      name: z.string(),
    })).optional(),
    genres: z.array(z.string()).optional(),
    styles: z.array(z.string()).optional(),
    thumb: z.string().optional(),
    artists: z.array(z.object({
      name: z.string(),
    })),
  }).optional(),
});

export const discogsSearchResponseSchema = z.object({
  results: z.array(discogsReleaseSchema),
  pagination: z.object({
    page: z.number(),
    pages: z.number(),
    per_page: z.number(),
    items: z.number(),
  }),
});

export type DiscogsRelease = z.infer<typeof discogsReleaseSchema>;
export type DiscogsSearchResponse = z.infer<typeof discogsSearchResponseSchema>;
