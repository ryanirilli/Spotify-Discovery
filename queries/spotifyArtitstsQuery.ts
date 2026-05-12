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
  return res.json();
}
