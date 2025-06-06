import { VercelRequest, VercelResponse } from '@vercel/node';
import storage from '../../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const styles = await storage.getMusicStyles();
    res.json(styles);
  } catch (error) {
    console.error("Error fetching styles:", error);
    res.status(500).json({ error: "Failed to fetch music styles" });
  }
} 