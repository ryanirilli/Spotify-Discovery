import React, { useEffect, useRef } from "react";
import { Box, BoxProps } from "@chakra-ui/react";
import lottie, {
  AnimationConfigWithPath,
  AnimationConfigWithData,
} from "lottie-web";
interface Props extends BoxProps {
  onComplete?: () => void;
  isPlaying?: boolean;
  lottiePlayerOptions:
    | Omit<AnimationConfigWithData, "container">
    | Omit<AnimationConfigWithPath, "container">;
}

function Lottie({
  lottiePlayerOptions,
  isPlaying,
  onComplete,
  ...rest
}: Props): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const animation = lottie.loadAnimation({
      //@ts-ignore
      container: containerRef.current, // the dom element that will contain the animation
      renderer: "svg",
      loop: true,
      autoplay: isPlaying,
      ...lottiePlayerOptions,
    });
    onComplete && animation.addEventListener("complete", onComplete);
    return () => {
      animation.destroy();
    };
  }, [lottiePlayerOptions, onComplete, isPlaying]);
  return <Box {...rest} ref={containerRef} />;
}

export default Lottie;
