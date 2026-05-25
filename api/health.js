import { sendJson } from "./_shared.js";

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  return sendJson(res, 200, {
    ok: true,
    runtime: "vercel-serverless",
    ai: Boolean(process.env.OPENAI_API_KEY),
    chatModel: process.env.OPENAI_MODEL || "gpt-5-mini",
    imageModel: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
  });
}
