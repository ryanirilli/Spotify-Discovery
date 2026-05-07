"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import produce from "immer";
import spotifyRecommendations from "@/queries/spotifyRecommendations";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TSpotifyArtist } from "@/types/SpotifyArtist";
import { TSpotifyTrack } from "@/types/SpotifyTrack";
import { TSpotifyRecommendationsOptions } from "@/types/SpotifyRecommendationsOptions";
import { artistsQuery } from "@/queries/spotifyArtitstsQuery";
import {
  buildSearchStringFromConfig,
  getEnabledArtistsForConfig,
  MAX_ENABLED_SEEDS,
  sanitizeRecommendationFilters,
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
  fetchRecs: (config?: TSpotifySearchConfig) => Promise<TSpotifyTrack[]>;
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

const getRecommendationsQueryKey = (config: TSpotifySearchConfig) =>
  ["spotifyRecommendations", buildSearchStringFromConfig(config)] as const;

async function fetchRecommendationsForConfig(config: TSpotifySearchConfig) {
  const enabledArtists = getEnabledArtistsForConfig(config);

  if (!enabledArtists.length && !config.genres.length) {
    return [];
  }

  document.body.scrollIntoView({ behavior: "smooth", block: "start" });

  const settings: TSpotifyRecommendationsOptions = {
    artists: enabledArtists,
    genres: config.genres,
    ...sanitizeRecommendationFilters(config.filters),
  };

  return spotifyRecommendations(settings);
}

export default function SpotifyRecommendationsProvider({
  children,
}: ISpotifyRecommendationsProvider) {
  const queryClient = useQueryClient();
  const [artists, setArtists] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [filters, setFilters] = useState<TSpotifyRecommendationFilters>({});
  const searchConfig = useMemo<TSpotifySearchConfig>(
    () => ({ artists, genres, filters }),
    [artists, genres, filters]
  );
  const recommendationsQueryKey = useMemo(
    () => getRecommendationsQueryKey(searchConfig),
    [searchConfig]
  );

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

  const { data: recommendations, isFetching: isLoadingRecs } = useQuery<
    TSpotifyTrack[]
  >({
    queryKey: recommendationsQueryKey,
    queryFn: () => fetchRecommendationsForConfig(searchConfig),
    enabled: false,
    staleTime: 0,
  });

  const fetchRecs = useCallback(
    (config: TSpotifySearchConfig = searchConfig) => {
      return queryClient.fetchQuery({
        queryKey: getRecommendationsQueryKey(config),
        queryFn: () => fetchRecommendationsForConfig(config),
        staleTime: 0,
      });
    },
    [queryClient, searchConfig]
  );

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
    setArtists((currentArtists) =>
      produce(currentArtists, (draft: string[]) => {
        draft.push(...artist);
        return draft;
      })
    );
  };

  const setSearchConfig = (config: TSpotifySearchConfig) => {
    setArtists(config.artists);
    setGenres(config.genres);
    setFilters(config.filters);
  };

  const removeArtist = (artist: string) => {
    setArtists((currentArtists) =>
      produce(currentArtists, (draft: string[]) => {
        const index = draft.findIndex((a) => a === artist);
        if (index > -1) {
          draft.splice(index, 1);
        }
      })
    );
  };

  const addGenre = (genre: string) => {
    setGenres((currentGenres) =>
      produce(currentGenres, (draft: string[]) => {
        draft.push(genre);
      })
    );
  };

  const removeGenre = (genre: string) => {
    setGenres((currentGenres) =>
      produce(currentGenres, (draft: string[]) => {
        const index = draft.findIndex((g) => g === genre);
        if (index > -1) {
          draft.splice(index, 1);
        }
      })
    );
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
