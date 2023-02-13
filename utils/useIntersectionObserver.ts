import { useState, useRef, useEffect } from "react";

const useIntersectionObserver = <T extends Element>(
  options?: IntersectionObserverInit
) => {
  const [target, setTarget] = useState<T | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);

  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        observer.current?.unobserve(entry.target);
      }
    });
  };

  const observe = (element: T) => {
    setTarget(element);
  };

  useEffect(() => {
    if (target) {
      observer.current = new IntersectionObserver(handleIntersection, options);
      observer.current.observe(target);
    }

    return () => {
      observer.current?.disconnect();
    };
  }, [target]);

  return [observe, isIntersecting] as const;
};

export default useIntersectionObserver;
