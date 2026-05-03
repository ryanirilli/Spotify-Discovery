"use client";

import {
  ReactElement,
  ReactNode,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Box } from "@chakra-ui/react";
import { Button } from "./Button";

interface IBottomSheet {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Element that opens the sheet when clicked. */
  trigger?: ReactElement;
  /** Sheet contents. */
  children: ReactNode;
  /** Optional title shown in the sheet header. */
  title?: ReactNode;
  /** Shown to the right of the title. Overrides the built-in Done button. */
  headerEndElement?: ReactNode;
  /** Label for the built-in close button. Pass null to hide it. Defaults to "Done". */
  doneLabel?: string | null;
}

// iOS-style spring decel — matches Chakra's `ease-in-smooth` token.
const SHEET_EASE = [0.32, 0.72, 0, 1] as const;
const SHEET_IN_DURATION = 0.32;
const SHEET_OUT_DURATION = 0.22;

/**
 * Mobile-first bottom sheet. Keyboard handling is CSS-driven: the viewport
 * meta uses `interactive-widget=resizes-content`, so when the software
 * keyboard opens the layout viewport shrinks and `position: fixed; bottom: 0`
 * naturally sits above the keyboard. `max-height: 85dvh` adapts to the new
 * viewport in the same paint as the keyboard animation. No JS translate, no
 * double source of truth, no re-entering the sheet when the input focuses.
 */
export default function BottomSheet({
  open,
  onOpenChange,
  trigger,
  children,
  title,
  headerEndElement,
  doneLabel = "Done",
}: IBottomSheet) {
  const [mounted, setMounted] = useState(false);
  const scrollLock = useRef<{
    overflow: string;
    position: string;
    top: string;
    width: string;
    scrollY: number;
  } | null>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    previousFocus.current =
      (document.activeElement as HTMLElement | null) ?? null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);

    const body = document.body;
    scrollLock.current = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      scrollY: window.scrollY,
    };
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollLock.current.scrollY}px`;
    body.style.width = "100%";

    return () => {
      document.removeEventListener("keydown", onKey);
      const lock = scrollLock.current;
      if (lock) {
        body.style.overflow = lock.overflow;
        body.style.position = lock.position;
        body.style.top = lock.top;
        body.style.width = lock.width;
        window.scrollTo(0, lock.scrollY);
      }
      scrollLock.current = null;
      if (previousFocus.current && "focus" in previousFocus.current) {
        previousFocus.current.focus({ preventScroll: true });
      }
    };
  }, [open, onOpenChange]);

  const wrappedTrigger =
    trigger && isValidElement(trigger)
      ? cloneElement(trigger as ReactElement<TriggerProps>, {
          onClick: (e: React.MouseEvent) => {
            (trigger.props as TriggerProps | undefined)?.onClick?.(e);
            if (!e.defaultPrevented) onOpenChange(true);
          },
        })
      : null;

  const endSlot =
    headerEndElement ??
    (doneLabel ? (
      <Button
        visual="secondary"
        size="sm"
        onClick={() => onOpenChange(false)}
      >
        {doneLabel}
      </Button>
    ) : null);

  const hasHeader = Boolean(title || endSlot);

  return (
    <>
      {wrappedTrigger}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                <motion.div
                  key="bottom-sheet-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: SHEET_OUT_DURATION,
                    ease: SHEET_EASE,
                  }}
                  onClick={() => onOpenChange(false)}
                  style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0, 0, 0, 0.7)",
                    zIndex: 1400,
                  }}
                />
                <motion.div
                  key="bottom-sheet-content"
                  role="dialog"
                  aria-modal="true"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{
                    duration: SHEET_IN_DURATION,
                    ease: SHEET_EASE,
                  }}
                  style={{
                    position: "fixed",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 1401,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    w="100%"
                    bg="black"
                    color="white"
                    borderTopRadius="xl"
                    maxH="85dvh"
                    pb="env(safe-area-inset-bottom)"
                    display="flex"
                    flexDirection="column"
                    boxShadow="dark-lg"
                  >
                    <Box display="flex" justifyContent="center" pt={2} pb={1}>
                      <Box
                        w="36px"
                        h="4px"
                        borderRadius="full"
                        bg="whiteAlpha.300"
                      />
                    </Box>
                    {hasHeader && (
                      <Box
                        display="flex"
                        alignItems="center"
                        gap={2}
                        py={2}
                        px={4}
                      >
                        {title && (
                          <Box
                            flex={1}
                            fontSize="md"
                            fontWeight="semibold"
                          >
                            {title}
                          </Box>
                        )}
                        {endSlot}
                      </Box>
                    )}
                    <Box px={4} py={3} flex={1} minH={0} overflowY="auto">
                      {children}
                    </Box>
                  </Box>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}

interface TriggerProps {
  onClick?: (e: React.MouseEvent) => void;
}
