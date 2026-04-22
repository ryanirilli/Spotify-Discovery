"use client";

import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Popover,
  Portal,
  Switch,
  Tag,
  useDisclosure,
} from "@chakra-ui/react";
import { produce } from "immer";
import { useContext, useReducer } from "react";
import { IoFilter } from "react-icons/io5";
import { TopNavHeightContext } from "./DesktopAppLayout";
import {
  SpotifyRecommendationsContext,
  TSpotifyRecommendationFilters,
} from "./SpotifyRecommendationsProvider";
import SpotifyTempoFilter from "./SpotifyTempoFilter";
import useHoverPreview from "@/utils/useHoverPreview";

type TSpotifyRecommendationFilterState = {
  isDirty: boolean;
  filters: TSpotifyRecommendationFilters;
};

type TSpotifyRecommendationAction = {
  type: "SET_TEMPO_RANGE";
  payload: any;
};

const initialFilters: TSpotifyRecommendationFilterState = {
  isDirty: false,
  filters: {},
};

const filtersReducer = (
  state: TSpotifyRecommendationFilterState,
  action: TSpotifyRecommendationAction
) => {
  switch (action.type) {
    case "SET_TEMPO_RANGE":
      return produce(state, (draft) => {
        draft.isDirty = true;
        draft.filters.target_tempo = action.payload[0];
        draft.filters.max_tempo = action.payload[1];
      });
    default:
      return state;
  }
};

export default function SpotifyRecommendationFilters() {
  const [draftFilters, dispatch] = useReducer(filtersReducer, initialFilters);
  const popover = useDisclosure();

  const { setFilters, filters, fetchRecs, recommendations } =
    useContext(SpotifyRecommendationsContext) || {};

  const onChangeTempoRange = (range: [number, number] | null) => {
    dispatch({ type: "SET_TEMPO_RANGE", payload: range || [] });
  };

  const onApply = () => {
    setFilters?.(draftFilters.filters);
    setTimeout(() => fetchRecs?.(), 0);
  };

  const { topNavHeight } = useContext(TopNavHeightContext);
  const [hoverPreviewEnabled, setHoverPreviewEnabled] = useHoverPreview();

  return Boolean(recommendations?.length) ? (
    <Box
      bgGradient="linear(to-b, blackAlpha.700, transparent)"
      p={[1, 2]}
      position="sticky"
      top={`${topNavHeight}px`}
      zIndex="banner"
    >
      <Flex alignItems="center" ml={[1, 0]}>
        <Popover.Root
          open={popover.open}
          onOpenChange={(e) => popover.setOpen(e.open)}
        >
          <Popover.Trigger asChild>
            <Button
              size={["sm", "md"]}
              colorPalette="blackAlpha"
              borderRadius="full"
            >
              <Icon as={IoFilter} />
              Filters
            </Button>
          </Popover.Trigger>
          <Portal>
            <Popover.Positioner>
              <Popover.Content>
                <Popover.Arrow />
                <Popover.Body>
                  <SpotifyTempoFilter
                    value={[
                      draftFilters.filters.target_tempo || 0,
                      draftFilters.filters.max_tempo || 0,
                    ]}
                    onChange={onChangeTempoRange}
                  />
                  <Box p={2}>
                    <Button
                      disabled={!draftFilters.isDirty}
                      w="100%"
                      onClick={() => {
                        onApply();
                        popover.onClose();
                      }}
                    >
                      Apply
                    </Button>
                  </Box>
                </Popover.Body>
              </Popover.Content>
            </Popover.Positioner>
          </Portal>
        </Popover.Root>
        <Box color="white" ml={2} flex={1} minW={0}>
          <HStack>
            {filters?.target_tempo ? (
              <Tag.Root size={["sm", "md"]} borderRadius="full">
                <Tag.Label>Target BPM {filters.target_tempo}</Tag.Label>
                <Tag.EndElement>
                  <Tag.CloseTrigger
                    onClick={() => {
                      const { target_tempo, ...rest } = filters;
                      setFilters?.(rest);
                      setTimeout(() => fetchRecs?.(), 0);
                    }}
                  />
                </Tag.EndElement>
              </Tag.Root>
            ) : null}
            {filters?.max_tempo ? (
              <Tag.Root size={["sm", "md"]} borderRadius="full">
                <Tag.Label>Max BPM {filters.max_tempo}</Tag.Label>
                <Tag.EndElement>
                  <Tag.CloseTrigger
                    onClick={() => {
                      const { max_tempo, ...rest } = filters;
                      setFilters?.(rest);
                      setTimeout(() => fetchRecs?.(), 0);
                    }}
                  />
                </Tag.EndElement>
              </Tag.Root>
            ) : null}
          </HStack>
        </Box>
        <Switch.Root
          checked={hoverPreviewEnabled}
          onCheckedChange={(e) => setHoverPreviewEnabled(e.checked)}
          size={["sm", "md"]}
          ml={2}
          flexShrink={0}
        >
          <Switch.HiddenInput />
          <Switch.Control
            _checked={{
              bg: "electricPurple.500",
              borderColor: "electricPurple.500",
            }}
          >
            <Switch.Thumb />
          </Switch.Control>
          <Switch.Label color="white" fontSize={["xs", "sm"]}>
            Hover to preview
          </Switch.Label>
        </Switch.Root>
      </Flex>
    </Box>
  ) : null;
}
