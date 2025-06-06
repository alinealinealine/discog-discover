import { 
  musicReleases, 
  musicStyles,
  type MusicRelease, 
  type InsertMusicRelease,
  type MusicStyle,
  type InsertMusicStyle 
} from "@shared/schema";
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/discog_discover',
});

export const db = drizzle(pool);

export interface IStorage {
  // Music releases
  getMusicReleases(): Promise<MusicRelease[]>;
  getMusicReleasesByStyle(style: string): Promise<MusicRelease[]>;
  createMusicRelease(release: InsertMusicRelease): Promise<MusicRelease>;
  createMusicReleases(releases: InsertMusicRelease[]): Promise<MusicRelease[]>;
  clearMusicReleasesByStyle(style: string): Promise<void>;

  // Music styles
  getMusicStyles(): Promise<MusicStyle[]>;
  createMusicStyle(style: InsertMusicStyle): Promise<MusicStyle>;
  getMusicStyleByName(name: string): Promise<MusicStyle | undefined>;
}

export class MemStorage implements IStorage {
  private musicReleases: Map<number, MusicRelease>;
  private musicStyles: Map<number, MusicStyle>;
  private currentReleaseId: number;
  private currentStyleId: number;

  constructor() {
    this.musicReleases = new Map();
    this.musicStyles = new Map();
    this.currentReleaseId = 1;
    this.currentStyleId = 1;

    // Initialize with common music styles
    this.initializeStyles();
  }

  private async initializeStyles() {
    const commonStyles = [
      { name: "electronic", displayName: "Electronic" },
      { name: "rock", displayName: "Rock" },
      { name: "jazz", displayName: "Jazz" },
      { name: "hip-hop", displayName: "Hip Hop" },
      { name: "funk-soul", displayName: "Funk / Soul" },
      { name: "classical", displayName: "Classical" },
      { name: "reggae", displayName: "Reggae" },
      { name: "folk-world-country", displayName: "Folk, World, & Country" },
      { name: "pop", displayName: "Pop" },
      { name: "blues", displayName: "Blues" },
      { name: "latin", displayName: "Latin" },
      { name: "stage-screen", displayName: "Stage & Screen" },
      { name: "children", displayName: "Children's" },
      { name: "non-music", displayName: "Non-Music" },
    ];

    for (const style of commonStyles) {
      await this.createMusicStyle(style);
    }
  }

  async getMusicReleases(): Promise<MusicRelease[]> {
    return Array.from(this.musicReleases.values());
  }

  async getMusicReleasesByStyle(style: string): Promise<MusicRelease[]> {
    return Array.from(this.musicReleases.values()).filter(
      (release) => release.style === style
    );
  }

  async createMusicRelease(insertRelease: InsertMusicRelease): Promise<MusicRelease> {
    const id = this.currentReleaseId++;
    const release: MusicRelease = { ...insertRelease, id };
    this.musicReleases.set(id, release);
    return release;
  }

  async createMusicReleases(insertReleases: InsertMusicRelease[]): Promise<MusicRelease[]> {
    const releases: MusicRelease[] = [];
    for (const insertRelease of insertReleases) {
      const release = await this.createMusicRelease(insertRelease);
      releases.push(release);
    }
    return releases;
  }

  async clearMusicReleasesByStyle(style: string): Promise<void> {
    const releasesToDelete = Array.from(this.musicReleases.entries())
      .filter(([_, release]) => release.style === style);
    
    for (const [id] of releasesToDelete) {
      this.musicReleases.delete(id);
    }
  }

  async getMusicStyles(): Promise<MusicStyle[]> {
    return Array.from(this.musicStyles.values());
  }

  async createMusicStyle(insertStyle: InsertMusicStyle): Promise<MusicStyle> {
    const id = this.currentStyleId++;
    const style: MusicStyle = { ...insertStyle, id };
    this.musicStyles.set(id, style);
    return style;
  }

  async getMusicStyleByName(name: string): Promise<MusicStyle | undefined> {
    return Array.from(this.musicStyles.values()).find(
      (style) => style.name === name
    );
  }
}

export const storage = new MemStorage();

export const storageDb = {
  async getMusicStyles() {
    const styles = await db.select({ style: musicReleases.style })
      .from(musicReleases)
      .groupBy(musicReleases.style);
    return styles.map(s => s.style);
  },

  async getMusicReleasesByStyle(style: string) {
    return await db.select()
      .from(musicReleases)
      .where(musicReleases.style.equals(style))
      .orderBy(musicReleases.collectCount.desc());
  },

  async createMusicReleases(releases: Array<{
    discogsId: string;
    title: string;
    artist: string;
    year: string | null;
    label: string | null;
    format: string | null;
    genre: string | null;
    style: string;
    wantCount: number | null;
    collectCount: number | null;
    thumbnailUrl: string | null;
  }>) {
    const values = releases.map(release => ({
      discogsId: release.discogsId,
      title: release.title,
      artist: release.artist,
      year: release.year || null,
      label: release.label || null,
      format: release.format || null,
      genre: release.genre || null,
      style: release.style,
      wantCount: release.wantCount || null,
      collectCount: release.collectCount || null,
      thumbnailUrl: release.thumbnailUrl || null
    }));

    return await db.insert(musicReleases)
      .values(values)
      .returning();
  },

  async clearMusicReleasesByStyle(style: string) {
    return await db.delete(musicReleases)
      .where(musicReleases.style.equals(style));
  }
};
