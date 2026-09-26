'use client';

import { useState } from 'react';
import type { Album } from '@/lib/albums';
import { ArtworkDialog } from '@/components/ArtworkDialog';

const FILTERS = ['Broadway', 'Musical'] as const;

type Status = 'idle' | 'loading' | 'done' | 'error';

export default function Home() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<string[]>([]);
  const [results, setResults] = useState<Album[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [selected, setSelected] = useState<Album | null>(null);

  async function search(e?: React.FormEvent, activeFilters = filters) {
    e?.preventDefault();
    const q = [query.trim(), ...activeFilters].join(' ').trim();
    if (!query.trim()) return;

    setStatus('loading');
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResults(data.results);
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  function toggleFilter(f: string) {
    const next = filters.includes(f) ? filters.filter((x) => x !== f) : [...filters, f];
    setFilters(next);
    if (status === 'done') search(undefined, next);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pt-14 pb-24 sm:px-6">
      <header className="flex flex-col items-center text-center">
        <img src="/playart-logo.svg" alt="PLAYART" className="h-12 w-auto sm:h-14" />
        <p className="mt-4 text-sm text-neutral-400">Find and download high-res album artwork.</p>
      </header>

      <form onSubmit={search} className="mx-auto mt-10 max-w-xl">
        <div className="flex items-center gap-2 rounded-full bg-neutral-900 p-1.5 pl-5 ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-brand">
          <svg viewBox="0 0 20 20" fill="currentColor" className="size-5 shrink-0 text-neutral-500">
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
              clipRule="evenodd"
            />
          </svg>
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Album or artist"
            aria-label="Album or artist"
            className="min-w-0 flex-1 bg-transparent py-2 outline-none placeholder:text-neutral-500"
          />
          <button
            type="submit"
            disabled={!query.trim() || status === 'loading'}
            className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-black transition hover:brightness-90 disabled:opacity-40"
          >
            Search
          </button>
        </div>

        <div className="mt-3 flex justify-center gap-2">
          {FILTERS.map((f) => {
            const on = filters.includes(f);
            return (
              <button
                key={f}
                type="button"
                aria-pressed={on}
                onClick={() => toggleFilter(f)}
                className={`rounded-full px-3 py-1 text-xs font-medium ring-1 transition ${
                  on
                    ? 'bg-brand/10 text-brand ring-brand/50'
                    : 'text-neutral-400 ring-white/10 hover:text-neutral-200 hover:ring-white/20'
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </form>

      <section className="mt-12" aria-live="polite">
        {status === 'loading' && <Grid>{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} />)}</Grid>}

        {status === 'error' && (
          <Message>Something went wrong. Check your connection and try again.</Message>
        )}

        {status === 'done' && results.length === 0 && (
          <Message>No albums found. Try a different spelling or fewer words.</Message>
        )}

        {status === 'done' && results.length > 0 && (
          <Grid>
            {results.map((album) => (
              <button
                key={album.id}
                type="button"
                onClick={() => setSelected(album)}
                className="group text-left focus:outline-none"
              >
                <div className="overflow-hidden rounded-xl bg-neutral-900 ring-1 ring-white/5 transition group-hover:ring-white/20 group-focus-visible:ring-2 group-focus-visible:ring-brand">
                  <img
                    src={album.thumb}
                    alt=""
                    loading="lazy"
                    className="aspect-square w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <p className="mt-2.5 truncate text-sm font-medium">{album.title}</p>
                <p className="truncate text-xs text-neutral-500">{album.artist}</p>
              </button>
            ))}
          </Grid>
        )}
      </section>

      <ArtworkDialog album={selected} onClose={() => setSelected(null)} />
    </main>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">{children}</div>;
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
  return <p className="text-center text-sm text-neutral-400">{children}</p>;
}
