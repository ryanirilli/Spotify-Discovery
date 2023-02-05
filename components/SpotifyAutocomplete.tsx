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
import spotifyArtistQuery from "@/queries/spoitifyArtistQuery";
import { useQuery } from "react-query";
import {
  SpotifyRecommendationsContext,
  TSpotifyRecommendationsContext,
} from "@/components/SpotifyRecommendationsProvider";
import { TSpotifyArtist } from "@/types/SpotifyArtist";
import scrollBarStyle from "@/utils/scrollBarStyle";

export default function SpotifyAutocomplete() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [artist, setArtist] = useState("");
  const [isResultsShowing, setIsResultsShowing] = useBoolean();
  const { addArtist, artists, fetchRecs } = useContext(
    SpotifyRecommendationsContext
  ) as TSpotifyRecommendationsContext;

  useOutsideClick({
    ref: containerRef,
    handler: () => setIsResultsShowing.off(),
  });

  const { data } = useQuery<TSpotifyArtist[]>(["spotifyArtist", artist], () =>
    spotifyArtistQuery(artist)
  );

  useEffect(() => {
    if (data?.length) {
      setIsResultsShowing.on();
    }
  }, [data, setIsResultsShowing]);

  const onFocus = () => {
    if (data?.length && !isResultsShowing) {
      setIsResultsShowing.on();
    }
  };

  const onAddArtist = (artist: TSpotifyArtist) => {
    addArtist(artist);
    setIsResultsShowing.off();
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setTimeout(fetchRecs, 0);
  };

  const artistIds = artists.map((artist) => artist.id);

  return (
    <Box position="relative" ref={containerRef} maxW="md" w={["auto", "md"]}>
      <InputGroup size="lg">
        <InputLeftElement
          pointerEvents="none"
          children={
            <Icon as={CgSearch} color="gray.500" transform="translateY(-3px)" />
          }
        />
        <Input
          borderRadius="full"
          bg="whiteAlpha.800"
          w="100%"
          size="md"
          ref={inputRef}
          onFocus={onFocus}
          placeholder="Search for an artist"
          onChange={(e) => setArtist(e.target.value)}
        />
      </InputGroup>
      {Boolean(data?.length) && isResultsShowing && (
        <Box
          boxShadow={"md"}
          position={"absolute"}
          top={"calc(100% + 8px)"}
          left={0}
          right={0}
          zIndex="dropdown"
        >
          <List
            spacing={2}
            role="listbox"
            maxH="xs"
            overflowY="scroll"
            zIndex="modal"
            bg="gray.100"
            borderRadius="md"
            sx={scrollBarStyle}
          >
            {data?.map((artist, i) => (
              <ListItem
                role="option"
                aria-setsize={data.length}
                aria-posinset={i + 1}
                key={artist.id}
              >
                <Flex alignItems="center" px={2}>
                  <Text>{artist.name}</Text>
                  <Spacer />
                  {!artistIds.includes(artist.id) && (
                    <Button size="sm" onClick={() => onAddArtist(artist)}>
                      Add
                    </Button>
                  )}
                </Flex>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
}
