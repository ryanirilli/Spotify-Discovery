"use client";

import {
  Box,
  Flex,
  Icon,
  Popover,
  Portal,
  Switch,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { Button } from "@/components/ui/Button";
import { forwardRef, useCallback, useContext, useMemo } from "react";
import { LuWaves } from "react-icons/lu";
import { TopNavHeightContext } from "./DesktopAppLayout";
import {
  SpotifyRecommendationsContext,
  TSpotifyRecommendationFilters,
} from "./SpotifyRecommendationsProvider";
import SpotifyTempoFilter, {
  getTempoFilterCount,
} from "./SpotifyTempoFilter";
import useHoverPreview from "@/utils/useHoverPreview";
import SpotifyShareCollectionButton from "./SpotifyShareCollectionButton";
import BottomSheet from "./ui/BottomSheet";
import scrollBarStyle from "@/utils/scrollBarStyle";
import {
  areRecommendationFiltersEqual,
  hasRecommendationSeeds,
  sanitizeRecommendationFilters,
} from "@/utils/spotifySearchConfig";

const EMPTY_SEEDS: string[] = [];
const EMPTY_FILTERS: TSpotifyRecommendationFilters = {};

export default function SpotifyRecommendationFilters() {
  const {
    open: isSheetOpen,
    setOpen: setSheetOpen,
  } = useDisclosure();
  const {
    open: isPopoverOpen,
    setOpen: setPopoverOpen,
  } = useDisclosure();

  const recommendationsContext = useContext(SpotifyRecommendationsContext);
  const artists = recommendationsContext?.artists ?? EMPTY_SEEDS;
  const genres = recommendationsContext?.genres ?? EMPTY_SEEDS;
  const filters = recommendationsContext?.filters ?? EMPTY_FILTERS;
  const recommendations = recommendationsContext?.recommendations;
  const fetchRecs = recommendationsContext?.fetchRecs;
  const setFilters = recommendationsContext?.setFilters;

  const onCommitFilter = useCallback(
    (next: TSpotifyRecommendationFilters) => {
      const nextFilters = sanitizeRecommendationFilters(next);

      if (areRecommendationFiltersEqual(filters, nextFilters)) {
        return;
      }

      setFilters?.(nextFilters);

      const nextConfig = {
        artists,
        genres,
        filters: nextFilters,
      };

      if (hasRecommendationSeeds(nextConfig)) {
        void fetchRecs?.(nextConfig);
      }
    },
    [artists, fetchRecs, filters, genres, setFilters]
  );

  const onAppliedFilter = useCallback(() => {
    setSheetOpen(false);
    setPopoverOpen(false);
  }, [setPopoverOpen, setSheetOpen]);

  const activeFilterCount = useMemo(
    () => getTempoFilterCount(filters),
    [filters]
  );
  const filterBody = useMemo(
    () => (
      <SpotifyTempoFilter
        value={filters}
        onCommit={onCommitFilter}
        onApplied={onAppliedFilter}
      />
    ),
    [filters, onAppliedFilter, onCommitFilter]
  );

  const { topNavHeight } = useContext(TopNavHeightContext);
  const [hoverPreviewEnabled, setHoverPreviewEnabled] = useHoverPreview();

  const shouldShowToolbar = Boolean(
    isSheetOpen ||
      isPopoverOpen ||
      recommendations?.length ||
      artists.length ||
      genres.length ||
      Object.keys(filters).length
  );

  return shouldShowToolbar ? (
    <Box
      bg="blackAlpha.700"
      backdropFilter="blur(12px) saturate(140%)"
      borderBottomWidth="1px"
      borderColor="whiteAlpha.200"
      boxShadow="0 1px 0 rgba(255, 255, 255, 0.04)"
      px={[2, 4]}
      py={[1.5, 2]}
      position="sticky"
      top={`${topNavHeight}px`}
      zIndex="banner"
    >
      <Flex alignItems="center" gap={2} minH={["40px", "44px"]}>
        <Box display={["block", "none"]} flexShrink={0}>
          <BottomSheet
            open={isSheetOpen}
            onOpenChange={setSheetOpen}
            trigger={<FilterTrigger hasActiveFilters={activeFilterCount > 0} />}
            title="Filter"
          >
            {filterBody}
          </BottomSheet>
        </Box>
        <Box display={["none", "block"]} flexShrink={0}>
          <Popover.Root
            open={isPopoverOpen}
            onOpenChange={(e) => setPopoverOpen(e.open)}
            positioning={{ placement: "bottom-start", strategy: "fixed" }}
            lazyMount
            unmountOnExit
          >
            <Popover.Trigger asChild>
              <FilterTrigger hasActiveFilters={activeFilterCount > 0} />
            </Popover.Trigger>
            {isPopoverOpen && (
              <Portal>
                <Popover.Positioner>
                  <Popover.Content
                    bg="gray.950"
                    color="white"
                    borderColor="whiteAlpha.200"
                    borderWidth="1px"
                    borderRadius="lg"
                    shadow="dark-lg"
                    w="440px"
                    maxW="calc(100vw - 24px)"
                    maxH="min(680px, calc(100dvh - 112px))"
                    overflow="hidden"
                    display="flex"
                    flexDirection="column"
                    css={{
                      "--popover-bg": "var(--chakra-colors-gray-950)",
                    }}
                  >
                    <Popover.Arrow>
                      <Popover.ArrowTip
                        bg="gray.950"
                        borderColor="whiteAlpha.200"
                      />
                    </Popover.Arrow>
                    <Popover.Body
                      p={4}
                      overflowY="auto"
                      overscrollBehavior="contain"
                      css={scrollBarStyle}
                    >
                      {filterBody}
                    </Popover.Body>
                  </Popover.Content>
                </Popover.Positioner>
              </Portal>
            )}
          </Popover.Root>
        </Box>
        <Box flex={1} minW={0} />
        <Box flexShrink={0}>
          <SpotifyShareCollectionButton />
        </Box>
        <Switch.Root
          checked={hoverPreviewEnabled}
          onCheckedChange={(e) => setHoverPreviewEnabled(e.checked)}
          size={["sm", "md"]}
          ml={2}
          flexShrink={0}
          display={["none", "flex"]}
        >
          <Switch.HiddenInput />
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Switch.Label
            color="white"
            textStyle="controlLabel"
            whiteSpace="nowrap"
          >
            Hover to preview
          </Switch.Label>
        </Switch.Root>
      </Flex>
    </Box>
  ) : null;
}

const FilterTrigger = forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & {
    hasActiveFilters: boolean;
  }
>(function FilterTrigger({ hasActiveFilters, ...buttonProps }, ref) {
  return (
    <Button
      ref={ref}
      visual="secondary"
      size={["sm", "md"]}
      flexShrink={0}
      bg={hasActiveFilters ? "rgba(176, 38, 255, 0.22)" : undefined}
      boxShadow={
        hasActiveFilters
          ? "inset 0 0 0 1px rgba(217, 141, 255, 0.45)"
          : undefined
      }
      aria-pressed={hasActiveFilters}
      _hover={{
        bg: hasActiveFilters ? "rgba(176, 38, 255, 0.3)" : "whiteAlpha.300",
      }}
      _active={{
        bg: hasActiveFilters ? "rgba(176, 38, 255, 0.36)" : "whiteAlpha.400",
      }}
      {...buttonProps}
    >
      <Icon as={LuWaves} />
      <Text as="span">Filter</Text>
    </Button>
  );
});
