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
  const { addArtist, artists, fetchRecs, isSeedLimitReached } = useContext(
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
          bg="white"
          w="100%"
          ref={inputRef}
          onFocus={onFocus}
          placeholder="Search for an artist"
          onChange={(e) => setArtist(e.target.value)}
        />
      </InputGroup>
      {Boolean(data?.length) && isResultsShowing && (
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
            {data?.map((artist, i) => (
              <ListItem
                role="option"
                aria-setsize={data.length}
                aria-posinset={i + 1}
                key={artist.id}
                _hover={{ bg: "gray.200" }}
                py={2}
                onClick={() => !isSeedLimitReached && onAddArtist(artist)}
              >
                <Flex alignItems="center" px={2}>
                  <Text>{artist.name}</Text>
                  <Spacer />
                  {!artistIds.includes(artist.id) && (
                    <Button opacity={isSeedLimitReached ? 0.5 : 1} size="sm">
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
