import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { style } = req.query;
  const { page = "1", per_page = "20" } = req.query;

  if (!style || typeof style !== 'string') {
    return res.status(400).json({ error: 'Style parameter is required' });
  }

  try {
    const DISCOGS_TOKEN = process.env.DISCOGS_TOKEN || process.env.DISCOGS_API_TOKEN || "";
    const DISCOGS_BASE_URL = "https://api.discogs.com";

    console.log(`[API] Fetching releases for style: ${style}`);
    console.log(`[API] Token configured: ${DISCOGS_TOKEN ? 'YES' : 'NO'}`);

    // Fetch from Discogs API (no caching in serverless)
    if (!DISCOGS_TOKEN) {
      console.error('[API] No Discogs token found');
      throw new Error("Discogs API token not configured");
    }

    const searchUrl = new URL(`${DISCOGS_BASE_URL}/database/search`);
    // Use genre instead of style for better results
    searchUrl.searchParams.set("genre", style.charAt(0).toUpperCase() + style.slice(1));
    searchUrl.searchParams.set("type", "release");
    searchUrl.searchParams.set("sort", "want");
    searchUrl.searchParams.set("sort_order", "desc");
    searchUrl.searchParams.set("page", page as string);
    searchUrl.searchParams.set("per_page", per_page as string);

    console.log(`Fetching from Discogs: ${searchUrl.toString()}`);
    
    const response = await fetch(searchUrl.toString(), {
      headers: {
        "Authorization": `Discogs token=${DISCOGS_TOKEN}`,
        "User-Agent": "MusicDiscoveryTool/1.0",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] Discogs API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Discogs API error: ${response.status} ${response.statusText}: ${errorText}`);
    }

    const data = await response.json();
    console.log(`Discogs API response sample:`, JSON.stringify(data.results?.[0] || {}, null, 2));
    
    // Skip validation and work directly with the API response
    if (!data.results || !Array.isArray(data.results)) {
      throw new Error("Invalid response format from Discogs API");
    }

    // Transform the results
    const transformedReleases = data.results.map((release: any) => {
      const basicInfo = release.basic_information;
      
      // Extract artist and title from the release title (format: "Artist - Title")
      let artist = "Unknown Artist";
      let title = "Unknown Title";
      
      const fullTitle = basicInfo?.title || release.title || "";
      if (fullTitle.includes(" - ")) {
        const parts = fullTitle.split(" - ");
        artist = parts[0].trim();
        title = parts.slice(1).join(" - ").trim();
      } else if (basicInfo?.artists?.[0]?.name) {
        artist = basicInfo.artists[0].name;
        title = fullTitle;
      } else {
        title = fullTitle;
      }
      const year = basicInfo?.year ? String(basicInfo.year) : (release.year ? String(release.year) : null);
      const label = basicInfo?.labels?.[0]?.name || null;
      const format = basicInfo?.formats?.[0]?.name || null;
      const genre = basicInfo?.genres?.[0] || null;
      const wantCount = release.community?.want || 0;
      const collectCount = release.community?.have || 0;
      const thumbnailUrl = basicInfo?.thumb || release.thumb || null;

      return {
        discogsId: release.id.toString(),
        title,
        artist,
        year,
        label,
        format,
        genre,
        style,
        wantCount,
        collectCount,
        thumbnailUrl,
      };
    });

    res.json({
      results: transformedReleases,
      pagination: data.pagination || {
        page: parseInt(page as string),
        pages: 1,
        per_page: parseInt(per_page as string),
        items: transformedReleases.length,
      }
    });
  } catch (error) {
    console.error(`[API] Error fetching releases for style ${style}:`, error);
    res.status(500).json({ 
      error: "Failed to fetch releases from Discogs",
      details: error instanceof Error ? error.message : "Unknown error",
      style: style
    });
  }
}