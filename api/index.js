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

// Endpoint universal de carátulas y fotos de artistas (Prioridad Last.fm + Deezer HD + Apple Music + CDN cache)
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
        if (type === 'artist') {
            // 1. Last.fm para fotos de artistas (si tiene imagen válida sin placeholder de estrella)
            try {
                const lfRes = await fetch(`https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(name)}&api_key=${LASTFM_KEY}&format=json`);
                if (lfRes.ok) {
                    const lfData = await lfRes.json();
                    const lfImg = extractLastFmImg(lfData?.artist?.image);
                    if (lfImg) return res.json({ url: lfImg });
                }
            } catch (e) {}

            // 2. Deezer para fotos de artistas (alta calidad 500x500 / 250x250)
            const dzRes = await fetch(`https://api.deezer.com/search/artist?q=${encodeURIComponent(name)}&limit=1`);
            if (dzRes.ok) {
                const dzData = await dzRes.json();
                const pic = dzData.data?.[0]?.picture_big || dzData.data?.[0]?.picture_medium;
                if (pic && !pic.includes('/artist//')) {
                    return res.json({ url: pic });
                }
            }
            // 3. Fallback a iTunes buscando álbum representativo del artista
            const itRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(name)}&entity=album&limit=1`);
            if (itRes.ok) {
                const itData = await itRes.json();
                const rawUrl = itData.results?.[0]?.artworkUrl100;
                if (rawUrl) {
                    return res.json({ url: rawUrl.replace('100x100bb', '400x400bb') });
                }
            }
        } else {
            // Canción o Álbum
            // 1. PRIORIDAD: Last.fm
            try {
                if (type === 'album') {
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
                } else {
                    // Track / canción
                    if (artist) {
                        const lfRes = await fetch(`https://ws.audioscrobbler.com/2.0/?method=track.getinfo&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(name)}&api_key=${LASTFM_KEY}&format=json`);
                        if (lfRes.ok) {
                            const lfData = await lfRes.json();
                            const lfImg = extractLastFmImg(lfData?.track?.album?.image);
                            if (lfImg) return res.json({ url: lfImg });
                        }
                    }
                }
            } catch (e) {}

            const q = `${name} ${artist || ''}`.trim();
            const entity = type === 'album' ? 'album' : 'song';

            // 2. Fallback iTunes (rápido y con carátulas oficiales en HD)
            const itRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=${entity}&limit=1`);
            if (itRes.ok) {
                const itData = await itRes.json();
                const rawUrl = itData.results?.[0]?.artworkUrl100;
                if (rawUrl) {
                    return res.json({ url: rawUrl.replace('100x100bb', '400x400bb') });
                }
            }

            // 3. Fallback a Deezer
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
