import spotifyApi from "@/lib/SpotifyClient";
import type { NextApiRequest, NextApiResponse } from "next";
import setSpotifyAccessToken from "@/lib/setSpotifyAccessToken";

function getArtistIds(queryArtists: NextApiRequest["query"]["artists"]) {
  const rawArtists = Array.isArray(queryArtists)
    ? queryArtists.join(",")
    : queryArtists;
  return (rawArtists || "")
    .split(",")
    .map((artist) => artist.trim())
    .filter(Boolean);
}

export default async function SpotifyGetArtistsDetails(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return await setSpotifyAccessToken(req, res, spotifyApi, async (spotifyApi) => {
    const artistIds = getArtistIds(req.query.artists);

    if (!artistIds.length) {
      return res.status(400).json({ error: "Missing artists query parameter" });
    }

    const data = await spotifyApi.getArtists(artistIds);
    return res.status(200).json(data?.body.artists || {});
  });
}
