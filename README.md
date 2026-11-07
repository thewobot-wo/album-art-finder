# PLAYART

Find and download high-resolution album artwork for any show, from iTunes and Deezer. Lives at [criswo.com/playart](https://www.criswo.com/playart).

```bash
npm install
npm run dev
```

Then open http://localhost:3000/playart.

## How it's deployed

- This repo deploys to the `play-art` Vercel project, with the app under the `/playart` base path.
- `criswo.com` belongs to a separate project (`cris-wo`, from the `Cris-Wo` repo). Its `vercel.json` forwards `/playart` to `play-art.vercel.app`, so the rest of that site is unaffected.

## Keyboard shortcuts

- `/` or `⌘K`: jump to search
- Arrow keys: move from search into the results and around the grid
- `Enter`: open an album, then again to download it
