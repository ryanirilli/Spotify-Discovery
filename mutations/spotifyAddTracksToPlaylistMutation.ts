export type TSpotifyAddToPlaylistArgs = {
  playlistId: string;
  tracks: string[];
};

export default async function spotifyAddTracksToPlaylist({
  playlistId,
  tracks,
}: TSpotifyAddToPlaylistArgs) {
  const res = await fetch(`/api/spotify-add-tracks-to-playlist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      playlistId,
      tracks,
    }),
  });
  const data = await res.json();
  return data;
}
