import { NextRequest, NextResponse } from 'next/server';

interface iTunesResult {
  collectionName: string;
  artistName: string;
  artworkUrl100: string;
  collectionId: number;
  source: string;
}

interface DeezerResult {
  title: string;
  artist: { name: string };
  cover_xl: string;
  id: number;
  source: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
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

    const results: (iTunesResult | DeezerResult)[] = [];

    if (itunesResponse.status === 'fulfilled' && itunesResponse.value.ok) {
      const itunesData = await itunesResponse.value.json();
      if (itunesData.results && itunesData.results.length > 0) {
        results.push(...itunesData.results.map((item: any) => ({
          ...item,
          source: 'itunes'
        })));
      }
    }

    if (deezerResponse.status === 'fulfilled' && deezerResponse.value.ok) {
      const deezerData = await deezerResponse.value.json();
      if (deezerData.data && deezerData.data.length > 0) {
        results.push(...deezerData.data.map((item: any) => ({
          ...item,
          source: 'deezer'
        })));
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error fetching album data:', error);
    return NextResponse.json(
      { error: 'Failed to search for album' },
      { status: 500 }
    );
  }
}