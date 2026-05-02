import OpenAI from "openai";

const DEFAULT_MODERATION_MODEL = "gpt-4o-mini";

const SYSTEM_PROMPT =
  "You are a strict content moderator for a public music discovery app. " +
  "Decide whether a user-submitted collection name is appropriate to display " +
  "to other users. A name is INAPPROPRIATE if it contains profanity, vulgar " +
  "language, slurs, sexual content, hate speech, harassment, threats, or is " +
  "otherwise offensive. Names that are merely silly, weird, or in a foreign " +
  "language are fine. Reply with exactly one word: \"ok\" or \"no\".";

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required to moderate collection titles");
  }
  return new OpenAI({ apiKey });
}

export async function isCollectionTitleAppropriate(
  title: string
): Promise<boolean> {
  try {
    const openai = getOpenAIClient();
    const model =
      process.env.OPENAI_MODERATION_MODEL || DEFAULT_MODERATION_MODEL;
    const res = await openai.chat.completions.create({
      model,
      temperature: 0,
      max_tokens: 3,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: title },
      ],
    });
    const verdict = res.choices[0]?.message?.content?.trim().toLowerCase();
    return verdict === "ok";
  } catch (error) {
    // Fail open so a transient OpenAI outage doesn't block users entirely.
    // The cover-gen step would surface a separate failure if the key is bad.
    console.error("Title moderation failed", error);
    return true;
  }
}
