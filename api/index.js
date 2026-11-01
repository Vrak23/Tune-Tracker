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

// Endpoint universal de carátulas y fotos de artistas (Deezer HD + Apple Music + CDN cache)
app.get('/api/artwork', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=604800, stale-while-revalidate=86400');
    const { type, name, artist } = req.query;
    if (!name) return res.status(400).json({ url: null });

    try {
        if (type === 'artist') {
            // 1. Deezer para fotos de artistas (alta calidad 500x500 / 250x250)
            const dzRes = await fetch(`https://api.deezer.com/search/artist?q=${encodeURIComponent(name)}&limit=1`);
            if (dzRes.ok) {
                const dzData = await dzRes.json();
                const pic = dzData.data?.[0]?.picture_big || dzData.data?.[0]?.picture_medium;
                if (pic && !pic.includes('/artist//')) {
                    return res.json({ url: pic });
                }
            }
            // 2. Fallback a iTunes buscando álbum representativo del artista
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
            const q = `${name} ${artist || ''}`.trim();
            const entity = type === 'album' ? 'album' : 'song';

            // 1. iTunes (rápido y con carátulas oficiales en HD)
            const itRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=${entity}&limit=1`);
            if (itRes.ok) {
                const itData = await itRes.json();
                const rawUrl = itData.results?.[0]?.artworkUrl100;
                if (rawUrl) {
                    return res.json({ url: rawUrl.replace('100x100bb', '400x400bb') });
                }
            }

            // 2. Fallback a Deezer
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
