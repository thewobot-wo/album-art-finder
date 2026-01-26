export interface AlbumResult {
  source: 'itunes' | 'deezer';
  collectionName?: string;
  artistName?: string;
  artworkUrl100?: string;
  collectionId?: number;
  title?: string;
  artist?: { name: string };
  cover_xl?: string;
  cover_big?: string;
  cover_medium?: string;
  cover_small?: string;
  id?: number;
}

export interface SearchResponse {
  results: AlbumResult[];
  error?: string;
}
