"use client";

import { Box } from "@chakra-ui/react";
import { usePathname } from "next/navigation";

interface ISpotifyTopNavDiscoPattern {
  rows?: number;
}

const DISCO_PATTERN_COLUMNS = 42;
const DISCO_PATTERN_SQUARE_SIZE = 10;
const DISCO_PATTERN_GAP = 5;

function getSquareColor(row: number, column: number) {
  const rightFade = (column + 1) / DISCO_PATTERN_COLUMNS;
  const shimmer =
    [0.18, 0.42, 0.28, 0.52, 0.24, 0.62, 0.34][
      (row * 3 + column * 5) % 7
    ];
  const opacity = 0.018 + rightFade * shimmer * 0.1;
  const hue =
    (row + column) % 11 === 0
      ? "176, 38, 255"
      : (row * 2 + column) % 13 === 0
        ? "49, 215, 255"
        : "255, 255, 255";

  return `rgba(${hue}, ${opacity.toFixed(3)})`;
}

export default function SpotifyTopNavDiscoPattern({
  rows = 4,
}: ISpotifyTopNavDiscoPattern) {
  const pathname = usePathname();

  if (pathname !== "/search" && pathname !== "/home") {
    return null;
  }

  const squares = Array.from(
    { length: DISCO_PATTERN_COLUMNS * rows },
    (_, index) => {
      const row = Math.floor(index / DISCO_PATTERN_COLUMNS);
      const column = index % DISCO_PATTERN_COLUMNS;

      return getSquareColor(row, column);
    }
  );

  return (
    <Box
      aria-hidden="true"
      position="absolute"
      inset={0}
      zIndex={0}
      display={["none", "block"]}
      pointerEvents="none"
      overflow="hidden"
      css={{
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.1) 24%, rgba(0,0,0,0.62) 58%, #000 100%)",
        maskImage:
          "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.1) 24%, rgba(0,0,0,0.62) 58%, #000 100%)",
      }}
    >
      <Box
        position="absolute"
        insetY={0}
        right={0}
        display="grid"
        gridTemplateColumns={`repeat(${DISCO_PATTERN_COLUMNS}, ${DISCO_PATTERN_SQUARE_SIZE}px)`}
        gridAutoRows={`${DISCO_PATTERN_SQUARE_SIZE}px`}
        alignContent="space-between"
        justifyContent="end"
        gap={`${DISCO_PATTERN_GAP}px`}
        w={`${
          DISCO_PATTERN_COLUMNS * DISCO_PATTERN_SQUARE_SIZE +
          (DISCO_PATTERN_COLUMNS - 1) * DISCO_PATTERN_GAP
        }px`}
        maxW="100%"
      >
        {squares.map((background, index) => (
          <Box
            key={index}
            w={`${DISCO_PATTERN_SQUARE_SIZE}px`}
            h={`${DISCO_PATTERN_SQUARE_SIZE}px`}
            borderRadius="2px"
            bg={background}
          />
        ))}
      </Box>
    </Box>
  );
}
