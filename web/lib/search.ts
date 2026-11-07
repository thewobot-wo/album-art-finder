import type { Album } from './albums';

const FETCH_LIMIT = 15;
const MAX_RESULTS = 20;
const TIMEOUT_MS = 4000;

const CAST_RECORDING = /\b(cast|broadway|musical)\b/i;
const NOT_THE_REAL_THING = /\b(karaoke|tribute|backing tracks?|made famous)\b/i;

interface Candidate extends Album {
  isSingle: boolean;
}

async function getJson(url: string) {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`${new URL(url).hostname} responded ${res.status}`);
  return res.json();
}

async function searchItunes(query: string): Promise<Candidate[]> {
  const data = await getJson(
    `https://itunes.apple.com/search?entity=album&limit=${FETCH_LIMIT}&term=${encodeURIComponent(query)}`,
  );

  return (data.results ?? [])
    .filter((r: any) => r.artworkUrl100)
    .map((r: any): Candidate => ({
      id: `itunes-${r.collectionId}`,
      source: 'itunes',
      title: r.collectionName,
      artist: r.artistName,
      year: r.releaseDate?.slice(0, 4),
      thumb: r.artworkUrl100.replace(/\d+x\d+bb/, '600x600bb'),
      full: r.artworkUrl100.replace(/\d+x\d+bb/, '3000x3000bb'),
      isSingle: r.trackCount === 1 || / - (Single|EP)$/.test(r.collectionName),
    }));
}

async function searchDeezer(query: string): Promise<Candidate[]> {
  const data = await getJson(
    `https://api.deezer.com/search/album?limit=${FETCH_LIMIT}&q=${encodeURIComponent(query)}`,
  );

  return (data.data ?? [])
    .filter((r: any) => r.cover_xl)
    .map((r: any): Candidate => ({
      id: `deezer-${r.id}`,
      source: 'deezer',
      title: r.title,
      artist: r.artist?.name ?? '',
      thumb: r.cover_big ?? r.cover_xl,
      full: r.cover_xl,
      isSingle: r.record_type === 'single',
    }));
}

function normalize(s: string) {
  return s
    .normalize('NFD')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/** Same title, and one artist credit contains the other ("Six" / "SIX, Toby Marlow"). */
function isSameAlbum(a: Album, b: Album) {
  if (normalize(a.title) !== normalize(b.title)) return false;
  const [artistA, artistB] = [normalize(a.artist), normalize(b.artist)];
  return artistA.includes(artistB) || artistB.includes(artistA);
}

/** Cast albums first, singles after albums, karaoke and tributes last. Nothing is hidden. */
function score(album: Candidate) {
  const text = `${album.title} ${album.artist}`;
  if (NOT_THE_REAL_THING.test(text)) return -1;
  return (CAST_RECORDING.test(text) ? 2 : 0) + (album.isSingle ? 0 : 1);
}

/**
 * Searches both sources; one failing doesn't sink the other. `complete` is
 * false when a source failed, so callers know not to cache the partial result.
 */
export async function searchAlbums(query: string): Promise<{ results: Album[]; complete: boolean }> {
  const settled = await Promise.allSettled([searchItunes(query), searchDeezer(query)]);
  const failures = settled.filter((s) => s.status === 'rejected');
  if (failures.length === settled.length) {
    throw new Error('All sources failed', { cause: failures });
  }
  const [itunes, deezer] = settled.map((s) => (s.status === 'fulfilled' ? s.value : []));

  // Skip what iTunes already has (its artwork is larger), then interleave so
  // both sources show up near the top.
  const extras = deezer.filter((album) => !itunes.some((other) => isSameAlbum(other, album)));
  const merged: Candidate[] = [];
  for (let i = 0; i < FETCH_LIMIT; i++) {
    if (itunes[i]) merged.push(itunes[i]);
    if (extras[i]) merged.push(extras[i]);
  }

  const results = merged
    .sort((a, b) => score(b) - score(a))
    .slice(0, MAX_RESULTS)
    .map(({ isSingle, ...album }) => album);

  return { results, complete: failures.length === 0 };
}
