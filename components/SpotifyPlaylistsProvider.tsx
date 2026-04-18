"use client";

import { createContext, ReactNode } from "react";
import { TSpotifyPlaylist } from "@/types/SpotifyPlaylist";
import spotifyUserPlaylists from "@/queries/spotifyUserPlaylists";
import { useQuery } from "@tanstack/react-query";

export type TSpotifyPlaylistsContext = {
  playlists: TSpotifyPlaylist[];
  isLoading: boolean;
  refetchPlaylists: () => Promise<unknown>;
};

export const SpotifyPlaylistsContext =
  createContext<TSpotifyPlaylistsContext | null>(null);

interface ISpotifyPlaylistsProvider {
  children: ReactNode;
}

export default function SpotifyPlaylistsProvider({
  children,
}: ISpotifyPlaylistsProvider) {
  const {
    data: playlists,
    isLoading,
    refetch: refetchPlaylists,
  } = useQuery<TSpotifyPlaylist[]>({
    queryKey: ["userPlaylists"],
    queryFn: spotifyUserPlaylists,
  });
  // Spotify can return the same playlist ID more than once (e.g. when a
  // user both owns and follows the same playlist). Deduplicate by ID so
  // consumers never receive duplicates and React keys stay unique.
  const uniquePlaylists = Array.from(
    new Map((playlists || []).map((p) => [p.id, p])).values()
  );

  return (
    <SpotifyPlaylistsContext.Provider
      value={{ playlists: uniquePlaylists, isLoading, refetchPlaylists }}
    >
      {children}
    </SpotifyPlaylistsContext.Provider>
  );
}
