import { useState, useEffect, KeyboardEvent } from "react";

interface ListSelectionState<T> {
  selectedIndex: number;
  onSelect?: (selectedItem: T | null) => void;
}

interface ListSelectionProps<T> {
  initialItems: T[];
  onSelect?: (selectedItem: T | null) => void;
}

function useListSelection<T extends Record<string, unknown>>({
  initialItems,
  onSelect,
}: ListSelectionProps<T>): ListSelectionState<T> {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex((prevIndex) =>
          prevIndex <= 0 ? initialItems.length - 1 : prevIndex - 1
        );
      } else if (event.key === "ArrowDown") {
        setSelectedIndex((prevIndex) =>
          prevIndex === initialItems.length - 1 ? 0 : prevIndex + 1
        );
      } else if (event.key === "Enter") {
        const selectedItem = initialItems[selectedIndex];
        if (onSelect) {
          onSelect(selectedItem);
        }
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown as unknown as EventListener,
      true
    );
    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown as unknown as EventListener,
        true
      );
    };
  }, [initialItems, selectedIndex, onSelect]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [initialItems]);

  return { selectedIndex, onSelect };
}

export default useListSelection;
