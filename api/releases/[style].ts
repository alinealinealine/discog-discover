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
    
    const capitalizedStyle = style.charAt(0).toUpperCase() + style.slice(1);
    
    // Try searching by style first, then genre as fallback
    let searchUrl = `https://api.discogs.com/database/search?style=${encodeURIComponent(capitalizedStyle)}&type=release&sort=want&sort_order=desc&page=1&per_page=20`;
    
    console.log('[API] URL (style search):', searchUrl);

    let response = await fetch(searchUrl, {
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

    let data = await response.json();
    
    // If no results with style search, try genre search
    if (!data.results || data.results.length === 0) {
      console.log('[API] No results with style search, trying genre search');
      searchUrl = `https://api.discogs.com/database/search?genre=${encodeURIComponent(capitalizedStyle)}&type=release&sort=want&sort_order=desc&page=1&per_page=20`;
      
      response = await fetch(searchUrl, {
        headers: {
          "Authorization": `Discogs token=${DISCOGS_TOKEN}`,
          "User-Agent": "MusicDiscoveryTool/1.0",
        },
      });
      
      if (response.ok) {
        data = await response.json();
      }
    }
    
    // If still no results, try a broader search with just the term
    if (!data.results || data.results.length === 0) {
      console.log('[API] No results with genre search, trying general search');
      searchUrl = `https://api.discogs.com/database/search?q=${encodeURIComponent(capitalizedStyle)}&type=release&sort=want&sort_order=desc&page=1&per_page=20`;
      
      response = await fetch(searchUrl, {
        headers: {
          "Authorization": `Discogs token=${DISCOGS_TOKEN}`,
          "User-Agent": "MusicDiscoveryTool/1.0",
        },
      });
      
      if (response.ok) {
        data = await response.json();
      }
    }
    console.log('[API] Got data, results count:', data.results?.length || 0);
    
    // Debug: log first result structure
    if (data.results && data.results.length > 0) {
      console.log('[API] First result structure:', JSON.stringify(data.results[0], null, 2));
    }

    // Transform data for frontend compatibility
    const transformedResults = (data.results || []).map((release: any) => {
      const basicInfo = release.basic_information || {};
      
      // Extract artist and title
      let artist = "Unknown Artist";
      let title = "Unknown Title";
      
      if (basicInfo.artists?.[0]?.name) {
        artist = basicInfo.artists[0].name;
        title = basicInfo.title || release.title || "";
      } else {
        const fullTitle = basicInfo.title || release.title || "";
        if (fullTitle.includes(" - ")) {
          const parts = fullTitle.split(" - ");
          artist = parts[0].trim();
          title = parts.slice(1).join(" - ").trim();
        } else {
          title = fullTitle;
        }
      }

      return {
        discogsId: release.id?.toString() || Math.random().toString(),
        title,
        artist,
        year: basicInfo.year?.toString() || release.year?.toString() || null,
        label: basicInfo.labels?.[0]?.name || null,
        format: basicInfo.formats?.[0]?.name || null,
        genre: basicInfo.genres?.[0] || null,
        style,
        wantCount: release.community?.want || release.stats?.community?.in_wantlist || 0,
        collectCount: release.community?.have || release.stats?.community?.in_collection || 0,
        thumbnailUrl: basicInfo.thumb || release.thumb || null
      };
    });

    return res.json({
      results: transformedResults,
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