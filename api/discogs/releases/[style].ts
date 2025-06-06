import { VercelRequest, VercelResponse } from '@vercel/node';
import storage from '../../../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const style = req.query.style as string;
  const page = req.query.page as string || "1";
  const per_page = req.query.per_page as string || "20";

  try {
    // Check if we have cached data for this style
    const cachedReleases = await storage.getMusicReleasesByStyle(style);
    
    if (cachedReleases.length > 0) {
      return res.json({
        results: cachedReleases,
        pagination: {
          page: parseInt(page),
          pages: Math.ceil(cachedReleases.length / parseInt(per_page)),
          per_page: parseInt(per_page),
          items: cachedReleases.length,
        }
      });
    }

    const DISCOGS_TOKEN = process.env.DISCOGS_TOKEN || process.env.DISCOGS_API_TOKEN || "";
    const DISCOGS_BASE_URL = "https://api.discogs.com";

    // Fetch from Discogs API
    if (!DISCOGS_TOKEN) {
      throw new Error("Discogs API token not configured");
    }

    const searchUrl = new URL(`${DISCOGS_BASE_URL}/database/search`);
    searchUrl.searchParams.set("genre", style.charAt(0).toUpperCase() + style.slice(1));
    searchUrl.searchParams.set("type", "release");
    searchUrl.searchParams.set("sort", "want");
    searchUrl.searchParams.set("sort_order", "desc");
    searchUrl.searchParams.set("page", page);
    searchUrl.searchParams.set("per_page", per_page);

    console.log(`Fetching from Discogs: ${searchUrl.toString()}`);
    
    const response = await fetch(searchUrl.toString(), {
      headers: {
        "Authorization": `Discogs token=${DISCOGS_TOKEN}`,
        "User-Agent": "MusicDiscoveryTool/1.0",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Discogs API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Discogs API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.results || !Array.isArray(data.results)) {
      throw new Error("Invalid response format from Discogs API");
    }

    // Transform and cache the results
    const releasesToCache = data.results.map((release: any) => {
      const basicInfo = release.basic_information;
      
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

      return {
        discogsId: release.id.toString(),
        title,
        artist,
        year: basicInfo?.year ? String(basicInfo.year) : (release.year ? String(release.year) : null),
        label: basicInfo?.labels?.[0]?.name || null,
        format: basicInfo?.formats?.[0]?.name || null,
        genre: basicInfo?.genres?.[0] || null,
        style,
        wantCount: release.community?.want || 0,
        collectCount: release.community?.have || 0,
        thumbnailUrl: basicInfo?.thumb || release.thumb || null,
      };
    });

    // Cache the results
    if (releasesToCache.length > 0) {
      await storage.clearMusicReleasesByStyle(style);
      await storage.createMusicReleases(releasesToCache);
    }

    res.json({
      results: releasesToCache,
      pagination: data.pagination || {
        page: parseInt(page),
        pages: 1,
        per_page: parseInt(per_page),
        items: releasesToCache.length,
      }
    });
  } catch (error) {
    console.error(`Error fetching releases for style ${style}:`, error);
    res.status(500).json({ 
      error: "Failed to fetch releases from Discogs",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
} 