import { NextRequest, NextResponse } from 'next/server';
import { searchAlbums } from '@/lib/search';

// Album catalogs change slowly, so let the CDN answer repeat searches.
const CACHED = 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim().slice(0, 200);
  if (!query) {
    return NextResponse.json({ error: 'Missing search query' }, { status: 400 });
  }

  try {
    const { results, complete } = await searchAlbums(query);
    return NextResponse.json(
      { results },
      { headers: { 'Cache-Control': complete ? CACHED : 'no-store' } },
    );
  } catch (error) {
    console.error('Album search failed:', error);
    return NextResponse.json({ error: 'Search is unavailable right now' }, { status: 502 });
  }
}
