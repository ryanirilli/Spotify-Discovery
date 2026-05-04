"use client";

import { useEffect, useState } from "react";
import { Box, Flex, Grid, HStack, Slider, Text } from "@chakra-ui/react";
import { Button } from "@/components/ui/Button";
import { TSpotifyRecommendationFilters } from "./SpotifyRecommendationsProvider";

const TEMPO_STEP = 5;
const TEMPO_MIN = 40;
const TEMPO_MAX = 200;
const DEFAULT_TEMPO_RANGE: [number, number] = [TEMPO_MIN, TEMPO_MAX];

type TTempoPreset = {
  label: string;
  description: string;
  range: [number, number];
};

const TEMPO_PRESETS: TTempoPreset[] = [
  { label: "Slow", description: "<= 90 BPM", range: [TEMPO_MIN, 90] },
  { label: "Mid", description: "90-120 BPM", range: [90, 120] },
  { label: "Upbeat", description: "120-140 BPM", range: [120, 140] },
  { label: "Fast", description: "140+ BPM", range: [140, TEMPO_MAX] },
];

interface ISpotifyTempoFilter {
  value: TSpotifyRecommendationFilters;
  onCommit: (next: TSpotifyRecommendationFilters) => void;
  onApplied?: () => void;
}

function hasTempoFilter(filters: TSpotifyRecommendationFilters) {
  return filters.min_tempo !== undefined || filters.max_tempo !== undefined;
}

function clampTempo(value: number) {
  return Math.max(TEMPO_MIN, Math.min(TEMPO_MAX, value));
}

function getTempoRange(filters: TSpotifyRecommendationFilters): [number, number] {
  const min = clampTempo(filters.min_tempo ?? DEFAULT_TEMPO_RANGE[0]);
  const max = clampTempo(filters.max_tempo ?? DEFAULT_TEMPO_RANGE[1]);
  return min <= max ? [min, max] : [max, min];
}

function getTempoFilters(range: [number, number]) {
  const [min, max] = range;
  const filters: TSpotifyRecommendationFilters = {};
  if (min > TEMPO_MIN) filters.min_tempo = min;
  if (max < TEMPO_MAX) filters.max_tempo = max;
  return filters;
}

function formatTempoRangeLabel(range: [number, number]) {
  const [min, max] = range;
  const hasMin = min > TEMPO_MIN;
  const hasMax = max < TEMPO_MAX;

  if (!hasMin && !hasMax) return "Any tempo";
  if (!hasMin) return `Up to ${max} BPM`;
  if (!hasMax) return `${min}+ BPM`;
  return `${min}-${max} BPM`;
}

function isTempoPresetMatch(range: [number, number], preset: TTempoPreset) {
  return range[0] === preset.range[0] && range[1] === preset.range[1];
}

export function getTempoFilterCount(filters: TSpotifyRecommendationFilters) {
  return hasTempoFilter(filters) ? 1 : 0;
}

export function getTempoFilterLabel(filters: TSpotifyRecommendationFilters) {
  if (!hasTempoFilter(filters)) return null;
  return formatTempoRangeLabel(getTempoRange(filters));
}

export default function SpotifyTempoFilter({
  value,
  onCommit,
  onApplied,
}: ISpotifyTempoFilter) {
  const [tempoDraft, setTempoDraft] = useState<[number, number]>(() =>
    getTempoRange(value)
  );

  useEffect(() => {
    setTempoDraft(getTempoRange(value));
  }, [value.min_tempo, value.max_tempo]);

  const activeTempoPresetLabel = TEMPO_PRESETS.find((preset) =>
    isTempoPresetMatch(tempoDraft, preset)
  )?.label;

  const onReset = () => {
    setTempoDraft(DEFAULT_TEMPO_RANGE);
    onCommit({});
    onApplied?.();
  };

  const onApply = () => {
    onCommit(getTempoFilters(tempoDraft));
    onApplied?.();
  };

  return (
    <Box w="100%" maxW="100%" minW={0} overflowX="hidden">
      <Box mb={4}>
        <Text textStyle="sectionTitle" color="white">
          Tempo
        </Text>
        <Text textStyle="microLabel" color="whiteAlpha.600">
          Set the BPM range for recommendations
        </Text>
      </Box>

      <Flex direction="column" gap={4}>
        <Box minW={0}>
          <Text textStyle="controlLabel" color="white" mb={2}>
            Presets
          </Text>
          <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap={2}>
            {TEMPO_PRESETS.map((preset) => (
              <PresetButton
                key={preset.label}
                label={preset.label}
                description={preset.description}
                active={activeTempoPresetLabel === preset.label}
                onClick={() => setTempoDraft(preset.range)}
              />
            ))}
          </Grid>
        </Box>

        <Box minW={0}>
          <Text textStyle="controlLabel" color="white" mb={1}>
            Custom range
          </Text>
          <Text textStyle="microLabel" color="whiteAlpha.600" mb={2}>
            {formatTempoRangeLabel(tempoDraft)}
          </Text>
          <Slider.Root
            aria-label={["Minimum tempo", "Maximum tempo"]}
            min={TEMPO_MIN}
            max={TEMPO_MAX}
            step={TEMPO_STEP}
            minStepsBetweenThumbs={2}
            value={tempoDraft}
            colorPalette="electricPurple"
            onValueChange={(event) =>
              setTempoDraft(event.value as [number, number])
            }
            css={{
              "--slider-thumb-size": "20px",
              "--slider-track-size": "8px",
            }}
          >
            <Slider.Control py={2}>
              <Slider.Track bg="whiteAlpha.200">
                <Slider.Range bg="electricPurple.500" />
              </Slider.Track>
              <Slider.Thumb
                index={0}
                bg="white"
                borderColor="electricPurple.500"
                borderWidth="2px"
                shadow="md"
              >
                <Slider.HiddenInput />
              </Slider.Thumb>
              <Slider.Thumb
                index={1}
                bg="white"
                borderColor="electricPurple.500"
                borderWidth="2px"
                shadow="md"
              >
                <Slider.HiddenInput />
              </Slider.Thumb>
            </Slider.Control>
          </Slider.Root>
          <HStack justifyContent="space-between" mt={1}>
            <Text textStyle="microLabel" color="whiteAlpha.500">
              Slow
            </Text>
            <Text textStyle="microLabel" color="whiteAlpha.500">
              Fast
            </Text>
          </HStack>
        </Box>
      </Flex>

      <Box mt={4} pt={3} pb={1} position="sticky" bottom="-16px" bg="gray.950">
        <Flex gap={2}>
          <Button visual="secondary" size="sm" flex={1} onClick={onReset}>
            Reset
          </Button>
          <Button visual="primary" size="sm" flex={1} onClick={onApply}>
            Apply
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}

function PresetButton({
  label,
  description,
  active,
  onClick,
}: {
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      visual="secondary"
      size="sm"
      h="52px"
      px={3}
      minW={0}
      borderRadius="md"
      bg={active ? "rgba(176, 38, 255, 0.22)" : undefined}
      borderColor={active ? "rgba(217, 141, 255, 0.45)" : "transparent"}
      borderWidth="1px"
      justifyContent="flex-start"
      aria-pressed={active}
      _hover={{
        bg: active ? "rgba(176, 38, 255, 0.3)" : "whiteAlpha.300",
      }}
      _active={{
        bg: active ? "rgba(176, 38, 255, 0.36)" : "whiteAlpha.400",
      }}
      onClick={onClick}
    >
      <Flex direction="column" alignItems="flex-start" lineHeight="1.1" minW={0}>
        <Text as="span" textStyle="controlLabel" lineClamp={1}>
          {label}
        </Text>
        <Text
          as="span"
          textStyle="microLabel"
          color={active ? "whiteAlpha.800" : "whiteAlpha.700"}
          opacity={0.7}
          lineClamp={1}
        >
          {description}
        </Text>
      </Flex>
    </Button>
  );
}
