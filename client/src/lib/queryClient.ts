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
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
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
  
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': DISCOGS_USER_AGENT,
        'Accept': 'application/json',
        'Authorization': `Discogs token=${DISCOGS_TOKEN}`,
      },
    });

    await throwIfResNotOk(res);
    return res.json();
  } catch (error) {
    console.error('Error fetching from Discogs:', error);
    throw error;
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
