"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Box,
  Button,
  Flex,
  Spacer,
  Input,
  InputGroup,
  Icon,
  List,
  Text,
} from "@chakra-ui/react";

import { CgSearch } from "react-icons/cg";
import { artistSearchQuery } from "@/queries/spotifyArtistSearchQuery";
import { useQuery } from "@tanstack/react-query";
import {
  SpotifyRecommendationsContext,
  TSpotifyRecommendationsContext,
} from "@/components/SpotifyRecommendationsProvider";
import { TSpotifyArtist } from "@/types/SpotifyArtist";
import scrollBarStyle from "@/utils/scrollBarStyle";
import useListSelection from "@/utils/useListSelection";

interface SpotifyAutocompleteContextType {
  isNew: boolean;
  setIsNew: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SpotifyAutocompleteContext =
  createContext<SpotifyAutocompleteContextType>(
    {} as SpotifyAutocompleteContextType
  );

interface ISpotifyAutocompleteProvider {
  children: React.ReactNode;
}

export function SpotifyAutocompleteProvider({
  children,
}: ISpotifyAutocompleteProvider) {
  const [isNew, setIsNew] = useState<boolean>(false);

  return (
    <SpotifyAutocompleteContext.Provider value={{ isNew, setIsNew }}>
      {children}
    </SpotifyAutocompleteContext.Provider>
  );
}

export default function SpotifyAutocomplete() {
  const { isNew, setIsNew } = useContext(SpotifyAutocompleteContext);
  const router = useRouter();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [artist, setArtist] = useState("");
  const [isResultsShowing, setIsResultsShowing] = useState(false);
  const { addArtists, artists, fetchRecs, isSeedLimitReached } = useContext(
    SpotifyRecommendationsContext
  ) as TSpotifyRecommendationsContext;

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsResultsShowing(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const { data: spotifyArtists } = useQuery<TSpotifyArtist[]>({
    queryKey: ["spotifyArtist", artist],
    queryFn: () => {
      if (artist.length < 2) {
        return [];
      }
      return artistSearchQuery(artist);
    },
  });

  const { selectedIndex } = useListSelection<TSpotifyArtist>({
    initialItems: spotifyArtists || [],
    onSelect(selected: TSpotifyArtist | null) {
      !isSeedLimitReached && selected && onAddArtist(selected);
    },
  });

  useEffect(() => {
    if (spotifyArtists?.length) {
      setIsResultsShowing(true);
    }
  }, [spotifyArtists]);

  useEffect(() => {
    if (isNew) {
      inputRef.current?.focus();
    }
  }, [isNew]);

  const onFocus = () => {
    if (spotifyArtists?.length && !isResultsShowing) {
      setIsResultsShowing(true);
    }
  };

  const onAddArtist = (artist: TSpotifyArtist) => {
    addArtists([artist.id]);
    setIsResultsShowing(false);
    setIsNew(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    if (pathname === "/search") {
      setTimeout(fetchRecs, 0);
    } else {
      // On /home or /track/[id], jump to /search — SpotifySearchSync will
      // mirror the current provider state into the URL and fetch.
      router.push("/search");
    }
  };

  const shouldShowResults =
    (Boolean(spotifyArtists?.length) && isResultsShowing) || isNew;

  const isNewExperience = isNew && !spotifyArtists?.length;

  return (
    <Box
      position="relative"
      ref={containerRef}
      maxW="md"
      w={["auto", "md"]}
      flex={1}
    >
      <InputGroup
        startElement={<Icon as={CgSearch} color="gray.500" />}
      >
        <Input
          size="sm"
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
      {shouldShowResults && (
        <Box
          boxShadow="dark-lg"
          position={"absolute"}
          top={"calc(100% + 8px)"}
          left={0}
          w={["calc(100vw - 16px)", "100%"]}
          zIndex="dropdown"
        >
          <List.Root
            listStyle="none"
            role="listbox"
            maxH="xs"
            overflowY={isNew ? "hidden" : "scroll"}
            zIndex="modal"
            bg={isNewExperience ? "transparent" : "gray.100"}
            borderRadius="md"
            css={scrollBarStyle}
          >
            {isNewExperience && (
              <Box p={4} bg="black" color="white">
                <Text fontSize="xl">
                  &#x261D; Search for your favorite artist
                </Text>
              </Box>
            )}
            {spotifyArtists?.map((artist, i) => {
              const isSelected = selectedIndex === i;
              return (
                <List.Item
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
                        size="xs"
                        disabled={isSeedLimitReached ? true : false}
                      >
                        Add
                      </Button>
                    )}
                  </Flex>
                </List.Item>
              );
            })}
          </List.Root>
        </Box>
      )}
    </Box>
  );
}
