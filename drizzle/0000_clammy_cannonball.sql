CREATE TYPE "public"."collection_cover_status" AS ENUM('pending', 'ready', 'failed');--> statement-breakpoint
CREATE TABLE "collections" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"owner_spotify_user_id" text NOT NULL,
	"owner_display_name" text,
	"config" jsonb NOT NULL,
	"artist_snapshot" jsonb NOT NULL,
	"cover_status" "collection_cover_status" DEFAULT 'pending' NOT NULL,
	"cover_image_url" text,
	"cover_blob_path" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
