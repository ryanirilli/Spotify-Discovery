"use client";

import { createContext, ReactNode, useMemo, useState } from "react";
import produce from "immer";
import spotifyRecommendations from "@/queries/spotifyRecommendations";
import { useQuery } from "react-query";
import { TSpotifyArtist } from "@/types/SpotifyArtist";
import { TSpotifyTrack } from "@/types/SpotifyTrack";
import { TSpotifyRecommendationsOptions } from "@/types/SpotifyRecommendationsOptions";

export type TSpotifyRecommendationsContext = {
  addArtist: (artist: TSpotifyArtist) => void;
  removeArtist: (artist: TSpotifyArtist) => void;
  addGenre: (genre: string) => void;
  removeGenre: (genre: string) => void;
  genres: string[];
  artists: TSpotifyArtist[];
  fetchRecs: () => void;
  recommendations: TSpotifyTrack[];
  isSeedLimitReached: boolean;
  filters: TSpotifyRecommendationFilters;
  setFilters: (filters: TSpotifyRecommendationFilters) => void;
  isLoadingRecs: boolean;
};

export type TSpotifyRecommendationFilters = {
  target_tempo?: number;
  max_tempo?: number;
};

interface ISpotifyRecommendationsProvider {
  children: ReactNode;
}

export const SpotifyRecommendationsContext = createContext<
  TSpotifyRecommendationsContext | undefined
>(undefined);

export default function SpotifyRecommendationsProvider({
  children,
}: ISpotifyRecommendationsProvider) {
  const [artists, setArtists] = useState<TSpotifyArtist[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [filters, setFilters] = useState<TSpotifyRecommendationFilters>({});

  const {
    data: recommendations,
    refetch: fetchRecs,
    isFetching: isLoadingRecs,
  } = useQuery<TSpotifyTrack[]>(
    ["spotifyRecommendations"],
    () => {
      if (!artists.length && !genres.length) {
        return Promise.resolve([]);
      }
      document.body.scrollIntoView({ behavior: "smooth", block: "start" });

      const settings: TSpotifyRecommendationsOptions = {
        artists: artists.map((a) => a.id),
        genres,
        ...filters,
      };

      return spotifyRecommendations(settings);
    },
    {
      enabled: false,
      staleTime: 0,
    }
  );

  const isSeedLimitReached = useMemo(() => {
    return artists.length + genres.length === 5;
  }, [artists, genres]);

  const addArtist = (artist: TSpotifyArtist) => {
    const updatedArtists = produce(artists, (draft: TSpotifyArtist[]) => {
      draft.push(artist);
      return draft;
    });
    setArtists(updatedArtists);
  };

  const removeArtist = (artist: TSpotifyArtist) => {
    const updatedArtists = produce(artists, (draft: TSpotifyArtist[]) => {
      const index = draft.findIndex((a) => a.id === artist.id);
      if (index > -1) {
        draft.splice(index, 1);
      }
      return draft;
    });
    setArtists(updatedArtists);
  };

  const addGenre = (genre: string) => {
    const updatedGenres = produce(genres, (draft: string[]) => {
      draft.push(genre);
    });
    setGenres(updatedGenres);
  };

  const removeGenre = (genre: string) => {
    const updatedGenres = produce(genres, (draft: string[]) => {
      const index = draft.findIndex((g) => g === genre);
      if (index > -1) {
        draft.splice(index, 1);
      }
    });
    setGenres(updatedGenres);
  };

  const contextValue = {
    addArtist,
    removeArtist,
    addGenre,
    removeGenre,
    genres,
    artists,
    fetchRecs,
    recommendations: recommendations || [],
    isSeedLimitReached,
    filters,
    setFilters,
    isLoadingRecs,
  };

  return (
    <SpotifyRecommendationsContext.Provider value={contextValue}>
      {children}
    </SpotifyRecommendationsContext.Provider>
  );
}
