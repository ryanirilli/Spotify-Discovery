import { del } from "@vercel/blob";
import { eq } from "drizzle-orm";
import type { NextApiRequest, NextApiResponse } from "next";
import spotifyApi from "@/lib/SpotifyClient";
import setSpotifyAccessToken from "@/lib/setSpotifyAccessToken";
import { getDb } from "@/db";
import { collections } from "@/db/schema";

export default async function SpotifyCollectionById(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return await setSpotifyAccessToken(req, res, spotifyApi, async () => {
    if (req.method !== "DELETE") {
      res.setHeader("Allow", "DELETE");
      return res.status(405).json({ error: "Method not allowed" });
    }

    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    if (!id) {
      return res.status(400).json({ error: "Collection id is required" });
    }

    const [me, existing] = await Promise.all([
      spotifyApi.getMe(),
      getDb()
        .select()
        .from(collections)
        .where(eq(collections.id, id))
        .limit(1),
    ]);
    const collection = existing[0];

    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    if (collection.ownerSpotifyUserId !== me.body.id) {
      return res.status(403).json({ error: "Only the owner can delete this" });
    }

    await getDb().delete(collections).where(eq(collections.id, id));

    if (collection.coverBlobPath) {
      del(collection.coverBlobPath).catch((error) => {
        console.error("Could not delete collection cover blob", error);
      });
    }

    return res.status(200).json({ success: true });
  });
}
