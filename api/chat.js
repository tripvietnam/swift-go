// Vercel Serverless Function: Secure proxy for Groq Chat
// Path: /api/chat
// Requires env var GROQ_API_KEY

import Groq from "@groq/sdk";

export default async function handler(req, res) {
  // CORS: handle preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({ error: 'Missing GROQ_API_KEY environment variable' });
  }

  try {
    const { history = [], message = '' } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid payload: message is required' });
    }

    const groq = new Groq({ apiKey });

    // Build messages: optional system prompt + recent history + user message
    const messages = [
      {
        role: 'system',
        content:
          'Bạn là trợ lý AI của Swift Go - nền tảng đặt phòng du lịch Việt Nam. Trả lời thân thiện, nhiệt tình và chuyên nghiệp về du lịch, khách sạn, tour. Không tiết lộ khóa hay thông tin nhạy cảm.'
      },
      ...history
        .filter(m => m && typeof m.role === 'string' && typeof m.content === 'string')
        .map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const reply = completion?.choices?.[0]?.message?.content || '';
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Groq proxy error:', err);
    const status = err?.status || 500;
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(status).json({ error: 'Proxy failed', details: err?.message || String(err) });
  }
}
