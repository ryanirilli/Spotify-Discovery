"use client";

import { Button, Flex, HStack, Icon } from "@chakra-ui/react";
import { useContext } from "react";
import SpotifyAutocomplete from "./SpotifyAutocomplete";
import { SpotifyRecommendationsContext } from "./SpotifyRecommendationsProvider";
import { FaBackward } from "react-icons/fa";

export default function SpotifySeedControls() {
  const { artists, setArtists } =
    useContext(SpotifyRecommendationsContext) || {};
  return (
    <Flex>
      <HStack px={2} flex={1}>
        <SpotifyAutocomplete />
        {(artists?.length ?? 0 > 0) && (
          <Button
            leftIcon={<Icon as={FaBackward} boxSize={4} />}
            size="sm"
            colorScheme="red"
            borderRadius="full"
            onClick={() => {
              window.scroll(0, 0);
              setArtists?.([]);
            }}
          >
            Reset Search
          </Button>
        )}
      </HStack>
    </Flex>
  );
}
