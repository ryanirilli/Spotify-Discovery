export type TSpotifyCreatePlaylistArgs = {
  name: string;
};

export default async function spotifyCreatePlaylist({
  name,
}: TSpotifyCreatePlaylistArgs) {
  const res = await fetch(`/api/spotify-create-playlist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name,
    }),
  });
  const data = await res.json();
  return data;
}
