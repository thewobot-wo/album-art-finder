export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { q: query } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }
  
  try {
    const deezerResponse = await fetch(
      `https://api.deezer.com/search/album?q=${encodeURIComponent(query)}&limit=5`
    );
    const deezerData = await deezerResponse.json();
    
    if (deezerData.data && deezerData.data.length > 0) {
      const album = deezerData.data[0];
      
      let imageUrl = album.cover_xl || album.cover_big || album.cover_medium || album.cover;
      
      if (imageUrl && imageUrl.includes('250x250')) {
        imageUrl = imageUrl.replace('250x250', '1200x1200');
      } else if (imageUrl && imageUrl.includes('500x500')) {
        imageUrl = imageUrl.replace('500x500', '1200x1200');
      }
      
      return res.json({
        success: true,
        album: {
          title: album.title,
          artist: album.artist.name,
          imageUrl: imageUrl,
          releaseDate: album.release_date,
          trackCount: album.nb_tracks,
          source: 'Deezer',
          deezerUrl: album.link
        }
      });
    }
    
    const iTunesResponse = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=5&media=music`
    );
    const iTunesData = await iTunesResponse.json();
    
    if (iTunesData.results && iTunesData.results.length > 0) {
      const album = iTunesData.results[0];
      
      let imageUrl = album.artworkUrl100;
      if (imageUrl) {
        imageUrl = imageUrl.replace('100x100', '1200x1200');
      }
      
      return res.json({
        success: true,
        album: {
          title: album.collectionName,
          artist: album.artistName,
          imageUrl: imageUrl,
          releaseDate: album.releaseDate,
          trackCount: album.trackCount,
          source: 'iTunes',
          iTunesUrl: album.collectionViewUrl
        }
      });
    }
    
    return res.json({ 
      success: false, 
      message: 'No albums found. Try different search terms.' 
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to search for album. Please try again.' 
    });
  }
}