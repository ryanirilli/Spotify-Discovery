import { TSpotifyArtist } from "@/types/SpotifyArtist";

export async function artistSearchQuery(
  artist: string
): Promise<TSpotifyArtist[]> {
  const res = await fetch(`/api/spotify-artist-search?artist=${artist}`);
  const data = await res.json();
  const artists = data?.body?.artists?.items;
  return artists || [];
}
