import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Release ID is required' });
  }

  try {
    const DISCOGS_TOKEN = process.env.DISCOGS_TOKEN || process.env.DISCOGS_API_TOKEN || "";

    if (!DISCOGS_TOKEN) {
      return res.status(500).json({ error: "Discogs API token not configured" });
    }

    console.log(`[API] Fetching high-res image for release ${id}`);

    const response = await fetch(`https://api.discogs.com/releases/${id}`, {
      headers: {
        "Authorization": `Discogs token=${DISCOGS_TOKEN}`,
        "User-Agent": "MusicDiscoveryTool/1.0",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Discogs API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: `Discogs API error: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();
    
    // Extract the highest resolution image
    let highResImage = null;
    
    if (data.images && data.images.length > 0) {
      // Sort by width descending to get the highest resolution
      const sortedImages = data.images.sort((a: any, b: any) => {
        const aWidth = a.width || 0;
        const bWidth = b.width || 0;
        return bWidth - aWidth;
      });
      
      // Use the highest resolution image, or fall back to uri
      highResImage = sortedImages[0].uri || sortedImages[0].resource_url;
    }
    
    // Fallback to other image sources
    if (!highResImage) {
      highResImage = data.thumb || data.cover_image || null;
    }

    return res.json({
      id: data.id,
      highResImage,
      thumb: data.thumb,
      images: data.images || []
    });

  } catch (error) {
    console.error('[API] Error fetching release details:', error);
    return res.status(500).json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}