"use client";
import {
  Box,
  Button,
  Grid,
  GridItem,
  Heading,
  Icon,
  Image,
} from "@chakra-ui/react";
import { useState } from "react";
import { BsSpotify } from "react-icons/bs";

export default function Home() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
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
        bg={["electricPurple.700", null, null, "transparent"]}
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
            loading={isLoggingIn}
            onClick={() => setIsLoggingIn(true)}
            borderRadius="full"
            border="1px solid rgb(255 255 255 / 25%)"
            minW="200px"
            size="lg"
            asChild
          >
            <a href="/api/spotify-login">
              <Icon as={BsSpotify} fontSize="md" color="white" />
              Login with Spotify
            </a>
          </Button>
        </Box>
      </GridItem>
    </Grid>
  );
}
