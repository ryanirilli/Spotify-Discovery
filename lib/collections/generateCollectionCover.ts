import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import OpenAI, { toFile } from "openai";
import { getDb } from "@/db";
import { collections } from "@/db/schema";
import { TSpotifyCollectionArtistSnapshot } from "@/types/SpotifyCollection";

const DEFAULT_IMAGE_MODEL = "gpt-image-2";

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required to generate collection covers");
  }
  return new OpenAI({ apiKey });
}

async function imageUrlToFile(url: string, index: number) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Could not fetch artist image ${index + 1}`);
  }

  const contentType = res.headers.get("content-type") || "image/jpeg";
  const ext = contentType.includes("png") ? "png" : "jpg";
  const buffer = Buffer.from(await res.arrayBuffer());

  return toFile(buffer, `artist-${index + 1}.${ext}`, { type: contentType });
}

function buildPrompt(
  title: string,
  artists: TSpotifyCollectionArtistSnapshot[]
) {
  const artistNames = artists.map((artist) => artist.name).join(", ");

  return [
    `Create a square cover image for a shared music discovery collection titled "${title}".`,
    artistNames
      ? `Use the supplied Spotify artist images as visual references for the mood, color, styling, and genre cues. The artist seeds are: ${artistNames}.`
      : "Use the title as the primary mood and genre cue.",
    "Make it polished, modern, music-forward, and suitable as a collection card thumbnail.",
    "Do not include text, typography, logos, UI, app branding, or recognizable copyrighted characters.",
  ].join(" ");
}

async function markCoverFailed(collectionId: string) {
  await getDb()
    .update(collections)
    .set({ coverStatus: "failed", updatedAt: new Date() })
    .where(eq(collections.id, collectionId));
}

export async function generateCollectionCover({
  collectionId,
  title,
  artists,
}: {
  collectionId: string;
  title: string;
  artists: TSpotifyCollectionArtistSnapshot[];
}) {
  try {
    const imageUrls = artists
      .map((artist) => artist.imageUrl)
      .filter((url): url is string => Boolean(url))
      .slice(0, 5);
    const imageFiles = await Promise.all(imageUrls.map(imageUrlToFile));
    const openai = getOpenAIClient();
    const result =
      imageFiles.length > 0
        ? await openai.images.edit({
            model: process.env.OPENAI_IMAGE_MODEL || DEFAULT_IMAGE_MODEL,
            image: imageFiles,
            prompt: buildPrompt(title, artists),
          })
        : await openai.images.generate({
            model: process.env.OPENAI_IMAGE_MODEL || DEFAULT_IMAGE_MODEL,
            prompt: buildPrompt(title, artists),
          });

    const base64Image = result.data?.[0]?.b64_json;
    if (!base64Image) {
      throw new Error("OpenAI did not return image data");
    }

    const image = Buffer.from(base64Image, "base64");
    const pathname = `collections/${collectionId}/cover.png`;
    const blob = await put(pathname, image, {
      access: "public",
      contentType: "image/png",
      allowOverwrite: true,
    });

    await getDb()
      .update(collections)
      .set({
        coverStatus: "ready",
        coverImageUrl: blob.url,
        coverBlobPath: pathname,
        updatedAt: new Date(),
      })
      .where(eq(collections.id, collectionId));
  } catch (error) {
    console.error("Could not generate collection cover", error);
    await markCoverFailed(collectionId);
  }
}
