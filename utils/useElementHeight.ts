import React, { useState, useLayoutEffect } from "react";

function useElementHeight(elementRef: React.RefObject<HTMLElement | null>) {
  const [height, setHeight] = useState<number>(0);

  useLayoutEffect(() => {
    const element = elementRef.current;

    if (!element) {
      return;
    }

    let frameId: number | null = null;
    let currentHeight = 0;

    const measure = () => {
      const newHeight = Math.ceil(element.getBoundingClientRect().height);
      if (currentHeight !== newHeight) {
        currentHeight = newHeight;
        setHeight(newHeight);
      }
    };

    measure();
    frameId = window.requestAnimationFrame(measure);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === element) {
          measure();
        }
      }
    });

    resizeObserver.observe(element);
    window.addEventListener("resize", measure);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [elementRef]);

  return height;
}

export default useElementHeight;
