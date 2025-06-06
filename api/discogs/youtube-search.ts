import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { artist, title } = req.body;

  if (!artist || !title) {
    return res.status(400).json({ error: "Artist and title are required" });
  }

  try {
    const searchQuery = encodeURIComponent(`${artist} ${title}`);
    const youtubeUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
    
    res.json({ url: youtubeUrl });
  } catch (error) {
    console.error("Error generating YouTube URL:", error);
    res.status(500).json({ error: "Failed to generate YouTube search URL" });
  }
} 