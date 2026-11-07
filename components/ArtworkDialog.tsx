'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { type Album, showNameFrom } from '@/lib/albums';

const SOURCE_LABEL = { itunes: 'iTunes', deezer: 'Deezer' } as const;

export function ArtworkDialog({ album, onClose }: { album: Album | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  // A layout effect so the dialog is open before the body's effect moves focus.
  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (album && !dialog.open) dialog.showModal();
    if (!album && dialog.open) dialog.close();
  }, [album]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="artwork-title"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto max-h-[92dvh] w-[min(92vw,28rem)] overflow-y-auto rounded-2xl bg-neutral-900 p-0 text-neutral-100 ring-1 ring-white/10 sm:w-[min(92vw,48rem)]"
    >
      {album && <ArtworkBody key={album.id} album={album} onClose={onClose} />}
    </dialog>
  );
}

function ArtworkBody({ album, onClose }: { album: Album; onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showName, setShowName] = useState(() => showNameFrom(album.title));
  const [size, setSize] = useState<{ width: number; height: number } | 'loading' | 'failed'>('loading');
  const [download, setDownload] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');

  // Ready to rename and hit Enter, without popping the keyboard on touch screens.
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    if (download !== 'saved') return;
    const timer = setTimeout(() => setDownload('idle'), 2000);
    return () => clearTimeout(timer);
  }, [download]);

  const name = showName.replace(/[\\/:*?"<>|]+/g, '').trim();
  const filename = `art-${name || 'untitled'}.jpg`;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name || download === 'saving') return;

    setDownload('saving');
    try {
      const res = await fetch(album.full);
      if (!res.ok) throw new Error(`Artwork responded ${res.status}`);
      const url = URL.createObjectURL(await res.blob());
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setDownload('saved');
    } catch (error) {
      console.error('Download failed:', error);
      setDownload('failed');
    }
  }

  return (
    <div className="grid sm:grid-cols-2">
      {/* First in the DOM so the dialog's default focus lands here, not on the
          text input, which would pop the keyboard on touch screens. */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-black/60 text-white backdrop-blur hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-brand"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden className="size-4">
          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
        </svg>
      </button>
      <div className="relative aspect-square self-stretch bg-neutral-800">
        <img src={album.thumb} alt={`${album.title} cover`} className="size-full object-cover" />
        {/* Same CORS mode as the download's fetch, so saving reuses this copy. */}
        <img
          src={album.full}
          alt=""
          crossOrigin="anonymous"
          decoding="async"
          onLoad={(e) =>
            setSize({ width: e.currentTarget.naturalWidth, height: e.currentTarget.naturalHeight })
          }
          onError={() => setSize('failed')}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-200 ${
            typeof size === 'object' ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      <div className="flex min-w-0 flex-col justify-between gap-6 p-5">
        <div className="pr-8">
          <h2 id="artwork-title" className="leading-snug font-semibold text-balance">
            {album.title}
          </h2>
          <p className="mt-1.5 text-sm text-neutral-300">{album.artist}</p>
          <p className="mt-1 text-sm text-neutral-400 tabular-nums">
            {[
              album.year,
              SOURCE_LABEL[album.source],
              typeof size === 'object'
                ? `${size.width} × ${size.height}`
                : size === 'loading' && 'Checking size…',
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>

        <form onSubmit={save} className="space-y-3">
          <label className="block">
            <span className="text-xs font-medium tracking-wide text-neutral-400 uppercase">Show name</span>
            <input
              ref={inputRef}
              value={showName}
              onChange={(e) => setShowName(e.target.value)}
              className="mt-1.5 w-full rounded-lg bg-neutral-800 px-3 py-2.5 text-base ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-brand sm:text-sm"
            />
            <span className="mt-1.5 block truncate text-xs text-neutral-400">Saves as {filename}</span>
          </label>
          <button
            type="submit"
            disabled={!name || download === 'saving'}
            className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-black transition hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50"
          >
            {download === 'saving' ? 'Downloading…' : download === 'saved' ? 'Saved ✓' : 'Download full size'}
          </button>
          <p role="status" className="text-xs text-red-400 empty:hidden">
            {download === 'failed' && "Couldn't download this image. Please try again."}
          </p>
        </form>
      </div>

    </div>
  );
}
