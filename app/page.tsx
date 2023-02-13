"use client";
import useWebkitFillAvailableSupported from "@/utils/useWebkitFillAvailableSupported";
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Image,
  useBoolean,
} from "@chakra-ui/react";
import { BsSpotify } from "react-icons/bs";
export default function Home() {
  const [isLoading, setIsLoading] = useBoolean(false);
  const isWebkitFillAvailable = useWebkitFillAvailableSupported();
  return (
    <Flex
      minH={isWebkitFillAvailable ? "-webkit-fill-available" : "100vh"}
      justifyContent="center"
      alignItems="center"
      bg="gray.900"
    >
      <Flex direction="column" color="white">
        <Flex
          direction={["column", "row"]}
          justifyContent="center"
          alignItems="center"
        >
          <Image mr={14} src="/SVG/disco-stu.svg" w="200px" alt="Disco Stu" />
          <Box textAlign="center" mt={[8, 0]}>
            <Heading>Better Music Discovery</Heading>
            <Heading as="h4" size="md" fontWeight="light">
              for Curators, Tastemakers, and Djs
            </Heading>
            <Button
              mt={8}
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
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
}
