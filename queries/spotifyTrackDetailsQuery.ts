export default async function spotifyTrackDetailsQuery(id: string) {
  const res = await fetch(`/api/spotify-track-details?id=${id}`);
  const data = await res.json();
  return data;
}
