'use client';

import { useEffect, useRef, useState } from 'react';
import { type Album, showNameFrom } from '@/lib/albums';
import { BASE_PATH } from '@/lib/basePath';

const SOURCE_LABEL = { itunes: 'iTunes', deezer: 'Deezer' } as const;

export function ArtworkDialog({ album, onClose }: { album: Album | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [showName, setShowName] = useState('');

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (album) {
      setShowName(showNameFrom(album.title));
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [album]);

  const filename = `art-${showName.trim() || 'untitled'}`;
  const href = album
    ? `${BASE_PATH}/api/download?${new URLSearchParams({ url: album.full, name: filename })}`
    : undefined;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto max-h-[92dvh] w-[min(92vw,28rem)] overflow-y-auto rounded-2xl bg-neutral-900 p-0 text-neutral-100 ring-1 ring-white/10"
    >
      {album && (
        <div className="flex flex-col">
          <div className="relative">
            <img src={album.thumb} alt="" className="aspect-square w-full object-cover" />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-black/60 text-white backdrop-blur hover:bg-black/80"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          </div>

          <div className="space-y-5 p-5">
            <div>
              <h2 className="font-semibold leading-snug">{album.title}</h2>
              <p className="mt-1 text-sm text-neutral-400">
                {album.artist}
                {album.year && ` · ${album.year}`} · {SOURCE_LABEL[album.source]}
              </p>
            </div>

            <form
              method="dialog"
              onSubmit={(e) => {
                e.preventDefault();
                if (href) window.location.href = href;
              }}
              className="space-y-3"
            >
              <label className="block">
                <span className="text-xs font-medium tracking-wide text-neutral-400 uppercase">
                  Show name
                </span>
                <input
                  value={showName}
                  onChange={(e) => setShowName(e.target.value)}
                  className="mt-1.5 w-full rounded-lg bg-neutral-800 px-3 py-2.5 text-sm ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-brand"
                />
                <span className="mt-1.5 block truncate text-xs text-neutral-500">
                  Saves as {filename}.jpg
                </span>
              </label>
              <button
                type="submit"
                disabled={!showName.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-sm font-semibold text-black transition hover:brightness-90 disabled:opacity-40"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
                  <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                  <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                </svg>
                Download full size
              </button>
            </form>
          </div>
        </div>
      )}
    </dialog>
  );
}
