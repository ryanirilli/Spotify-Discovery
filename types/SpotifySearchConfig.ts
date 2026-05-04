export type TSpotifyRecommendationFilters = {
  min_tempo?: number;
  max_tempo?: number;
};

export type TSpotifySearchConfig = {
  artists: string[];
  genres: string[];
  filters: TSpotifyRecommendationFilters;
};
