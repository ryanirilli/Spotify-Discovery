"use client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Box,
  Flex,
  Spacer,
  Input,
  InputGroup,
  Icon,
  List,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { Button } from "@/components/ui/Button";

import { CgSearch } from "react-icons/cg";
import { artistSearchQuery } from "@/queries/spotifyArtistSearchQuery";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
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

const MIN_SEARCH_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 180;
const EMPTY_ARTISTS: TSpotifyArtist[] = [];

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
  const searchTerm = artist.trim();
  const [debouncedArtist, setDebouncedArtist] = useState("");
  const [isResultsShowing, setIsResultsShowing] = useState(false);
  const { addArtists, artists, fetchRecs, isSeedLimitReached } = useContext(
    SpotifyRecommendationsContext
  ) as TSpotifyRecommendationsContext;

  const hasSearchTerm = searchTerm.length >= MIN_SEARCH_LENGTH;
  const hasDebouncedSearchTerm =
    debouncedArtist.length >= MIN_SEARCH_LENGTH;

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

  useEffect(() => {
    if (!hasSearchTerm) {
      setDebouncedArtist("");
      return;
    }

    const timeout = window.setTimeout(() => {
      setDebouncedArtist(searchTerm);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeout);
  }, [hasSearchTerm, searchTerm]);

  const {
    data: spotifyArtists,
    isError,
    isFetching,
  } = useQuery<TSpotifyArtist[]>({
    queryKey: ["spotifyArtist", debouncedArtist],
    queryFn: () => artistSearchQuery(debouncedArtist),
    enabled: hasDebouncedSearchTerm,
    placeholderData: (previousData, previousQuery) => {
      const previousArtist = previousQuery?.queryKey[1];

      return typeof previousArtist === "string" &&
        previousArtist.length >= MIN_SEARCH_LENGTH
        ? previousData
        : undefined;
    },
  });

  const visibleArtists = useMemo(() => {
    if (!hasSearchTerm || !hasDebouncedSearchTerm) {
      return EMPTY_ARTISTS;
    }

    return spotifyArtists || EMPTY_ARTISTS;
  }, [hasDebouncedSearchTerm, hasSearchTerm, spotifyArtists]);

  const isWaitingToSearch =
    hasSearchTerm && debouncedArtist !== searchTerm;
  const isSearching = hasSearchTerm && (isWaitingToSearch || isFetching);
  const hasResults = visibleArtists.length > 0;
  const shouldShowEmptyState =
    hasSearchTerm && !isSearching && !isError && !hasResults;

  const { selectedIndex } = useListSelection<TSpotifyArtist>({
    initialItems: visibleArtists,
    enabled: isResultsShowing && hasResults,
    onSelect(selected: TSpotifyArtist | null) {
      if (!isResultsShowing || isSeedLimitReached || !selected) {
        return;
      }

      onAddArtist(selected);
    },
  });

  useEffect(() => {
    if (isNew) {
      inputRef.current?.focus();
      setIsResultsShowing(true);
    }
  }, [isNew]);

  const onFocus = () => {
    if ((hasSearchTerm || isNew) && !isResultsShowing) {
      setIsResultsShowing(true);
    }
  };

  const onArtistChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextArtist = event.target.value;
    setArtist(nextArtist);
    setIsResultsShowing(
      nextArtist.trim().length >= MIN_SEARCH_LENGTH || isNew
    );
  };

  const onAddArtist = (artist: TSpotifyArtist) => {
    addArtists([artist.id], [artist]);
    setArtist("");
    setDebouncedArtist("");
    setIsResultsShowing(false);
    setIsNew(false);
    if (pathname === "/search") {
      setTimeout(fetchRecs, 0);
    } else {
      // On /home or /track/[id], jump to /search — SpotifySearchSync will
      // mirror the current provider state into the URL and fetch.
      router.push("/search");
    }
  };

  const isNewExperience = isNew && !hasSearchTerm;

  const shouldShowResults =
    isResultsShowing && (hasSearchTerm || isNewExperience);

  const autocompleteSurface = shouldShowResults
    ? "var(--chakra-colors-gray-950)"
    : "var(--chakra-colors-black)";
  const autocompleteBorderLayers = [
    "radial-gradient(ellipse 72px 42px at left bottom, rgba(255, 255, 255, 0.44) 0%, rgba(255, 255, 255, 0.26) 32%, transparent 68%) border-box",
    "radial-gradient(ellipse 72px 42px at right top, rgba(255, 255, 255, 0.44) 0%, rgba(255, 255, 255, 0.26) 32%, transparent 68%) border-box",
    "linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.08)) border-box",
  ].join(", ");
  const autocompleteFocusBorderLayers = [
    "radial-gradient(ellipse 78px 46px at left bottom, rgba(255, 255, 255, 0.58) 0%, rgba(255, 255, 255, 0.34) 32%, transparent 68%) border-box",
    "radial-gradient(ellipse 78px 46px at right top, rgba(255, 255, 255, 0.58) 0%, rgba(255, 255, 255, 0.34) 32%, transparent 68%) border-box",
    "linear-gradient(180deg, rgba(255, 255, 255, 0.24), rgba(255, 255, 255, 0.1)) border-box",
  ].join(", ");
  const autocompleteShadow = [
    shouldShowResults ? "var(--chakra-shadows-dark-lg)" : undefined,
    "inset 0 -1px 0 rgba(0, 0, 0, 0.45)",
  ]
    .filter(Boolean)
    .join(", ");
  const autocompleteFocusShadow = [
    "0 0 0 1px rgba(255, 255, 255, 0.14)",
    shouldShowResults ? "var(--chakra-shadows-dark-lg)" : undefined,
    "inset 0 -1px 0 rgba(0, 0, 0, 0.48)",
  ]
    .filter(Boolean)
    .join(", ");
  const autocompleteBackground = `linear-gradient(${autocompleteSurface}, ${autocompleteSurface}) padding-box, ${autocompleteBorderLayers}`;
  const autocompleteFocusBackground = `linear-gradient(${autocompleteSurface}, ${autocompleteSurface}) padding-box, ${autocompleteFocusBorderLayers}`;

  return (
    <Box
      position="relative"
      ref={containerRef}
      maxW="md"
      w={["100%", "md"]}
      flex={1}
    >
      <Box
        position="relative"
        zIndex={1001}
        background={autocompleteBackground}
        borderWidth="1px"
        borderBottomWidth={shouldShowResults ? "0" : "1px"}
        borderColor="transparent"
        borderTopRadius={shouldShowResults ? "2xl" : "full"}
        borderBottomRadius={shouldShowResults ? "0" : "full"}
        boxShadow={autocompleteShadow}
        transition="background 160ms ease, border-radius 160ms ease, box-shadow 160ms ease"
        _focusWithin={{
          background: autocompleteFocusBackground,
          boxShadow: autocompleteFocusShadow,
        }}
      >
        <InputGroup
          startElement={
            <Flex
              alignItems="center"
              justifyContent="center"
              boxSize={6}
              borderRadius="full"
              bg="electricPurple.500"
              color="white"
            >
              <Icon
                as={CgSearch}
                boxSize={4}
                transform="translate(-1px, 1px)"
              />
            </Flex>
          }
          startElementProps={{ w: 10, px: 0 }}
        >
          <Input
            unstyled
            h={9}
            ps={10}
            pe={3}
            textStyle="body"
            borderWidth="0"
            borderRadius="full"
            outline="0"
            color="white"
            bg="transparent"
            w="100%"
            ref={inputRef}
            onFocus={onFocus}
            placeholder="Search for an artist"
            value={artist}
            onChange={onArtistChange}
            _placeholder={{ color: "white" }}
            _focusVisible={{ boxShadow: "none", outline: "0" }}
          />
        </InputGroup>
      </Box>
      <AnimatePresence initial={false}>
        {shouldShowResults && (
          <motion.div
            key="artist-autocomplete-results"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.99 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              width: "100%",
              zIndex: 1000,
              transformOrigin: "top center",
            }}
          >
            <Box w="100%">
              <List.Root
                listStyle="none"
                role="listbox"
                aria-busy={isSearching}
                maxH="xs"
                overflowY={isNewExperience ? "hidden" : "auto"}
                zIndex="modal"
                bg="gray.950"
                color="white"
                borderWidth="1px"
                borderTopWidth="0"
                borderColor="whiteAlpha.300"
                borderTopRadius="0"
                borderBottomRadius="2xl"
                boxShadow="dark-lg"
                css={scrollBarStyle}
              >
                <AnimatePresence initial={false}>
                  {isNewExperience && (
                    <motion.li
                      key="new-artist-prompt"
                      role="presentation"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.14 }}
                      style={{ listStyle: "none" }}
                    >
                      <Box p={4} bg="black" color="white">
                        <Text textStyle="sectionTitle">
                          &#x261D; Search for your favorite artist
                        </Text>
                      </Box>
                    </motion.li>
                  )}
                  {isSearching && (
                    <motion.li
                      key="artist-search-loading"
                      role="presentation"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.14 }}
                      style={{ listStyle: "none", overflow: "hidden" }}
                    >
                      <Flex
                        role="status"
                        aria-live="polite"
                        alignItems="center"
                        gap={2}
                        px={3}
                        py={2}
                        color="whiteAlpha.800"
                        bg="whiteAlpha.100"
                        borderBottomWidth={hasResults ? "1px" : "0"}
                        borderColor="whiteAlpha.100"
                      >
                        <Spinner size="xs" color="electricPurple.300" />
                        <Text textStyle="statusText">
                          {hasResults ? "Updating results" : "Searching artists"}
                        </Text>
                      </Flex>
                    </motion.li>
                  )}
                  {isError && (
                    <motion.li
                      key="artist-search-error"
                      role="presentation"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.14 }}
                      style={{ listStyle: "none" }}
                    >
                      <Box px={3} py={3} color="whiteAlpha.800">
                        <Text textStyle="statusText">Could not load artist results.</Text>
                      </Box>
                    </motion.li>
                  )}
                  {shouldShowEmptyState && (
                    <motion.li
                      key="artist-search-empty"
                      role="presentation"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.14 }}
                      style={{ listStyle: "none" }}
                    >
                      <Box px={3} py={3} color="whiteAlpha.800">
                        <Text textStyle="statusText">No artists found.</Text>
                      </Box>
                    </motion.li>
                  )}
                  {visibleArtists.map((artist, i) => {
                    const isSelected = selectedIndex === i;
                    return (
                      <motion.li
                        role="option"
                        aria-selected={isSelected}
                        aria-setsize={visibleArtists.length}
                        aria-posinset={i + 1}
                        key={artist.id}
                        layout="position"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.14 }}
                        style={{ listStyle: "none" }}
                      >
                        <Box
                          bg={isSelected ? "whiteAlpha.200" : "transparent"}
                          color="white"
                          py={2}
                          cursor={
                            isSeedLimitReached ? "not-allowed" : "pointer"
                          }
                          _hover={{ bg: "whiteAlpha.100" }}
                          onClick={() =>
                            !isSeedLimitReached && onAddArtist(artist)
                          }
                        >
                          <Flex alignItems="center" gap={3} px={3}>
                            <Text textStyle="itemTitle">{artist.name}</Text>
                            <Spacer />
                            {!artists.includes(artist.id) && (
                              <Button
                                visual="primary"
                                size="xs"
                                disabled={isSeedLimitReached}
                              >
                                Add
                              </Button>
                            )}
                          </Flex>
                        </Box>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </List.Root>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
