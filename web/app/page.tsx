'use client';

import { useState } from 'react';
import { AlbumResult, getImageUrl, getAlbumName, getArtistName, getThumbnailUrl } from '@album-art-finder/shared';

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
      <div className="max-w-6xl mx-auto px-4">
        {/* Logo Section - Compact Banner */}
        <div className="bg-gradient-to-b from-[#fceb00] via-[#fceb00] to-[#e6d800] rounded-lg mb-8 overflow-hidden shadow-[0_0_40px_rgba(252,235,0,0.3)]">
          <div className="flex justify-center py-2 px-8">
            <img
              src="/playart-logo.svg"
              alt="PLAYART®"
              className="h-16 w-auto"
            />
          </div>
        </div>

        {/* Search Form - Centered with Max Width */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Artist name (optional)"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchAlbum()}
              className="w-full p-3 bg-transparent border-b-2 border-[#fceb00] text-white focus:outline-none focus:border-[#fceb00] focus:shadow-[0_4px_20px_rgba(252,235,0,0.4)] placeholder-gray-400 transition-all duration-300"
            />
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Album name"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchAlbum()}
                className="w-full p-3 bg-transparent border-b-2 border-[#fceb00] text-white focus:outline-none focus:border-[#fceb00] focus:shadow-[0_4px_20px_rgba(252,235,0,0.4)] placeholder-gray-400 transition-all duration-300"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => addTermToAlbum('Broadway')}
                  type="button"
                  className="px-3 py-1 text-xs bg-transparent text-[#fceb00] border border-[#fceb00] uppercase tracking-wider hover:bg-gradient-to-r hover:from-[#fceb00] hover:to-[#e6d800] hover:text-black transition-all duration-300 font-bold"
                >
                  + Broadway
                </button>
                <button
                  onClick={() => addTermToAlbum('Musical')}
                  type="button"
                  className="px-3 py-1 text-xs bg-transparent text-[#fceb00] border border-[#fceb00] uppercase tracking-wider hover:bg-gradient-to-r hover:from-[#fceb00] hover:to-[#e6d800] hover:text-black transition-all duration-300 font-bold"
                >
                  + Musical
                </button>
              </div>
            </div>
            <button
              onClick={searchAlbum}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#fceb00] to-[#e6d800] text-black p-4 hover:from-[#e6d800] hover:to-[#fceb00] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold uppercase tracking-[0.2em] shadow-[0_4px_20px_rgba(252,235,0,0.3)]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Searching
                </span>
              ) : 'Search Album Art'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 text-red-200 px-6 py-4 rounded-lg mb-8 backdrop-blur-sm">
            <p className="font-bold mb-1">🎭 Performance Issue</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Results Grid - Full Width */}
        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result, index) => {
              const imageUrl = getImageUrl(result);
              const albumName = getAlbumName(result);
              const artistName = getArtistName(result);

              return (
                <div
                  key={index}
                  onClick={() => downloadImage(imageUrl, albumName || '', artistName || '')}
                  className="card-entrance group relative bg-gray-900 border-2 border-[#fceb00]/30 overflow-hidden cursor-pointer transition-all duration-300 hover:border-[#fceb00] hover:shadow-[0_0_30px_rgba(252,235,0,0.4)] hover:scale-[1.02]"
                >
                  {/* Image container */}
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={getThumbnailUrl(result) || 'https://via.placeholder.com/300x300?text=No+Image'}
                      alt={`${albumName} cover`}
                      className="w-full h-full object-cover artwork-image transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                      }}
                    />

                    {/* Hover overlay with download icon */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        {/* Download icon */}
                        <svg className="w-16 h-16 text-[#fceb00] mx-auto mb-3 drop-shadow-[0_0_10px_rgba(252,235,0,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                        <p className="text-[#fceb00] font-bold text-lg uppercase tracking-widest drop-shadow-[0_0_10px_rgba(252,235,0,0.5)]">Download</p>
                        <p className="text-white text-sm mt-1">High Resolution</p>
                      </div>
                    </div>

                    {/* Source badge */}
                    <div className="absolute top-3 right-3 opacity-90">
                      <span className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-sm ${
                        result.source === 'itunes'
                          ? 'bg-black/80 text-white border border-white/20'
                          : 'bg-orange-500/90 text-white border border-orange-300/20'
                      }`}>
                        {result.source === 'itunes' ? 'iTunes' : 'Deezer'}
                      </span>
                    </div>
                  </div>

                  {/* Info section */}
                  <div className="p-5 bg-gradient-to-b from-gray-900 to-black border-t-2 border-[#fceb00]/20">
                    <h3 className="font-bold text-lg mb-1.5 text-white truncate group-hover:text-[#fceb00] transition-colors duration-300">
                      {albumName}
                    </h3>
                    <p className="text-gray-400 text-sm truncate group-hover:text-gray-300 transition-colors duration-300">
                      {artistName}
                    </p>
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