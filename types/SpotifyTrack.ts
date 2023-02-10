import { TSpotifyArtist } from "./SpotifyArtist";
import { TSpotifyExternalUrls } from "./SpotifyExternalUrls";

type TSpotifyAlbumImage = {
  width: number;
  height: number;
  url: string;
};

type TSpotifyAlbum = {
  name: string;
  preview_url: string;
  images: TSpotifyAlbumImage[];
};

export type TSpotifyTrack = {
  id: string;
  name: string;
  preview_url: string;
  artists: Omit<TSpotifyArtist, "images">[];
  album: TSpotifyAlbum;
  uri: string;
  external_urls: TSpotifyExternalUrls;
};
