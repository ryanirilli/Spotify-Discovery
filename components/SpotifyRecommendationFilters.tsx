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
  Tag,
  TagLabel,
  Text,
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
      bg="blackAlpha.800"
      p={[1, 4]}
      position="sticky"
      top={`${topNavHeight}px`}
      zIndex="sticky"
    >
      <Flex alignItems="center">
        <Popover>
          {({ onClose }) => (
            <>
              <PopoverTrigger>
                <Button
                  leftIcon={<Icon as={IoFilter} />}
                  size="sm"
                  colorScheme="blue"
                  borderRadius="full"
                >
                  Filters
                </Button>
              </PopoverTrigger>
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
            </>
          )}
        </Popover>
        <Box color="white" ml={2}>
          <HStack>
            {filters?.target_tempo && (
              <Tag colorScheme="blue" size={["sm", "md"]}>
                <TagLabel>Target BPM {filters.target_tempo}</TagLabel>
              </Tag>
            )}
            {filters?.max_tempo && (
              <Tag colorScheme="blue" size={["sm", "md"]}>
                <TagLabel>Max BPM {filters.max_tempo}</TagLabel>
              </Tag>
            )}
          </HStack>
        </Box>
      </Flex>
    </Box>
  ) : null;
}
