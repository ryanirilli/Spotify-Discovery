"use client";

import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  List,
  ListItem,
  Text,
  Flex,
  Spacer,
  useBoolean,
} from "@chakra-ui/react";
import spotifyGenreSeeds from "@/queries/spotifyGenreSeeds";
import { useQuery } from "react-query";
import { useContext } from "react";
import {
  SpotifyRecommendationsContext,
  TSpotifyRecommendationsContext,
} from "./SpotifyRecommendationsProvider";
import scrollBarStyle from "@/utils/scrollBarStyle";

export default function SpotifyGenres() {
  const { data } = useQuery("spotifyGenres", spotifyGenreSeeds);
  const [isOpen, setIsOpen] = useBoolean();
  const { addGenre, genres, removeGenre, fetchRecs } = useContext(
    SpotifyRecommendationsContext
  ) as TSpotifyRecommendationsContext;

  const onClose = () => {
    setIsOpen.off();
    fetchRecs();
  };

  return (
    <>
      <Button borderRadius="full" colorScheme="blue" onClick={setIsOpen.on}>
        Add Genres
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent background="gray.900" color="white" boxShadow="2xl">
          <ModalHeader>Genres</ModalHeader>
          <ModalCloseButton />
          <ModalBody sx={scrollBarStyle} bg="blackAlpha.500" px={0}>
            <List>
              {data?.map((genre: string) => {
                const hasAdded = genres.includes(genre);
                const action = hasAdded ? removeGenre : addGenre;
                return (
                  <ListItem
                    key={genre}
                    _hover={{ bg: "black" }}
                    px={4}
                    py={2}
                    cursor="pointer"
                    role="button"
                    onClick={() => action(genre)}
                  >
                    <Flex alignItems="center">
                      <Text textTransform="capitalize">{genre}</Text>
                      <Spacer />
                      {!genres.includes(genre) ? (
                        <Button colorScheme="blackAlpha" size="sm">
                          Add
                        </Button>
                      ) : (
                        <Button colorScheme="red" size="sm">
                          Remove
                        </Button>
                      )}
                    </Flex>
                  </ListItem>
                );
              })}
            </List>
          </ModalBody>
          <ModalFooter>
            <Button w="100%" colorScheme="blue" onClick={onClose}>
              Done
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
