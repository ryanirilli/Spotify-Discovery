import { TSpotifyArtist } from "./SpotifyArtist";

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
};
