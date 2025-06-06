interface MusicStyle {
  id: number;
  name: string;
  value: string;
}

interface MusicRelease {
  id: number;
  style: string;
  title: string;
  discogsId: string;
  artist: string;
  label: string | null;
  format: string | null;
  year: string | null;
  genre: string | null;
  wantCount: number | null;
  collectCount: number | null;
  thumbnailUrl: string | null;
}

const storage = {
  getMusicStyles: async (): Promise<MusicStyle[]> => {
    return [
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
  },

  getMusicReleasesByStyle: async (style: string): Promise<MusicRelease[]> => {
    return [];
  },

  createMusicReleases: async (releases: Omit<MusicRelease, 'id'>[]): Promise<MusicRelease[]> => {
    return releases.map((release, index) => ({
      ...release,
      id: index + 1,
      label: release.label ?? null,
      format: release.format ?? null,
      year: release.year ?? null,
      genre: release.genre ?? null,
      wantCount: release.wantCount ?? null,
      collectCount: release.collectCount ?? null,
      thumbnailUrl: release.thumbnailUrl ?? null
    }));
  },

  clearMusicReleasesByStyle: async (style: string): Promise<void> => {
    return;
  }
};

export default storage; 