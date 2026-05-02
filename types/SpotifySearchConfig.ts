export type TSpotifyRecommendationFilters = {
  target_tempo?: number;
  max_tempo?: number;
};

export type TSpotifySearchConfig = {
  artists: string[];
  genres: string[];
  filters: TSpotifyRecommendationFilters;
};
