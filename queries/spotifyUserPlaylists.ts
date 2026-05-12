import { TSpotifyPlaylist } from "@/types/SpotifyPlaylist";

export default async function spotifyUserPlaylists() {
  const res = await fetch(`/api/spotify-get-user-playlists`);
  if (!res.ok) {
    console.warn("Could not fetch Spotify playlists", await res.json());
    return [];
  }
  const data = await res.json();
  return Array.isArray(data) ? (data as TSpotifyPlaylist[]) : [];
}
