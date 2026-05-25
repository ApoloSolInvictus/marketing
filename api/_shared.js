export function setJsonHeaders(res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
}

export function sendJson(res, statusCode, payload) {
  setJsonHeaders(res);
  res.status(statusCode).end(JSON.stringify(payload));
}

export function requirePost(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    return sendJson(res, 204, {});
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    sendJson(res, 405, { error: "Method not allowed" });
    return false;
  }

  return true;
}

export function cleanText(value, maxLength = 8000) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function normalizeHistory(history = []) {
  if (!Array.isArray(history)) return [];

  return history
    .slice(-10)
    .map((item) => ({
      role: item?.role === "ai" ? "assistant" : item?.role === "assistant" ? "assistant" : "user",
      content: cleanText(item?.content || item?.text || "", 3000),
    }))
    .filter((item) => item.content);
}

export function extractOutputText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const parts = [];
  for (const output of data?.output || []) {
    for (const content of output?.content || []) {
      if (typeof content?.text === "string") parts.push(content.text);
    }
  }

  return parts.join("\n").trim();
}

export function openAiErrorMessage(data, fallback = "OpenAI request failed") {
  return data?.error?.message || data?.message || fallback;
}
