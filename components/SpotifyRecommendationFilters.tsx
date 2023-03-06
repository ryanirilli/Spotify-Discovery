"use client";

import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Tag,
  TagLabel,
} from "@chakra-ui/react";
import produce from "immer";
import { useContext, useReducer } from "react";
import { IoFilter } from "react-icons/io5";
import { TopNavHeightContext } from "./DesktopAppLayout";
import {
  SpotifyRecommendationsContext,
  TSpotifyRecommendationFilters,
} from "./SpotifyRecommendationsProvider";
import SpotifyTempoFilter from "./SpotifyTempoFilter";

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

  return Boolean(recommendations?.length) ? (
    <Box
      bgGradient="linear(to-b, blackAlpha.700, transparent)"
      p={[1, 2]}
      position="sticky"
      top={`${topNavHeight}px`}
      zIndex="banner"
    >
      <Flex alignItems="center" ml={[1, 0]}>
        <Popover>
          {({ onClose }) => (
            <>
              <PopoverTrigger>
                <Button
                  leftIcon={<Icon as={IoFilter} />}
                  size={["sm", "md"]}
                  colorScheme="blackButton"
                  borderRadius="full"
                >
                  Filters
                </Button>
              </PopoverTrigger>
              <Portal>
                <PopoverContent>
                  <PopoverArrow />
                  <PopoverBody>
                    <SpotifyTempoFilter onChange={onChangeTempoRange} />
                  </PopoverBody>
                  <Box p={2}>
                    <Button
                      isDisabled={!draftFilters.isDirty}
                      w="100%"
                      colorScheme="purple"
                      onClick={() => {
                        onApply();
                        onClose();
                      }}
                    >
                      Apply
                    </Button>
                  </Box>
                </PopoverContent>
              </Portal>
            </>
          )}
        </Popover>
        <Box color="white" ml={2}>
          <HStack>
            {filters?.target_tempo && (
              <Tag colorScheme="blue" size={["sm", "md"]} borderRadius="full">
                <TagLabel>Target BPM {filters.target_tempo}</TagLabel>
              </Tag>
            )}
            {filters?.max_tempo && (
              <Tag colorScheme="blue" size={["sm", "md"]} borderRadius="full">
                <TagLabel>Max BPM {filters.max_tempo}</TagLabel>
              </Tag>
            )}
          </HStack>
        </Box>
      </Flex>
    </Box>
  ) : null;
}
