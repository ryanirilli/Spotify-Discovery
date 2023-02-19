"use client";

import spotifyUserInfo from "@/queries/spotifyUserInfo";
import {
  Avatar,
  HStack,
  Text,
  Icon,
  Box,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Flex,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { useQuery } from "react-query";
import { VscDebugDisconnect } from "react-icons/vsc";
import { FiChevronUp } from "react-icons/fi";
import { FaUser } from "react-icons/fa";

export default function SpotifyUserInfo() {
  const { data } = useQuery("user", spotifyUserInfo);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const onContinue = async () => {
    const res = await fetch("/api/spotify-clear-session");
    if (res.status === 200) {
      window.location.href = "https://www.spotify.com/us/account/apps/";
    }
  };

  return (
    <>
      <HStack
        bg="whiteAlpha.200"
        pl={4}
        borderRadius="full"
        alignItems="center"
      >
        <Flex flex={1}>
          <Avatar
            icon={<Icon as={FaUser} fontSize="md" color="black" />}
            bg="spotifyGreen"
            ml={-4}
            size="sm"
          />
          <Text ml={2} color="white" noOfLines={1}>
            {data?.display_name}
          </Text>
        </Flex>
        <Box>
          <Menu>
            <MenuButton
              as={IconButton}
              size="sm"
              borderRadius="full"
              aria-label="Options"
              icon={<Icon as={FiChevronUp} />}
              variant="ghost"
              _hover={{
                bg: "whiteAlpha.300",
                color: "white",
              }}
              _active={{ bg: "whiteAlpha.300" }}
            />
            <MenuList bg="blackAlpha.900">
              <MenuItem
                bg="transparent"
                icon={<Icon boxSize={6} as={VscDebugDisconnect} />}
                onClick={onOpen}
              >
                Disconnect from Spotify
              </MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </HStack>
      <Modal isOpen={isOpen} onClose={onClose} variant="spotifyModal">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Disconnect from Spotify</ModalHeader>
          <ModalCloseButton />
          <ModalBody p={4}>
            <Text mb={2}>
              Sorry to see you go! In order to disconnect Disco Stu from your
              spotify account you need to remove access from this app.
            </Text>
            <Text>
              By clicking continue you will end your session with Disco Stu and
              be redirected to Spotify's "Manage Apps" page. There you can
              locate the app titled "Disco Stu" and click "Remove Access"
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onContinue} w="100%" colorScheme="purple">
              Continue
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
