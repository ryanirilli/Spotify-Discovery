import SpotifySeedControls from "@/components/SpotifySeedControls";
import SpotifySeeds from "@/components/SpotifySeeds";
import SpotifyTopNav from "@/components/SpotifyTopNav";
import DesktopAppLayout from "@/components/DesktopAppLayout";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SpotifyMainContent from "@/components/SpotifyMainContent";
import SpotifyLeftSidebar from "@/components/SpotifyLeftSidebar";

export default async function Home() {
  const nextCookies = cookies();
  const { value: spotifyAccessToken } =
    nextCookies.get("spotify_access_token") || {};
  const { value: spotifyRefreshToken } =
    nextCookies.get("spotify_refresh_token") || {};
  if (!spotifyAccessToken && !spotifyRefreshToken) {
    redirect("/");
  }

  return (
    <DesktopAppLayout
      topNav={
        <SpotifyTopNav>
          <SpotifySeedControls />
          <SpotifySeeds />
        </SpotifyTopNav>
      }
      leftSidebar={<SpotifyLeftSidebar />}
    >
      <SpotifyMainContent />
    </DesktopAppLayout>
  );
}
