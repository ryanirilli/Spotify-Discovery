import {
  TSpotifyRecommendationFilters,
  TSpotifySearchConfig,
} from "@/types/SpotifySearchConfig";

export const MAX_ENABLED_SEEDS = 5;

const FILTER_PARAM_RANGES = {
  min_tempo: { min: 1, max: Number.POSITIVE_INFINITY },
  max_tempo: { min: 1, max: Number.POSITIVE_INFINITY },
} satisfies Record<keyof TSpotifyRecommendationFilters, {
  min: number;
  max: number;
}>;

const FILTER_PARAM_KEYS = Object.keys(
  FILTER_PARAM_RANGES
) as (keyof TSpotifyRecommendationFilters)[];

function parseCsv(value: string | null) {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function toNumberInRange(value: unknown, min: number, max: number) {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }
  const num = Number(value);
  return Number.isFinite(num) && num >= min && num <= max ? num : undefined;
}

export function sanitizeRecommendationFilters(
  filters: TSpotifyRecommendationFilters
) {
  const next: TSpotifyRecommendationFilters = {};

  FILTER_PARAM_KEYS.forEach((key) => {
    const range = FILTER_PARAM_RANGES[key];
    const value = toNumberInRange(filters[key], range.min, range.max);
    if (value !== undefined) next[key] = value;
  });

  return next;
}

export function buildSearchStringFromConfig(config: TSpotifySearchConfig) {
  const params = new URLSearchParams();
  const filters = sanitizeRecommendationFilters(config.filters);
  if (config.artists.length) params.set("artists", config.artists.join(","));
  if (config.genres.length) params.set("genres", config.genres.join(","));
  FILTER_PARAM_KEYS.forEach((key) => {
    const value = filters[key];
    if (value !== undefined) params.set(key, String(value));
  });
  return params.toString();
}

export function parseSearchConfigFromParams(
  params: Pick<URLSearchParams, "get">
): TSpotifySearchConfig {
  const filters: TSpotifyRecommendationFilters = {};

  FILTER_PARAM_KEYS.forEach((key) => {
    const range = FILTER_PARAM_RANGES[key];
    const value = toNumberInRange(params.get(key), range.min, range.max);
    if (value !== undefined) filters[key] = value;
  });

  return {
    artists: parseCsv(params.get("artists")),
    genres: parseCsv(params.get("genres")),
    filters,
  };
}

export function normalizeSearchConfig(value: unknown): TSpotifySearchConfig {
  const input = typeof value === "object" && value !== null ? value : {};
  const raw = input as {
    artists?: unknown;
    genres?: unknown;
    filters?: Record<string, unknown>;
  };
  const filters: TSpotifyRecommendationFilters = {};

  FILTER_PARAM_KEYS.forEach((key) => {
    const range = FILTER_PARAM_RANGES[key];
    const value = toNumberInRange(raw.filters?.[key], range.min, range.max);
    if (value !== undefined) filters[key] = value;
  });

  return {
    artists: toStringArray(raw.artists),
    genres: toStringArray(raw.genres),
    filters,
  };
}

export function hasRecommendationSeeds(config: TSpotifySearchConfig) {
  return config.artists.length > 0 || config.genres.length > 0;
}

export function getEnabledArtistsForConfig(config: TSpotifySearchConfig) {
  const slots = Math.max(0, MAX_ENABLED_SEEDS - config.genres.length);
  if (slots <= 0) return [];
  return config.artists.slice(-slots);
}
