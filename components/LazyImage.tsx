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
  const [observe, isIntersecting] = useIntersectionObserver({ threshold: 0.2 });

  useEffect(() => {
    if (isIntersecting && imgRef.current) {
      if (imgRef.current.complete && imgRef.current.naturalHeight !== 0) {
        setIsLoaded(true);
      } else {
        imgRef.current.addEventListener("load", handleLoad);
        imgRef.current.src = src;
      }
    }
    return () => {
      imgRef.current?.removeEventListener("load", handleLoad);
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
