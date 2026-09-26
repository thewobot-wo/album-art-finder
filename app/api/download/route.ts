import { NextRequest, NextResponse } from 'next/server';
import { ARTWORK_HOSTS } from '@/lib/albums';

/**
 * Streams artwork back with a Content-Disposition header so the browser
 * saves it under our filename (cross-origin <a download> ignores names).
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const name = (params.get('name') || 'album-art').replace(/[\\/:*?"<>|]+/g, '').trim();

  let url: URL;
  try {
    url = new URL(params.get('url') ?? '');
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
  }
  if (url.protocol !== 'https:' || !ARTWORK_HOSTS.some((re) => re.test(url.hostname))) {
    return NextResponse.json({ error: 'Host not allowed' }, { status: 400 });
  }

  const upstream = await fetch(url);
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: 'Artwork not available' }, { status: 502 });
  }

  const filename = `${name}.jpg`;
  return new NextResponse(upstream.body, {
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'image/jpeg',
      'Content-Disposition': `attachment; filename="${filename.replace(/[^\x20-\x7e]/g, '_')}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}
