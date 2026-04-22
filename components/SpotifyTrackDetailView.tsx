"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AspectRatio,
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  IconButton,
  Image,
  Skeleton,
  Spacer,
  Stack,
  Text,
  VisuallyHidden,
} from "@chakra-ui/react";
import { MdArrowBack, MdPause, MdPlayArrow } from "react-icons/md";
import { BsSpotify } from "react-icons/bs";
import { useQuery } from "@tanstack/react-query";
import spotifyTrackQuery from "@/queries/spotifyTrackQuery";
import SpotifyTrackDetails from "./SpotifyTrackDetails";
import LazyImage from "./LazyImage";

export default function SpotifyTrackDetailView({ id }: { id: string }) {
  const router = useRouter();

  const { data: track, isLoading } = useQuery({
    queryKey: ["spotifyTrack", id],
    queryFn: () => spotifyTrackQuery(id),
  });

  const previewRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePreview = () => {
    const el = previewRef.current;
    if (!el) return;
    if (el.paused) {
      setIsPlaying(true);
      el.play().catch(() => setIsPlaying(false));
    } else {
      el.pause();
      setIsPlaying(false);
    }
  };

  const onBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/search");
    }
  };

  const albumImageUrl = track?.album?.images?.[0]?.url;
  const artistNames = track?.artists?.map((a) => a.name).join(", ") || "";

  return (
    <Box color="white" p={[4, 6, 8]}>
      <Flex mb={[4, 6]} alignItems="center">
        <Button
          size="sm"
          variant="ghost"
          color="white"
          borderRadius="full"
          _hover={{ bg: "whiteAlpha.200" }}
          _active={{ bg: "whiteAlpha.300" }}
          onClick={onBack}
        >
          <Icon as={MdArrowBack} boxSize={5} />
          Back
        </Button>
      </Flex>

      <Flex
        direction={["column", null, "row"]}
        gap={[6, 8]}
        maxW="6xl"
        mx="auto"
      >
        <Box w={["100%", null, "40%"]} maxW={["100%", null, "md"]}>
          <AspectRatio
            ratio={1}
            borderRadius="lg"
            overflow="hidden"
            boxShadow="dark-lg"
            bg="blackAlpha.500"
          >
            {isLoading ? (
              <Skeleton w="100%" h="100%" />
            ) : albumImageUrl ? (
              <LazyImage src={albumImageUrl} alt={track?.album?.name || ""} />
            ) : (
              <Box />
            )}
          </AspectRatio>

          {track?.preview_url && (
            <Flex mt={4} gap={2} alignItems="center">
              <IconButton
                aria-label={isPlaying ? "Pause preview" : "Play preview"}
                colorPalette="electricPurple"
                borderRadius="full"
                size="lg"
                onClick={togglePreview}
              >
                <Icon
                  as={isPlaying ? MdPause : MdPlayArrow}
                  boxSize={7}
                />
              </IconButton>
              <Text color="whiteAlpha.700" fontSize="sm">
                Preview
              </Text>
              <Spacer />
              <VisuallyHidden>
                <audio
                  ref={previewRef}
                  src={track.preview_url}
                  onEnded={() => setIsPlaying(false)}
                  preload="auto"
                  playsInline
                />
              </VisuallyHidden>
            </Flex>
          )}
        </Box>

        <Stack flex={1} gap={4} minW={0}>
          <Box>
            <Text
              textTransform="uppercase"
              color="whiteAlpha.600"
              fontSize="xs"
              letterSpacing="wider"
              mb={1}
            >
              Track
            </Text>
            {isLoading ? (
              <Skeleton height="40px" w="80%" />
            ) : (
              <Heading as="h1" size={["lg", "xl"]} lineHeight="short">
                {track?.name}
              </Heading>
            )}
            <Text mt={2} color="whiteAlpha.800" fontSize="md">
              {isLoading ? <Skeleton height="20px" w="50%" /> : artistNames}
            </Text>
            <Text color="whiteAlpha.600" fontSize="sm">
              {isLoading ? null : track?.album?.name}
            </Text>
          </Box>

          {track?.external_urls?.spotify && (
            <Box>
              <Button
                size="sm"
                borderRadius="full"
                colorPalette="spotifyGreen"
                asChild
              >
                <a
                  href={track.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon as={BsSpotify} />
                  Open in Spotify
                </a>
              </Button>
            </Box>
          )}

          <Box
            mt={2}
            bg="whiteAlpha.100"
            borderRadius="lg"
            p={[2, 4]}
            color="whiteAlpha.900"
          >
            <Heading as="h2" size="sm" mb={2} color="whiteAlpha.700">
              Audio features
            </Heading>
            <Box
              bg="white"
              color="black"
              borderRadius="md"
              overflow="hidden"
            >
              <SpotifyTrackDetails id={id} />
            </Box>
          </Box>
        </Stack>
      </Flex>
    </Box>
  );
}
