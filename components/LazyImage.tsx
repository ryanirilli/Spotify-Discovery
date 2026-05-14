import useIntersectionObserver from "@/utils/useIntersectionObserver";
import { Box, Image, ImageProps } from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";
import CollectionCoverPlaceholder from "./CollectionCoverPlaceholder";

interface ILazyImage extends ImageProps {
  src: string;
  alt: string;
  placeholderSeed?: string;
}

const LazyImage = ({ src, alt, placeholderSeed, ...rest }: ILazyImage) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const [observe, isIntersecting] = useIntersectionObserver({ threshold: 0.2 });

  useEffect(() => {
    setIsLoaded(false);
  }, [src]);

  useEffect(() => {
    const imgEl = imgRef.current;
    if (isIntersecting && imgEl) {
      if (imgEl.complete && imgEl.naturalHeight !== 0) {
        setIsLoaded(true);
      } else {
        imgEl.addEventListener("load", handleLoad);
        imgEl.src = src;
      }
    }
    return () => {
      imgEl?.removeEventListener("load", handleLoad);
    };
  }, [isIntersecting, src]);

  useEffect(() => {
    if (imgRef.current) {
      observe(imgRef.current);
    }
  }, [observe]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <Box position="relative" overflow="hidden" w="100%" h="100%">
      {!isLoaded && <CollectionCoverPlaceholder seed={placeholderSeed ?? src} />}
      <Image
        ref={imgRef}
        alt={alt}
        opacity={isLoaded ? 1 : 0}
        transition="opacity 0.3s ease"
        w="100%"
        h="100%"
        {...rest}
      />
    </Box>
  );
};

export default LazyImage;
