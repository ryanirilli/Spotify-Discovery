"use client";
import { Box, Button, Flex, Heading, Icon, useBoolean } from "@chakra-ui/react";
import { BsSpotify } from "react-icons/bs";
export default function Home() {
  const [isLoading, setIsLoading] = useBoolean(false);
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
            for curators, tastemakers, and audiophiles
          </Heading>
        </Box>
        <Button
          isLoading={isLoading}
          onClick={setIsLoading.on}
          borderRadius="full"
          minW="200px"
          size="lg"
          colorScheme="green"
          leftIcon={<Icon as={BsSpotify} fontSize="md" color="white" />}
          as="a"
          href="/api/spotify-login"
        >
          Login with Spotify
        </Button>
      </Flex>
    </Flex>
  );
}
