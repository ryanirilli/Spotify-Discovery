import { useState, useEffect } from "react";

function useWebkitFillAvailableSupported(): boolean {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      // If running on server-side rendering, assume the property is not supported
      setSupported(false);
    } else {
      // Create a test div and check if the property is supported
      const testDiv = document.createElement("div");
      const heightDescriptor = Object.getOwnPropertyDescriptor(
        testDiv.style,
        "height"
      );
      if (
        heightDescriptor &&
        typeof heightDescriptor.value === "string" &&
        !heightDescriptor.value.includes("-webkit-fill-available")
      ) {
        setSupported(false);
      } else {
        setSupported(true);
      }
    }
  }, []);

  return supported;
}

export default useWebkitFillAvailableSupported;
