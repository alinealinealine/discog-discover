import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Disc, Search, ExternalLink, Heart, Calendar } from "lucide-react";
import { FaYoutube } from "react-icons/fa";
import { generateYouTubeSearchUrl, formatNumber } from "@/lib/utils";
import { discogsRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";

// Common music styles
const MUSIC_STYLES = [
  { id: 1, name: "rock", displayName: "Rock" },
  { id: 2, name: "jazz", displayName: "Jazz" },
  { id: 3, name: "electronic", displayName: "Electronic" },
  { id: 4, name: "hip-hop", displayName: "Hip Hop" },
  { id: 5, name: "classical", displayName: "Classical" },
  { id: 6, name: "pop", displayName: "Pop" },
  { id: 7, name: "folk", displayName: "Folk" },
  { id: 8, name: "metal", displayName: "Metal" },
  { id: 9, name: "blues", displayName: "Blues" },
  { id: 10, name: "country", displayName: "Country" },
];

interface DiscogsRelease {
  id?: number;
  discogsId: string;
  title: string;
  artist: string;
  year: string | null;
  format: string | null;
  label: string | null;
  genre: string | null;
  style: string;
  wantCount: number | null;
  collectCount: number | null;
  thumbnailUrl: string | null;
  // Legacy fields for compatibility
  thumb?: string;
  cover_image?: string;
  master_id?: number;
  community?: {
    want: number;
    have: number;
  };
}

interface DiscogsSearchResponse {
  results: DiscogsRelease[];
  pagination: {
    page: number;
    pages: number;
    per_page: number;
    items: number;
  };
}

// Custom hook to fetch high-res cover images for releases
function useHighResImages(releases: DiscogsRelease[] | undefined) {
  const [images, setImages] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!releases) return;
    let isMounted = true;
    const fetchImages = async () => {
      const promises = releases.map(async (release) => {
        // Use the thumbnail URL from our API
        const releaseId = release.id || parseInt(release.discogsId);
        if (images[releaseId]) return;
        const imageUrl = release.thumbnailUrl || release.thumb || release.cover_image;
        return { id: releaseId, url: imageUrl };
      });
      const results = await Promise.all(promises);
      if (isMounted) {
        const newImages: Record<number, string> = {};
        results.forEach((res) => {
          if (res) newImages[res.id] = res.url;
        });
        setImages((prev) => ({ ...prev, ...newImages }));
      }
    };
    fetchImages();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [releases]);

  return images;
}

export default function Home() {
  const [selectedStyle, setSelectedStyle] = useState<string>("rock");
  const [selectedStyleDisplay, setSelectedStyleDisplay] = useState<string>("Rock");

  // Fetch releases for selected style
  const { 
    data: releasesData, 
    isLoading: isLoadingReleases,
    error: releasesError,
    refetch: refetchReleases 
  } = useQuery<DiscogsSearchResponse>({
    queryKey: ['discogs-search', selectedStyle],
    queryFn: async () => {
      const response = await fetch(`/api/releases/${selectedStyle}`);
      if (!response.ok) {
        throw new Error('Failed to fetch releases');
      }
      return response.json();
    },
    enabled: !!selectedStyle,
  });

  // Fetch high-res images for releases
  const highResImages = useHighResImages(releasesData?.results);

  // For the stack effect
  const [hovered, setHovered] = useState<number | null>(null);

  // Precompute random rotations for each album (memoized for stability)
  const rotations = useMemo(() => {
    if (!releasesData?.results) return [];
    return releasesData.results.map(() => (Math.random() * 10 - 5)); // -5deg to +5deg
  }, [releasesData?.results]);

  // Update albumTransforms to use a wider scatter range and avoid edges
  const albumTransforms = useMemo(() => {
    if (!releasesData?.results) return [];
    return releasesData.results.map(() => ({
      top: 5 + Math.random() * 80,    // 5-85%
      left: 5 + Math.random() * 80,   // 5-85%
      rotation: Math.random() * 10 - 5 // -5 to +5 deg
    }));
  }, [releasesData?.results]);

  const handleStyleChange = (value: string) => {
    setSelectedStyle(value);
    const style = MUSIC_STYLES.find(s => s.name === value);
    setSelectedStyleDisplay(style?.displayName || value);
  };

  const handleYouTubeClick = (artist: string, title: string) => {
    const url = generateYouTubeSearchUrl(artist, title);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Floating Title and Style Selector */}
        <div className="relative mb-8">
          <div className="absolute top-0 left-0 z-10">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-lg p-2">
              <h1 className="text-white text-sm font-medium px-3 py-1.5">Most Collected Music</h1>
            </div>
          </div>
          <div className="absolute top-0 right-0 z-10">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-lg p-2">
              <select
                value={selectedStyle}
                onChange={(e) => {
                  const style = e.target.value;
                  setSelectedStyle(style);
                  setSelectedStyleDisplay(style.charAt(0).toUpperCase() + style.slice(1));
                }}
                className="bg-transparent text-white text-sm font-medium px-3 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer hover:bg-white/5 transition-colors"
              >
                <option value="rock">Rock</option>
                <option value="jazz">Jazz</option>
                <option value="electronic">Electronic</option>
                <option value="hip-hop">Hip Hop</option>
                <option value="classical">Classical</option>
                <option value="pop">Pop</option>
                <option value="folk">Folk</option>
                <option value="metal">Metal</option>
                <option value="blues">Blues</option>
                <option value="reggae">Reggae</option>
                <option value="soul">Soul</option>
                <option value="funk">Funk</option>
                <option value="r-n-b">R&B</option>
                <option value="punk">Punk</option>
                <option value="indie">Indie</option>
                <option value="ambient">Ambient</option>
                <option value="house">House</option>
                <option value="techno">Techno</option>
                <option value="disco">Disco</option>
                <option value="country">Country</option>
                <option value="world">World</option>
                <option value="experimental">Experimental</option>
                <option value="latin">Latin</option>
                <option value="gospel">Gospel</option>
                <option value="soundtrack">Soundtrack</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingReleases && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array(10).fill(0).map((_, i) => (
              <div key={i} className="aspect-square">
                <Skeleton className="w-full h-full rounded-2xl" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {releasesError && (
          <Alert className="mb-8 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Error Loading Data</h3>
                  <p className="mt-1">Failed to fetch music data from Discogs. Please try again or select a different style.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => refetchReleases()}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Artistic Album Stack */}
        {releasesData && releasesData.results.length > 0 && (
          <div className="relative w-full h-[900px] overflow-hidden">
            {releasesData.results.slice(0, 20).map((release, i) => {
              const releaseId = release.id || parseInt(release.discogsId);
              const imgUrl = release.thumbnailUrl || highResImages[releaseId] || release.thumb;
              const { top, left, rotation } = albumTransforms[i] || {};
              return (
                <motion.div
                  key={releaseId}
                  className="absolute"
                  style={{
                    top: `${top}%`,
                    left: `${left}%`,
                    zIndex: hovered === i ? 20 : i,
                  }}
                  animate={{
                    scale: hovered === i ? 1.18 : 1,
                    rotate: hovered === i ? 0 : rotation,
                    filter: hovered !== null && hovered !== i ? 'blur(2px) grayscale(60%)' : 'none',
                    opacity: hovered !== null && hovered !== i ? 0.5 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  onTouchStart={() => setHovered(i)}
                  onTouchEnd={() => setHovered(null)}
                >
                  <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-2xl shadow-2xl overflow-hidden cursor-pointer">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={`${release.title} cover`}
                        className="w-full h-full object-cover"
                        style={{ imageRendering: 'auto' }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = `
                            <div class='w-full h-full flex items-center justify-center bg-gray-200'>
                              <svg class='w-12 h-12 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3'></path>
                              </svg>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                      </div>
                    )}
                    {/* Overlay info on hover */}
                    <AnimatePresence>
                      {hovered === i && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          transition={{ duration: 0.25 }}
                          className="absolute inset-0 bg-black/60 backdrop-blur flex flex-col justify-end p-4 rounded-2xl"
                        >
                          <h3 className="text-white font-semibold text-base line-clamp-2 mb-1 drop-shadow">
                            {release.title}
                          </h3>
                          <p className="text-gray-200 text-xs line-clamp-1 mb-2 drop-shadow">
                            {release.artist}
                          </p>
                          <div className="flex items-center space-x-2 text-xs mb-2">
                            {release.year && (
                              <span className="inline-block px-2 py-1 rounded-full bg-white/70 text-gray-700 font-medium">
                                <Calendar className="w-3 h-3 mr-1 inline-block" />
                                {release.year}
                              </span>
                            )}
                            <span className="inline-block px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                              <Heart className="w-3 h-3 mr-1 inline-block text-blue-400" />
                              {formatNumber(release.collectCount || 0)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-500 hover:text-blue-700 hover:bg-blue-100/40"
                              onClick={() => handleYouTubeClick(release.artist, release.title)}
                            >
                              <FaYoutube className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-500 hover:text-blue-700 hover:bg-blue-100/40"
                              onClick={() => window.open(`https://www.discogs.com/release/${release.discogsId}`, '_blank', 'noopener,noreferrer')}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>© 2024 Music Discovery Tool</span>
              <span>•</span>
              <span>Built for music discovery</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Data from</span>
              <a 
                href="https://www.discogs.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-medium hover:text-gray-900 transition-colors"
              >
                Discogs.com
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
