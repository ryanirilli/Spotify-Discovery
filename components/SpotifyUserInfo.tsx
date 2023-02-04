"use client";

import spotifyUserInfo from "@/queries/spotifyUserInfo";
import { Avatar, HStack, Text, Icon } from "@chakra-ui/react";
import { useQuery } from "react-query";
import { BsSpotify } from "react-icons/bs";

export default function SpotifyUserInfo() {
  const { data } = useQuery("user", spotifyUserInfo);
  console.log("USER", data);
  return (
    <HStack
      display={["none", null, "flex"]}
      mr={2}
      bg="blackAlpha.900"
      px={4}
      borderRadius="full"
    >
      <Avatar
        icon={<Icon as={BsSpotify} fontSize="md" color="black" />}
        bg="green.300"
        ml={-4}
        size="sm"
      />
      <Text color="white">{data?.display_name}</Text>
    </HStack>
  );
}
