import { CollectionRow } from "@/db/schema";
import { TSpotifyCollection } from "@/types/SpotifyCollection";

export function serializeCollection(row: CollectionRow): TSpotifyCollection {
  return {
    id: row.id,
    title: row.title,
    owner_spotify_user_id: row.ownerSpotifyUserId,
    owner_display_name: row.ownerDisplayName,
    config: row.config,
    artist_snapshot: row.artistSnapshot,
    cover_status: row.coverStatus,
    cover_image_url: row.coverImageUrl,
    cover_blob_path: row.coverBlobPath,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}
