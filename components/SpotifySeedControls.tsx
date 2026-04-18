"use client";

import { Button, Flex, HStack, Icon } from "@chakra-ui/react";
import { useContext } from "react";
import SpotifyAutocomplete from "./SpotifyAutocomplete";
import { SpotifyRecommendationsContext } from "./SpotifyRecommendationsProvider";
import { MdClose } from "react-icons/md";

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
            variant="ghost"
            color="white"
            _hover={{ bg: "whiteAlpha.200" }}
            _active={{ bg: "whiteAlpha.300" }}
            onClick={() => {
              window.scroll(0, 0);
              setArtists?.([]);
            }}
          >
            <Icon as={MdClose} boxSize={4} />
            Clear all
          </Button>
        )}
      </HStack>
    </Flex>
  );
}
