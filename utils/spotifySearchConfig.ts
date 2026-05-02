import {
  TSpotifyRecommendationFilters,
  TSpotifySearchConfig,
} from "@/types/SpotifySearchConfig";

export const MAX_ENABLED_SEEDS = 5;

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

function toPositiveNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : undefined;
}

export function buildSearchStringFromConfig(config: TSpotifySearchConfig) {
  const params = new URLSearchParams();
  if (config.artists.length) params.set("artists", config.artists.join(","));
  if (config.genres.length) params.set("genres", config.genres.join(","));
  if (config.filters.target_tempo) {
    params.set("target_tempo", String(config.filters.target_tempo));
  }
  if (config.filters.max_tempo) {
    params.set("max_tempo", String(config.filters.max_tempo));
  }
  return params.toString();
}

export function parseSearchConfigFromParams(
  params: Pick<URLSearchParams, "get">
): TSpotifySearchConfig {
  const targetTempo = toPositiveNumber(params.get("target_tempo"));
  const maxTempo = toPositiveNumber(params.get("max_tempo"));
  const filters: TSpotifyRecommendationFilters = {};

  if (targetTempo) filters.target_tempo = targetTempo;
  if (maxTempo) filters.max_tempo = maxTempo;

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
  const targetTempo = toPositiveNumber(raw.filters?.target_tempo);
  const maxTempo = toPositiveNumber(raw.filters?.max_tempo);
  const filters: TSpotifyRecommendationFilters = {};

  if (targetTempo) filters.target_tempo = targetTempo;
  if (maxTempo) filters.max_tempo = maxTempo;

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
