"use client";

import {
  Icon,
  Toaster as ChakraToaster,
  createToaster,
  Portal,
  Stack,
  Toast,
} from "@chakra-ui/react";
import { TbPlaylistAdd } from "react-icons/tb";

export const toaster = createToaster({
  placement: "top",
  pauseOnPageIdle: true,
});

export function Toaster() {
  return (
    <Portal>
      <ChakraToaster toaster={toaster}>
        {(toast) => {
          const isPlaylistHint = toast.meta?.icon === "playlist";

          return (
            <Toast.Root
              width={{ md: "sm" }}
              display="flex"
              alignItems="flex-start"
              gap={3}
              bg={isPlaylistHint ? "electricPurple.500" : undefined}
              color={isPlaylistHint ? "white" : undefined}
              borderColor={isPlaylistHint ? "electricPurple.400" : undefined}
            >
              {isPlaylistHint && (
                <Icon
                  as={TbPlaylistAdd}
                  boxSize={5}
                  color="white"
                  flexShrink={0}
                  mt="1px"
                />
              )}
              <Stack gap="1" flex="1" maxWidth="100%">
                {toast.title && (
                  <Toast.Title color={isPlaylistHint ? "white" : undefined}>
                    {toast.title}
                  </Toast.Title>
                )}
                {toast.description && (
                  <Toast.Description
                    color={isPlaylistHint ? "white" : undefined}
                  >
                    {toast.description}
                  </Toast.Description>
                )}
              </Stack>
              {toast.action && (
                <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>
              )}
              {toast.closable && <Toast.CloseTrigger />}
            </Toast.Root>
          );
        }}
      </ChakraToaster>
    </Portal>
  );
}
