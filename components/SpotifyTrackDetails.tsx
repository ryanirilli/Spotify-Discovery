"use client";

import spotifyTrackDetailsQuery from "@/queries/spotifyTrackDetailsQuery";
import {
  List,
  ListItem,
  Skeleton,
  Slider,
  SliderFilledTrack,
  SliderTrack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Tr,
} from "@chakra-ui/react";
import { ReactNode, useMemo } from "react";
import { useQuery } from "react-query";

const attributes = new Set(["duration_ms", "tempo"]);

const sliderAttributes = new Set([
  "danceability",
  "energy",
  "speechiness",
  "acousticness",
  "instrumentalness",
  "liveness",
  "valence",
]);

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
  const { data, isLoading } = useQuery(["spotifyTrackDetails", id], () => {
    return spotifyTrackDetailsQuery(id);
  });

  const atts = useMemo(() => {
    if (!data) {
      return [];
    }
    const nodes: ReactNode[] = [];
    attributes.forEach((key) =>
      nodes.push(
        <Tr key={key}>
          <Td>
            {key.toLowerCase() === "duration_ms"
              ? "duration"
              : key.toLowerCase() === "tempo"
              ? "bpm"
              : key}
          </Td>
          <Td textAlign="right">
            {key.toLowerCase() === "duration_ms"
              ? msToMinAndSec(data[key])
              : key.toLowerCase() === "tempo"
              ? Number(data[key]).toFixed(1)
              : data[key]}
          </Td>
        </Tr>
      )
    );
    return nodes;
  }, [data]);

  const sliderAtts = useMemo(() => {
    if (!data) {
      return [];
    }
    const nodes: ReactNode[] = [];
    sliderAttributes.forEach((key) => {
      nodes.push(
        <Tr key={key}>
          <Td>{key === "valence" ? "positive vibe" : key}</Td>
          <Td textAlign="right">
            <Slider
              aria-label={`${key} slider`}
              defaultValue={data[key] * 100}
              min={0}
              max={100}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
            </Slider>
          </Td>
        </Tr>
      );
    });
    return nodes;
  }, [data]);

  return isLoading ? (
    <List>
      <ListItemPlaceholder />
      <ListItemPlaceholder />
      <ListItemPlaceholder />
      <ListItemPlaceholder />
      <ListItemPlaceholder />
      <ListItemPlaceholder />
      <ListItemPlaceholder />
      <ListItemPlaceholder />
      <ListItemPlaceholder />
    </List>
  ) : (
    <TableContainer>
      <Table size="sm">
        <Tbody>
          {atts}
          {sliderAtts}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

function ListItemPlaceholder() {
  return (
    <ListItem px={2} my={4} opacity={0.5}>
      <Skeleton borderRadius="full" height="20px" />
    </ListItem>
  );
}
