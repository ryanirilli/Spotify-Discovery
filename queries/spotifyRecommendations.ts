import { TSpotifyRecommendationsOptions } from "@/types/SpotifyRecommendationsOptions";

export default async function spotifyRecommendations({
  artists,
  genres,
  max_tempo,
  target_tempo,
}: TSpotifyRecommendationsOptions) {
  const params = new URLSearchParams();
  params.append("artists", artists.join(","));
  params.append("genres", genres.join(","));
  if (target_tempo) params.append("target_tempo", target_tempo.toString());
  if (max_tempo) params.append("max_tempo", max_tempo.toString());
  const res = await fetch(
    `/api/spotify-get-recommendations?${params.toString()}`
  );
  const data = await res.json();
  return data;
}
