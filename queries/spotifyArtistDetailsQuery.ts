export default async function spotifyArtistDetailsQuery(artistId: string) {
  const res = await fetch(
    `/api/spotify-get-artist-details?artistId=${artistId}`
  );
  return await res.json();
}
