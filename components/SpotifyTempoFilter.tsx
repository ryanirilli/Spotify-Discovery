import { useState } from "react";
import {
  Box,
  Flex,
  NumberInput,
  Button,
  Icon,
  Text,
  IconButton,
  Portal,
  Tooltip,
} from "@chakra-ui/react";
import { TbActivity } from "react-icons/tb";
import { IoCloseOutline } from "react-icons/io5";

interface ISpotifyTempoFilter {
  onChange: (range: [number, number] | null) => void;
  value: [number, number];
}

export default function SpotifyTempoFilter({
  onChange,
  value,
}: ISpotifyTempoFilter) {
  const [hasAddedTempoRange, setHasAddedTempoRange] = useState(false);

  const onRemoveTempoRange = () => {
    setHasAddedTempoRange(false);
    onChange(null);
  };

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
          <Tooltip.Root openDelay={500}>
            <Tooltip.Trigger asChild>
              <IconButton
                variant={"ghost"}
                aria-label="remove tempo filter"
                size="xs"
                onClick={onRemoveTempoRange}
              >
                <Icon as={IoCloseOutline} boxSize="6" />
              </IconButton>
            </Tooltip.Trigger>
            <Portal>
              <Tooltip.Positioner>
                <Tooltip.Content fontSize="xs">
                  <Tooltip.Arrow />
                  Remove filter
                </Tooltip.Content>
              </Tooltip.Positioner>
            </Portal>
          </Tooltip.Root>
        </Flex>
        <Flex mb={2}>
          <Box mr={2}>
            <Text fontSize="xs">Target</Text>
            <NumberInput.Root
              maxW={20}
              value={String(value?.[0] ?? 0)}
              onValueChange={(e) => {
                const val = e.valueAsNumber;
                onChange([isNaN(val) ? 0 : val, value[1]]);
              }}
              size={["lg", "sm"]}
            >
              <NumberInput.Input bg="whiteAlpha.900" />
              <NumberInput.Control>
                <NumberInput.IncrementTrigger />
                <NumberInput.DecrementTrigger />
              </NumberInput.Control>
            </NumberInput.Root>
          </Box>
          <Box>
            <Text fontSize="xs">Max</Text>
            <NumberInput.Root
              maxW="80px"
              value={String(value?.[1] ?? 0)}
              onValueChange={(e) => {
                const val = e.valueAsNumber;
                onChange?.([value[0], isNaN(val) ? 0 : val]);
              }}
              size={["lg", "sm"]}
            >
              <NumberInput.Input bg="whiteAlpha.900" />
              <NumberInput.Control>
                <NumberInput.IncrementTrigger />
                <NumberInput.DecrementTrigger />
              </NumberInput.Control>
            </NumberInput.Root>
          </Box>
        </Flex>
      </Box>
    </Box>
  ) : (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => setHasAddedTempoRange(true)}
    >
      <Icon as={TbActivity} />
      Tempo Range (BPM)
    </Button>
  );
}
