"use client";

import { useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AspectRatio,
  Box,
  Card,
  Progress,
  Text,
  VisuallyHidden,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import {
  SpotifyRecommendationsContext,
  TSpotifyRecommendationsContext,
} from "./SpotifyRecommendationsProvider";
import { TSpotifyTrack } from "@/types/SpotifyTrack";
import {
  SpotifyCurrentTrackContext,
  TSpotifyCurrentTrackContext,
} from "./SpotifyCurrentTrackProvider";

export default function SpotifyTracks() {
  const { recommendations } = useContext(
    SpotifyRecommendationsContext
  ) as TSpotifyRecommendationsContext;

  return (
    <>
      <Wrap spacing={0} pb={32}>
        {recommendations.map((rec) => (
          <WrapItem
            w={["100%", "50%", "25%", "16.66%"]}
            key={rec.id}
            position="relative"
          >
            <SpotifyTrack rec={rec} />
          </WrapItem>
        ))}
      </Wrap>
    </>
  );
}

function SpotifyTrack({ rec }: { rec: TSpotifyTrack }) {
  const { curTrack, setCurTrack } =
    useContext<TSpotifyCurrentTrackContext | null>(
      SpotifyCurrentTrackContext
    ) || {};
  const previewRef = useRef<HTMLAudioElement>(null);
  const onMouseEnterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const [trackProgress, setTrackProgress] = useState(0);
  const [isAlbumArtLoaded, setIsAlbumArtLoaded] = useState(false);

  const animateTrackProgress = () => {
    if (previewRef.current !== null && !previewRef.current.paused) {
      const { currentTime, duration } = previewRef.current;
      let progress = (currentTime / duration) * 100;
      if (progress === 100) {
        progress = 0;
        previewRef.current.currentTime = 0;
      }
      setTrackProgress(progress);
      requestAnimationFrame(animateTrackProgress);
    }
  };

  const playTrack = () => {
    setCurTrack?.(rec.id);
    previewRef.current?.play();
    animateTrackProgress();
  };
  const pauseTrack = () => {
    previewRef.current?.pause();
  };

  const toggleTrack = () => {
    if (previewRef.current?.paused) {
      playTrack();
    } else {
      pauseTrack();
    }
  };

  useEffect(() => {
    if (
      previewRef.current &&
      !previewRef.current.paused &&
      curTrack !== rec.id
    ) {
      pauseTrack();
    }
  }, [curTrack, rec]);

  const isTouchDevice = window.ontouchstart !== undefined;
  const albumImageUrl = rec.album.images[0]?.url;

  const handleMouseEnter = () => {
    if (isTouchDevice) {
      return;
    }
    onMouseEnterTimeoutRef.current = setTimeout(playTrack, 300);
  };

  const handleMouseLeave = () => {
    if (isTouchDevice) {
      return;
    }
    clearTimeout(onMouseEnterTimeoutRef.current!);
    pauseTrack();
  };

  return (
    <Card m={2} w="100%" bg="gray.900" overflow="hidden">
      <AspectRatio
        ratio={1}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={toggleTrack}
        transition="opacity 0.3s ease-in-out"
        opacity={isAlbumArtLoaded ? 1 : 0}
      >
        {albumImageUrl && (
          <Image
            fill
            sizes="(max-width: 768px) 100vw,
              (max-width: 1200px) 50vw,
              33vw"
            alt="album art"
            src={albumImageUrl}
            onLoadingComplete={() => setIsAlbumArtLoaded(true)}
          />
        )}
      </AspectRatio>

      <VisuallyHidden>
        <audio src={rec.preview_url} ref={previewRef} />
      </VisuallyHidden>
      <Progress value={trackProgress} />
      <Box px={2} bg="white">
        <Text fontWeight="bold" fontSize="small" noOfLines={1}>
          {rec.name}
        </Text>
        <Text fontSize="small" noOfLines={1} transform="translateY(-3px)">
          {rec.artists.map((a) => a.name).join(", ")}
        </Text>
      </Box>
    </Card>
  );
}
