export default async function spotifyGetAlbumTracksQuery(albumId: string) {
  const res = await fetch(`/api/spotify-get-album-tracks?albumId=${albumId}`);
  return await res.json();
}
