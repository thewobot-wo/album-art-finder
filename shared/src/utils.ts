import { AlbumResult } from './types';

export function getImageUrl(result: AlbumResult): string {
  if (result.source === 'itunes') {
    return result.artworkUrl100?.replace('100x100', '1200x1200') || '';
  } else {
    return result.cover_xl || result.cover_big || '';
  }
}

export function getAlbumName(result: AlbumResult): string {
  return result.source === 'itunes' ? (result.collectionName || '') : (result.title || '');
}

export function getArtistName(result: AlbumResult): string {
  return result.source === 'itunes' ? (result.artistName || '') : (result.artist?.name || '');
}

export function getThumbnailUrl(result: AlbumResult): string {
  if (result.source === 'itunes') {
    // Request 600x600 for crisp display (Retina-ready)
    return result.artworkUrl100?.replace('100x100', '600x600') || '';
  } else {
    return result.cover_xl || result.cover_big || result.cover_medium || result.cover_small || '';
  }
}
