"use client";
import { Box, Button, Flex, Heading, Icon } from "@chakra-ui/react";
import { BsSpotify } from "react-icons/bs";
export default function Home() {
  return (
    <Flex
      height="100vh"
      justifyContent="center"
      alignItems="center"
      bg="gray.900"
    >
      <Flex direction="column" justifyContent="center" color="white">
        <Box pb={8} textAlign="center">
          <Heading>Better Music Discovery</Heading>
          <Heading as="h4" size="md" fontWeight="light">
            Made with love for Spotify users
          </Heading>
        </Box>
        <Button
          borderRadius="full"
          minW="200px"
          size="lg"
          colorScheme="green"
          leftIcon={<Icon as={BsSpotify} fontSize="md" color="white" />}
          as="a"
          href="/api/spotify-login"
        >
          Login
        </Button>
      </Flex>
    </Flex>
  );
}
