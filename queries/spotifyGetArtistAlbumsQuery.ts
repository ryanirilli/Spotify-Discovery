export default async function spotifyGetArtistAlbumsQuery(artistId: string) {
  const res = await fetch(
    `/api/spotify-get-artist-albums?artistId=${artistId}`
  );
  return await res.json();
}
