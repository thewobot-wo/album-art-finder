# PLAYART

Find and download high-resolution album artwork for any show, from iTunes and Deezer. Lives at [playart.criswo.com](https://playart.criswo.com).

It deploys from `main` through Vercel, so merging is all it takes.

## How it's deployed

This repo deploys to the `play-art` Vercel project, whose Root Directory is `web/`. Cloudflare holds the DNS for `playart.criswo.com`, as a DNS-only record pointing at Vercel.

## Keyboard shortcuts

- `/` or `⌘K`: jump to search
- Arrow keys: move from search into the results and around the grid
- `Enter`: open an album, then again to download it
