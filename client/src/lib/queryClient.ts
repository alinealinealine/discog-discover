import { QueryClient } from "@tanstack/react-query";

const DISCOGS_API_URL = '/api/discogs';
const DISCOGS_USER_AGENT = 'DiscogTuneTracker/1.0';

// Your personal access token from Discogs
const DISCOGS_TOKEN = import.meta.env.VITE_DISCOGS_TOKEN;

if (!DISCOGS_TOKEN) {
  console.error('Discogs token is not set. Please set VITE_DISCOGS_TOKEN in your .env file');
}

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
  if (!DISCOGS_TOKEN) {
    throw new Error('Discogs token is not set');
  }

  const queryParams = new URLSearchParams(params);
  const url = `${DISCOGS_API_URL}${endpoint}?${queryParams.toString()}`;
  
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
        'User-Agent': DISCOGS_USER_AGENT,
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
