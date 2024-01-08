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
  const [hasAddedTempoRange, setHasAddedTempoRange] = useBoolean();

  const onRemoveTempoRange = () => {
    setHasAddedTempoRange.off();
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
          <Tooltip label="Remove filter" fontSize="xs" hasArrow openDelay={500}>
            <IconButton
              variant={"ghost"}
              aria-label="remove tempo filter"
              size="xs"
              icon={<Icon as={IoCloseOutline} boxSize="6" />}
              onClick={onRemoveTempoRange}
            />
          </Tooltip>
        </Flex>
        <Flex mb={2}>
          <Box mr={2}>
            <Text fontSize="xs">Target</Text>
            <NumberInput
              maxW={20}
              value={value?.[0]}
              onChange={(_, val) => {
                onChange([isNaN(val) ? 0 : val, value[1]]);
              }}
              size={["lg", "sm"]}
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
              value={value?.[1]}
              onChange={(_, val) =>
                onChange?.([value[0], isNaN(val) ? 0 : val])
              }
              size={["lg", "sm"]}
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
