type TSpotifyRecommendations = {
  artists: string[];
  genres: string[];
};

export default async function spotifyRecommendations({
  artists,
  genres,
}: TSpotifyRecommendations) {
  const params = new URLSearchParams();
  params.append("artists", artists.join(","));
  params.append("genres", genres.join(","));
  const res = await fetch(
    `/api/spotify-get-recommendations?${params.toString()}`
  );
  const data = await res.json();
  return data;
}
