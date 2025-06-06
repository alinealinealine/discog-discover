import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const styles = [
      { id: 1, name: 'Rock', value: 'rock' },
      { id: 2, name: 'Jazz', value: 'jazz' },
      { id: 3, name: 'Hip Hop', value: 'hip-hop' },
      { id: 4, name: 'Electronic', value: 'electronic' },
      { id: 5, name: 'Classical', value: 'classical' },
      { id: 6, name: 'Pop', value: 'pop' },
      { id: 7, name: 'R&B', value: 'r-b' },
      { id: 8, name: 'Country', value: 'country' },
      { id: 9, name: 'Metal', value: 'metal' },
      { id: 10, name: 'Folk', value: 'folk' }
    ];
    res.json(styles);
  } catch (error) {
    console.error("Error fetching styles:", error);
    res.status(500).json({ error: "Failed to fetch music styles" });
  }
}