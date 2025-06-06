import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[API] Function started');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { style } = req.query;
  console.log('[API] Style requested:', style);

  if (!style || typeof style !== 'string') {
    return res.status(400).json({ error: 'Style parameter is required' });
  }

  try {
    const DISCOGS_TOKEN = process.env.DISCOGS_TOKEN || process.env.DISCOGS_API_TOKEN || "";
    console.log('[API] Token check:', DISCOGS_TOKEN ? 'FOUND' : 'MISSING');

    if (!DISCOGS_TOKEN) {
      console.error('[API] No Discogs token found');
      return res.status(500).json({ error: "Discogs API token not configured" });
    }

    console.log('[API] About to fetch from Discogs');
    
    const searchUrl = `https://api.discogs.com/database/search?genre=${encodeURIComponent(style.charAt(0).toUpperCase() + style.slice(1))}&type=release&sort=want&sort_order=desc&page=1&per_page=20`;
    
    console.log('[API] URL:', searchUrl);

    const response = await fetch(searchUrl, {
      headers: {
        "Authorization": `Discogs token=${DISCOGS_TOKEN}`,
        "User-Agent": "MusicDiscoveryTool/1.0",
      },
    });

    console.log('[API] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Discogs API error:', response.status, errorText);
      return res.status(500).json({ 
        error: `Discogs API error: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();
    console.log('[API] Got data, results count:', data.results?.length || 0);

    // Simple response without complex transformation
    return res.json({
      results: data.results || [],
      pagination: data.pagination || { page: 1, pages: 1, per_page: 20, items: 0 }
    });

  } catch (error) {
    console.error('[API] Catch block error:', error);
    return res.status(500).json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}