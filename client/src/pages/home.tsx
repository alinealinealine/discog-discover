import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Disc, Search, ExternalLink, Heart, Calendar, Tag } from "lucide-react";
import { FaYoutube } from "react-icons/fa";
import { generateYouTubeSearchUrl, formatNumber } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

interface MusicStyle {
  id: number;
  name: string;
  displayName: string;
}

interface MusicRelease {
  id: number;
  discogsId: string;
  title: string;
  artist: string;
  year: string;
  label: string;
  format: string;
  genre: string;
  style: string;
  wantCount: number;
  collectCount: number;
  thumbnailUrl: string;
}

interface ReleasesResponse {
  results: MusicRelease[];
  pagination: {
    page: number;
    pages: number;
    per_page: number;
    items: number;
  };
}

export default function Home() {
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [selectedStyleDisplay, setSelectedStyleDisplay] = useState<string>("");

  // Fetch available styles
  const { data: styles = [] } = useQuery<MusicStyle[]>({
    queryKey: ["/api/styles"],
  });

  // Fetch releases for selected style
  const { 
    data: releasesData, 
    isLoading: isLoadingReleases,
    error: releasesError,
    refetch: refetchReleases 
  } = useQuery<ReleasesResponse>({
    queryKey: ["/api/releases", selectedStyle],
    enabled: !!selectedStyle,
  });

  const handleStyleChange = (value: string) => {
    setSelectedStyle(value);
    const style = styles.find(s => s.name === value);
    setSelectedStyleDisplay(style?.displayName || value);
  };

  const handleYouTubeClick = (artist: string, title: string) => {
    const url = generateYouTubeSearchUrl(artist, title);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Disc className="h-8 w-8 text-gray-900" />
              <h1 className="text-xl font-bold text-gray-900">Music Discovery Tool</h1>
            </div>
            <div className="text-sm text-gray-500">
              Powered by Discogs
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Style Selector */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <Search className="inline-block w-5 h-5 mr-2" />
              Select Music Style
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="style-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Choose a music style to discover most collected releases
                </label>
                <Select value={selectedStyle} onValueChange={handleStyleChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a style..." />
                  </SelectTrigger>
                  <SelectContent>
                    {styles.map((style) => (
                      <SelectItem key={style.id} value={style.name}>
                        {style.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoadingReleases && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4" />
                <p className="text-gray-600">
                  Fetching most collected <span className="font-medium">{selectedStyleDisplay}</span> music...
                </p>
              </div>
              
              {/* Loading skeleton */}
              <div className="mt-6 space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex space-x-4">
                      <Skeleton className="w-16 h-16 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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

        {/* Results Section */}
        {releasesData && releasesData.results.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Most Collected <span className="capitalize font-bold">{selectedStyleDisplay}</span> Music
                </h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {releasesData.results.length} results
                </span>
              </div>

              <div className="space-y-4">
                {releasesData.results.map((release) => (
                  <div key={release.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          {/* Album cover */}
                          <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                            {release.thumbnailUrl ? (
                              <img 
                                src={release.thumbnailUrl} 
                                alt={`${release.title} cover`}
                                className="w-full h-full object-cover rounded"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.parentElement!.innerHTML = '<svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>';
                                }}
                              />
                            ) : (
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                              </svg>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {release.title}
                            </h3>
                            <p className="text-gray-600 text-sm truncate">
                              {release.artist}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          {release.year && (
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {release.year}
                            </span>
                          )}
                          {release.label && (
                            <span className="flex items-center">
                              <Tag className="w-3 h-3 mr-1" />
                              {release.label}
                            </span>
                          )}
                          <span className="flex items-center">
                            <Heart className="w-3 h-3 mr-1 text-red-400" />
                            {formatNumber(release.wantCount)} want
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {release.format && (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {release.format}
                            </span>
                          )}
                          {release.genre && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {release.genre}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="ml-4 flex-shrink-0">
                        <Button
                          onClick={() => handleYouTubeClick(release.artist, release.title)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                          size="sm"
                        >
                          <FaYoutube className="w-4 h-4 mr-2" />
                          Listen on YouTube
                          <ExternalLink className="w-3 h-3 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination info */}
              {releasesData.pagination && (
                <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
                  <div className="text-sm text-gray-500">
                    Showing <span className="font-medium">1-{releasesData.results.length}</span> of{" "}
                    <span className="font-medium">{releasesData.pagination.items}</span> results
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!selectedStyle && !isLoadingReleases && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Disc className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Discover Music</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Select a music style above to find the most collected releases in that genre. 
                  We'll provide YouTube links so you can listen right away.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

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
