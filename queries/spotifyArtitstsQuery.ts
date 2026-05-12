import { TSpotifyArtist } from "@/types/SpotifyArtist";

export async function artistsQuery(
  artists: string[]
): Promise<TSpotifyArtist[]> {
  if (!artists.length) {
    return [];
  }
  const res = await fetch(
    `/api/spotify-get-artists-detail?artists=${artists.join(",")}`
  );
  if (!res.ok) {
    console.warn("Could not fetch Spotify artist details", await res.json());
    return [];
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
