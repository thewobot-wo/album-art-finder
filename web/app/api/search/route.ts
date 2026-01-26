import { NextRequest, NextResponse } from 'next/server';
import { searchAlbums } from '@album-art-finder/shared';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  const result = await searchAlbums(query);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.results.length === 0 ? 404 : 200 });
  }

  return NextResponse.json({ results: result.results });
}