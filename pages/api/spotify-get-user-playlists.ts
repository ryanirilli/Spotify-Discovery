import spotifyApi from "@/lib/SpotifyClient";
import type { NextApiRequest, NextApiResponse } from "next";
import setSpotifyAccessToken from "@/lib/setSpotifyAccessToken";
import { TSpotifyPlaylist } from "@/types/SpotifyPlaylist";

export default async function SpotifyGetUserPlaylists(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return await setSpotifyAccessToken(req, res, spotifyApi, async () => {
    let offset = 0;
    let allPlaylists: any[] = [];
    const {
      body: { id: ownerId },
    } = await spotifyApi.getMe();
    async function getUserPlaylists(offset: number) {
      const data = await spotifyApi.getUserPlaylists({
        limit: 50,
        offset,
      });
      allPlaylists = allPlaylists.concat(data.body.items);
      if (data.body.next) {
        offset = offset + 50;
        await getUserPlaylists(offset);
      }
    }
    await getUserPlaylists(offset);
    allPlaylists = allPlaylists.filter(
      (playlist) => playlist.owner.id === ownerId
    );
    return res.status(200).json(allPlaylists as TSpotifyPlaylist[]);
  });
}
