"use client";

import spotifyTrackDetailsQuery from "@/queries/spotifyTrackDetailsQuery";
import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { LoadingTextRows } from "./LoadingSkeleton";

const attributes = [
  {
    key: "duration_ms",
    label: "Duration",
    format: msToMinAndSec,
  },
  {
    key: "tempo",
    label: "BPM",
    format: (value: number) => value.toFixed(1),
  },
] as const;

const meterAttributes = [
  { key: "danceability", label: "Danceability" },
  { key: "energy", label: "Energy" },
  { key: "speechiness", label: "Speechiness" },
  { key: "acousticness", label: "Acousticness" },
  { key: "instrumentalness", label: "Instrumentalness" },
  { key: "liveness", label: "Liveness" },
  { key: "valence", label: "Positive vibe" },
] as const;

function msToMinAndSec(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Number(((ms % 60000) / 1000).toFixed(0));
  const formatted = `${minutes}:${(seconds < 10 ? "0" : "") + seconds}`;
  return seconds === 60 ? `${minutes + 1}:00` : formatted;
}

interface ISpotifyTrackDetails {
  id: string;
}

export default function SpotifyTrackDetails({ id }: ISpotifyTrackDetails) {
  const { data, isLoading } = useQuery({
    queryKey: ["spotifyTrackDetails", id],
    queryFn: () => spotifyTrackDetailsQuery(id),
  });

  const atts = useMemo(() => {
    if (!data) {
      return [];
    }
    return attributes
      .filter(({ key }) => typeof data[key] === "number")
      .map(({ key, label, format }) => ({
        key,
        label,
        value: format(data[key]),
      }));
  }, [data]);

  const meterAtts = useMemo(() => {
    if (!data) {
      return [];
    }
    return meterAttributes
      .filter(({ key }) => typeof data[key] === "number")
      .map(({ key, label }) => ({
        key,
        label,
        percent: Math.max(0, Math.min(100, Math.round(data[key] * 100))),
      }));
  }, [data]);

  return isLoading ? (
    <LoadingTextRows count={9} my={4} opacity={0.5} />
  ) : (
    <Stack gap={4}>
      {atts.length > 0 && (
        <Stack gap={2}>
          {atts.map((attribute) => (
            <Flex
              key={attribute.key}
              alignItems="center"
              justifyContent="space-between"
              gap={3}
            >
              <Text textStyle="itemMeta" color="whiteAlpha.600">
                {attribute.label}
              </Text>
              <Text textStyle="itemMeta" color="whiteAlpha.900">
                {attribute.value}
              </Text>
            </Flex>
          ))}
        </Stack>
      )}
      <Stack gap={3}>
        {meterAtts.map((attribute) => (
          <Flex
            key={attribute.key}
            alignItems="center"
            justifyContent="space-between"
            gap={3}
          >
            <Flex
              alignItems="center"
              minW={0}
              flex={1}
            >
              <Text textStyle="itemMeta" color="whiteAlpha.700">
                {attribute.label}
              </Text>
            </Flex>
            <Box
              h="6px"
              w="46%"
              minW="112px"
              maxW="160px"
              overflow="hidden"
              borderRadius="full"
              bg="whiteAlpha.100"
              boxShadow="inset 0 0 0 1px rgba(255, 255, 255, 0.04)"
            >
              <Box
                h="100%"
                w={`${attribute.percent}%`}
                minW={attribute.percent > 0 ? "2px" : 0}
                borderRadius="full"
                bg="whiteAlpha.700"
              />
            </Box>
          </Flex>
        ))}
      </Stack>
    </Stack>
  );
}
