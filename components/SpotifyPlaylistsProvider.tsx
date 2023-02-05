"use client";

import { createContext, ReactNode } from "react";
import { TSpotifyPlaylist } from "@/types/SpotifyPlaylist";
import spotifyUserPlaylists from "@/queries/spotifyUserPlaylists";
import { useQuery } from "react-query";

export type TSpotifyPlaylistsContext = {
  playlists: TSpotifyPlaylist[];
};

export const SpotifyPlaylistsContext =
  createContext<TSpotifyPlaylistsContext | null>(null);

interface ISpotifyPlaylistsProvider {
  children: ReactNode;
}

export default function SpotifyPlaylistsProvider({
  children,
}: ISpotifyPlaylistsProvider) {
  const { data: playlists } = useQuery("userPlaylists", spotifyUserPlaylists);
  return (
    <SpotifyPlaylistsContext.Provider value={{ playlists: playlists || [] }}>
      {children}
    </SpotifyPlaylistsContext.Provider>
  );
}
