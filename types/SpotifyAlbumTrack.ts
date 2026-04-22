import { TSpotifyArtist } from "./SpotifyArtist";
import { TSpotifyExternalUrls } from "./SpotifyExternalUrls";

export type TSpotifyAlbumTrack = {
  id: string;
  name: string;
  preview_url: string | null;
  duration_ms: number;
  track_number: number;
  uri: string;
  external_urls: TSpotifyExternalUrls;
  artists: Omit<TSpotifyArtist, "images">[];
};
