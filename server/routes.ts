import type { Express } from "express";
import { createServer, type Server } from "http";
import storage from "./storage";
import { z } from "zod";
import { discogsSearchResponseSchema, type DiscogsSearchResponse } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const DISCOGS_TOKEN = process.env.DISCOGS_TOKEN || process.env.DISCOGS_API_TOKEN || "";
  const DISCOGS_BASE_URL = "https://api.discogs.com";
  
  // Get available music styles
  app.get("/api/styles", async (req, res) => {
    try {
      const styles = await storage.getMusicStyles();
      res.json(styles);
    } catch (error) {
      console.error("Error fetching styles:", error);
      res.status(500).json({ error: "Failed to fetch music styles" });
    }
  });

  // Get most collected music by style
  app.get("/api/releases/:style", async (req, res) => {
    const { style } = req.params;
    const { page = "1", per_page = "20" } = req.query;

    try {
      // Check if we have cached data for this style
      const cachedReleases = await storage.getMusicReleasesByStyle(style);
      
      if (cachedReleases.length > 0) {
        res.json({
          results: cachedReleases,
          pagination: {
            page: parseInt(page as string),
            pages: Math.ceil(cachedReleases.length / parseInt(per_page as string)),
            per_page: parseInt(per_page as string),
            items: cachedReleases.length,
          }
        });
        return;
      }

      // Fetch from Discogs API
      if (!DISCOGS_TOKEN) {
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
        console.error(`Discogs API error: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`Discogs API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Discogs API response sample:`, JSON.stringify(data.results?.[0] || {}, null, 2));
      
      // Skip validation and work directly with the API response
      if (!data.results || !Array.isArray(data.results)) {
        throw new Error("Invalid response format from Discogs API");
      }

      // Transform and cache the results
      const releasesToCache = data.results.map((release: any) => {
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

      // Cache the results
      if (releasesToCache.length > 0) {
        await storage.clearMusicReleasesByStyle(style);
        await storage.createMusicReleases(releasesToCache);
      }

      res.json({
        results: releasesToCache,
        pagination: data.pagination || {
          page: parseInt(page as string),
          pages: 1,
          per_page: parseInt(per_page as string),
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
  });

  // Generate YouTube search URL
  app.post("/api/youtube-search", async (req, res) => {
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
  });

  const httpServer = createServer(app);
  return httpServer;
}
