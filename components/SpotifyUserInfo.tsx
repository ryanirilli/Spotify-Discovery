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
  Flex,
  Button,
  Dialog,
  Portal,
  useDisclosure,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { VscDebugDisconnect } from "react-icons/vsc";
import { FiChevronUp } from "react-icons/fi";
import { FaUser } from "react-icons/fa";
import DialogCloseButton from "./DialogCloseButton";

export default function SpotifyUserInfo() {
  const { data } = useQuery({ queryKey: ["user"], queryFn: spotifyUserInfo });
  const { open, onOpen, onClose, setOpen } = useDisclosure();

  const onContinue = async () => {
    const res = await fetch("/api/spotify-clear-session");
    if (res.status === 200) {
      window.location.href = "https://www.spotify.com/us/account/apps/";
    }
  };

  return (
    <>
      <Menu.Root>
        <Menu.Trigger asChild>
          <HStack
            aria-label="Options"
            bg="whiteAlpha.200"
            pl={4}
            pr={1}
            py={1}
            borderRadius="full"
            alignItems="center"
            cursor="pointer"
            _hover={{ bg: "whiteAlpha.300" }}
            _active={{ bg: "whiteAlpha.300" }}
          >
            <Flex flex={1} alignItems="center" minW={0}>
              <Avatar.Root bg="spotifyGreen" ml={-4} size="sm">
                <Avatar.Fallback>
                  <Icon as={FaUser} fontSize="md" color="black" />
                </Avatar.Fallback>
              </Avatar.Root>
              <Text ml={2} color="white" lineClamp={1}>
                {data?.display_name}
              </Text>
            </Flex>
            <Flex
              boxSize={8}
              borderRadius="full"
              alignItems="center"
              justifyContent="center"
              color="white"
            >
              <Icon as={FiChevronUp} />
            </Flex>
          </HStack>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content bg="blackAlpha.900" color="white">
              <Menu.Item
                value="disconnect"
                bg="transparent"
                color="white"
                _hover={{ bg: "whiteAlpha.200" }}
                onClick={onOpen}
              >
                <Icon boxSize={6} as={VscDebugDisconnect} />
                Disconnect from Spotify
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
      <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Disconnect from Spotify</Dialog.Title>
              </Dialog.Header>
              <Dialog.CloseTrigger asChild>
                <DialogCloseButton />
              </Dialog.CloseTrigger>
              <Dialog.Body p={4}>
                <Text mb={2}>
                  Sorry to see you go! In order to disconnect Disco Stu from
                  your Spotify account you need to remove access from this app.
                </Text>
                <Text>
                  By clicking continue you will end your session with Disco Stu
                  and be redirected to Spotify&apos;s &quot;Manage Apps&quot;
                  page. There you can locate the app titled &quot;Disco
                  Stu&quot; and click &quot;Remove Access&quot;
                </Text>
              </Dialog.Body>
              <Dialog.Footer>
                <Button onClick={onContinue} w="100%" colorPalette="whiteAlpha">
                  Continue
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}
