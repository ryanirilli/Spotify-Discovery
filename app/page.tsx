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
        color="white"
        display="flex"
        alignItems={["top", "center"]}
        justifyContent={["center", null, null, "flex-end"]}
        order={[2, null, null, 1]}
        px={[6, 8, 12, 16]}
      >
        <Box
          textAlign={["center", null, null, "left"]}
          mt={[8, 0]}
          zIndex="base"
          maxW={["100%", null, null, "560px"]}
        >
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
        position="relative"
        overflow={["hidden", null, null, "visible"]}
        p={[8]}
        order={[1, null, null, 2]}
      >
        <Image
          w={["100%", "100%"]}
          position={["relative", null, "absolute"]}
          right={[0, null, 8, 16]}
          bottom={0}
          transform={[
            "translateY(0%)",
            null,
            "translateY(65%)",
            "translateY(50%)",
          ]}
          ml={14}
          src="/SVG/disco-stu.svg"
          alt="Disco Stu"
        />
      </GridItem>
    </Grid>
  );
}
