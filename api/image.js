import { Buffer } from "node:buffer";
import { cleanText, openAiErrorMessage, requirePost, sendJson } from "./_shared.js";

const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";

function dataUrlToBlob(dataUrl) {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl || "");
  if (!match) return null;

  const mimeType = match[1];
  const buffer = Buffer.from(match[2], "base64");
  return {
    blob: new Blob([buffer], { type: mimeType }),
    extension: mimeType.split("/")[1] || "png",
  };
}

function demoImage(prompt) {
  const safePrompt = cleanText(prompt || "Marketing visual", 120)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#0b0f16"/>
        <stop offset="0.48" stop-color="#12363a"/>
        <stop offset="1" stop-color="#3b2431"/>
      </linearGradient>
    </defs>
    <rect width="1024" height="1024" fill="url(#bg)"/>
    <rect x="88" y="116" width="848" height="792" rx="32" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.24)" stroke-width="2"/>
    <path d="M160 680 C260 520 346 548 456 420 C570 288 710 286 864 174" fill="none" stroke="#39d0c8" stroke-width="18" stroke-linecap="round"/>
    <circle cx="266" cy="610" r="44" fill="#f7b955"/>
    <circle cx="530" cy="390" r="56" fill="#f06d8f"/>
    <circle cx="768" cy="252" r="40" fill="#39d0c8"/>
    <text x="128" y="190" fill="#f6f7fb" font-family="Arial, sans-serif" font-size="46" font-weight="700">INFINITI MKT</text>
    <text x="128" y="252" fill="#b9c3d2" font-family="Arial, sans-serif" font-size="28">Modo demo visual</text>
    <foreignObject x="128" y="730" width="768" height="120">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Arial,sans-serif;color:#f6f7fb;font-size:34px;line-height:1.2;font-weight:700">${safePrompt}</div>
    </foreignObject>
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function extractImage(data) {
  const item = data?.data?.[0];
  if (item?.url) return item.url;
  if (item?.b64_json) return `data:image/png;base64,${item.b64_json}`;
  return null;
}

export default async function handler(req, res) {
  if (!requirePost(req, res)) return;

  const { prompt, reference_image: referenceImage, brand } = req.body || {};
  const cleanPrompt = cleanText(prompt, 4000);

  if (!cleanPrompt) {
    return sendJson(res, 400, { error: "Missing image prompt" });
  }

  const finalPrompt = [
    "Crea una pieza visual profesional para marketing digital.",
    `Brief: ${cleanPrompt}`,
    brand?.name ? `Marca: ${cleanText(brand.name, 120)}` : "",
    brand?.tone ? `Tono visual: ${cleanText(brand.tone, 160)}` : "",
    "Composicion limpia, premium, utilizable en anuncios y redes sociales.",
  ]
    .filter(Boolean)
    .join("\n");

  if (!process.env.OPENAI_API_KEY) {
    return sendJson(res, 200, {
      url: demoImage(cleanPrompt),
      enhanced: finalPrompt,
      mode: "demo",
      model: "demo",
    });
  }

  const reference = dataUrlToBlob(referenceImage);
  const endpoint = reference
    ? "https://api.openai.com/v1/images/edits"
    : "https://api.openai.com/v1/images/generations";

  const requestInit = reference
    ? (() => {
        const form = new FormData();
        form.append("model", IMAGE_MODEL);
        form.append("prompt", finalPrompt);
        form.append("size", "1024x1024");
        form.append("image", reference.blob, `reference.${reference.extension}`);
        return {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: form,
        };
      })()
    : {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: IMAGE_MODEL,
          prompt: finalPrompt,
          size: "1024x1024",
        }),
      };

  const openAiResponse = await fetch(endpoint, requestInit);
  const data = await openAiResponse.json().catch(() => ({}));

  if (!openAiResponse.ok) {
    return sendJson(res, openAiResponse.status, {
      error: openAiErrorMessage(data, "Image generation failed"),
      mode: "error",
    });
  }

  const url = extractImage(data);
  if (!url) {
    return sendJson(res, 502, { error: "OpenAI did not return an image" });
  }

  return sendJson(res, 200, {
    url,
    enhanced: finalPrompt,
    mode: "live",
    model: IMAGE_MODEL,
  });
}
