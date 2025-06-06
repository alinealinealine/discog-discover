import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const DISCOGS_TOKEN = process.env.DISCOGS_TOKEN || process.env.DISCOGS_API_TOKEN || "";
  
  res.json({
    message: "API is working",
    hasToken: !!DISCOGS_TOKEN,
    tokenLength: DISCOGS_TOKEN ? DISCOGS_TOKEN.length : 0,
    tokenPreview: DISCOGS_TOKEN ? `${DISCOGS_TOKEN.substring(0, 4)}...` : "none",
    env: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
    }
  });
}