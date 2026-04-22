import { TSpotifyArtist } from "./SpotifyArtist";
import { TSpotifyExternalUrls } from "./SpotifyExternalUrls";

type TSpotifyAlbumImage = {
  width: number;
  height: number;
  url: string;
};

export type TSpotifyAlbum = {
  id: string;
  name: string;
  images: TSpotifyAlbumImage[];
  release_date: string;
  total_tracks: number;
  album_type?: string;
  album_group?: string;
  uri: string;
  external_urls: TSpotifyExternalUrls;
  artists: Omit<TSpotifyArtist, "images">[];
};
