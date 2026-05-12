import { TSpotifyRecommendationsOptions } from "@/types/SpotifyRecommendationsOptions";

const FILTER_PARAM_KEYS: (keyof Omit<
  TSpotifyRecommendationsOptions,
  "artists" | "genres"
>)[] = ["min_tempo", "max_tempo"];

export default async function spotifyRecommendations({
  artists,
  genres,
  ...filters
}: TSpotifyRecommendationsOptions) {
  const params = new URLSearchParams();
  params.append("artists", artists.join(","));
  params.append("genres", genres.join(","));
  FILTER_PARAM_KEYS.forEach((key) => {
    const value = filters[key];
    if (value !== undefined) params.append(key, value.toString());
  });
  const res = await fetch(
    `/api/spotify-get-recommendations?${params.toString()}`
  );
  if (!res.ok) {
    console.warn("Could not fetch Spotify recommendations", await res.json());
    return [];
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
