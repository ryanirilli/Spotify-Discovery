import {
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { TSpotifyCollectionArtistSnapshot } from "@/types/SpotifyCollection";
import { TSpotifySearchConfig } from "@/types/SpotifySearchConfig";

export const collectionCoverStatus = pgEnum("collection_cover_status", [
  "pending",
  "ready",
  "failed",
]);

export const collections = pgTable("collections", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  ownerSpotifyUserId: text("owner_spotify_user_id").notNull(),
  ownerDisplayName: text("owner_display_name"),
  config: jsonb("config").$type<TSpotifySearchConfig>().notNull(),
  artistSnapshot: jsonb("artist_snapshot")
    .$type<TSpotifyCollectionArtistSnapshot[]>()
    .notNull(),
  coverStatus: collectionCoverStatus("cover_status")
    .notNull()
    .default("pending"),
  coverImageUrl: text("cover_image_url"),
  coverBlobPath: text("cover_blob_path"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type NewCollection = typeof collections.$inferInsert;
export type CollectionRow = typeof collections.$inferSelect;
