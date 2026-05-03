"use client";

import spotifyTrackDetailsQuery from "@/queries/spotifyTrackDetailsQuery";
import { Slider, Table } from "@chakra-ui/react";
import { ReactNode, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { LoadingTextRows } from "./LoadingSkeleton";

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
  const { data, isLoading } = useQuery({
    queryKey: ["spotifyTrackDetails", id],
    queryFn: () => spotifyTrackDetailsQuery(id),
  });

  const atts = useMemo(() => {
    if (!data) {
      return [];
    }
    const nodes: ReactNode[] = [];
    attributes.forEach((key) =>
      nodes.push(
        <Table.Row key={key}>
          <Table.Cell textStyle="itemMeta">
            {key.toLowerCase() === "duration_ms"
              ? "duration"
              : key.toLowerCase() === "tempo"
              ? "bpm"
              : key}
          </Table.Cell>
          <Table.Cell textStyle="itemMeta" textAlign="right">
            {key.toLowerCase() === "duration_ms"
              ? msToMinAndSec(data[key])
              : key.toLowerCase() === "tempo"
              ? Number(data[key]).toFixed(1)
              : data[key]}
          </Table.Cell>
        </Table.Row>
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
        <Table.Row key={key}>
          <Table.Cell textStyle="itemMeta">
            {key === "valence" ? "positive vibe" : key}
          </Table.Cell>
          <Table.Cell textStyle="itemMeta" textAlign="right">
            <Slider.Root
              aria-label={[`${key} slider`]}
              defaultValue={[data[key] * 100]}
              min={0}
              max={100}
            >
              <Slider.Control>
                <Slider.Track>
                  <Slider.Range />
                </Slider.Track>
              </Slider.Control>
            </Slider.Root>
          </Table.Cell>
        </Table.Row>
      );
    });
    return nodes;
  }, [data]);

  return isLoading ? (
    <LoadingTextRows count={9} my={4} opacity={0.5} />
  ) : (
    <Table.ScrollArea bg="transparent">
      <Table.Root
        size="sm"
        bg="transparent"
        css={{
          "& tr": { background: "transparent !important" },
          "& td": {
            background: "transparent !important",
            border: "none",
            color: "var(--chakra-colors-whiteAlpha-900)",
            textTransform: "capitalize",
          },
        }}
      >
        <Table.Body>
          {atts}
          {sliderAtts}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  );
}
