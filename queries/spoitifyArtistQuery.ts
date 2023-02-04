import { TSpotifyArtist } from "@/types/SpotifyArtist";

export default async function artistQuery(
  artist: string
): Promise<TSpotifyArtist[]> {
  if (artist.length < 2) {
    return [];
  }
  const res = await fetch(`/api/spotify-artist-search?artist=${artist}`);
  const data = await res.json();
  const artists = data?.body?.artists?.items;
  return artists || [];
}
