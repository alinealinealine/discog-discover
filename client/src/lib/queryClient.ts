import { QueryClient } from "@tanstack/react-query";

const API_BASE_URL = '/api/discogs';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    console.error('API Error Response:', {
      status: res.status,
      statusText: res.statusText,
      headers: Object.fromEntries(res.headers.entries()),
      body: text
    });
    throw new Error(`API Error: ${res.status} ${res.statusText} - ${text}`);
  }
}

export async function discogsRequest<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T> {
  const queryParams = new URLSearchParams(params);
  const url = `${API_BASE_URL}${endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  console.log('Making request to:', url);
  console.log('With headers:', {
    'User-Agent': DISCOGS_USER_AGENT,
    'Accept': 'application/json',
    'Authorization': 'Discogs token=***',
    'Content-Type': 'application/json',
  });
  
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Discogs token=${DISCOGS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    await throwIfResNotOk(res);
    const data = await res.json();
    console.log('API Response:', data);
    return data;
  } catch (error) {
    console.error('Detailed error fetching from Discogs:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch music data: ${error.message}`);
    }
    throw new Error('Failed to fetch music data from Discogs. Please try again or select a different style.');
  }
}

export async function youtubeSearchRequest(artist: string, title: string): Promise<{ url: string }> {
  const url = `${API_BASE_URL}/youtube-search`;
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ artist, title }),
    });

    await throwIfResNotOk(res);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error generating YouTube URL:', error);
    throw new Error('Failed to generate YouTube search URL');
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
