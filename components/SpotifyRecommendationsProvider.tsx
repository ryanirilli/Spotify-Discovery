"use client";

import { createContext, ReactNode, useEffect, useMemo, useState } from "react";
import produce from "immer";
import spotifyRecommendations from "@/queries/spotifyRecommendations";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TSpotifyArtist } from "@/types/SpotifyArtist";
import { TSpotifyTrack } from "@/types/SpotifyTrack";
import { TSpotifyRecommendationsOptions } from "@/types/SpotifyRecommendationsOptions";
import { artistsQuery } from "@/queries/spotifyArtitstsQuery";
import {
  getEnabledArtistsForConfig,
  MAX_ENABLED_SEEDS,
} from "@/utils/spotifySearchConfig";
import {
  TSpotifyRecommendationFilters,
  TSpotifySearchConfig,
} from "@/types/SpotifySearchConfig";

export { MAX_ENABLED_SEEDS };
export type { TSpotifyRecommendationFilters, TSpotifySearchConfig };

export type TSpotifyRecommendationsContext = {
  artists: string[];
  artistsDetails: TSpotifyArtist[];
  enabledArtists: string[];
  isArtistDisabled: (id: string) => boolean;
  addArtists: (artist: string[], details?: TSpotifyArtist[]) => void;
  setArtists: (artist: string[]) => void;
  setSearchConfig: (config: TSpotifySearchConfig) => void;
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

interface ISpotifyRecommendationsProvider {
  children: ReactNode;
}

export const SpotifyRecommendationsContext = createContext<
  TSpotifyRecommendationsContext | undefined
>(undefined);

export default function SpotifyRecommendationsProvider({
  children,
}: ISpotifyRecommendationsProvider) {
  const queryClient = useQueryClient();
  const [artists, setArtists] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [filters, setFilters] = useState<TSpotifyRecommendationFilters>({});

  // Only the most recently added artists (within the remaining seed budget
  // after genres) are sent to the recommendations API. Older artists remain
  // in `artists` but are treated as "disabled" seeds so the user can toggle
  // them back in by removing a newer selection.
  const enabledArtists = useMemo(() => {
    return getEnabledArtistsForConfig({ artists, genres, filters });
  }, [artists, genres, filters]);

  const disabledCount = artists.length - enabledArtists.length;

  const isArtistDisabled = (id: string) => {
    const idx = artists.indexOf(id);
    return idx !== -1 && idx < disabledCount;
  };

  const {
    data: recommendations,
    refetch: fetchRecs,
    isFetching: isLoadingRecs,
  } = useQuery<TSpotifyTrack[]>({
    queryKey: ["spotifyRecommendations"],
    queryFn: () => {
      if (!enabledArtists.length && !genres.length) {
        return Promise.resolve([]);
      }

      document.body.scrollIntoView({ behavior: "smooth", block: "start" });

      const settings: TSpotifyRecommendationsOptions = {
        artists: enabledArtists,
        genres,
        ...filters,
      };

      return spotifyRecommendations(settings);
    },
    enabled: false,
    staleTime: 0,
  });

  // Artists can now always be added (older ones are auto-disabled), so the
  // seed limit only applies to genres.
  const isSeedLimitReached = useMemo(() => {
    return genres.length >= MAX_ENABLED_SEEDS;
  }, [genres]);

  const addArtists = (artist: string[], details?: TSpotifyArtist[]) => {
    if (details?.length) {
      // Prime the React Query cache so the seed pill renders immediately
      // from the data the caller already has, rather than waiting for the
      // /api/spotify-get-artists-detail roundtrip.
      queryClient.setQueryData<TSpotifyArtist[]>(
        ["spotifyArtistsDetails"],
        (existing) => {
          const byId = new Map<string, TSpotifyArtist>();
          existing?.forEach((a) => byId.set(a.id, a));
          details.forEach((a) => byId.set(a.id, a));
          return Array.from(byId.values());
        }
      );
    }
    const updatedArtists = produce(artists, (draft: string[]) => {
      draft.push(...artist);
      return draft;
    });
    setArtists(updatedArtists);
  };

  const setSearchConfig = (config: TSpotifySearchConfig) => {
    setArtists(config.artists);
    setGenres(config.genres);
    setFilters(config.filters);
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
  >({
    queryKey: ["spotifyArtistsDetails"],
    queryFn: () => artistsQuery(artists),
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
    setSearchConfig,
    removeArtist,
    addGenre,
    removeGenre,
    genres,
    artists,
    artistsDetails,
    enabledArtists,
    isArtistDisabled,
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
