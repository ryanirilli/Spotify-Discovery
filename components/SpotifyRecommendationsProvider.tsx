"use client";

import { createContext, ReactNode, useEffect, useMemo, useState } from "react";
import produce from "immer";
import spotifyRecommendations from "@/queries/spotifyRecommendations";
import { useQuery } from "react-query";
import { TSpotifyArtist } from "@/types/SpotifyArtist";
import { TSpotifyTrack } from "@/types/SpotifyTrack";
import { TSpotifyRecommendationsOptions } from "@/types/SpotifyRecommendationsOptions";
import { artistsQuery } from "@/queries/spotifyArtitstsQuery";

export type TSpotifyRecommendationsContext = {
  artists: string[];
  artistsDetails: TSpotifyArtist[];
  addArtists: (artist: string[]) => void;
  setArtists: (artist: string[]) => void;
  removeArtist: (artist: string) => void;
  addGenre: (genre: string) => void;
  removeGenre: (genre: string) => void;
  genres: string[];
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
  const [artists, setArtists] = useState<string[]>([]);
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
        artists,
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

  const addArtists = (artist: string[]) => {
    const updatedArtists = produce(artists, (draft: string[]) => {
      draft.push(...artist);
      return draft;
    });
    setArtists(updatedArtists);
  };

  const removeArtist = (artist: string) => {
    const updatedArtists = produce(artists, (draft: string[]) => {
      const index = draft.findIndex((a) => a === artist);
      if (index > -1) {
        draft.splice(index, 1);
      }
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

  const { data: artistsDetailsData, refetch: fetchArtistsDetails } = useQuery<
    TSpotifyArtist[]
  >("spotifyArtistsDetails", () => artistsQuery(artists), {
    enabled: false,
    staleTime: 0,
  });
  useEffect(() => {
    if (artists.length) {
      fetchArtistsDetails();
    }
  }, [artists, fetchArtistsDetails]);

  const artistsDetails = useMemo(() => {
    return (
      artistsDetailsData?.filter((artist) => artists.includes(artist.id)) || []
    );
  }, [artistsDetailsData, artists]);

  const contextValue = {
    addArtists,
    setArtists,
    removeArtist,
    addGenre,
    removeGenre,
    genres,
    artists,
    artistsDetails,
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
