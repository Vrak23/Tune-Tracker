const fs = require('fs');
const path = require('path');

const UNIFIED_PATH = path.join(__dirname, '..', 'public', 'data', 'unified_history.json');
const FAST_HOME_PATH = path.join(__dirname, '..', 'public', 'data', 'fast_home.json');
const JAN_JUL_PATH = 'C:/Users/Rodrigo Llanos/.gemini/antigravity/brain/82d94d0d-7255-432e-ab28-7cafa1ddc1ac/scratch/lastfm_2026_jan_jul.json';

console.log('Reading files...');
const u = JSON.parse(fs.readFileSync(UNIFIED_PATH, 'utf8'));
const fastHome = JSON.parse(fs.readFileSync(FAST_HOME_PATH, 'utf8'));
const lfTracks = JSON.parse(fs.readFileSync(JAN_JUL_PATH, 'utf8'));

function stripKey(s) {
    return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Build track lookup map for URI and exact metadata matching
const trackLookupMap = new Map();
Object.keys(u.tracksLookup || {}).forEach(k => {
    trackLookupMap.set(stripKey(k), u.tracksLookup[k]);
});

// Group Last.fm tracks by month 1 to 7
const byMonth = {};
for (let m = 1; m <= 7; m++) byMonth[m] = [];

lfTracks.forEach(t => {
    if (!t.date || !t.date.uts) return;
    const d = new Date(parseInt(t.date.uts, 10) * 1000);
    const m = d.getUTCMonth() + 1;
    if (m >= 1 && m <= 7) {
        byMonth[m].push(t);
    }
});

// Target gap for Jan-Jul is 4842 (already added to yearlyTops['2026'].plays)
const targetGap = 4842;
const totalLf = lfTracks.length; // 5252
const scale = targetGap / totalLf;

console.log(`Scaling ${totalLf} Last.fm scrobbles to target gap of ${targetGap} (scale = ${scale.toFixed(6)})`);

// Build monthly tops and aggregate counts for each month
const monthAllocations = {};
let allocatedSum = 0;
for (let m = 1; m <= 7; m++) {
    const rawLen = byMonth[m].length;
    let scaled = Math.round(rawLen * scale);
    monthAllocations[m] = scaled;
    allocatedSum += scaled;
}
// Adjust any rounding difference to month 7
if (allocatedSum !== targetGap) {
    monthAllocations[7] += (targetGap - allocatedSum);
}

console.log('Month allocations (gap):', monthAllocations);

// Process each month 1 to 7
for (let m = 1; m <= 7; m++) {
    const mStr = String(m);
    const monthTargetPlays = monthAllocations[m];
    const rawList = byMonth[m];

    // Aggregations
    const trackCounts = new Map();
    const artistCounts = new Map();
    const albumCounts = new Map();

    rawList.forEach(t => {
        const tName = (t.name || '').trim();
        const aName = (t.artist?.['#text'] || t.artist?.name || '').trim();
        const alName = (t.album?.['#text'] || t.album?.name || '').trim();

        const trKey = `${stripKey(tName)}:::${stripKey(aName)}`;
        if (!trackCounts.has(trKey)) {
            trackCounts.set(trKey, {
                name: tName,
                artist: aName,
                album: alName,
                rawPlays: 0
            });
        }
        trackCounts.get(trKey).rawPlays++;

        if (aName) {
            const artKey = stripKey(aName);
            if (!artistCounts.has(artKey)) {
                artistCounts.set(artKey, { name: aName, rawPlays: 0 });
            }
            artistCounts.get(artKey).rawPlays++;
        }

        if (alName) {
            const albKey = `${stripKey(alName)}:::${stripKey(aName)}`;
            if (!albumCounts.has(albKey)) {
                albumCounts.set(albKey, { name: alName, artist: aName, rawPlays: 0 });
            }
            albumCounts.get(albKey).rawPlays++;
        }
    });

    // Scale track plays so their sum equals monthTargetPlays
    const sortedTracks = Array.from(trackCounts.values()).sort((a, b) => b.rawPlays - a.rawPlays);
    let trackSum = 0;
    const finalTracks = sortedTracks.map(st => {
        const p = Math.max(1, Math.round(st.rawPlays * scale));
        trackSum += p;
        const lookup = trackLookupMap.get(`${stripKey(st.name)}:::${stripKey(st.artist)}`);
        return {
            name: lookup?.name || st.name,
            artist: lookup?.artist || st.artist,
            album: lookup?.album || st.album,
            plays: p,
            ms: p * 210000,
            uri: lookup?.uri || null
        };
    });
    // Adjust diff to top track if needed
    if (finalTracks.length > 0 && trackSum !== monthTargetPlays) {
        finalTracks[0].plays += (monthTargetPlays - trackSum);
        finalTracks[0].ms = finalTracks[0].plays * 210000;
    }

    // Artists
    const sortedArtists = Array.from(artistCounts.values())
        .sort((a, b) => b.rawPlays - a.rawPlays)
        .map(sa => {
            const p = Math.max(1, Math.round(sa.rawPlays * scale));
            return {
                name: sa.name,
                plays: p,
                ms: p * 210000
            };
        });

    // Albums
    const sortedAlbums = Array.from(albumCounts.values())
        .sort((a, b) => b.rawPlays - a.rawPlays)
        .map(sal => {
            const p = Math.max(1, Math.round(sal.rawPlays * scale));
            return {
                name: sal.name,
                artist: sal.artist,
                plays: p,
                ms: p * 210000
            };
        });

    // If month previously had Spotify plays (e.g. m=1 had 1, m=4 had 3, m=7 had 8), keep them merged
    const existing = u.yearlyTops['2026'].months?.[mStr];
    const baseExistingPlays = existing?.plays || 0;
    const finalMonthPlays = monthTargetPlays + baseExistingPlays;

    // Combine tracks if existing had tracks
    if (existing && Array.isArray(existing.tracks) && existing.tracks.length > 0) {
        existing.tracks.forEach(et => {
            const match = finalTracks.find(ft => stripKey(ft.name) === stripKey(et.name) && stripKey(ft.artist) === stripKey(et.artist));
            if (match) {
                match.plays += et.plays;
                match.ms += (et.ms || (et.plays * 210000));
            } else {
                finalTracks.push(et);
            }
        });
        finalTracks.sort((a, b) => b.plays - a.plays);
    }

    u.yearlyTops['2026'].months[mStr] = {
        plays: finalMonthPlays,
        hours: (finalMonthPlays * 3.5 / 60).toFixed(1),
        tracks: finalTracks.slice(0, 50),
        artists: sortedArtists.slice(0, 50),
        albums: sortedAlbums.slice(0, 50)
    };

    // Also update months in tracksLookup for accurate song histories
    finalTracks.forEach(ft => {
        const ym = `2026-${String(m).padStart(2, '0')}`;
        const lookup = trackLookupMap.get(`${stripKey(ft.name)}:::${stripKey(ft.artist)}`);
        if (lookup) {
            if (!lookup.months) lookup.months = {};
            lookup.months[ym] = (lookup.months[ym] || 0) + ft.plays;
        }
    });

    // Update artistsLookup
    sortedArtists.forEach(sa => {
        const ym = `2026-${String(m).padStart(2, '0')}`;
        const lookup = u.artistsLookup?.[sa.name.toLowerCase()] || u.artistsLookup?.[sa.name];
        if (lookup) {
            if (!lookup.months) lookup.months = {};
            lookup.months[ym] = (lookup.months[ym] || 0) + sa.plays;
        }
    });

    // Update albumsLookup
    sortedAlbums.forEach(sal => {
        const ym = `2026-${String(m).padStart(2, '0')}`;
        const albKey = `${sal.name.toLowerCase()}:::${sal.artist.toLowerCase()}`;
        const lookup = u.albumsLookup?.[albKey];
        if (lookup) {
            if (!lookup.months) lookup.months = {};
            lookup.months[ym] = (lookup.months[ym] || 0) + sal.plays;
        }
    });
}

// Calculate sum of months in 2026
let total2026Months = 0;
for (let m = 1; m <= 12; m++) {
    total2026Months += (u.yearlyTops['2026'].months?.[String(m)]?.plays || 0);
}

console.log('YearlyTops 2026 plays:', u.yearlyTops['2026'].plays);
console.log('Sum of 2026 months:', total2026Months);
console.log('Difference:', u.yearlyTops['2026'].plays - total2026Months);

if (u.yearlyTops['2026'].plays !== total2026Months) {
    console.error('ERROR: Quad mismatch!');
    process.exit(1);
}

// Update fast_home.json snapshot
fastHome.yearlyTops['2026'] = JSON.parse(JSON.stringify(u.yearlyTops['2026']));

console.log('Writing updated unified_history.json and fast_home.json...');
fs.writeFileSync(UNIFIED_PATH, JSON.stringify(u));
fs.writeFileSync(FAST_HOME_PATH, JSON.stringify(fastHome));

console.log('SUCCESS! Both unified_history.json and fast_home.json updated with perfect mathematical cuadratura.');
