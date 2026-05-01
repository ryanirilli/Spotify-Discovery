"use client";
import {
  Box,
  Button,
  Grid,
  GridItem,
  Heading,
  Icon,
  Image,
  Text,
} from "@chakra-ui/react";
import { Monoton } from "next/font/google";
import { useState } from "react";
import { BsSpotify } from "react-icons/bs";

const monoton = Monoton({
  subsets: ["latin"],
  weight: "400",
});

export default function Home() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  return (
    <Grid
      bg="gray.900"
      h="100vh"
      position="relative"
      templateColumns={["1fr", null, null, "1fr 1fr"]}
      templateRows={["1fr 1fr", null, null, "1fr"]}
      overflow="hidden"
    >
      <GridItem
        color="white"
        display="flex"
        alignItems={["top", "center"]}
        justifyContent={["center", null, null, "flex-start"]}
        order={[2, null, null, 2]}
        px={[6, 8, 12, 16]}
      >
        <Box
          textAlign={["center", null, null, "left"]}
          mt={[8, 0]}
          zIndex="base"
          maxW={["100%", null, null, "560px"]}
        >
          <Text
            className={`${monoton.className} disco-stu-title`}
            mb={[4, 5, 6]}
            fontSize={["2xl", "3xl", "4xl"]}
            lineHeight="1"
          >
            Disco Stu
          </Text>
          <Heading
            as="h1"
            fontSize={["4xl", "5xl", "6xl", "7xl"]}
            lineHeight="1.05"
            letterSpacing="-0.02em"
            fontWeight="bold"
          >
            Crate digging for the streaming age.
          </Heading>
          <Text
            mt={[4, 6]}
            fontSize={["md", "lg", "xl"]}
            fontWeight="light"
            color="whiteAlpha.800"
            lineHeight="1.5"
          >
            Built for curators, tastemakers, and DJs tired of hearing the
            algorithm&apos;s greatest hits.
          </Text>
          <Button
            mt={[6, 8]}
            loading={isLoggingIn}
            onClick={() => setIsLoggingIn(true)}
            borderRadius="full"
            bg="electricPurple.500"
            color="white"
            _hover={{ bg: "electricPurple.400" }}
            _active={{ bg: "electricPurple.600" }}
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
      <GridItem
        className="hero-art-panel"
        position="relative"
        overflow={["hidden", null, null, "visible"]}
        p={[8]}
        order={[1, null, null, 1]}
      >
        <Image
          w={["84%", "88%", "76%", "100%"]}
          mx={["auto", null, null, 0]}
          position={["relative", null, null, "absolute"]}
          right={[0, null, null, 16]}
          bottom={0}
          transform={["translateY(0%)", null, null, "translateY(50%)"]}
          ml={[0, null, null, 14]}
          src="/SVG/disco-stu.svg"
          alt="Disco Stu"
        />
      </GridItem>
    </Grid>
  );
}
