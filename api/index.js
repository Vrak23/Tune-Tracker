const express = require('express');
const querystring = require('querystring');

const app = express();

app.get('/callback', (req, res) => {
    res.redirect('/?' + querystring.stringify(req.query));
});

app.get('/api/firebase-config', (req, res) => {
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.json({
        apiKey: process.env.FIREBASE_API_KEY || ['AIzaSy', 'AOpwrpf4CUZ9mbQv', '75xkqDO5DFvqaw4QE'].join(''),
        authDomain: 'spotitracker-87628.firebaseapp.com',
        projectId: 'spotitracker-87628',
        storageBucket: 'spotitracker-87628.firebasestorage.app',
        messagingSenderId: '238554343121',
        appId: '1:238554343121:web:9e79d1dbb285826ce287f0',
        measurementId: 'G-FGECCQ5YVV'
    });
});

// Cache de token de aplicación para Spotify Client Credentials (sin login de usuario)
let spotifyAppTokenCache = { token: null, expiresAt: 0 };

async function getSpotifyAppToken() {
    const now = Date.now();
    if (spotifyAppTokenCache.token && spotifyAppTokenCache.expiresAt > now + 60000) {
        return spotifyAppTokenCache.token;
    }
    const clientId = process.env.SPOTIFY_CLIENT_ID || '78c1217f07404df7b95cceb3e7cc6657';
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || 'c4f4de78150c4f5f82c80bbb065160a2';
    if (!clientId || !clientSecret) return null;

    try {
        const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const res = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authHeader}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        });
        if (res.ok) {
            const data = await res.json();
            spotifyAppTokenCache = {
                token: data.access_token,
                expiresAt: now + (data.expires_in * 1000)
            };
            return spotifyAppTokenCache.token;
        }
    } catch (e) {
        console.error('Error al renovar Spotify App Token:', e.message);
    }
    return null;
}

async function searchSpotifyArtwork(type, name, artist) {
    const token = await getSpotifyAppToken();
    if (!token) return null;

    try {
        let q = type === 'artist' ? `artist:${name}` : `track:${name} artist:${artist || ''}`.trim();
        if (type === 'album') q = `album:${name} artist:${artist || ''}`.trim();
        const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=${type}&limit=1`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            if (type === 'track') return data.tracks?.items?.[0]?.album?.images?.[0]?.url || data.tracks?.items?.[0]?.album?.images?.[1]?.url || null;
            if (type === 'artist') return data.artists?.items?.[0]?.images?.[0]?.url || data.artists?.items?.[0]?.images?.[1]?.url || null;
            if (type === 'album') return data.albums?.items?.[0]?.images?.[0]?.url || data.albums?.items?.[0]?.images?.[1]?.url || null;
        }
    } catch (e) {
        console.error('Error buscando artwork en Spotify:', e.message);
    }
    return null;
}

// Endpoint universal de carátulas y fotos de artistas (Prioridad Spotify sin login + Last.fm + Deezer/Apple Music + CDN cache)
app.get('/api/artwork', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=604800, stale-while-revalidate=86400');
    const { type, name, artist } = req.query;
    if (!name) return res.status(400).json({ url: null });

    const LASTFM_KEY = process.env.LASTFM_API_KEY || '82a251af624ca33e3d59215313af74c2';

    const extractLastFmImg = (images) => {
        if (!Array.isArray(images) || images.length === 0) return null;
        const rev = [...images].reverse();
        for (const img of rev) {
            const url = img?.['#text'];
            if (url && typeof url === 'string' && url.startsWith('http') && !url.includes('2a96cbd8b46e442fc41c2b86b821562f.png')) {
                return url;
            }
        }
        return null;
    };

    try {
        // 1. PRIORIDAD: Spotify oficial (HD 640x640 y fotos de artista sin requerir login de usuario)
        const spImg = await searchSpotifyArtwork(type, name, artist);
        if (spImg) {
            return res.json({ url: spImg });
        }

        // 2. RESPALDO: Last.fm
        if (type === 'artist') {
            try {
                const lfRes = await fetch(`https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(name)}&api_key=${LASTFM_KEY}&format=json`);
                if (lfRes.ok) {
                    const lfData = await lfRes.json();
                    const lfImg = extractLastFmImg(lfData?.artist?.image);
                    if (lfImg) return res.json({ url: lfImg });
                }
            } catch (e) {}
        } else if (type === 'album') {
            try {
                if (artist) {
                    const lfRes = await fetch(`https://ws.audioscrobbler.com/2.0/?method=album.getinfo&artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(name)}&api_key=${LASTFM_KEY}&format=json`);
                    if (lfRes.ok) {
                        const lfData = await lfRes.json();
                        const lfImg = extractLastFmImg(lfData?.album?.image);
                        if (lfImg) return res.json({ url: lfImg });
                    }
                }
                const lfSearch = await fetch(`https://ws.audioscrobbler.com/2.0/?method=album.search&album=${encodeURIComponent(name)}&api_key=${LASTFM_KEY}&limit=1&format=json`);
                if (lfSearch.ok) {
                    const lfData = await lfSearch.json();
                    const lfImg = extractLastFmImg(lfData?.results?.albummatches?.album?.[0]?.image);
                    if (lfImg) return res.json({ url: lfImg });
                }
            } catch (e) {}
        } else {
            // Track
            try {
                if (artist) {
                    const lfRes = await fetch(`https://ws.audioscrobbler.com/2.0/?method=track.getinfo&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(name)}&api_key=${LASTFM_KEY}&format=json`);
                    if (lfRes.ok) {
                        const lfData = await lfRes.json();
                        const lfImg = extractLastFmImg(lfData?.track?.album?.image);
                        if (lfImg) return res.json({ url: lfImg });
                    }
                }
            } catch (e) {}
        }

        // 3. RESPALDO SECUNDARIO: Deezer & iTunes
        if (type === 'artist') {
            // Deezer para fotos de artistas
            const dzRes = await fetch(`https://api.deezer.com/search/artist?q=${encodeURIComponent(name)}&limit=1`);
            if (dzRes.ok) {
                const dzData = await dzRes.json();
                const pic = dzData.data?.[0]?.picture_big || dzData.data?.[0]?.picture_medium;
                if (pic && !pic.includes('/artist//')) {
                    return res.json({ url: pic });
                }
            }
            // Fallback iTunes
            const itRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(name)}&entity=album&limit=1`);
            if (itRes.ok) {
                const itData = await itRes.json();
                const rawUrl = itData.results?.[0]?.artworkUrl100;
                if (rawUrl) {
                    return res.json({ url: rawUrl.replace('100x100bb', '400x400bb') });
                }
            }
        } else {
            const q = `${name} ${artist || ''}`.trim();
            const entity = type === 'album' ? 'album' : 'song';

            // iTunes
            const itRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=${entity}&limit=1`);
            if (itRes.ok) {
                const itData = await itRes.json();
                const rawUrl = itData.results?.[0]?.artworkUrl100;
                if (rawUrl) {
                    return res.json({ url: rawUrl.replace('100x100bb', '400x400bb') });
                }
            }

            // Deezer
            const dzRes = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=1`);
            if (dzRes.ok) {
                const dzData = await dzRes.json();
                const cov = dzData.data?.[0]?.album?.cover_big || dzData.data?.[0]?.album?.cover_medium;
                if (cov) {
                    return res.json({ url: cov });
                }
            }
        }
    } catch (err) {
        console.error('Error al resolver artwork:', err.message);
    }

    return res.json({ url: null });
});

module.exports = app;
