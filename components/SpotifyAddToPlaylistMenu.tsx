"use client";

import {
  ReactElement,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Box,
  Button,
  Flex,
  Icon,
  Input,
  InputGroup,
  Popover,
  Portal,
  Spinner,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { CgSearch } from "react-icons/cg";
import { SiApplemusic } from "react-icons/si";
import { SpotifyPlaylistsContext } from "./SpotifyPlaylistsProvider";
import BottomSheet from "./ui/BottomSheet";
import spotifyAddTracksToPlaylist, {
  TSpotifyAddToPlaylistArgs,
} from "@/mutations/spotifyAddTracksToPlaylistMutation";
import spotifyCreatePlaylist, {
  TSpotifyCreatePlaylistArgs,
} from "@/mutations/spotifyCreatePlaylistMutation";
import { toaster } from "@/utils/toaster";
import { TSpotifyTrack } from "@/types/SpotifyTrack";
import scrollBarStyle from "@/utils/scrollBarStyle";

interface ISpotifyAddToPlaylistMenu {
  track: TSpotifyTrack;
  /** Element that opens the popover when clicked. Must accept a ref. */
  trigger: ReactElement;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Thin outer shell. Intentionally avoids subscribing to context, creating
 * query subscribers, or evaluating menu JSX until the popover is actually
 * opened. Each track card renders one of these, so closed-state overhead
 * must stay near zero.
 *
 * All the heavy work (context subscription, mutations, filtering, list
 * rendering) lives in `MenuBody`, which only mounts when `open` is true
 * thanks to `lazyMount` + `unmountOnExit` on Popover.Root.
 */
export default function SpotifyAddToPlaylistMenu({
  track,
  trigger,
  onOpenChange,
}: ISpotifyAddToPlaylistMenu) {
  const [open, setOpen] = useState(false);

  // Resolves client-side only — SSR returns undefined, so we fall through to
  // the popover path on first paint and swap to the sheet once we know the
  // viewport is narrow.
  const isMobile = useBreakpointValue(
    { base: true, md: false },
    { ssr: false }
  );

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  if (isMobile) {
    return (
      <BottomSheet
        open={open}
        onOpenChange={handleOpenChange}
        trigger={trigger}
        title="Add to playlist"
      >
        {open && (
          <MenuBody
            track={track}
            onClose={() => setOpen(false)}
            autoFocusInput={false}
            fillHeight
          />
        )}
      </BottomSheet>
    );
  }

  return (
    <Popover.Root
      open={open}
      onOpenChange={(e) => handleOpenChange(e.open)}
      positioning={{ placement: "bottom-end" }}
      lazyMount
      unmountOnExit
    >
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      {open && (
        <Portal>
          <Popover.Positioner>
            <Popover.Content
              bg="black"
              color="white"
              borderWidth={0}
              boxShadow="dark-lg"
              w="320px"
              maxW="90vw"
              // Chakra v3 wires the arrow tip fill via this CSS var; set it
              // here so the arrow matches the solid black content.
              css={{ "--popover-bg": "colors.black" }}
            >
              <Popover.Arrow>
                <Popover.ArrowTip
                  bg="black"
                  borderColor="transparent"
                  boxShadow="none"
                />
              </Popover.Arrow>
              <Popover.Body p={0}>
                <MenuBody track={track} onClose={() => setOpen(false)} />
              </Popover.Body>
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      )}
    </Popover.Root>
  );
}

interface IMenuBody {
  track: TSpotifyTrack;
  onClose: () => void;
  /** Defaults to true for the popover variant; mobile sheet opts out. */
  autoFocusInput?: boolean;
  /** When true, the list flex-fills its container instead of capping at 280px. */
  fillHeight?: boolean;
}

/**
 * Heavy body of the add-to-playlist menu. Only mounted while the popover is
 * open — so context subscriptions, mutation subscribers, and the filter/list
 * JSX are paid for exactly once (for the opened popover), not once per card.
 */
function MenuBody({
  track,
  onClose,
  autoFocusInput = true,
  fillHeight = false,
}: IMenuBody) {
  const { playlists, isLoading, refetchPlaylists } =
    useContext(SpotifyPlaylistsContext) || {
      playlists: [],
      isLoading: false,
      refetchPlaylists: undefined,
    };

  const [filter, setFilter] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return playlists ?? [];
    return (playlists ?? []).filter((p) =>
      p.name.toLowerCase().includes(q)
    );
  }, [playlists, filter]);

  const hasExactMatch = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return false;
    return (playlists ?? []).some((p) => p.name.toLowerCase() === q);
  }, [playlists, filter]);

  const showCreateRow = filter.trim().length > 0 && !hasExactMatch;

  const addMutation = useMutation({
    mutationFn: ({ playlistId, tracks }: TSpotifyAddToPlaylistArgs) =>
      spotifyAddTracksToPlaylist({ playlistId, tracks }),
    onSuccess: (_data, vars) => {
      const pl = playlists?.find((p) => p.id === vars.playlistId);
      toaster.create({
        title: `Added to ${pl?.name ?? "playlist"}`,
        type: "success",
        duration: 3000,
      });
      onClose();
    },
    onError: () => {
      toaster.create({
        title: "Couldn't add track",
        type: "error",
        duration: 3000,
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: ({ name }: TSpotifyCreatePlaylistArgs) =>
      spotifyCreatePlaylist({ name }),
    onSuccess: async (res: {
      success?: boolean;
      data?: { body?: { id?: string; name?: string } };
    }) => {
      const newId = res?.data?.body?.id;
      const newName = res?.data?.body?.name ?? filter.trim();
      await refetchPlaylists?.();
      if (newId) {
        try {
          await spotifyAddTracksToPlaylist({
            playlistId: newId,
            tracks: [track.uri],
          });
          toaster.create({
            title: `Created "${newName}" and added track`,
            type: "success",
            duration: 3000,
          });
        } catch {
          toaster.create({
            title: `Created "${newName}" but couldn't add the track`,
            type: "error",
            duration: 4000,
          });
        }
      }
      onClose();
    },
    onError: () => {
      toaster.create({
        title: "Couldn't create playlist",
        type: "error",
        duration: 3000,
      });
    },
  });

  const busy = addMutation.isPending || createMutation.isPending;

  const onSelect = (playlistId: string) => {
    if (busy) return;
    addMutation.mutate({ playlistId, tracks: [track.uri] });
  };

  const onCreate = () => {
    if (busy) return;
    const name = filter.trim();
    if (!name) return;
    createMutation.mutate({ name });
  };

  return (
    <Flex
      direction="column"
      h={fillHeight ? "100%" : undefined}
      minH={0}
    >
      <Box p={2}>
        <InputGroup
          startElement={<Icon as={CgSearch} color="gray.400" />}
        >
          <Input
            ref={inputRef}
            autoFocus={autoFocusInput}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Find or create a playlist"
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              e.preventDefault();
              if (showCreateRow) {
                onCreate();
              } else if (filtered.length > 0) {
                onSelect(filtered[0].id);
              }
            }}
          />
        </InputGroup>
      </Box>

      <Box
        maxH={fillHeight ? undefined : "280px"}
        flex={fillHeight ? 1 : undefined}
        minH={0}
        overflowY="auto"
        css={scrollBarStyle}
        py={1}
      >
        {showCreateRow && (
          <PopoverRow
            onClick={onCreate}
            disabled={busy}
            loading={createMutation.isPending}
          >
            <Icon as={SiApplemusic} color="color-palette.400" />
            <Text lineClamp={1}>
              Create{" "}
              <Text as="span" fontWeight="bold">
                &ldquo;{filter.trim()}&rdquo;
              </Text>
            </Text>
          </PopoverRow>
        )}

        {isLoading ? (
          <Flex justify="center" py={4}>
            <Spinner size="sm" />
          </Flex>
        ) : filtered.length === 0 ? (
          <Text px={3} py={3} color="gray.400" fontSize="sm">
            {filter.trim()
              ? "No matching playlists"
              : "No playlists yet"}
          </Text>
        ) : (
          filtered.map((pl) => (
            <PopoverRow
              key={pl.id}
              onClick={() => onSelect(pl.id)}
              disabled={busy}
              loading={
                addMutation.isPending &&
                addMutation.variables?.playlistId === pl.id
              }
            >
              <Text lineClamp={1}>{pl.name}</Text>
            </PopoverRow>
          ))
        )}
      </Box>
    </Flex>
  );
}

interface IPopoverRow {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

function PopoverRow({ children, onClick, disabled, loading }: IPopoverRow) {
  return (
    <Button
      w="100%"
      justifyContent="flex-start"
      variant="ghost"
      size="sm"
      bg="transparent"
      color="white"
      borderRadius={0}
      fontWeight="normal"
      px={3}
      _hover={{ bg: "whiteAlpha.200" }}
      _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <Flex gap={2} alignItems="center" minW={0} w="100%">
        {children}
        {loading && <Spinner size="xs" ml="auto" />}
      </Flex>
    </Button>
  );
}
