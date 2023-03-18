"use client";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Spacer,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  List,
  ListItem,
  Text,
  useBoolean,
  useOutsideClick,
} from "@chakra-ui/react";

import { CgSearch } from "react-icons/cg";
import { artistSearchQuery } from "@/queries/spotifyArtistSearchQuery";
import { useQuery } from "react-query";
import {
  SpotifyRecommendationsContext,
  TSpotifyRecommendationsContext,
} from "@/components/SpotifyRecommendationsProvider";
import { TSpotifyArtist } from "@/types/SpotifyArtist";
import scrollBarStyle from "@/utils/scrollBarStyle";
import useListSelection from "@/utils/useListSelection";

export default function SpotifyAutocomplete() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [artist, setArtist] = useState("");
  const [isResultsShowing, setIsResultsShowing] = useBoolean();
  const { addArtists, artists, fetchRecs, isSeedLimitReached } = useContext(
    SpotifyRecommendationsContext
  ) as TSpotifyRecommendationsContext;

  useOutsideClick({
    ref: containerRef,
    handler: () => setIsResultsShowing.off(),
  });

  const { data: spotifyArtists } = useQuery<TSpotifyArtist[]>(
    ["spotifyArtist", artist],
    () => {
      if (artist.length < 2) {
        return [];
      }
      return artistSearchQuery(artist);
    }
  );

  const { selectedIndex } = useListSelection<TSpotifyArtist>({
    initialItems: spotifyArtists || [],
    onSelect(selected: TSpotifyArtist | null) {
      !isSeedLimitReached && selected && onAddArtist(selected);
    },
  });

  useEffect(() => {
    if (spotifyArtists?.length) {
      setIsResultsShowing.on();
    }
  }, [spotifyArtists, setIsResultsShowing]);

  const onFocus = () => {
    if (spotifyArtists?.length && !isResultsShowing) {
      setIsResultsShowing.on();
    }
  };

  const onAddArtist = (artist: TSpotifyArtist) => {
    addArtists([artist.id]);
    setIsResultsShowing.off();
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setTimeout(fetchRecs, 0);
  };

  return (
    <Box
      position="relative"
      ref={containerRef}
      maxW="md"
      w={["auto", "md"]}
      flex={1}
    >
      <InputGroup size="sm">
        <InputLeftElement
          pointerEvents="none"
          children={<Icon as={CgSearch} color="gray.500" />}
        />
        <Input
          borderRadius="full"
          borderColor="whiteAlpha.300"
          color="white"
          bg="whiteAlpha.200"
          w="100%"
          ref={inputRef}
          onFocus={onFocus}
          placeholder="Search for an artist"
          onChange={(e) => setArtist(e.target.value)}
        />
      </InputGroup>
      {Boolean(spotifyArtists?.length) && isResultsShowing && (
        <Box
          boxShadow="dark-lg"
          position={"absolute"}
          top={"calc(100% + 8px)"}
          left={0}
          w={["calc(100vw - 16px)", "100%"]}
          zIndex="dropdown"
        >
          <List
            role="listbox"
            maxH="xs"
            overflowY="scroll"
            zIndex="modal"
            bg="gray.100"
            borderRadius="md"
            sx={scrollBarStyle}
          >
            {spotifyArtists?.map((artist, i) => {
              const isSelected = selectedIndex === i;
              return (
                <ListItem
                  role="option"
                  aria-setsize={spotifyArtists.length}
                  aria-posinset={i + 1}
                  key={artist.id}
                  _hover={{ bg: "gray.200" }}
                  bg={isSelected ? "gray.200" : "transparent"}
                  py={2}
                  onClick={() => !isSeedLimitReached && onAddArtist(artist)}
                >
                  <Flex alignItems="center" px={2}>
                    <Text>{artist.name}</Text>
                    <Spacer />
                    {!artists.includes(artist.id) && (
                      <Button
                        colorScheme="purple"
                        size="xs"
                        isDisabled={isSeedLimitReached ? true : false}
                      >
                        Add
                      </Button>
                    )}
                  </Flex>
                </ListItem>
              );
            })}
          </List>
        </Box>
      )}
    </Box>
  );
}
