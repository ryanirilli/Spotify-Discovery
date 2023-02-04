"use client";

import { createContext, ReactNode, useState } from "react";

export type TSpotifyCurrentTrackContext = {
  curTrack: string | null;
  setCurTrack: (track: string | null) => void;
};

export const SpotifyCurrentTrackContext =
  createContext<TSpotifyCurrentTrackContext | null>(null);

interface ISpotifyCurrentTrackProvider {
  children: ReactNode;
}

export default function SpotifyCurrentTrackProvider({
  children,
}: ISpotifyCurrentTrackProvider) {
  const [curTrack, setCurTrack] = useState<string | null>(null);
  return (
    <SpotifyCurrentTrackContext.Provider value={{ curTrack, setCurTrack }}>
      {children}
    </SpotifyCurrentTrackContext.Provider>
  );
}
