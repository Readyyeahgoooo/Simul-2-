import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  api: { bodyParser: { sizeLimit: "6mb" } },
};

function extractJson(content: string) {
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const slice = content.slice(start, end + 1);
  try {
    return JSON.parse(slice);
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Validate request method
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Read environment variables
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || "xiaomi/mimo-v2-flash:free";

  // Validate API key exists
  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({ 
      error: "Missing OPENROUTER_API_KEY on server",
      message: "Please configure OPENROUTER_API_KEY in Vercel environment variables"
    });
  }

  // Validate request body
  const { model, messages, enableReasoning } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ 
      error: "Missing messages[]",
      message: "Request body must include a non-empty messages array"
    });
  }

  // Select model (priority: request body > env variable > default)
  const chosenModel = typeof model === "string" && model.trim() ? model : DEFAULT_MODEL;

  try {
    // Make request to OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": req.headers?.origin || req.headers?.referer || "https://vercel.app",
        "X-Title": "Vibe Life Stimulator",
      },
      body: JSON.stringify({
        model: chosenModel,
        messages,
        temperature: 0.7,
        ...(enableReasoning ? { reasoning: { enabled: true } } : {}),
      }),
    });

    const data = await response.json();

    // Handle OpenRouter API errors
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: "OpenRouter error", 
        details: data,
        message: data?.error?.message || "OpenRouter API request failed"
      });
    }

    // Extract content from response
    const content = data?.choices?.[0]?.message?.content ?? "";

    // Parse JSON response
    let parsed: any = null;
    try {
      parsed = JSON.parse(content);
    } catch {
      // Try to extract JSON from markdown-wrapped content
      parsed = extractJson(content);
    }

    // Return parsed JSON or safe fallback
    if (!parsed) {
      return res.status(200).json({ 
        event: content || "Model returned empty content." 
      });
    }

    return res.status(200).json(parsed);
  } catch (e: any) {
    console.error("Server error:", e);
    return res.status(500).json({ 
      error: "Server error", 
      message: e?.message || String(e) 
    });
  }
}
