"use client";

import { Button, Flex, HStack } from "@chakra-ui/react";
import { useContext } from "react";
import SpotifyAutocomplete from "./SpotifyAutocomplete";
import { SpotifyRecommendationsContext } from "./SpotifyRecommendationsProvider";

export default function SpotifySeedControls() {
  const { artists, setArtists } =
    useContext(SpotifyRecommendationsContext) || {};
  return (
    <Flex>
      <HStack px={2} flex={1}>
        <SpotifyAutocomplete />
        {(artists?.length ?? 0 > 0) && (
          <Button
            size="sm"
            variant="outline"
            borderColor={"whiteAlpha.400"}
            color="whiteAlpha.500"
            _hover={{ color: "whiteAlpha.700", bg: "whiteAlpha.300" }}
            borderRadius="full"
            onClick={() => setArtists?.([])}
          >
            Clear
          </Button>
        )}
      </HStack>
    </Flex>
  );
}
