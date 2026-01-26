import { AlbumResult, SearchResponse } from './types';

interface iTunesResponse {
  results: any[];
}

interface DeezerResponse {
  data: any[];
}

export async function searchAlbums(query: string): Promise<SearchResponse> {
  if (!query.trim()) {
    return { results: [], error: 'Query is required' };
  }

  try {
    const [itunesResponse, deezerResponse] = await Promise.allSettled([
      fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=3`,
        {
          headers: { 'User-Agent': 'Album Art Finder/1.0' },
        }
      ),
      fetch(`https://api.deezer.com/search/album?q=${encodeURIComponent(query)}&limit=3`)
    ]);

    const results: AlbumResult[] = [];

    if (itunesResponse.status === 'fulfilled' && itunesResponse.value.ok) {
      const itunesData: iTunesResponse = await itunesResponse.value.json();
      if (itunesData.results && itunesData.results.length > 0) {
        results.push(...itunesData.results.map((item: any) => ({
          ...item,
          source: 'itunes' as const
        })));
      }
    }

    if (deezerResponse.status === 'fulfilled' && deezerResponse.value.ok) {
      const deezerData: DeezerResponse = await deezerResponse.value.json();
      if (deezerData.data && deezerData.data.length > 0) {
        results.push(...deezerData.data.map((item: any) => ({
          ...item,
          source: 'deezer' as const
        })));
      }
    }

    if (results.length === 0) {
      return { results: [], error: 'No albums found' };
    }

    return { results };
  } catch (error) {
    console.error('Error fetching album data:', error);
    return {
      results: [],
      error: error instanceof Error ? error.message : 'Failed to search for album'
    };
  }
}
