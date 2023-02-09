"use client";

import {
  Box,
  Flex,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
  Icon,
  Text,
  IconButton,
  Tooltip,
  useBoolean,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
} from "@chakra-ui/react";
import { TbActivity } from "react-icons/tb";
import { BsTrash } from "react-icons/bs";

import { useEffect, useState } from "react";

interface ISpotifyTempoFilter {
  onChange: (range: [number, number] | null) => void;
}

export default function SpotifyTempoFilter({ onChange }: ISpotifyTempoFilter) {
  const [hasAddedTempoRange, setHasAddedTempoRange] = useBoolean();
  const [tempoRange, setTempoRange] = useState<number[]>([100, 120]);

  useEffect(() => {
    if (hasAddedTempoRange) {
      onChange(tempoRange as [number, number]);
    } else {
      onChange(null);
    }
  }, [hasAddedTempoRange, tempoRange, onChange]);

  return hasAddedTempoRange ? (
    <Box
      pt={2}
      border="1px"
      borderColor="gray.300"
      borderRadius="md"
      overflow="hidden"
    >
      <Box px={2}>
        <Flex justifyContent="space-between" mb={2}>
          <Text mb={2}>Tempo Range (BPM)</Text>
          <Tooltip label="Remove filter" fontSize="xs" hasArrow>
            <IconButton
              variant={"ghost"}
              aria-label="remove tempo filter"
              size="xs"
              icon={<Icon as={BsTrash} />}
              onClick={setHasAddedTempoRange.off}
            />
          </Tooltip>
        </Flex>

        <Flex justifyContent="space-between" mb={2}>
          <Box mr={2}>
            <Text fontSize="xs">Target</Text>
            <NumberInput
              maxW={20}
              value={tempoRange[0]}
              onChange={(_, val) =>
                setTempoRange([isNaN(val) ? 0 : val, tempoRange[1]])
              }
              size="sm"
            >
              <NumberInputField bg="whiteAlpha.900" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Box>
          <Box>
            <Text fontSize="xs">Max</Text>
            <NumberInput
              maxW="80px"
              value={tempoRange[1]}
              onChange={(_, val) =>
                setTempoRange?.([tempoRange[0], isNaN(val) ? 0 : val])
              }
              size="sm"
            >
              <NumberInputField bg="whiteAlpha.900" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Box>
        </Flex>
      </Box>
      <Box pt={2} px={2}>
        <Slider
          aria-label="target tempo slider"
          min={0}
          max={200}
          value={tempoRange[0]}
          onChange={(val) => setTempoRange([val, val + 20])}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb boxSize={6} />
        </Slider>
      </Box>
    </Box>
  ) : (
    <Button
      leftIcon={<Icon as={TbActivity} />}
      size="sm"
      colorScheme="blue"
      variant="ghost"
      onClick={setHasAddedTempoRange.on}
    >
      Tempo Range (BPM)
    </Button>
  );
}
