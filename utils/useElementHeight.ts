import React, { useState, useLayoutEffect } from "react";

function useElementHeight(elementRef: React.RefObject<HTMLElement>) {
  const [height, setHeight] = useState<number>(0);

  useLayoutEffect(() => {
    let currentHeight: number;
    const element = elementRef.current;

    if (!element) {
      return;
    }

    setHeight(element.offsetHeight);
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === element) {
          const newHeight = element.offsetHeight;
          if (currentHeight && currentHeight !== newHeight) {
            setHeight(newHeight);
            currentHeight = newHeight;
          } else {
            currentHeight = newHeight;
          }
        }
      }
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [elementRef]);

  return height;
}

export default useElementHeight;
