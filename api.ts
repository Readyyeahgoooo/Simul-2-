export const config = {
  api: { bodyParser: { sizeLimit: '6mb' } }, // adjust if needed
};

function extractJson(content: string) {
  // Best-effort: find the first JSON object in the output
  const start = content.indexOf('{');
  const end = content.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  const slice = content.slice(start, end + 1);
  try {
    return JSON.parse(slice);
  } catch {
    return null;
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-r1';

  if (!OPENROUTER_API_KEY) {
    res.status(500).json({ error: 'Missing OPENROUTER_API_KEY on server' });
    return;
  }

  const { model, messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Missing messages[]' });
    return;
  }

  const chosenModel = (typeof model === 'string' && model.trim()) ? model : DEFAULT_MODEL;

  try {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        // Optional but recommended by OpenRouter:
        'HTTP-Referer': req.headers?.origin || 'https://vercel.app',
        'X-Title': 'Vibe Life Stimulator',
      },
      body: JSON.stringify({
        model: chosenModel,
        messages,
        temperature: 0.7,
      }),
    });

    const data = await r.json();

    if (!r.ok) {
      res.status(r.status).json({ error: 'OpenRouter error', details: data });
      return;
    }

    const content = data?.choices?.[0]?.message?.content ?? '';
    // Try strict JSON parse first
    let parsed: any = null;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = extractJson(content);
    }

    if (!parsed) {
      // Return something safe so your UI doesn't crash
      res.status(200).json({
        event: content || 'Model returned empty content.',
      });
      return;
    }

    res.status(200).json(parsed);
  } catch (e: any) {
    res.status(500).json({ error: 'Server error', message: e?.message || String(e) });
  }
}
