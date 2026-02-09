import { useState, useEffect } from 'react'
import './App.css'
import SongCard from './SongCard'
import dummyPlaylist from './demo-data/dummyPlaylist' // DEMO: remove this import

const API_BASE = 'http://127.0.0.1:8000';

const SpotifyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
);

const StravaIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/>
  </svg>
);

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [bpm, setBpm] = useState(160);
  const [length, setLength] = useState(15);
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [stravaToken, setStravaToken] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  // On mount, check URL for OAuth callback params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state'); // 'spotify' or 'strava'

    if (code && state) {
      exchangeCode(code, state);
      // Clean URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const exchangeCode = async (code, service) => {
    try {
      const response = await fetch(`${API_BASE}/auth/${service}/callback?code=${encodeURIComponent(code)}`);
      if (!response.ok) throw new Error(`Auth failed: ${response.status}`);
      const data = await response.json();

      if (service === 'spotify') {
        setSpotifyToken(data.access_token);
      } else if (service === 'strava') {
        setStravaToken(data.access_token);
      }
    } catch (err) {
      console.error(`OAuth exchange error (${service}):`, err);
      setError(`Failed to connect ${service}: ${err.message}`);
    }
  };

  const loginWithSpotify = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/spotify`);
      if (!response.ok) throw new Error(`Failed to get auth URL: ${response.status}`);
      const data = await response.json();
      window.location.href = data.auth_url;
    } catch (err) {
      console.error('Spotify login error:', err);
      setError(`Spotify login failed: ${err.message}`);
    }
  };

  const loginWithStrava = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/strava`);
      if (!response.ok) throw new Error(`Failed to get auth URL: ${response.status}`);
      const data = await response.json();
      window.location.href = data.auth_url;
    } catch (err) {
      console.error('Strava login error:', err);
      setError(`Strava login failed: ${err.message}`);
    }
  };

  const fetchCovers = async (songs) => {
    const updated = await Promise.all(
      songs.map(async (song) => {
        const title = song.title || song.name || song.song || '';
        const artist = song.artist || song.artist_name || '';
        try {
          const resp = await fetch(
            `${API_BASE}/cover?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`
          );
          if (resp.ok) {
            const data = await resp.json();
            if (data.cover_url) {
              return { ...song, album_cover_url: data.cover_url };
            }
          }
        } catch (e) {
          console.error(`Cover fetch failed for "${title}":`, e);
        }
        return song;
      })
    );
    setPlaylist(updated);
  };

  const create = async (bpm, length) => {
    const url = `${API_BASE}/create?bpm=${bpm}&length=${length}`;
    setLoading(true);
    setError(null);
    setPlaylist([]);

    let songs = [];
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }
      songs = Array.isArray(result) ? result : (result.songs || result.data || []);
    } catch (error) {
      console.error(error.message);
      // DEMO: fall back to dummy data when API is unavailable
      songs = dummyPlaylist;
    } finally {
      setPlaylist(songs);
      setLoading(false);
    }

    if (songs.length > 0) {
      fetchCovers(songs);
    }
  }

  return (
    <>
      <header className="header">
        <div className="header-brand">RunTune</div>
        <div className="header-actions">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        <div className="header-auth">
          <button
            className={`auth-btn spotify ${spotifyToken ? 'connected' : ''}`}
            onClick={loginWithSpotify}
            disabled={!!spotifyToken}
          >
            <SpotifyIcon />
            {spotifyToken ? (
              <><span className="connected-dot"></span> Connected</>
            ) : (
              'Spotify'
            )}
          </button>
          <button
            className={`auth-btn strava ${stravaToken ? 'connected' : ''}`}
            onClick={loginWithStrava}
            disabled={!!stravaToken}
          >
            <StravaIcon />
            {stravaToken ? (
              <><span className="connected-dot"></span> Connected</>
            ) : (
              'Strava'
            )}
          </button>
        </div>
        </div>
      </header>

      <div className="hero">
        <h1>RunTune</h1>
        <p className="hero-subtitle">Match your music to your stride</p>
      </div>

      <form className="params" onSubmit={(e) => e.preventDefault()}>
        <div className="params-row">
          <div className="param-group">
            <label htmlFor="bpm_input">Cadence</label>
            <input type="number" id="bpm_input" placeholder='BPM'
            min="40" max="220" required
            value={bpm} onChange={(e) => setBpm(e.target.valueAsNumber)}/>
          </div>
          <div className="param-group">
            <label htmlFor="length">Songs</label>
            <input type="number" id="length" placeholder='Count'
            min="10" max="999" required
            value={length} onChange={(e) => setLength(e.target.valueAsNumber)}/>
          </div>
        </div>
        <button
          type="submit"
          className="generate-btn"
          onClick={() => create(bpm, length)}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Playlist'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )}

      {playlist.length > 0 && (
        <div className="playlist-container">
          <h2>Your Playlist <span className="song-count">{playlist.length} songs</span></h2>
          <div className="playlist">
            {playlist.map((song, index) => (
              <SongCard
                key={index}
                index={index + 1}
                song={song.title || song.name || song.song || 'Unknown Title'}
                artist={song.artist || song.artist_name || 'Unknown Artist'}
                album={song.album || song.album_name || 'Unknown Album'}
                albumCoverUrl={song.album_cover || song.cover_url || song.album_cover_url}
              />
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default App
