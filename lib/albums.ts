export type Source = 'itunes' | 'deezer';

export interface Album {
  id: string;
  source: Source;
  title: string;
  artist: string;
  year?: string;
  /** ~600px image for the grid and preview. */
  thumb: string;
  /** Largest artwork the source offers. */
  full: string;
}

/** Hosts the download proxy is allowed to fetch from. */
export const ARTWORK_HOSTS = [/\.mzstatic\.com$/, /\.dzcdn\.net$/];

const LIMIT = 8;

async function searchItunes(query: string): Promise<Album[]> {
  const url = `https://itunes.apple.com/search?entity=album&limit=${LIMIT}&term=${encodeURIComponent(query)}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`iTunes ${res.status}`);
  const data = await res.json();

  return (data.results ?? [])
    .filter((r: any) => r.artworkUrl100)
    .map((r: any): Album => ({
      id: `itunes-${r.collectionId}`,
      source: 'itunes',
      title: r.collectionName,
      artist: r.artistName,
      year: r.releaseDate?.slice(0, 4),
      thumb: r.artworkUrl100.replace(/\d+x\d+bb/, '600x600bb'),
      full: r.artworkUrl100.replace(/\d+x\d+bb/, '3000x3000bb'),
    }));
}

async function searchDeezer(query: string): Promise<Album[]> {
  const url = `https://api.deezer.com/search/album?limit=${LIMIT}&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Deezer ${res.status}`);
  const data = await res.json();

  return (data.data ?? [])
    .filter((r: any) => r.cover_xl)
    .map((r: any): Album => ({
      id: `deezer-${r.id}`,
      source: 'deezer',
      title: r.title,
      artist: r.artist?.name ?? '',
      thumb: r.cover_big ?? r.cover_xl,
      full: r.cover_xl,
    }));
}

/** Searches both sources; one failing doesn't sink the other. */
export async function searchAlbums(query: string): Promise<Album[]> {
  const settled = await Promise.allSettled([searchItunes(query), searchDeezer(query)]);
  if (settled.every((s) => s.status === 'rejected')) {
    throw new Error('All sources failed');
  }
  const [itunes, deezer] = settled.map((s) => (s.status === 'fulfilled' ? s.value : []));

  // Drop Deezer albums iTunes already has (iTunes artwork is larger), then
  // interleave so both sources show up near the top.
  const seen = new Set(itunes.map(albumKey));
  const extra = deezer.filter((a) => !seen.has(albumKey(a)));
  const merged: Album[] = [];
  for (let i = 0; i < LIMIT; i++) {
    if (itunes[i]) merged.push(itunes[i]);
    if (extra[i]) merged.push(extra[i]);
  }
  return merged;
}

function albumKey(album: Album) {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${norm(album.title)}|${norm(album.artist)}`;
}

/** "Hamilton (Original Broadway Cast Recording)" -> "Hamilton" */
export function showNameFrom(title: string): string {
  return title
    .replace(/\s*[([].*?[)\]]\s*/g, ' ')
    .replace(/\s*-\s*(original|cast|soundtrack).*$/i, '')
    .trim();
}
