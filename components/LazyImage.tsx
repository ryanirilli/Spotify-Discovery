import useIntersectionObserver from "@/utils/useIntersectionObserver";
import { Image, ImageProps } from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";

interface ILazyImage extends ImageProps {
  src: string;
  alt: string;
}

const LazyImage = ({ src, alt, ...rest }: ILazyImage) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const [observe, isIntersecting] = useIntersectionObserver({ threshold: 0.5 });

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
    <Image
      ref={imgRef}
      alt={alt}
      opacity={isLoaded ? 1 : 0}
      transition="opacity 0.3s ease"
      {...rest}
    />
  );
};

export default LazyImage;
