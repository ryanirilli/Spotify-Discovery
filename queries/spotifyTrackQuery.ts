import { TSpotifyTrack } from "@/types/SpotifyTrack";

export default async function spotifyTrackQuery(id: string): Promise<TSpotifyTrack> {
  const res = await fetch(`/api/spotify-get-track?id=${id}`);
  const data = await res.json();
  return data;
}
