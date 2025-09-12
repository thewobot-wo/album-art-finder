'use client';

import { useState } from 'react';

interface AlbumResult {
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

export default function Home() {
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [results, setResults] = useState<AlbumResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchAlbum = async () => {
    if (!album.trim()) {
      setError('Please enter an album name');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);

    const query = artist.trim() ? `${artist.trim()} ${album.trim()}` : album.trim();

    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else if (data.results && data.results.length > 0) {
        setResults(data.results);
      } else {
        setError('No albums found. Try different search terms.');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`Connection error: ${err instanceof Error ? err.message : 'Please check your internet connection and try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (result: AlbumResult) => {
    if (result.source === 'itunes') {
      return result.artworkUrl100?.replace('100x100', '1200x1200') || '';
    } else {
      return result.cover_xl || '';
    }
  };

  const getAlbumName = (result: AlbumResult) => {
    return result.source === 'itunes' ? result.collectionName : result.title;
  };

  const getArtistName = (result: AlbumResult) => {
    return result.source === 'itunes' ? result.artistName : result.artist?.name;
  };

  const addTermToAlbum = (term: string) => {
    if (!album.includes(term)) {
      setAlbum(prev => prev.trim() ? `${prev.trim()} ${term}` : term);
    }
  };

  const downloadImage = async (imageUrl: string, albumName: string, artistName: string) => {
    const showName = prompt('Enter the name of the show:');
    
    if (showName === null) {
      // User cancelled the prompt
      return;
    }
    
    if (showName.trim() === '') {
      alert('Please enter a valid show name.');
      return;
    }
    
    try {
      // Fetch the image as a blob to avoid cross-origin issues
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const blobUrl = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `art-${showName.trim()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-black py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-black rounded-lg p-8 mb-8">
          <div className="flex justify-center mb-8">
            <img 
              src="/playart-logo.svg" 
              alt="PLAYART®" 
              className="w-full max-w-2xl h-auto"
            />
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Artist name (optional)"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="w-full p-3 border border-gray-600 bg-gray-900 text-white rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder-gray-400"
            />
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Album name"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchAlbum()}
                className="w-full p-3 border border-gray-600 bg-gray-900 text-white rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder-gray-400"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => addTermToAlbum('Broadway')}
                  className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 hover:text-white transition-colors"
                >
                  + Broadway
                </button>
                <button
                  onClick={() => addTermToAlbum('Musical')}
                  className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 hover:text-white transition-colors"
                >
                  + Musical
                </button>
              </div>
            </div>
            <button
              onClick={searchAlbum}
              disabled={loading}
              className="w-full bg-yellow-500 text-black p-3 rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {loading ? 'Searching...' : 'Search Album Art'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result, index) => {
              const imageUrl = getImageUrl(result);
              const albumName = getAlbumName(result);
              const artistName = getArtistName(result);

              return (
                <div key={index} className="bg-gray-900 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
                  <div className="aspect-square relative">
                    <img
                      src={result.source === 'itunes' ? result.artworkUrl100 : (result.cover_xl || result.cover_big || 'https://via.placeholder.com/300x300?text=No+Image')}
                      alt={`${albumName} cover`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 text-xs rounded-full text-white ${
                        result.source === 'itunes' ? 'bg-black' : 'bg-orange-500'
                      }`}>
                        {result.source === 'itunes' ? 'iTunes' : 'Deezer'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1 text-white truncate">
                      {albumName}
                    </h3>
                    <p className="text-gray-400 mb-4 truncate">{artistName}</p>
                    <button
                      onClick={() => downloadImage(imageUrl, albumName || '', artistName || '')}
                      className="w-full bg-yellow-400 text-black py-2 px-4 rounded hover:bg-yellow-300 transition-colors font-semibold"
                    >
                      Download High-Res
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}