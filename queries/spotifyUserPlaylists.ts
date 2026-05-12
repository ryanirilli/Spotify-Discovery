import { TSpotifyPlaylist } from "@/types/SpotifyPlaylist";

export default async function spotifyUserPlaylists() {
  const res = await fetch(`/api/spotify-get-user-playlists`);
  const data = await res.json();
  return data as TSpotifyPlaylist[];
}
