export interface Album {
  id: string;
  source: 'itunes' | 'deezer';
  title: string;
  artist: string;
  year?: string;
  /** ~600px image for the grid and preview. */
  thumb: string;
  /** Largest artwork the source offers. */
  full: string;
}

/** "Hamilton (Original Broadway Cast Recording)" -> "Hamilton" */
export function showNameFrom(title: string): string {
  return title
    .replace(/\s*[([].*?[)\]]\s*/g, ' ')
    .replace(/\s*-\s*(original|cast|soundtrack|single|ep\b).*$/i, '')
    .trim();
}
