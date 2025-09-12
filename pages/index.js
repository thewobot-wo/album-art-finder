import React, { useState } from 'react';
import Head from 'next/head';

export default function AlbumArtFinder() {
  const [albumName, setAlbumName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [loading, setLoading] = useState(false);
  const [albumArt, setAlbumArt] = useState(null);
  const [error, setError] = useState('');

  const searchAlbumArt = async () => {
    if (!albumName.trim()) {
      setError('Please enter an album name');
      return;
    }

    setLoading(true);
    setError('');
    setAlbumArt(null);

    try {
      const query = artistName.trim() 
        ? `${artistName.trim()} ${albumName.trim()}`
        : albumName.trim();

      const response = await fetch(`/api/album-search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      if (!data.success) {
        setError(data.message || 'No album found. Try different search terms.');
        setLoading(false);
        return;
      }

      setAlbumArt(data.album);
      setLoading(false);

    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search for album artwork. Please try again.');
      setLoading(false);
    }
  };

  const downloadImage = async () => {
    if (!albumArt?.imageUrl) return;

    try {
      const response = await fetch(albumArt.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${albumArt.artist} - ${albumArt.title} (1200x1200).jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download image');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchAlbumArt();
    }
  };

  return (
    <>
      <Head>
        <title>Album Art Finder - High Resolution Album Covers</title>
        <meta name="description" content="Find and download high-resolution album artwork up to 1200x1200 pixels" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" clipRule="evenodd" />
              </svg>
              <h1 className="text-3xl font-bold text-gray-800">Album Art Finder</h1>
            </div>
            <p className="text-gray-600">Search for high-resolution album artwork</p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="artist" className="block text-sm font-medium text-gray-700 mb-1">
                Artist Name (optional)
              </label>
              <input
                id="artist"
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter artist name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="album" className="block text-sm font-medium text-gray-700 mb-1">
                Album Name *
              </label>
              <input
                id="album"
                type="text"
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter album name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={searchAlbumArt}
              disabled={loading || !albumName.trim()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Album Art
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {albumArt && (
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">{albumArt.title}</h3>
                <p className="text-gray-600">{albumArt.artist}</p>
                {albumArt.releaseDate && (
                  <p className="text-sm text-gray-500">Released: {new Date(albumArt.releaseDate).getFullYear()}</p>
                )}
                {albumArt.trackCount && (
                  <p className="text-sm text-gray-500">{albumArt.trackCount} tracks</p>
                )}
                <p className="text-xs text-blue-600 mt-1">Source: {albumArt.source}</p>
              </div>
              
              <div className="flex justify-center mb-4">
                <img
                  src={albumArt.imageUrl}
                  alt={`${albumArt.title} album art`}
                  className="max-w-sm w-full h-auto rounded-lg shadow-lg"
                />
              </div>
              
              <div className="text-center space-y-2">
                <button
                  onClick={downloadImage}
                  className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 flex items-center justify-center mx-auto"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download 1200x1200
                </button>
                
                {albumArt.deezerUrl && (
                  
                    href={albumArt.deezerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-blue-600 hover:text-blue-800 text-sm mr-4"
                  >
                    View on Deezer
                  </a>
                )}
                
                {albumArt.iTunesUrl && (
                  
                    href={albumArt.iTunesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View on iTunes
                  </a>
                )}
                
                <p className="text-sm text-gray-500 mt-2">
                  High resolution album artwork ready for download
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 text-sm text-gray-500 text-center">
            <p className="mb-2"><strong>Powered by Deezer & iTunes APIs</strong></p>
            <p>High-resolution album artwork up to 1200x1200 pixels</p>
          </div>
        </div>
      </div>
    </>
  );
}