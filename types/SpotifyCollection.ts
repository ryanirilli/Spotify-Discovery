import { TSpotifySearchConfig } from "./SpotifySearchConfig";

export type TSpotifyCollectionCoverStatus = "pending" | "ready" | "failed";

export type TSpotifyCollectionArtistSnapshot = {
  id: string;
  name: string;
  imageUrl: string | null;
};

export type TSpotifyCollection = {
  id: string;
  title: string;
  owner_spotify_user_id: string;
  owner_display_name: string | null;
  config: TSpotifySearchConfig;
  artist_snapshot: TSpotifyCollectionArtistSnapshot[];
  cover_status: TSpotifyCollectionCoverStatus;
  cover_image_url: string | null;
  cover_blob_path: string | null;
  created_at: string;
  updated_at: string;
};
