export default async function spotifyGenreSeeds() {
  const res = await fetch(`/api/spotify-get-genre-seeds`);
  const data = await res.json();
  return data;
}
