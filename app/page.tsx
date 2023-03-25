"use client";
import useWebkitFillAvailableSupported from "@/utils/useWebkitFillAvailableSupported";
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  Icon,
  Image,
  useBoolean,
} from "@chakra-ui/react";
import Link from "next/link";
import { BsSpotify } from "react-icons/bs";
import { MdSecurity } from "react-icons/md";
export default function Home() {
  const [isLoggingIn, setIsLoggingIn] = useBoolean(false);
  const isWebkitFillAvailable = useWebkitFillAvailableSupported();
  return (
    <Grid
      bg="gray.900"
      h="100vh"
      templateColumns={["1fr", null, null, "1fr 1fr"]}
      templateRows={["1fr 1fr", null, null, "1fr"]}
      overflow="hidden"
    >
      <GridItem
        position="relative"
        overflow={["hidden", null, null, "visible"]}
        p={[8]}
        bg={["#0582f8", null, null, "transparent"]}
      >
        <Image
          w={["100%", "100%"]}
          position={["relative", null, "absolute"]}
          left={0}
          bottom={0}
          transform={[
            "translateY(0%)",
            null,
            "translateY(65%)",
            "translateY(50%)",
          ]}
          mr={14}
          src="/SVG/disco-stu.svg"
          alt="Disco Stu"
        />
      </GridItem>
      <GridItem
        color="white"
        display="flex"
        alignItems={["top", "center"]}
        justifyContent="center"
      >
        <Box textAlign="center" mt={[8, 0]} zIndex="base">
          <Heading>Better Music Discovery</Heading>
          <Heading as="h2" size="md" fontWeight="light">
            for Curators, Tastemakers, and Djs
          </Heading>
          <Button
            mt={8}
            isLoading={isLoggingIn}
            onClick={setIsLoggingIn.on}
            borderRadius="full"
            border="1px solid rgb(255 255 255 / 25%)"
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
      </GridItem>
    </Grid>
  );

  return (
    <Grid
      bg="gray.900"
      gridTemplateRows="auto 1fr"
      minH={isWebkitFillAvailable ? "-webkit-fill-available" : "100vh"}
    >
      <Flex color="white" justifyContent="flex-end" p={4}>
        <Link href="/privacy-policy">
          <Button variant="link" leftIcon={<Icon as={MdSecurity} />}>
            Privacy Policy
          </Button>
        </Link>
      </Flex>
      <Flex justifyContent="center" alignItems="center">
        <Flex direction="column" color="white">
          <Flex
            direction={["column", "row"]}
            justifyContent="center"
            alignItems="center"
          >
            <Image
              position="absolute"
              bottom={"-50%"}
              left={0}
              mr={14}
              src="/SVG/disco-stu.svg"
              w="50%"
              alt="Disco Stu"
            />
            <Box textAlign="center" mt={[8, 0]}>
              <Heading>Better Music Discovery</Heading>
              <Heading as="h4" size="md" fontWeight="light">
                for Curators, Tastemakers, and Djs
              </Heading>
              <Button
                mt={8}
                isLoading={isLoggingIn}
                onClick={setIsLoggingIn.on}
                borderRadius="full"
                border="1px solid rgb(255 255 255 / 25%)"
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
    </Grid>
  );
}
