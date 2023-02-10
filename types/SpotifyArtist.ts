import { TSpotifyExternalUrls } from "./SpotifyExternalUrls";

type TSpotifyArtistImage = {
  width: number;
  height: number;
  url: string;
};

export type TSpotifyArtist = {
  id: string;
  name: string;
  images: TSpotifyArtistImage[];
  external_urls: TSpotifyExternalUrls;
};
