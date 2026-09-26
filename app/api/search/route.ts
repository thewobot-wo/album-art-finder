import { NextRequest, NextResponse } from 'next/server';
import { searchAlbums } from '@/lib/albums';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim();
  if (!query) {
    return NextResponse.json({ error: 'Missing search query' }, { status: 400 });
  }

  try {
    return NextResponse.json({ results: await searchAlbums(query) });
  } catch (error) {
    console.error('Album search failed:', error);
    return NextResponse.json({ error: 'Search is unavailable right now' }, { status: 502 });
  }
}
