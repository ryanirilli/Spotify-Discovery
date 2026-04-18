import { TSpotifyTrack } from "@/types/SpotifyTrack";
import { Link, LinkProps } from "@chakra-ui/react";
import React from "react";

const isSpotifySupported = () => {
  if (!navigator.registerProtocolHandler) {
    return false;
  }

  try {
    navigator.registerProtocolHandler(
      "spotify",
      "https://open.spotify.com/embed"
    );
    return true;
  } catch {
    return false;
  }
};

interface Props extends LinkProps {
  rec: TSpotifyTrack;
  isExternal?: boolean;
  children: React.ReactNode;
}

const SpotifyLink: React.FC<Props> = ({
  rec,
  children,
  isExternal,
  ...rest
}) => {
  const handleLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    if (!isSpotifySupported()) {
      return;
    }

    event.preventDefault();
    window.location.href = rec.uri;
  };

  return (
    <Link
      {...rest}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      href={isSpotifySupported() ? rec.uri : rec.external_urls.spotify}
      onClick={handleLinkClick}
    >
      {children}
    </Link>
  );
};

export default SpotifyLink;
