'use client';

import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import type { Album } from '@/lib/albums';
import { BASE_PATH } from '@/lib/basePath';
import { ArtworkDialog } from '@/components/ArtworkDialog';

const FILTERS = ['Broadway', 'Musical'];

type Status = 'idle' | 'loading' | 'done' | 'error';

export default function Home() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<string[]>([]);
  const [results, setResults] = useState<Album[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [selected, setSelected] = useState<Album | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const inFlight = useRef<AbortController>(null);

  async function search(text: string, activeFilters: string[]) {
    const trimmed = text.trim();
    if (!trimmed) return;

    // A newer search always wins, even if an older response arrives after it.
    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;

    setStatus('loading');
    window.scrollTo({ top: 0 });

    const params = new URLSearchParams({ q: trimmed });
    activeFilters.forEach((f) => params.append('f', f));
    window.history.replaceState(null, '', `?${params}`);

    try {
      // Lowercased so "Hair" and "hair" share a cache entry.
      const q = [trimmed, ...activeFilters].join(' ').toLowerCase();
      const res = await fetch(`${BASE_PATH}/api/search?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Search responded ${res.status}`);
      const data = await res.json();
      setResults(data.results);
      setStatus('done');
    } catch (error) {
      if (controller.signal.aborted) return;
      console.error('Search failed:', error);
      setStatus('error');
    }
  }

  function toggleFilter(f: string) {
    const next = filters.includes(f) ? filters.filter((x) => x !== f) : [...filters, f];
    setFilters(next);
    if (status !== 'idle') search(query, next);
  }

  function focusSearch() {
    inputRef.current?.focus();
    inputRef.current?.select();
  }

  // Restore a search from the URL, so refreshing or sharing a link keeps it.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (!q) return;
    const f = params.getAll('f').filter((x) => FILTERS.includes(x));
    setQuery(q);
    setFilters(f);
    search(q, f);
  }, []);

  // "/" or Cmd/Ctrl+K jumps to the search box with the old query selected.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const cmdK = e.key === 'k' && (e.metaKey || e.ctrlKey);
      const typing = e.target instanceof HTMLElement && e.target.matches('input, textarea');
      if (!cmdK && (e.key !== '/' || typing)) return;
      e.preventDefault();
      // Close any open dialog first: it holds focus until it's gone.
      flushSync(() => setSelected(null));
      focusSearch();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Arrow keys move through the album grid; up from the top row returns to search.
  function onGridKeyDown(e: React.KeyboardEvent) {
    if (!e.key.startsWith('Arrow') || !gridRef.current) return;
    const albums = Array.from(gridRef.current.querySelectorAll('button'));
    const index = albums.indexOf(document.activeElement as HTMLButtonElement);
    if (index < 0) return;

    const columns = albums.filter((a) => a.offsetTop === albums[0].offsetTop).length;
    const moves: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -columns,
      ArrowDown: columns,
    };
    const target = index + moves[e.key];

    e.preventDefault();
    if (target < 0 && e.key === 'ArrowUp') focusSearch();
    // Down from a short second-to-last row lands on the last album.
    else if (e.key === 'ArrowDown') albums[Math.min(target, albums.length - 1)].focus();
    else albums[target]?.focus();
  }

  const started = status !== 'idle';
  const loading = status === 'loading';

  return (
    <main>
      <header
        className={
          started
            ? 'sticky top-0 z-10 border-b border-white/5 bg-neutral-950/85 backdrop-blur'
            : 'pt-[16vh]'
        }
      >
        <div
          className={`mx-auto flex max-w-6xl px-4 sm:px-6 ${
            started
              ? 'flex-wrap items-center gap-x-5 gap-y-2.5 py-3'
              : 'flex-col items-center gap-4 text-center'
          }`}
        >
          <img
            src={`${BASE_PATH}/playart-logo.svg`}
            alt="PLAYART"
            width={1200}
            height={300}
            className={started ? 'h-8 w-auto' : 'h-14 w-auto sm:h-16'}
          />
          {!started && (
            <p className="mb-5 text-sm text-neutral-400">Find and download high-res album artwork.</p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              search(query, filters);
            }}
            className={started ? 'order-3 w-full sm:order-2 sm:w-auto sm:min-w-0 sm:flex-1' : 'w-full max-w-xl'}
          >
            <div className="flex items-center gap-2 rounded-full bg-neutral-900 p-1 pl-4 ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-brand">
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden className="size-5 shrink-0 text-neutral-500">
                <path
                  fillRule="evenodd"
                  d="M9 3.500a5.500 5.500 0 1 0 0 11 5.500 5.500 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.060 1.060l-3.329-3.328A7 7 0 0 1 2 9Z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                ref={inputRef}
                autoFocus
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== 'ArrowDown') return;
                  e.preventDefault();
                  gridRef.current?.querySelector('button')?.focus();
                }}
                placeholder="Show, album or artist"
                aria-label="Show, album or artist"
                className="peer min-w-0 flex-1 bg-transparent py-1.5 outline-none placeholder:text-neutral-500"
              />
              <kbd
                title="Press / or ⌘K to search"
                className="hidden rounded border border-white/10 px-1.5 text-xs text-neutral-400 peer-focus:hidden sm:block"
              >
                /
              </kbd>
              <button
                type="submit"
                disabled={!query.trim()}
                className="rounded-full bg-brand px-5 py-1.5 text-sm font-semibold text-black transition hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-40"
              >
                Search
              </button>
            </div>
          </form>

          <div className={`flex gap-2 ${started ? 'order-2 ml-auto sm:order-3 sm:ml-0' : ''}`}>
            {FILTERS.map((f) => {
              const on = filters.includes(f);
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleFilter(f)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                    on
                      ? 'bg-brand/10 text-brand ring-brand/50'
                      : 'text-neutral-400 ring-white/10 hover:text-neutral-200 hover:ring-white/25'
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <section aria-busy={loading} className="mx-auto max-w-6xl px-4 pt-6 pb-24 sm:px-6">
        <p aria-live="polite" className="sr-only">
          {status === 'done' && `${results.length} albums found`}
        </p>

        {status === 'error' ? (
          <Message>
            Something went wrong with that search.{' '}
            <button
              type="button"
              onClick={() => search(query, filters)}
              className="font-medium text-neutral-100 underline underline-offset-2 hover:text-brand"
            >
              Try again
            </button>
          </Message>
        ) : loading && results.length === 0 ? (
          <Grid>
            {Array.from({ length: 10 }, (_, i) => (
              <Skeleton key={i} />
            ))}
          </Grid>
        ) : status === 'done' && results.length === 0 ? (
          <Message>No albums found. Try a different spelling or fewer words.</Message>
        ) : (
          <Grid
            ref={gridRef}
            onKeyDown={onGridKeyDown}
            className={`transition-opacity ${loading ? 'opacity-50' : ''}`}
          >
            {results.map((album, i) => (
              <button
                key={album.id}
                type="button"
                onClick={() => setSelected(album)}
                className="group min-w-0 text-left focus:outline-none"
              >
                <div className="aspect-square overflow-hidden rounded-xl bg-neutral-900 ring-1 ring-white/5 transition group-hover:ring-white/25 group-focus-visible:ring-2 group-focus-visible:ring-brand">
                  <img
                    src={album.thumb}
                    alt=""
                    loading={i < 10 ? 'eager' : 'lazy'}
                    decoding="async"
                    onLoad={(e) => (e.currentTarget.dataset.loaded = '')}
                    className="size-full object-cover opacity-0 transition duration-300 data-loaded:opacity-100 motion-safe:group-hover:scale-[1.03]"
                  />
                </div>
                <p className="mt-2.5 truncate text-sm font-medium">{album.title}</p>
                <p className="truncate text-xs text-neutral-400">{album.artist}</p>
              </button>
            ))}
          </Grid>
        )}
      </section>

      <ArtworkDialog album={selected} onClose={() => setSelected(null)} />
    </main>
  );
}

function Grid({ className = '', ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={`grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 ${className}`}
      {...props}
    />
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square rounded-xl bg-neutral-900" />
      <div className="mt-2.5 h-3.5 w-3/4 rounded bg-neutral-900" />
      <div className="mt-1.5 h-3 w-1/2 rounded bg-neutral-900" />
    </div>
  );
}

function Message({ children }: { children: React.ReactNode }) {
  return <p className="pt-10 text-center text-sm text-neutral-400">{children}</p>;
}
