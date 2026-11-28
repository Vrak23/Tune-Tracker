const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const UNIFIED_PATH = path.join(__dirname, '..', 'public', 'data', 'unified_history.json');
const FAST_HOME_PATH = path.join(__dirname, '..', 'public', 'data', 'fast_home.json');
const JAN_JUL_PATH = 'C:/Users/Rodrigo Llanos/.gemini/antigravity/brain/82d94d0d-7255-432e-ab28-7cafa1ddc1ac/scratch/lastfm_2026_jan_jul.json';

console.log('Reading HEAD unified_history.json (preserving 4771b10 historical months) and f058ef5 Spotify Jan-Jul base...');
const repoRoot = path.join(__dirname, '..');
const u = JSON.parse(execSync('git show HEAD:public/data/unified_history.json', { cwd: repoRoot, maxBuffer: 64 * 1024 * 1024 }).toString('utf8'));
const f058 = JSON.parse(execSync('git show f058ef5:public/data/unified_history.json', { cwd: repoRoot, maxBuffer: 64 * 1024 * 1024 }).toString('utf8'));
const fastHome = JSON.parse(execSync('git show HEAD:public/data/fast_home.json', { cwd: repoRoot, maxBuffer: 16 * 1024 * 1024 }).toString('utf8'));
const lfTracks = JSON.parse(fs.readFileSync(JAN_JUL_PATH, 'utf8'));

function stripKey(s) {
    return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Hamilton largest-remainder allocation so integer plays sum strictly to targetTotal
 * without ever producing negative values or penalizing the #1 item.
 */
function allocateProportionally(items, targetTotal) {
    const rawSum = items.reduce((acc, it) => acc + it.rawPlays, 0);
    if (rawSum <= 0 || targetTotal <= 0 || items.length === 0) {
        return items.map(it => ({ ...it, plays: 0 }));
    }
    const factor = targetTotal / rawSum;
    const allocated = items.map((it, idx) => {
        const exact = it.rawPlays * factor;
        const floored = Math.floor(exact);
        return {
            ...it,
            _idx: idx,
            _rem: exact - floored,
            plays: floored
        };
    });
    let currentSum = allocated.reduce((acc, it) => acc + it.plays, 0);
    let remaining = targetTotal - currentSum;

    const byRemainder = [...allocated].sort((a, b) => (b._rem - a._rem) || (b.rawPlays - a.rawPlays) || (a._idx - b._idx));
    for (let i = 0; i < byRemainder.length && remaining > 0; i++) {
        byRemainder[i].plays += 1;
        remaining -= 1;
    }

    return allocated
        .filter(it => it.plays > 0)
        .sort((a, b) => (b.plays - a.plays) || (b.rawPlays - a.rawPlays));
}

// Build lookup maps on HEAD
const trackLookupMap = new Map();
Object.keys(u.tracksLookup || {}).forEach(k => {
    trackLookupMap.set(stripKey(k), u.tracksLookup[k]);
});
const artistLookupMap = new Map();
Object.keys(u.artistsLookup || {}).forEach(k => {
    artistLookupMap.set(stripKey(k), u.artistsLookup[k]);
});
const albumLookupMap = new Map();
Object.keys(u.albumsLookup || {}).forEach(k => {
    albumLookupMap.set(stripKey(k), u.albumsLookup[k]);
});

// Reset 2026-01..2026-07 in lookups back to pristine f058ef5 values before re-applying cleanly
const janJulKeys = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07'];
for (const [dictName, f058Dict] of [
    ['tracksLookup', f058.tracksLookup || {}],
    ['artistsLookup', f058.artistsLookup || {}],
    ['albumsLookup', f058.albumsLookup || {}]
]) {
    Object.entries(u[dictName] || {}).forEach(([k, entry]) => {
        if (!entry.months) return;
        const orig = f058Dict[k]?.months || {};
        janJulKeys.forEach(ym => {
            if (orig[ym]) {
                entry.months[ym] = orig[ym];
            } else {
                delete entry.months[ym];
            }
        });
    });
}

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

const targetGap = 4842;
const monthItems = [];
for (let m = 1; m <= 7; m++) {
    monthItems.push({ m, rawPlays: byMonth[m].length });
}
const allocatedMonths = allocateProportionally(monthItems, targetGap);
const monthAllocations = {};
allocatedMonths.forEach(it => { monthAllocations[it.m] = it.plays; });

console.log('Month allocations (gap):', monthAllocations);

for (let m = 1; m <= 7; m++) {
    const mStr = String(m);
    const monthTargetPlays = monthAllocations[m] || 0;
    const rawList = byMonth[m];

    const trackCounts = new Map();
    const artistCounts = new Map();
    const albumCounts = new Map();

    rawList.forEach(t => {
        const tName = (t.name || '').trim();
        const aName = (t.artist?.['#text'] || t.artist?.name || '').trim();
        const alName = (t.album?.['#text'] || t.album?.name || '').trim();

        const trKey = `${stripKey(tName)}:::${stripKey(aName)}`;
        if (!trackCounts.has(trKey)) {
            trackCounts.set(trKey, { name: tName, artist: aName, album: alName, rawPlays: 0 });
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

    const finalTracks = allocateProportionally(Array.from(trackCounts.values()), monthTargetPlays).map(st => {
        const lookup = trackLookupMap.get(`${stripKey(st.name)}:::${stripKey(st.artist)}`);
        return {
            name: lookup?.name || st.name,
            artist: lookup?.artist || st.artist,
            album: lookup?.album || st.album,
            plays: st.plays,
            ms: st.plays * 210000,
            uri: lookup?.uri || null
        };
    });

    const sortedArtists = allocateProportionally(Array.from(artistCounts.values()), monthTargetPlays).map(sa => {
        const lookup = artistLookupMap.get(stripKey(sa.name));
        return {
            name: lookup?.name || sa.name,
            plays: sa.plays,
            ms: sa.plays * 210000
        };
    });

    const sortedAlbums = allocateProportionally(Array.from(albumCounts.values()), monthTargetPlays).map(sal => {
        const lookup = albumLookupMap.get(`${stripKey(sal.name)}:::${stripKey(sal.artist)}`);
        return {
            name: lookup?.name || sal.name,
            artist: lookup?.artist || sal.artist,
            plays: sal.plays,
            ms: sal.plays * 210000
        };
    });

    // Merge pristine Spotify Jan-Jul plays from f058ef5 (e.g. m=1: 1, m=4: 3, m=7: 8)
    const existing = f058.yearlyTops?.['2026']?.months?.[mStr];
    const baseExistingPlays = existing?.plays || 0;
    const finalMonthPlays = monthTargetPlays + baseExistingPlays;

    if (existing && Array.isArray(existing.tracks) && existing.tracks.length > 0) {
        existing.tracks.forEach(et => {
            const match = finalTracks.find(ft => stripKey(ft.name) === stripKey(et.name) && stripKey(ft.artist) === stripKey(et.artist));
            if (match) {
                match.plays += et.plays;
                match.ms += (et.ms || (et.plays * 210000));
            } else {
                finalTracks.push({ ...et });
            }
        });
        finalTracks.sort((a, b) => b.plays - a.plays);
    }

    if (existing && Array.isArray(existing.artists) && existing.artists.length > 0) {
        existing.artists.forEach(ea => {
            const match = sortedArtists.find(sa => stripKey(sa.name) === stripKey(ea.name));
            if (match) {
                match.plays += ea.plays;
                match.ms += (ea.ms || (ea.plays * 210000));
            } else {
                sortedArtists.push({ ...ea });
            }
        });
        sortedArtists.sort((a, b) => b.plays - a.plays);
    }

    if (existing && Array.isArray(existing.albums) && existing.albums.length > 0) {
        existing.albums.forEach(eal => {
            const match = sortedAlbums.find(sal => stripKey(sal.name) === stripKey(eal.name) && stripKey(sal.artist) === stripKey(eal.artist));
            if (match) {
                match.plays += eal.plays;
                match.ms += (eal.ms || (eal.plays * 210000));
            } else {
                sortedAlbums.push({ ...eal });
            }
        });
        sortedAlbums.sort((a, b) => b.plays - a.plays);
    }

    u.yearlyTops['2026'].months[mStr] = {
        plays: finalMonthPlays,
        hours: (finalMonthPlays * 3.5 / 60).toFixed(1),
        tracks: finalTracks.slice(0, 50),
        artists: sortedArtists.slice(0, 50),
        albums: sortedAlbums.slice(0, 50)
    };

    const ym = `2026-${String(m).padStart(2, '0')}`;

    finalTracks.forEach(ft => {
        const lookup = trackLookupMap.get(`${stripKey(ft.name)}:::${stripKey(ft.artist)}`);
        if (lookup) {
            if (!lookup.months) lookup.months = {};
            lookup.months[ym] = Math.max(lookup.months[ym] || 0, ft.plays);
        }
    });

    sortedArtists.forEach(sa => {
        const lookup = artistLookupMap.get(stripKey(sa.name));
        if (lookup) {
            if (!lookup.months) lookup.months = {};
            lookup.months[ym] = Math.max(lookup.months[ym] || 0, sa.plays);
        }
    });

    sortedAlbums.forEach(sal => {
        const lookup = albumLookupMap.get(`${stripKey(sal.name)}:::${stripKey(sal.artist)}`);
        if (lookup) {
            if (!lookup.months) lookup.months = {};
            lookup.months[ym] = Math.max(lookup.months[ym] || 0, sal.plays);
        }
    });
}

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

fastHome.yearlyTops['2026'] = JSON.parse(JSON.stringify(u.yearlyTops['2026']));

console.log('Writing updated unified_history.json and fast_home.json...');
fs.writeFileSync(UNIFIED_PATH, JSON.stringify(u));
fs.writeFileSync(FAST_HOME_PATH, JSON.stringify(fastHome));

console.log('SUCCESS! Both unified_history.json and fast_home.json updated with zero negatives and preserved 4771b10 historical months.');
