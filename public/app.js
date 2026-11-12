
// ----------------------------------------------------
// FIREBASE CLOUD CONFIGURATION & INIT (Seguro sin keys en crudo)
// ----------------------------------------------------
let firebaseApp = null;
let firestoreDb = null;
let firebaseMessaging = null;

async function initFirebase() {
    if (typeof firebase === 'undefined' || firebaseApp) return;
    try {
        let cfg = null;
        try {
            const res = await fetch('/api/firebase-config');
            if (res.ok) cfg = await res.json();
        } catch (_) {}
        if (!cfg) {
            cfg = {
                authDomain: 'spotitracker-87628.firebaseapp.com',
                projectId: 'spotitracker-87628',
                storageBucket: 'spotitracker-87628.firebasestorage.app',
                messagingSenderId: '238554343121',
                appId: '1:238554343121:web:9e79d1dbb285826ce287f0',
                measurementId: 'G-FGECCQ5YVV'
            };
        }
        firebaseApp = firebase.initializeApp(cfg);
        if (firebase.firestore) firestoreDb = firebase.firestore();
        if (firebase.messaging && firebase.messaging.isSupported()) {
            firebaseMessaging = firebase.messaging();
        }
        console.log('Firebase inicializado correctamente');
    } catch (e) {
        console.warn('Firebase init:', e);
    }
}
initFirebase();

// ----------------------------------------------------
// ----------------------------------------------------
// TUNE TRACKER: ROLES, DEMO MODE & OWNER MODE SYSTEM
// ----------------------------------------------------
const DEFAULT_LASTFM_USER = 'Vrak_23';
const DEFAULT_LASTFM_KEY = '82a251af624ca33e3d59215313af74c2';

// Supabase Configuration (Central-de-estudio)
const SUPABASE_PROJECT_URL = 'https://znbihwazambtwjwizmsn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_C7JjbD4TMFzBGysYO835GQ_s1rRzvm-';
const SUPABASE_REST_URL = `${SUPABASE_PROJECT_URL}/rest/v1/spotitracker_curator`;
const CLOUD_AUTOSYNC_KEY = 'spotitracker_cloud_autosync';
const CLOUD_LAST_SYNC_KEY = 'spotitracker_cloud_last_sync';

// Global Legacy Filter Elements (Safe declarations to prevent TDZ/ReferenceError)
let yearsFilterContainer = null;
let yearsPillList = null;
let monthsFilterContainer = null;
let monthsPillList = null;

let isDemoSession = false;

function isDemoMode() {
    return isDemoSession || sessionStorage.getItem('tunetracker_demo_session') === 'true';
}
window.isDemoMode = isDemoMode;

function isAppOwner() {
    if (isDemoMode()) return false;
    if (localStorage.getItem('tunetracker_owner_mode') === 'true') return true;
    const lastUser = (localStorage.getItem('lastfm_user') || '').trim().toLowerCase();
    if (lastUser === 'vrak_23' || lastUser === 'vrak23') return true;
    if (typeof userProfileData !== 'undefined' && userProfileData) {
        const uid = (userProfileData.id || '').toLowerCase();
        const dname = (userProfileData.display_name || '').toLowerCase();
        if (uid.includes('vrak') || uid.includes('rodrigo') || dname.includes('vrak') || dname.includes('rodrigo')) {
            return true;
        }
    }
    return false;
}
window.isAppOwner = isAppOwner;

function buildDemoDatabase() {
    const demoTracks = [
        { name: 'Starboy', artist: 'The Weeknd', album: 'Starboy', plays: 312, count: 312, hours: 19.9, ms: 312 * 230000, first: '2022-03-14', last: '2026-10-29', byYear: { '2022': 45, '2023': 78, '2024': 64, '2025': 70, '2026': 55 } },
        { name: 'Instant Crush (feat. Julian Casablancas)', artist: 'Daft Punk', album: 'Random Access Memories', plays: 284, count: 284, hours: 26.5, ms: 284 * 337000, first: '2021-06-10', last: '2026-10-28', byYear: { '2021': 40, '2022': 52, '2023': 60, '2024': 48, '2025': 44, '2026': 40 } },
        { name: 'Do I Wanna Know?', artist: 'Arctic Monkeys', album: 'AM', plays: 265, count: 265, hours: 20.0, ms: 265 * 272000, first: '2021-02-19', last: '2026-10-30', byYear: { '2021': 50, '2022': 45, '2023': 42, '2024': 48, '2025': 45, '2026': 35 } },
        { name: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', plays: 248, count: 248, hours: 14.0, ms: 248 * 203000, first: '2021-05-01', last: '2026-10-25', byYear: { '2021': 65, '2022': 55, '2023': 40, '2024': 35, '2025': 30, '2026': 23 } },
        { name: 'The Less I Know The Better', artist: 'Tame Impala', album: 'Currents', plays: 231, count: 231, hours: 13.8, ms: 231 * 216000, first: '2021-08-12', last: '2026-10-27', byYear: { '2021': 35, '2022': 48, '2023': 44, '2024': 40, '2025': 36, '2026': 28 } },
        { name: 'Feel Good Inc.', artist: 'Gorillaz', album: 'Demon Days', plays: 219, count: 219, hours: 13.5, ms: 219 * 222000, first: '2021-04-20', last: '2026-10-24', byYear: { '2021': 30, '2022': 42, '2023': 45, '2024': 38, '2025': 34, '2026': 30 } },
        { name: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', plays: 210, count: 210, hours: 11.6, ms: 210 * 200000, first: '2021-01-11', last: '2026-10-26', byYear: { '2021': 55, '2022': 40, '2023': 35, '2024': 30, '2025': 28, '2026': 22 } },
        { name: 'Midnight City', artist: 'M83', album: "Hurry Up, We're Dreaming", plays: 196, count: 196, hours: 13.2, ms: 196 * 243000, first: '2022-01-08', last: '2026-10-22', byYear: { '2022': 44, '2023': 38, '2024': 42, '2025': 40, '2026': 32 } },
        { name: 'Sweater Weather', artist: 'The Neighbourhood', album: 'I Love You.', plays: 185, count: 185, hours: 12.3, ms: 185 * 240000, first: '2021-11-05', last: '2026-10-20', byYear: { '2021': 22, '2022': 38, '2023': 40, '2024': 35, '2025': 28, '2026': 22 } },
        { name: 'Get Lucky (feat. Pharrell Williams)', artist: 'Daft Punk', album: 'Random Access Memories', plays: 174, count: 174, hours: 12.0, ms: 174 * 248000, first: '2021-07-15', last: '2026-10-19', byYear: { '2021': 30, '2022': 34, '2023': 32, '2024': 28, '2025': 26, '2026': 24 } },
        { name: '505', artist: 'Arctic Monkeys', album: 'Favourite Worst Nightmare', plays: 168, count: 168, hours: 11.8, ms: 168 * 253000, first: '2022-04-02', last: '2026-10-21', byYear: { '2022': 36, '2023': 38, '2024': 34, '2025': 32, '2026': 28 } },
        { name: 'BIRDS OF A FEATHER', artist: 'Billie Eilish', album: 'HIT ME HARD AND SOFT', plays: 159, count: 159, hours: 9.3, ms: 159 * 210000, first: '2024-05-18', last: '2026-10-30', byYear: { '2024': 62, '2025': 54, '2026': 43 } },
        { name: 'Vivir Mi Vida', artist: 'Marc Anthony', album: '3.0', plays: 145, count: 145, hours: 10.1, ms: 145 * 252000, first: '2021-09-12', last: '2026-10-15', byYear: { '2021': 25, '2022': 28, '2023': 26, '2024': 24, '2025': 22, '2026': 20 } },
        { name: 'Clocks', artist: 'Coldplay', album: 'A Rush of Blood to the Head', plays: 138, count: 138, hours: 11.7, ms: 138 * 307000, first: '2021-03-22', last: '2026-10-18', byYear: { '2021': 24, '2022': 26, '2023': 25, '2024': 23, '2025': 22, '2026': 18 } },
        { name: 'On Melancholy Hill', artist: 'Gorillaz', album: 'Plastic Beach', plays: 132, count: 132, hours: 8.5, ms: 132 * 233000, first: '2022-02-14', last: '2026-10-17', byYear: { '2022': 28, '2023': 28, '2024': 26, '2025': 26, '2026': 24 } }
    ];

    const demoArtists = [
        { name: 'The Weeknd', plays: 845, count: 845, hours: 50.5, ms: 845 * 215000, first: '2021-01-11', last: '2026-10-29', byYear: { '2021': 120, '2022': 155, '2023': 160, '2024': 145, '2025': 140, '2026': 125 } },
        { name: 'Daft Punk', plays: 760, count: 760, hours: 55.9, ms: 760 * 265000, first: '2021-06-10', last: '2026-10-28', byYear: { '2021': 110, '2022': 135, '2023': 140, '2024': 130, '2025': 125, '2026': 120 } },
        { name: 'Arctic Monkeys', plays: 710, count: 710, hours: 48.3, ms: 710 * 245000, first: '2021-02-19', last: '2026-10-30', byYear: { '2021': 105, '2022': 125, '2023': 130, '2024': 120, '2025': 120, '2026': 110 } },
        { name: 'Gorillaz', plays: 620, count: 620, hours: 39.2, ms: 620 * 228000, first: '2021-04-20', last: '2026-10-24', byYear: { '2021': 90, '2022': 110, '2023': 115, '2024': 105, '2025': 105, '2026': 95 } },
        { name: 'Dua Lipa', plays: 580, count: 580, hours: 33.0, ms: 580 * 205000, first: '2021-05-01', last: '2026-10-25', byYear: { '2021': 115, '2022': 110, '2023': 95, '2024': 90, '2025': 90, '2026': 80 } },
        { name: 'Tame Impala', plays: 540, count: 540, hours: 35.2, ms: 540 * 235000, first: '2021-08-12', last: '2026-10-27', byYear: { '2021': 80, '2022': 95, '2023': 100, '2024': 95, '2025': 90, '2026': 80 } },
        { name: 'Coldplay', plays: 490, count: 490, hours: 35.4, ms: 490 * 260000, first: '2021-03-22', last: '2026-10-18', byYear: { '2021': 75, '2022': 85, '2023': 90, '2024': 85, '2025': 80, '2026': 75 } },
        { name: 'Billie Eilish', plays: 465, count: 465, hours: 27.4, ms: 465 * 212000, first: '2021-07-30', last: '2026-10-30', byYear: { '2021': 55, '2022': 65, '2023': 70, '2024': 95, '2025': 95, '2026': 85 } },
        { name: 'M83', plays: 410, count: 410, hours: 27.5, ms: 410 * 242000, first: '2022-01-08', last: '2026-10-22', byYear: { '2022': 85, '2023': 85, '2024': 82, '2025': 80, '2026': 78 } },
        { name: 'The Neighbourhood', plays: 385, count: 385, hours: 25.4, ms: 385 * 238000, first: '2021-11-05', last: '2026-10-20', byYear: { '2021': 45, '2022': 70, '2023': 75, '2024': 70, '2025': 65, '2026': 60 } }
    ];

    const demoAlbums = [
        { name: 'Random Access Memories', artist: 'Daft Punk', plays: 520, count: 520, hours: 38.2, ms: 520 * 265000, first: '2021-06-10', last: '2026-10-28', byYear: { '2021': 80, '2022': 95, '2023': 95, '2024': 85, '2025': 85, '2026': 80 } },
        { name: 'Starboy', artist: 'The Weeknd', plays: 480, count: 480, hours: 30.0, ms: 480 * 225000, first: '2022-03-14', last: '2026-10-29', byYear: { '2022': 90, '2023': 105, '2024': 95, '2025': 100, '2026': 90 } },
        { name: 'AM', artist: 'Arctic Monkeys', plays: 450, count: 450, hours: 30.0, ms: 450 * 240000, first: '2021-02-19', last: '2026-10-30', byYear: { '2021': 75, '2022': 80, '2023': 80, '2024': 75, '2025': 75, '2026': 65 } },
        { name: 'Future Nostalgia', artist: 'Dua Lipa', plays: 410, count: 410, hours: 23.1, ms: 410 * 203000, first: '2021-05-01', last: '2026-10-25', byYear: { '2021': 90, '2022': 85, '2023': 65, '2024': 60, '2025': 58, '2026': 52 } },
        { name: 'Currents', artist: 'Tame Impala', plays: 390, count: 390, hours: 24.9, ms: 390 * 230000, first: '2021-08-12', last: '2026-10-27', byYear: { '2021': 60, '2022': 70, '2023': 70, '2024': 65, '2025': 65, '2026': 60 } },
        { name: 'After Hours', artist: 'The Weeknd', plays: 365, count: 365, hours: 21.3, ms: 365 * 210000, first: '2021-01-11', last: '2026-10-26', byYear: { '2021': 75, '2022': 65, '2023': 60, '2024': 58, '2025': 55, '2026': 52 } },
        { name: 'Demon Days', artist: 'Gorillaz', plays: 340, count: 340, hours: 21.0, ms: 340 * 222000, first: '2021-04-20', last: '2026-10-24', byYear: { '2021': 55, '2022': 60, '2023': 60, '2024': 58, '2025': 55, '2026': 52 } }
    ];

    const tracksLookup = {};
    demoTracks.forEach(t => {
        const key1 = `${t.name.toLowerCase()}|||${t.artist.toLowerCase()}`;
        const key2 = `${t.name.toLowerCase()}:::${t.artist.toLowerCase()}`;
        tracksLookup[key1] = { ...t };
        tracksLookup[key2] = { ...t };
    });

    const artistsLookup = {};
    demoArtists.forEach(a => {
        artistsLookup[a.name.toLowerCase()] = { ...a };
        artistsLookup[normalizeKey(a.name)] = { ...a };
    });

    const albumsLookup = {};
    demoAlbums.forEach(al => {
        const key1 = `${al.name.toLowerCase()}|||${al.artist.toLowerCase()}`;
        const key2 = `${al.name.toLowerCase()}:::${al.artist.toLowerCase()}`;
        albumsLookup[key1] = { ...al };
        albumsLookup[key2] = { ...al };
    });

    const years = ['2021', '2022', '2023', '2024', '2025', '2026'];
    const yearlyTops = {
        overall: {
            plays: 12450,
            hours: 747,
            tracks: demoTracks.map(t => ({ ...t })),
            artists: demoArtists.map(a => ({ ...a })),
            albums: demoAlbums.map(al => ({ ...al }))
        }
    };

    years.forEach(yr => {
        const yTracks = demoTracks
            .filter(t => t.byYear && t.byYear[yr])
            .map(t => ({ ...t, plays: t.byYear[yr], count: t.byYear[yr], ms: t.byYear[yr] * 225000 }))
            .sort((a, b) => b.plays - a.plays);
        const yPlays = yTracks.reduce((acc, x) => acc + x.plays, 0) * 3;
        yearlyTops[yr] = {
            plays: yPlays,
            hours: Math.round(yPlays * 3.6 / 60),
            tracks: yTracks,
            artists: demoArtists
                .filter(a => a.byYear && a.byYear[yr])
                .map(a => ({ ...a, plays: a.byYear[yr], count: a.byYear[yr], ms: a.byYear[yr] * 225000 }))
                .sort((a, b) => b.plays - a.plays),
            albums: demoAlbums
                .filter(al => al.byYear && al.byYear[yr])
                .map(al => ({ ...al, plays: al.byYear[yr], count: al.byYear[yr], ms: al.byYear[yr] * 225000 }))
                .sort((a, b) => b.plays - a.plays)
        };
    });

    const nowMs = Date.now();
    const recent = demoTracks.slice(0, 12).map((t, idx) => ({
        name: t.name,
        artist: t.artist,
        album: t.album,
        ts: new Date(nowMs - idx * 18 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 16),
        source: 'demo'
    }));

    return {
        summary: {
            totalStreams: 12450,
            validStreams: 12450,
            spotifyStreams: 12450,
            lastfmStreams: 12450,
            totalMinutes: 44820,
            totalHours: 747,
            uniqueTracks: 840,
            uniqueArtists: 215,
            totalArtists: 215,
            uniqueAlbums: 310,
            totalAlbums: 310,
            years: years
        },
        yearlyTops,
        monthlyTops: {},
        tracksLookup,
        artistsLookup,
        albumsLookup,
        recent,
        insights: {
            hourly: [120, 85, 45, 20, 10, 15, 45, 190, 340, 480, 560, 620, 690, 710, 740, 820, 910, 1050, 1180, 1120, 980, 840, 560, 315],
            weekdays: [1650, 1780, 1820, 1890, 2110, 1720, 1480],
            streaks: {
                longestDays: 24,
                longestStart: '2024-06-01',
                longestEnd: '2024-06-24',
                topDayDate: '2025-08-14',
                topDayStreams: 92,
                totalActiveDays: 680
            },
            loyalty: demoArtists.slice(0, 8).map(a => ({
                name: a.name,
                yearsCount: Object.keys(a.byYear || {}).length,
                yearsList: Object.keys(a.byYear || {}),
                totalStreams: a.plays
            })),
            forgottenGems: demoTracks.slice(3, 9).map(t => ({
                name: t.name,
                artist: t.artist,
                peakYear: '2022',
                peakCount: 65,
                totalCount: t.plays,
                lastPlayed: '2025-11-10'
            }))
        }
    };
}
window.buildDemoDatabase = buildDemoDatabase;

// Acceso secreto al Modo Dueño tocando 5 veces el logo de Tune Tracker
let secretLogoTapCount = 0;
let secretLogoTapTimer = null;
function handleSecretLogoTap(e) {
    if (e) e.preventDefault();
    secretLogoTapCount++;
    clearTimeout(secretLogoTapTimer);
    if (secretLogoTapCount >= 5) {
        secretLogoTapCount = 0;
        promptOwnerUnlock();
    } else {
        secretLogoTapTimer = setTimeout(() => {
            secretLogoTapCount = 0;
        }, 2200);
    }
}
window.handleSecretLogoTap = handleSecretLogoTap;

function promptOwnerUnlock() {
    if (isAppOwner()) {
        const toggle = confirm('Actualmente tienes activo el Modo Dueño (Admin).\n¿Deseas cambiar a Modo Amigo/Invitado para probar la vista restringida?');
        if (toggle) {
            localStorage.removeItem('tunetracker_owner_mode');
            localStorage.removeItem('lastfm_user');
            localStorage.removeItem('lastfm_key');
            location.reload();
        }
        return;
    }
    const pin = prompt('Introduce la clave de acceso de Dueño para desbloquear Era Tidal y el Panel Admin:');
    if (pin && (pin.trim().toLowerCase() === 'vrak23' || pin.trim().toLowerCase() === 'vrak_23' || pin.trim() === '2323' || pin.trim().toLowerCase() === 'admin')) {
        isDemoSession = false;
        sessionStorage.removeItem('tunetracker_demo_session');
        localStorage.setItem('tunetracker_owner_mode', 'true');
        localStorage.setItem('lastfm_user', DEFAULT_LASTFM_USER);
        localStorage.setItem('lastfm_key', DEFAULT_LASTFM_KEY);
        alert('¡Modo Dueño activado con éxito! Se han habilitado la Era Tidal, el Panel de Solicitudes y los ajustes de streams.');
        location.reload();
    } else if (pin !== null) {
        alert('Clave incorrecta. Permaneces en Modo Invitado.');
    }
}
window.promptOwnerUnlock = promptOwnerUnlock;

// ----------------------------------------------------
// SISTEMA DE SOLICITUD Y APROBACIÓN ADMIN (CURADOR & WRAPPED)
// ----------------------------------------------------
const ACCESS_REQUESTS_KEY = 'tunetracker_access_requests_v1';
let accessRequestsState = null;

function getAccessRequestsState() {
    if (accessRequestsState) return accessRequestsState;
    try {
        const raw = localStorage.getItem(ACCESS_REQUESTS_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed.users === 'object') {
                accessRequestsState = parsed;
                return accessRequestsState;
            }
        }
    } catch (e) {}
    accessRequestsState = { users: {} };
    return accessRequestsState;
}

function saveAccessRequestsLocal() {
    try {
        localStorage.setItem(ACCESS_REQUESTS_KEY, JSON.stringify(getAccessRequestsState()));
    } catch (e) {}
}

async function syncAccessRequestsFromCloud(forceRender = false) {
    const local = getAccessRequestsState();
    let remoteUsers = null;

    // 1. Pull from Firebase Firestore
    try {
        if (firestoreDb) {
            const docSnap = await firestoreDb.collection('spotitracker_profile').doc('access_requests').get();
            if (docSnap.exists && docSnap.data()?.users) {
                remoteUsers = docSnap.data().users;
            }
        }
    } catch (e) {}

    // 2. Pull from Supabase if available
    if (!remoteUsers && typeof SUPABASE_PROJECT_URL !== 'undefined' && typeof SUPABASE_ANON_KEY !== 'undefined') {
        try {
            const res = await fetch(`${SUPABASE_PROJECT_URL}/rest/v1/spotitracker_profile?id=eq.access_requests&select=state`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            });
            if (res.ok) {
                const rows = await res.json();
                if (rows?.[0]?.state?.users) {
                    remoteUsers = rows[0].state.users;
                }
            }
        } catch (e) {}
    }

    if (remoteUsers && typeof remoteUsers === 'object') {
        Object.entries(remoteUsers).forEach(([uKey, rEntry]) => {
            const lEntry = local.users[uKey];
            if (!lEntry || !lEntry.updatedAt || (rEntry.updatedAt && rEntry.updatedAt >= lEntry.updatedAt)) {
                local.users[uKey] = rEntry;
            }
        });
        saveAccessRequestsLocal();
    }

    updateFeatureAccessBadges();
    if (forceRender) {
        renderAdminRequestsList();
    }
}
window.syncAccessRequestsFromCloud = syncAccessRequestsFromCloud;

async function pushAccessRequestsToCloud() {
    saveAccessRequestsLocal();
    updateFeatureAccessBadges();
    const stateObj = getAccessRequestsState();
    const payload = {
        id: 'access_requests',
        user_id: 'admin_requests',
        state: stateObj,
        updated_at: new Date().toISOString()
    };

    try {
        if (firestoreDb) {
            await firestoreDb.collection('spotitracker_profile').doc('access_requests').set({
                users: stateObj.users,
                updated_at: payload.updated_at
            }, { merge: true });
        }
    } catch (e) {}

    if (typeof SUPABASE_PROJECT_URL !== 'undefined' && typeof SUPABASE_ANON_KEY !== 'undefined') {
        try {
            await fetch(`${SUPABASE_PROJECT_URL}/rest/v1/spotitracker_profile`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=merge-duplicates'
                },
                body: JSON.stringify(payload)
            });
        } catch (e) {}
    }
}

function getCurrentNormalizedUser() {
    const u = (localStorage.getItem('lastfm_user') || '').trim();
    return { raw: u, key: u.toLowerCase() };
}

function getUserFeatureStatus(feature) {
    if (isAppOwner()) return 'approved';
    if (isDemoMode()) return 'demo_blocked';
    const { key } = getCurrentNormalizedUser();
    if (!key) return 'none';
    const st = getAccessRequestsState();
    return st.users?.[key]?.[feature] || 'none';
}

function updateFeatureAccessBadges() {
    const isOwner = isAppOwner();
    const isDemo = isDemoMode();

    const curatorBadge = document.getElementById('badge-access-curator');
    const wrappedBadge = document.getElementById('badge-access-wrapped');
    const bentoCuratorBadge = document.getElementById('bento-curator-badge');
    const adminPendingBadge = document.getElementById('badge-admin-pending-count');

    const formatBadge = (el, status) => {
        if (!el) return;
        if (isOwner || status === 'approved') {
            el.className = 'badge rounded-pill bg-success bg-opacity-25 text-success border border-success border-opacity-25';
            el.textContent = '✓ Activo';
        } else if (status === 'pending') {
            el.className = 'badge rounded-pill bg-warning bg-opacity-25 text-warning border border-warning border-opacity-25';
            el.textContent = '⏳ Pendiente';
        } else {
            el.className = 'badge rounded-pill bg-secondary bg-opacity-25 text-secondary';
            el.textContent = '🔒 Solicitar';
        }
    };

    if (!isDemo) {
        const curStatus = getUserFeatureStatus('curator');
        const wrpStatus = getUserFeatureStatus('wrapped');
        formatBadge(curatorBadge, curStatus);
        formatBadge(wrappedBadge, wrpStatus);
        if (bentoCuratorBadge) {
            if (isOwner || curStatus === 'approved') {
                bentoCuratorBadge.textContent = 'CURADOR';
                bentoCuratorBadge.style.background = 'rgba(255, 255, 255, 0.08)';
                bentoCuratorBadge.style.color = '#a1a1aa';
            } else if (curStatus === 'pending') {
                bentoCuratorBadge.textContent = '⏳ PENDIENTE';
                bentoCuratorBadge.style.background = 'rgba(251, 191, 36, 0.18)';
                bentoCuratorBadge.style.color = '#fbbf24';
            } else {
                bentoCuratorBadge.textContent = '🔒 SOLICITAR';
                bentoCuratorBadge.style.background = 'rgba(168, 85, 247, 0.2)';
                bentoCuratorBadge.style.color = '#e9d5ff';
            }
        }
    }

    if (isOwner && adminPendingBadge) {
        const st = getAccessRequestsState();
        let pendingCount = 0;
        Object.values(st.users || {}).forEach(u => {
            if (u.curator === 'pending') pendingCount++;
            if (u.wrapped === 'pending') pendingCount++;
        });
        if (pendingCount > 0) {
            adminPendingBadge.textContent = `${pendingCount} nueva${pendingCount === 1 ? '' : 's'}`;
            adminPendingBadge.className = 'badge rounded-pill bg-danger text-white fw-bold';
        } else {
            adminPendingBadge.textContent = 'Al día';
            adminPendingBadge.className = 'badge rounded-pill bg-secondary bg-opacity-25 text-secondary';
        }
    }
}

function openFeatureRequestModal(feature) {
    const modalEl = document.getElementById('featureRequestModal');
    const body = document.getElementById('feature-request-modal-body');
    if (!modalEl || !body) return;

    const { raw } = getCurrentNormalizedUser();
    const status = getUserFeatureStatus(feature);
    const isCurator = feature === 'curator';
    const title = isCurator ? 'Curador de Playlists Semestrales' : 'Wrapped & Pistas Musicales';
    const icon = isCurator ? 'fa-wand-magic-sparkles text-primary' : 'fa-gift text-warning';
    const desc = isCurator
        ? 'Selecciona y organiza tus mejores ~18 canciones de cada semestre con filtros inteligentes.'
        : 'Descubre pistas quincenales sobre tus artistas y canciones rumbo a tu Wrapped anual.';

    body.innerHTML = `
        <div class="mb-3 d-inline-flex align-items-center justify-content-center rounded-circle" style="width: 68px; height: 68px; background: rgba(168, 85, 247, 0.14); border: 1px solid rgba(168, 85, 247, 0.35);">
            <i class="fa-solid ${icon} fs-2"></i>
        </div>
        <h5 class="fw-bold text-white mb-1">${title}</h5>
        <p class="text-secondary small mb-3">${desc}</p>

        <div class="p-3 rounded-3 border border-secondary border-opacity-20 mb-3 text-start" style="background: rgba(255,255,255,0.02); font-size: 0.78rem;">
            <div class="d-flex align-items-center justify-content-between mb-1">
                <span class="text-secondary">Usuario solicitante:</span>
                <strong class="text-white">@${escapeHtml(raw || 'Invitado')}</strong>
            </div>
            <div class="d-flex align-items-center justify-content-between">
                <span class="text-secondary">Estado del acceso:</span>
                ${status === 'pending'
                    ? '<span class="badge bg-warning bg-opacity-20 text-warning border border-warning border-opacity-30">⏳ Pendiente de aprobación</span>'
                    : '<span class="badge bg-secondary bg-opacity-25 text-secondary">🔒 Requiere autorización del Admin</span>'}
            </div>
        </div>

        ${status === 'pending' ? `
            <div class="alert alert-warning py-2 px-3 small mb-3" style="font-size: 0.76rem; background: rgba(251, 191, 36, 0.1); border-color: rgba(251, 191, 36, 0.3); color: #fde68a;">
                <i class="fa-regular fa-clock me-1"></i>Tu solicitud ya fue enviada al administrador. En cuanto la apruebe, tendrás acceso inmediato.
            </div>
            <button type="button" class="btn btn-brand w-100 rounded-pill py-2 fw-semibold" onclick="checkMyApprovalNow('${feature}')">
                <i class="fa-solid fa-arrows-rotate me-1.5"></i>Verificar si ya fui aprobado
            </button>
        ` : `
            <button type="button" class="btn btn-brand w-100 rounded-pill py-2.5 fw-bold shadow" onclick="submitFeatureAccessRequest('${feature}')">
                <i class="fa-solid fa-paper-plane me-1.5"></i>Solicitar Acceso al Administrador
            </button>
        `}
    `;

    bootstrap.Modal.getOrCreateInstance(modalEl).show();
}
window.openFeatureRequestModal = openFeatureRequestModal;

async function submitFeatureAccessRequest(feature) {
    const { raw, key } = getCurrentNormalizedUser();
    if (!key) {
        alert('Primero conecta tu usuario de Last.fm para solicitar acceso.');
        return;
    }
    const st = getAccessRequestsState();
    if (!st.users[key]) {
        st.users[key] = { username: raw, curator: 'none', wrapped: 'none', updatedAt: new Date().toISOString() };
    }
    st.users[key].username = raw;
    st.users[key][feature] = 'pending';
    st.users[key].updatedAt = new Date().toISOString();

    await pushAccessRequestsToCloud();
    openFeatureRequestModal(feature);
    if (typeof showEngagementToast === 'function') {
        showEngagementToast('<i class="fa-solid fa-paper-plane text-info"></i>', 'Solicitud Enviada', 'El administrador recibirá tu solicitud para activar esta función.');
    }
}
window.submitFeatureAccessRequest = submitFeatureAccessRequest;

async function checkMyApprovalNow(feature) {
    await syncAccessRequestsFromCloud(false);
    const status = getUserFeatureStatus(feature);
    if (status === 'approved') {
        const modalEl = document.getElementById('featureRequestModal');
        bootstrap.Modal.getInstance(modalEl)?.hide();
        if (feature === 'curator') {
            switchAppView('curator');
        } else {
            openWrappedHintModal(true);
        }
    } else {
        openFeatureRequestModal(feature);
        if (typeof showEngagementToast === 'function') {
            showEngagementToast('<i class="fa-regular fa-clock text-warning"></i>', 'Aún pendiente', 'El administrador todavía no ha aprobado la solicitud.');
        }
    }
}
window.checkMyApprovalNow = checkMyApprovalNow;

async function openAdminRequestsModal() {
    if (!isAppOwner()) return;
    const modalEl = document.getElementById('adminRequestsModal');
    if (!modalEl) return;
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
    renderAdminRequestsList();
    await syncAccessRequestsFromCloud(true);
}
window.openAdminRequestsModal = openAdminRequestsModal;

function renderAdminRequestsList() {
    const container = document.getElementById('admin-requests-list');
    if (!container) return;
    const st = getAccessRequestsState();
    const entries = Object.entries(st.users || {});

    if (entries.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4 text-secondary border border-secondary border-opacity-15 rounded-3" style="background: rgba(255,255,255,0.01);">
                <i class="fa-solid fa-inbox fs-3 mb-2 opacity-50 d-block"></i>
                <span class="small">Aún no hay solicitudes de amigos registradas.</span>
            </div>
        `;
        return;
    }

    entries.sort((a, b) => {
        const aPend = (a[1].curator === 'pending' || a[1].wrapped === 'pending') ? 1 : 0;
        const bPend = (b[1].curator === 'pending' || b[1].wrapped === 'pending') ? 1 : 0;
        if (aPend !== bPend) return bPend - aPend;
        return (b[1].updatedAt || '').localeCompare(a[1].updatedAt || '');
    });

    container.innerHTML = entries.map(([uKey, u]) => {
        const cur = u.curator || 'none';
        const wrp = u.wrapped || 'none';
        const badgeFor = (val) => {
            if (val === 'approved') return '<span class="badge bg-success bg-opacity-25 text-success">✓ Aprobado</span>';
            if (val === 'pending') return '<span class="badge bg-warning text-dark fw-bold">⏳ Solicita Acceso</span>';
            return '<span class="badge bg-secondary bg-opacity-25 text-secondary">Sin acceso</span>';
        };
        return `
            <div class="p-3 rounded-3 border border-secondary border-opacity-20" style="background: rgba(255,255,255,0.03);">
                <div class="d-flex align-items-center justify-content-between mb-2">
                    <div class="d-flex align-items-center gap-2">
                        <i class="fa-brands fa-lastfm text-danger"></i>
                        <strong class="text-white" style="font-size: 0.9rem;">@${escapeHtml(u.username || uKey)}</strong>
                    </div>
                    <div class="d-flex gap-1.5">
                        <button type="button" class="btn btn-sm btn-success rounded-pill px-2.5 py-0.5 fw-semibold" style="font-size: 0.70rem;" onclick="adminSetUserFeatureStatus('${escapeJsStr(uKey)}', 'both', 'approved')">
                            ✓ Aprobar Todo
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-danger rounded-pill px-2 py-0.5" style="font-size: 0.70rem;" onclick="adminSetUserFeatureStatus('${escapeJsStr(uKey)}', 'both', 'none')" title="Revocar permisos">
                            <i class="fa-solid fa-ban"></i>
                        </button>
                    </div>
                </div>
                <div class="row g-2 pt-2 border-top border-secondary border-opacity-10" style="font-size: 0.75rem;">
                    <div class="col-12 col-sm-6 d-flex align-items-center justify-content-between">
                        <span class="text-secondary"><i class="fa-solid fa-wand-magic-sparkles text-primary me-1"></i>Curador: ${badgeFor(cur)}</span>
                        <button type="button" class="btn btn-sm ${cur === 'approved' ? 'btn-outline-secondary' : 'btn-outline-success'} py-0 px-2 rounded-pill" style="font-size: 0.68rem;" onclick="adminSetUserFeatureStatus('${escapeJsStr(uKey)}', 'curator', '${cur === 'approved' ? 'none' : 'approved'}')">
                            ${cur === 'approved' ? 'Quitar' : 'Aprobar'}
                        </button>
                    </div>
                    <div class="col-12 col-sm-6 d-flex align-items-center justify-content-between">
                        <span class="text-secondary"><i class="fa-solid fa-gift text-warning me-1"></i>Wrapped: ${badgeFor(wrp)}</span>
                        <button type="button" class="btn btn-sm ${wrp === 'approved' ? 'btn-outline-secondary' : 'btn-outline-success'} py-0 px-2 rounded-pill" style="font-size: 0.68rem;" onclick="adminSetUserFeatureStatus('${escapeJsStr(uKey)}', 'wrapped', '${wrp === 'approved' ? 'none' : 'approved'}')">
                            ${wrp === 'approved' ? 'Quitar' : 'Aprobar'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

async function adminSetUserFeatureStatus(uKey, feature, newStatus) {
    const st = getAccessRequestsState();
    if (!st.users[uKey]) {
        st.users[uKey] = { username: uKey, curator: 'none', wrapped: 'none', updatedAt: new Date().toISOString() };
    }
    if (feature === 'both') {
        st.users[uKey].curator = newStatus;
        st.users[uKey].wrapped = newStatus;
    } else {
        st.users[uKey][feature] = newStatus;
    }
    st.users[uKey].updatedAt = new Date().toISOString();
    await pushAccessRequestsToCloud();
    renderAdminRequestsList();
}
window.adminSetUserFeatureStatus = adminSetUserFeatureStatus;

async function adminManualGrantAll() {
    const inp = document.getElementById('admin-manual-user-input');
    const raw = inp ? inp.value.trim() : '';
    if (!raw) return;
    const uKey = raw.toLowerCase();
    const st = getAccessRequestsState();
    st.users[uKey] = {
        username: raw,
        curator: 'approved',
        wrapped: 'approved',
        updatedAt: new Date().toISOString()
    };
    if (inp) inp.value = '';
    await pushAccessRequestsToCloud();
    renderAdminRequestsList();
}
window.adminManualGrantAll = adminManualGrantAll;

function applyRoleBasedUI() {
    const isOwner = isAppOwner();
    const isDemo = isDemoMode();

    document.querySelectorAll('.owner-only-element').forEach(el => {
        if (isOwner) el.classList.remove('d-none');
        else el.classList.add('d-none');
    });

    document.querySelectorAll('.non-owner-element').forEach(el => {
        if (!isOwner) el.classList.remove('d-none');
        else el.classList.add('d-none');
    });

    document.querySelectorAll('.demo-hide-element').forEach(el => {
        if (isDemo) el.classList.add('d-none');
        else el.classList.remove('d-none');
    });

    document.querySelectorAll('.demo-only-element').forEach(el => {
        if (isDemo) el.classList.remove('d-none');
        else el.classList.add('d-none');
    });

    updateFeatureAccessBadges();
    syncAccessRequestsFromCloud(false);
    if (typeof renderPeriodSelectOptions === 'function') {
        renderPeriodSelectOptions(currentRange);
    }
}
window.applyRoleBasedUI = applyRoleBasedUI;

// ----------------------------------------------------
// TIDAL ESTIMATES & CUSTOM STREAM OVERRIDES SYSTEM
// ----------------------------------------------------
let tidalEstimates = null;
let rawDefaultTidalEstimates = null;
let isTidalLoading = false;

function getCustomStreamOverrides() {
    try {
        const raw = localStorage.getItem('spoti_stream_overrides');
        if (raw) {
            const parsed = JSON.parse(raw);
            // Limpieza estricta de artistas removidos de la Era Tidal por solicitud del usuario
            let cleaned = false;
            const blacklist = ['trivium', 'lifecycles', 'death', 'michaeljackson'];
            if (parsed.artists) {
                Object.keys(parsed.artists).forEach(ak => {
                    const normAk = normalizeKey(ak);
                    if (blacklist.includes(normAk)) {
                        delete parsed.artists[ak];
                        cleaned = true;
                    }
                });
            }
            if (parsed.tracks) {
                Object.keys(parsed.tracks).forEach(tk => {
                    const normTk = normalizeKey(tk);
                    if (blacklist.some(b => normTk.includes(b))) {
                        delete parsed.tracks[tk];
                        cleaned = true;
                    }
                });
            }
            if (cleaned) {
                localStorage.setItem('spoti_stream_overrides', JSON.stringify(parsed));
                if (typeof saveProfileState === 'function') {
                    const st = getProfileState();
                    st.streamOverrides = parsed;
                    saveProfileState();
                }
            }
            return parsed;
        }
    } catch (e) {
        console.warn('Error reading spoti_stream_overrides:', e);
    }
    return { tracks: {}, artists: {} };
}

function saveCustomStreamOverridesToStorage(overrides, skipCloudPush = false) {
    try {
        localStorage.setItem('spoti_stream_overrides', JSON.stringify(overrides));
        if (!skipCloudPush && typeof saveProfileState === 'function') {
            const st = getProfileState();
            st.streamOverrides = overrides;
            saveProfileState();
        }
    } catch (e) {
        console.warn('Error saving spoti_stream_overrides:', e);
    }
}

function getCustomOverrideDeltaPlays(yearFilter = null) {
    if (!tidalEstimates || !rawDefaultTidalEstimates) return 0;
    let curSum = 0;
    let defSum = 0;
    Object.values(tidalEstimates.tracks || {}).forEach(t => {
        curSum += yearFilter ? (t.years?.[yearFilter] || 0) : (t.plays || 0);
    });
    Object.values(rawDefaultTidalEstimates.tracks || {}).forEach(t => {
        defSum += yearFilter ? (t.years?.[yearFilter] || 0) : (t.plays || 0);
    });
    return curSum - defSum;
}

function applyCustomOverridesToTidal() {
    if (!rawDefaultTidalEstimates) {
        if (tidalEstimates) {
            rawDefaultTidalEstimates = JSON.parse(JSON.stringify(tidalEstimates));
        } else {
            return;
        }
    }
    if (!isAppOwner()) {
        tidalEstimates = { period: 'Sin Era Tidal', totalPlays: 0, tracks: {}, artists: {} };
        return;
    }
    tidalEstimates = JSON.parse(JSON.stringify(rawDefaultTidalEstimates));
    const overrides = getCustomStreamOverrides();

    // 1. Tracks overrides
    if (overrides.tracks) {
        tidalEstimates.tracks = tidalEstimates.tracks || {};
        Object.entries(overrides.tracks).forEach(([k, ovr]) => {
            const plays = Math.max(0, parseInt(ovr.plays, 10) || 0);
            if (ovr.deleted) {
                delete tidalEstimates.tracks[k];
            } else {
                const existing = tidalEstimates.tracks[k] || {};
                const y25 = ovr.years?.['2025'] !== undefined ? ovr.years['2025'] : Math.round(plays * 0.35);
                const y26 = ovr.years?.['2026'] !== undefined ? ovr.years['2026'] : (plays - y25);
                tidalEstimates.tracks[k] = {
                    name: ovr.name || existing.name || '',
                    artist: ovr.artist || existing.artist || '',
                    album: ovr.album || existing.album || '',
                    plays: plays,
                    years: { "2025": y25, "2026": y26 },
                    months: ovr.months || existing.months || {}
                };
            }
        });
    }

    // 2. Artists overrides
    if (overrides.artists) {
        tidalEstimates.artists = tidalEstimates.artists || {};
        Object.entries(overrides.artists).forEach(([k, ovr]) => {
            const plays = Math.max(0, parseInt(ovr.plays, 10) || 0);
            if (ovr.deleted) {
                delete tidalEstimates.artists[k];
            } else {
                const matchedKey = Object.keys(tidalEstimates.artists).find(ak => normalizeKey(ak) === normalizeKey(k)) || ovr.name || k;
                const existing = tidalEstimates.artists[matchedKey] || {};
                const y25 = ovr.years?.['2025'] !== undefined ? ovr.years['2025'] : Math.round(plays * 0.35);
                const y26 = ovr.years?.['2026'] !== undefined ? ovr.years['2026'] : (plays - y25);
                tidalEstimates.artists[matchedKey] = {
                    plays: plays,
                    years: { "2025": y25, "2026": y26 }
                };
            }
        });
    }
}

async function loadTidalEstimates() {
    if (!isAppOwner()) {
        tidalEstimates = { period: 'Sin Era Tidal', totalPlays: 0, tracks: {}, artists: {} };
        return tidalEstimates;
    }
    if (tidalEstimates) return tidalEstimates;
    if (isTidalLoading) {
        while (isTidalLoading) {
            await new Promise(r => setTimeout(r, 100));
        }
        return tidalEstimates;
    }
    isTidalLoading = true;
    try {
        const res = await fetch('/data/tidal_estimates.json');
        if (res.ok) {
            rawDefaultTidalEstimates = await res.json();
            applyCustomOverridesToTidal();
            console.log('Era Tidal y ajustes cargados correctamente:', tidalEstimates.period);
        }
    } catch (e) {
        console.warn('No se pudo cargar tidal_estimates.json:', e);
    } finally {
        isTidalLoading = false;
    }
    return tidalEstimates;
}

function setCustomStreamOverride(type, name, artist, plays, year2025, year2026) {
    const overrides = getCustomStreamOverrides();
    const p = Math.max(0, parseInt(plays, 10) || 0);
    const y25 = year2025 !== undefined ? parseInt(year2025, 10) : Math.round(p * 0.35);
    const y26 = year2026 !== undefined ? parseInt(year2026, 10) : (p - y25);

    if (type === 'track') {
        const key = `${normalizeKey(name)}:::${normalizeKey(artist || '')}`;
        overrides.tracks = overrides.tracks || {};
        overrides.tracks[key] = {
            name: name,
            artist: artist || '',
            plays: p,
            years: { "2025": y25, "2026": y26 },
            updatedAt: new Date().toISOString()
        };
    } else if (type === 'artist') {
        const key = normalizeKey(name);
        overrides.artists = overrides.artists || {};
        overrides.artists[key] = {
            name: name,
            plays: p,
            years: { "2025": y25, "2026": y26 },
            updatedAt: new Date().toISOString()
        };
    }
    saveCustomStreamOverridesToStorage(overrides);
    applyCustomOverridesToTidal();
}

function removeCustomStreamOverride(type, name, artist) {
    const overrides = getCustomStreamOverrides();
    if (type === 'track') {
        const key = `${normalizeKey(name)}:::${normalizeKey(artist || '')}`;
        if (overrides.tracks) delete overrides.tracks[key];
    } else if (type === 'artist') {
        const key = normalizeKey(name);
        if (overrides.artists) delete overrides.artists[key];
    }
    saveCustomStreamOverridesToStorage(overrides);
    applyCustomOverridesToTidal();
}

function hasCustomStreamOverride(type, name, artist) {
    const overrides = getCustomStreamOverrides();
    if (type === 'track') {
        const key = `${normalizeKey(name)}:::${normalizeKey(artist || '')}`;
        return !!overrides.tracks?.[key];
    } else if (type === 'artist') {
        const key = normalizeKey(name);
        return !!overrides.artists?.[key];
    }
    return false;
}

const CLIENT_ID = '78c1217f07404df7b95cceb3e7cc6657';
const REDIRECT_URI = window.location.origin + '/callback';

function getLastFmCredentials() {
    if (localStorage.getItem('spoti_logged_out') === 'true') {
        return { user: null, key: null };
    }
    const storedUser = localStorage.getItem('lastfm_user');
    const storedKey = localStorage.getItem('lastfm_key');
    if (storedUser && storedUser.trim()) {
        return { user: storedUser.trim(), key: (storedKey && storedKey.trim()) ? storedKey.trim() : DEFAULT_LASTFM_KEY };
    }
    // Solo si el navegador tiene activado el Modo Dueño sin haber ingresado usuario manual:
    if (localStorage.getItem('tunetracker_owner_mode') === 'true') {
        return { user: DEFAULT_LASTFM_USER, key: DEFAULT_LASTFM_KEY };
    }
    // Para amigos/invitados que no han conectado Last.fm:
    return { user: null, key: null };
}

let accessToken = localStorage.getItem('spotify_access_token') || null;
let currentSource = 'unified'; // 'unified' (Historial Unificado Spotify + Last.fm) | 'spotify' | 'lastfm'
let unifiedDb = null;
let isUnifiedDbLoading = false;
let spotifyDb = null;
let isSpotifyDbLoading = false;
let lastFmRecentDelta = (() => {
    try {
        const raw = localStorage.getItem('tunetracker_delta_cache');
        if (raw) {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) {
                const map = new Map();
                arr.forEach(t => {
                    const u = t?.date?.uts || t?.uts;
                    if (u) map.set(`${u}:::${t.name}`, t);
                });
                const sorted = Array.from(map.values()).sort((a, b) => {
                    const ub = parseInt(b.date?.uts || b.uts, 10) || 0;
                    const ua = parseInt(a.date?.uts || a.uts, 10) || 0;
                    return ub - ua;
                });
                try { localStorage.setItem('tunetracker_delta_cache', JSON.stringify(sorted)); } catch (_) {}
                return sorted;
            }
        }
    } catch (e) {}
    return [];
})();
let hasFetchedLastFmDelta = false;
let currentRange = 'overall'; // 'overall', 'year-YYYY', 'month-YYYY-M' o Last.fm periods
let currentType = 'tracks';  // tracks, artists, albums, recent
let currentLimit = 50;
let userProfileData = null;
let currentLoadedItems = []; // Para compartir en tarjeta

// Fallback visual inline para carátulas sin internet (0 peticiones de red, previene bucles)
const FALLBACK_ART_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40' width='40' height='40'%3E%3Crect width='40' height='40' fill='%231c1c24' rx='6'/%3E%3Cpath d='M16 14v12l10-6z' fill='%2364748b'/%3E%3C/svg%3e";

function safeImgError(img) {
    if (!img) return;
    img.onerror = null; // Rompe de inmediato cualquier bucle de reintento
    img.src = FALLBACK_ART_SVG;
}
window.safeImgError = safeImgError;

// Fallback visual para avatares de usuario (perfil siempre nítido, sin icono roto)
const DEFAULT_AVATAR_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 44 44' width='44' height='44'%3E%3Crect width='44' height='44' fill='%2318181c' rx='22'/%3E%3Ccircle cx='22' cy='16' r='6' fill='%23a855f7'/%3E%3Cpath d='M10 34c0-5 5.5-8 12-8s12 3 12 8z' fill='%23a855f7'/%3E%3C/svg%3e";

function safeAvatarError(img) {
    if (!img) return;
    img.onerror = null;
    img.src = DEFAULT_AVATAR_SVG;
}
window.safeAvatarError = safeAvatarError;

// PWA: Registrar Service Worker con detección de actualizaciones
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((registration) => {
            // Actualizaciones en vivo: buscar nueva version cada minuto y al volver a la app
            const checkForAppUpdate = () => { if (navigator.onLine) registration.update().catch(() => {}); };
            setInterval(checkForAppUpdate, 60000);
            document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkForAppUpdate(); });
            window.addEventListener('focus', checkForAppUpdate);
            registration.onupdatefound = () => {
                const installingWorker = registration.installing;
                if (installingWorker) {
                    installingWorker.onstatechange = () => {
                        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            const toast = document.getElementById('update-toast');
                            if (toast) {
                                toast.classList.remove('d-none');
                                toast.classList.add('d-flex');
                            }
                        }
                    };
                }
            };
        }).catch(err => {
            console.log('SW registration error:', err);
        });
    });
}

// Elementos DOM
const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');
const navActions = document.getElementById('nav-actions');
const userImg = document.getElementById('user-img');
const drawerUserImg = document.getElementById('drawer-user-img');
const drawerUserName = document.getElementById('drawer-user-name');
const drawerUserFollowers = document.getElementById('drawer-user-followers');
const btnLogin = document.getElementById('btn-login');
const statsList = document.getElementById('stats-list');
const loader = document.getElementById('loader');
const currentlyPlayingContainer = document.getElementById('currently-playing-container');

// Toolbar Desplegables DOM
const selectDataSource = document.getElementById('select-data-source');
const selectTimePeriod = document.getElementById('select-time-period');
const selectMonth = document.getElementById('select-month');
const selectLimit = document.getElementById('select-page-size') || document.getElementById('select-limit');
const customDatePickerContainer = document.getElementById('custom-date-container') || document.getElementById('custom-date-picker-container');
const inputDateFrom = document.getElementById('input-date-from');
const inputDateTo = document.getElementById('input-date-to');
const btnSwapDates = document.getElementById('btn-swap-dates');
const btnApplyCustomDates = document.getElementById('btn-apply-custom-dates');

// Playlist Curator DOM
const playlistCuratorModalEl = document.getElementById('playlistCuratorModal');
const btnOpenCuratorNav = document.getElementById('btn-open-curator-nav');
const menuOpenCurator = document.getElementById('menu-open-curator');
const curatorYear = document.getElementById('curator-year');
const curatorHalf = document.getElementById('curator-half');
const curatorPlaylistName = document.getElementById('curator-playlist-name');
const curatorBtnSaveCloud = document.getElementById('curator-btn-save-cloud');
const curatorTargetCount = document.getElementById('curator-target-count');
const curatorExcludePast = document.getElementById('curator-exclude-past');
const curatorBtnGenerate = document.getElementById('curator-btn-generate');
const curatorPeriodBadge = document.getElementById('curator-period-badge');
const curatorCounterBadge = document.getElementById('curator-counter-badge');
const curatorTabSelected = document.getElementById('curator-tab-selected');
const curatorTabBench = document.getElementById('curator-tab-bench');
const curatorSelectedNum = document.getElementById('curator-selected-num');
const curatorBenchNum = document.getElementById('curator-bench-num');
const curatorSelectedView = document.getElementById('curator-selected-view');
const curatorBenchView = document.getElementById('curator-bench-view');
const curatorSelectedList = document.getElementById('curator-selected-list');
const curatorBenchList = document.getElementById('curator-bench-list');
const curatorBenchSearch = document.getElementById('curator-bench-search');
const curatorBtnCopy = document.getElementById('curator-btn-copy');
const curatorBtnClear = document.getElementById('curator-btn-clear');
const curatorBtnYtMusic = document.getElementById('curator-btn-ytmusic');
const curatorBtnSpotify = document.getElementById('curator-btn-spotify');

// Stat Strip DOM
const statStrip = document.getElementById('stat-strip');
const stripPlaycount = document.getElementById('strip-playcount');
const stripHoursWrapper = document.getElementById('strip-hours-wrapper');
const stripHoursDot = document.getElementById('strip-hours-dot');
const stripHours = document.getElementById('strip-hours');
const stripArtists = document.getElementById('strip-artists');
const stripAlbums = document.getElementById('strip-albums');

// PWA Update DOM
const updateToast = document.getElementById('update-toast');
const btnApplyUpdate = document.getElementById('btn-apply-update');
const menuForceUpdate = document.getElementById('menu-force-update');

// Last.fm Modal & Drawer DOM
const drawerLastFmStatus = document.getElementById('drawer-lastfm-status');
const lastFmModalEl = document.getElementById('lastFmModal');
const lastFmUsernameInput = document.getElementById('lastfm-username-input');
const lastFmApiKeyInput = document.getElementById('lastfm-apikey-input');
const btnLastFmSave = document.getElementById('btn-lastfm-save');
const btnLastFmDisconnect = document.getElementById('btn-lastfm-disconnect');
const lastFmError = document.getElementById('lastfm-error');

// Menu Drawer Items
const filterSearchInput = document.getElementById('filter-search-input');
const menuOpenHabits = document.getElementById('menu-open-habits');
const menuOpenForgotten = document.getElementById('menu-open-forgotten');
const menuOpenVersus = document.getElementById('menu-open-versus');
const menuOpenRecords = document.getElementById('menu-open-records');
const menuSavePlaylist = document.getElementById('menu-save-playlist');
const menuOpenShare = document.getElementById('menu-open-share');
const menuLastFmConnect = document.getElementById('menu-lastfm-connect');
const menuGdriveConnect = document.getElementById('menu-gdrive-connect');
const gdriveModalEl = document.getElementById('gdriveModal');
const gdriveStatusCard = document.getElementById('gdrive-status-card');
const gdriveStatusTitle = document.getElementById('gdrive-status-title');
const gdriveStatusDesc = document.getElementById('gdrive-status-desc');
const gdriveSyncBadge = document.getElementById('gdrive-sync-badge');
const drawerGdriveStatus = document.getElementById('drawer-gdrive-status');
const curatorBtnCloud = document.getElementById('curator-btn-cloud');
const curatorCloudLabel = document.getElementById('curator-cloud-label');
const gdriveClientIdInput = document.getElementById('gdrive-client-id-input');
const btnGdriveSaveId = document.getElementById('btn-gdrive-save-id');
const btnGdriveAuth = document.getElementById('btn-gdrive-auth');
const btnGdriveAuthText = document.getElementById('btn-gdrive-auth-text');
const btnGdriveUpload = document.getElementById('btn-gdrive-upload');
const btnGdriveDownload = document.getElementById('btn-gdrive-download');
const btnGdriveLogout = document.getElementById('btn-gdrive-logout');
const gdriveAutosyncToggle = document.getElementById('gdrive-autosync-toggle');
const gdriveAlert = document.getElementById('gdrive-alert');
const menuInstallApp = document.getElementById('menu-install-app');
const menuLogout = document.getElementById('menu-logout');

// Share Modal Elements
const shareCardModal = document.getElementById('shareCardModal');
const btnDownloadCard = document.getElementById('btn-download-card');

// Botones de instalación PWA
let deferredPrompt = null;
const btnInstallLogin = document.getElementById('btn-install-login');
const btnInstallFab = document.getElementById('btn-install-fab');
const installModalEl = document.getElementById('installModal');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

async function triggerInstallFlow() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            if (btnInstallLogin) btnInstallLogin.classList.add('d-none');
            if (btnInstallFab) btnInstallFab.classList.add('d-none');
        }
        deferredPrompt = null;
    } else {
        const modal = bootstrap.Modal.getOrCreateInstance(installModalEl);
        modal.show();
    }
}

// ----------------------------------------------------
// UTILIDADES
// ----------------------------------------------------

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
window.escapeHtml = escapeHtml;

function escapeJsStr(str) {
    if (!str) return '';
    return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
window.escapeJsStr = escapeJsStr;

function formatNumber(num) {
    if (!num) return '0';
    const n = parseInt(num, 10);
    if (isNaN(n)) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString();
}

function normalizeKey(str) {
    return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function formatDate(timestampUTS) {
    if (!timestampUTS) return '';
    const date = new Date(parseInt(timestampUTS, 10) * 1000);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Hoy, ${time}`;
    if (isYesterday) return `Ayer, ${time}`;
    return `${date.toLocaleDateString([], { day: '2-digit', month: 'short' })}, ${time}`;
}

const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];
const MONTH_SHORT_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function getThisWeekDateRange() {
    const now = new Date();
    const dayOfWeek = (now.getDay() + 6) % 7; // 0=Lun, 1=Mar, ..., 6=Dom
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    const pad = n => String(n).padStart(2, '0');
    const fStr = `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`;
    const tStr = `${sunday.getFullYear()}-${pad(sunday.getMonth() + 1)}-${pad(sunday.getDate())}`;
    return {
        fromD: fStr,
        toD: tStr,
        fromUTS: Math.floor(monday.getTime() / 1000),
        toUTS: Math.floor(sunday.getTime() / 1000)
    };
}

function getLastMonthInfo() {
    const now = new Date();
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevY = String(prevMonthDate.getFullYear());
    const prevM = String(prevMonthDate.getMonth() + 1);
    const paddedM = prevM.padStart(2, '0');
    const ym = `${prevY}-${paddedM}`;
    const lastDay = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1, 0).getDate();
    return {
        prevY,
        prevM,
        ym,
        fromD: `${ym}-01`,
        toD: `${ym}-${String(lastDay).padStart(2, '0')}`
    };
}

function getLast6MonthsRange() {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const pad = n => String(n).padStart(2, '0');
    const fromD = `${sixMonthsAgo.getFullYear()}-${pad(sixMonthsAgo.getMonth() + 1)}-01`;
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const toD = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(lastDay)}`;
    return { fromD, toD };
}

function isDeltaItemInCurrentRange(t, range = currentRange) {
    if (!t) return false;
    let uts = t._uts;
    let isoD = t._isoD;
    let dtYear = t._year;
    let dtMonth = t._month;

    if (uts === undefined) {
        if (!t.date?.uts) return false;
        uts = parseInt(t.date.uts, 10);
        const d = new Date(uts * 1000);
        isoD = d.toISOString().slice(0, 10);
        dtYear = String(d.getFullYear());
        dtMonth = `${dtYear}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        t._uts = uts;
        t._isoD = isoD;
        t._year = dtYear;
        t._month = dtMonth;
        t._normName = normalizeKey(t.name || '');
        t._normArtist = normalizeKey(t.artist ? (t.artist['#text'] || t.artist.name || '') : '');
        t._normAlbum = normalizeKey(t.album ? (t.album['#text'] || t.album.name || '') : '');
    }

    if (!range || range === 'overall' || range === 'era-lastfm') return true;
    if (range === 'this-week' || range === '7day') {
        const { fromUTS, toUTS } = getThisWeekDateRange();
        return uts >= fromUTS && uts <= toUTS;
    }
    if (range === 'last-month' || range === '1month') {
        const lm = getLastMonthInfo();
        return dtMonth === lm.ym;
    }
    if (range === 'last-6-months' || range === '6month') {
        const { fromD, toD } = getLast6MonthsRange();
        return isoD >= fromD && isoD <= toD;
    }
    if (range === 'current-month') {
        const now = new Date();
        const curYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        return dtMonth === curYM;
    }
    if (range === '4weeks') {
        const now = new Date();
        const fourWeeksAgo = new Date(now.getTime() - (28 * 24 * 60 * 60 * 1000));
        return isoD >= fourWeeksAgo.toISOString().slice(0, 10) && isoD <= now.toISOString().slice(0, 10);
    }
    if (range.startsWith('year-')) {
        return dtYear === range.replace('year-', '');
    }
    if (range.startsWith('month-')) {
        const parts = range.replace('month-', '').split('-');
        const rY = parts[0];
        const rM = parts[1];
        const targetYM = `${rY}-${String(parseInt(rM, 10)).padStart(2, '0')}`;
        return dtMonth === targetYM;
    }
    if (range.startsWith('dates_')) {
        const [fromD, toD] = range.replace('dates_', '').split('_to_');
        return isoD >= fromD && isoD <= toD;
    }
    return false;
}

function renderPeriodSelectOptions(selectedVal = currentRange || 'overall') {
    const sel = document.getElementById('select-time-period');
    if (!sel) return;
    const isOwner = isAppOwner();

    // Si el usuario no es admin y está seleccionada una era, resetear a 'overall'
    if (!isOwner && (selectedVal === 'era-spotify' || selectedVal === 'era-tidal' || selectedVal === 'era-lastfm')) {
        selectedVal = 'overall';
        currentRange = 'overall';
    }

    // Normalizar valores legacy si existían
    if (selectedVal === '7day') selectedVal = 'this-week';
    if (selectedVal === '1month') selectedVal = 'last-month';
    if (selectedVal === '6month') selectedVal = 'last-6-months';

    sel.innerHTML = `
        <optgroup label="⚡ Rápido">
            <option value="this-week" ${selectedVal === 'this-week' ? 'selected' : ''}>Esta semana (su semana respectiva)</option>
            <option value="last-month" ${selectedVal === 'last-month' ? 'selected' : ''}>Mes pasado</option>
            <option value="last-6-months" ${selectedVal === 'last-6-months' ? 'selected' : ''}>Hace 6 meses</option>
            <option value="overall" ${selectedVal === 'overall' ? 'selected' : ''}>Histórico Total</option>
        </optgroup>
        <optgroup label="⚙️ Avanzado">
            ${isOwner ? `
            <option value="era-spotify" class="owner-only-element" ${selectedVal === 'era-spotify' ? 'selected' : ''}>Era Spotify (2019 - Ago 2025)</option>
            <option value="era-tidal" class="owner-only-element" ${selectedVal === 'era-tidal' ? 'selected' : ''}>Era Tidal (Ago 2025 - Jul 2026 ≈)</option>
            <option value="era-lastfm" class="owner-only-element" ${selectedVal === 'era-lastfm' ? 'selected' : ''}>Nueva Era Last.fm (Ago 2025 - Hoy)</option>
            ` : ''}
            <option value="year-2026" ${selectedVal === 'year-2026' ? 'selected' : ''}>Año 2026</option>
            <option value="year-2025" ${selectedVal === 'year-2025' ? 'selected' : ''}>Año 2025</option>
            <option value="year-2024" ${selectedVal === 'year-2024' ? 'selected' : ''}>Año 2024</option>
            <option value="year-2023" ${selectedVal === 'year-2023' ? 'selected' : ''}>Año 2023</option>
            <option value="year-2022" ${selectedVal === 'year-2022' ? 'selected' : ''}>Año 2022</option>
            <option value="year-2021" ${selectedVal === 'year-2021' ? 'selected' : ''}>Año 2021</option>
            <option value="year-2020" ${selectedVal === 'year-2020' ? 'selected' : ''}>Año 2020</option>
            <option value="year-2019" ${selectedVal === 'year-2019' ? 'selected' : ''}>Año 2019</option>
            <option value="custom" ${selectedVal === 'custom' || (selectedVal && selectedVal.startsWith('dates_')) ? 'selected' : ''}>Rango de Fechas...</option>
        </optgroup>
    `;
    sel.value = selectedVal;
}
window.renderPeriodSelectOptions = renderPeriodSelectOptions;

function getRangeLabel(range) {
    if (range === 'this-week' || range === '7day') return 'Esta semana';
    if (range === 'last-month' || range === '1month') return 'Mes pasado';
    if (range === 'last-6-months' || range === '6month') return 'Hace 6 meses';
    if (range === 'current-month') return 'Este Mes';
    if (range === '4weeks') return 'Últimas 4 Semanas';
    if (range === 'era-spotify') return 'Era Spotify (2019 - Ago 2025)';
    if (range === 'era-tidal') return 'Era Tidal (Ago 2025 - Jul 2026 ≈ Estimado)';
    if (range === 'era-lastfm') return 'Nueva Era / Streaming (Ago 2025 - Actualidad)';
    if (range && range.startsWith('dates_')) {
        const [fromD, toD] = range.replace('dates_', '').split('_to_');
        const [fy, fm, fd] = fromD.split('-');
        const [ty, tm, td] = toD.split('-');
        const fMonth = MONTH_SHORT_NAMES[parseInt(fm, 10) - 1] || fm;
        const tMonth = MONTH_SHORT_NAMES[parseInt(tm, 10) - 1] || tm;
        return `${parseInt(fd, 10)} ${fMonth} ${fy} — ${parseInt(td, 10)} ${tMonth} ${ty}`;
    }
    if (range && range.startsWith('month-')) {
        const parts = range.split('-'); // ['month', '2026', '9']
        const year = parts[1];
        const monthNum = parseInt(parts[2], 10);
        return `${MONTH_NAMES[monthNum - 1]} ${year}`;
    }
    if (range && range.startsWith('year-')) return `Año ${range.replace('year-', '')}`;
    if (range === '3month') return 'Últimos 3 Meses';
    if (range === '12month') return 'Último Año';
    if (range === 'overall') return 'Histórico Total';
    return range;
}

// ----------------------------------------------------
// EVENT LISTENERS & INICIALIZACIÓN
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
    setupEventListeners();
    updateCloudUI('active');

    const authLoadingView = document.getElementById('auth-loading-view');
    const isLoggedOut = localStorage.getItem('spoti_logged_out') === 'true';

    const hasLastFm = !!(localStorage.getItem('lastfm_user') && localStorage.getItem('lastfm_user').trim());
    const hasOwner = localStorage.getItem('tunetracker_owner_mode') === 'true';
    const isAuthenticated = !isLoggedOut && (hasLastFm || hasOwner);

    if (authLoadingView) authLoadingView.classList.add('d-none');

    if (isAuthenticated) {
        isDemoSession = false;
        sessionStorage.removeItem('tunetracker_demo_session');
        showDashboard();
    } else {
        showLogin();
    }
});

function setupEventListeners() {
    // Navegación Desktop Tabs
    document.querySelectorAll('.desktop-nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.currentTarget.getAttribute('data-tab');
            switchAppView(tab);
        });
    });

    // Login con Last.fm directo en pantalla de bienvenida
    const loginLastFmInput = document.getElementById('login-lastfm-input');
    const btnLoginLastFmSubmit = document.getElementById('btn-login-lastfm-submit');
    const loginLastFmError = document.getElementById('login-lastfm-error');

    async function processLastFmLogin() {
        const user = loginLastFmInput ? loginLastFmInput.value.trim() : '';
        if (!user) {
            if (loginLastFmError) {
                loginLastFmError.textContent = 'Por favor ingresa tu nombre de usuario de Last.fm.';
                loginLastFmError.classList.remove('d-none');
            }
            if (loginLastFmInput) loginLastFmInput.focus();
            return;
        }

        if (btnLoginLastFmSubmit) {
            btnLoginLastFmSubmit.disabled = true;
            btnLoginLastFmSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-1.5"></span> Conectando...';
        }
        if (loginLastFmError) loginLastFmError.classList.add('d-none');

        try {
            let testRes = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${encodeURIComponent(user)}&api_key=${encodeURIComponent(DEFAULT_LASTFM_KEY)}&format=json`);
            let testData = await testRes.json();

            if (testData.error === 8) {
                await new Promise(r => setTimeout(r, 1200));
                testRes = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${encodeURIComponent(user)}&api_key=${encodeURIComponent(DEFAULT_LASTFM_KEY)}&format=json`);
                testData = await testRes.json();
            }

            if (testData.error) {
                if (loginLastFmError) {
                    loginLastFmError.textContent = `No se encontró el usuario "${user}" en Last.fm. Verifica que esté bien escrito.`;
                    loginLastFmError.classList.remove('d-none');
                }
                return;
            }

            localStorage.removeItem('spoti_logged_out');
            localStorage.setItem('lastfm_user', user);
            localStorage.setItem('lastfm_key', DEFAULT_LASTFM_KEY);
            isDemoSession = false;
            sessionStorage.removeItem('tunetracker_demo_session');
            unifiedDb = null;
            applyRoleBasedUI();
            showDashboard();
        } catch (e) {
            if (loginLastFmError) {
                loginLastFmError.textContent = 'Error al conectar con los servidores de Last.fm. Intenta de nuevo.';
                loginLastFmError.classList.remove('d-none');
            }
        } finally {
            if (btnLoginLastFmSubmit) {
                btnLoginLastFmSubmit.disabled = false;
                btnLoginLastFmSubmit.innerHTML = '<i class="fa-brands fa-lastfm me-1.5"></i> Conectar y Entrar';
            }
        }
    }

    if (btnLoginLastFmSubmit) {
        btnLoginLastFmSubmit.addEventListener('click', processLastFmLogin);
    }
    if (loginLastFmInput) {
        loginLastFmInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                processLastFmLogin();
            }
        });
    }

    const btnLoginDemo = document.getElementById('btn-login-demo');
    if (btnLoginDemo) {
        btnLoginDemo.addEventListener('click', () => {
            localStorage.removeItem('spoti_logged_out');
            isDemoSession = true;
            sessionStorage.setItem('tunetracker_demo_session', 'true');
            unifiedDb = null;
            showDashboard();
        });
    }

    const btnLoginLastFm = document.getElementById('btn-login-lastfm');
    if (btnLoginLastFm) {
        btnLoginLastFm.addEventListener('click', () => {
            localStorage.removeItem('spoti_logged_out');
            isDemoSession = false;
            sessionStorage.removeItem('tunetracker_demo_session');
        });
    }

    // Last.fm Secondary Navigation Tabs (Temas, Artistas, Álbumes, Scrobbles)
    document.querySelectorAll('#content-type-tabs .lastfm-nav-tab, #content-type-tabs .segmented-tab').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('#content-type-tabs .lastfm-nav-tab, #content-type-tabs .segmented-tab').forEach(b => b.classList.remove('active'));
            const target = e.currentTarget;
            target.classList.add('active');
            currentType = target.getAttribute('data-type');
            loadStats();
        });
    });

    // Toolbar Desplegables
    if (selectDataSource) {
        selectDataSource.addEventListener('change', (e) => {
            switchDataSource(e.target.value);
        });
    }

    if (selectTimePeriod) {
        selectTimePeriod.addEventListener('change', (e) => {
            handleTimePeriodChange(e.target.value);
        });
    }

    if (selectMonth) {
        selectMonth.addEventListener('change', (e) => {
            handleMonthChange(e.target.value);
        });
    }

    if (selectLimit) {
        selectLimit.addEventListener('change', (e) => {
            currentLimit = parseInt(e.target.value, 10);
            loadStats();
        });
    }

    if (btnApplyCustomDates) {
        btnApplyCustomDates.addEventListener('click', applyCustomDateRange);
    }
    if (btnSwapDates) {
        btnSwapDates.addEventListener('click', (e) => {
            e.preventDefault();
            const icon = btnSwapDates.querySelector('i');
            if (icon) {
                icon.style.transform = (icon.style.transform === 'rotate(180deg)') ? 'rotate(0deg)' : 'rotate(180deg)';
                icon.style.transition = 'transform 0.25s ease';
            }
            if (inputDateFrom && inputDateTo) {
                const currentTo = inputDateTo.value;
                if (currentTo) {
                    inputDateFrom.value = currentTo;
                }
                // Al hacerlo, que el seleccionador de la derecha se resetee
                inputDateTo.value = '';
                inputDateTo.focus();
            }
        });
    }
    if (inputDateFrom) {
        inputDateFrom.addEventListener('change', () => {
            if (selectTimePeriod && selectTimePeriod.value === 'custom' && inputDateTo?.value) {
                applyCustomDateRange();
            }
        });
    }
    if (inputDateTo) {
        inputDateTo.addEventListener('change', () => {
            if (selectTimePeriod && selectTimePeriod.value === 'custom' && inputDateTo.value) {
                applyCustomDateRange();
            }
        });
    }

    // Modal: Preservar scroll de la página de fondo sin que se reinicie ni suba arriba
    let savedModalScrollY = 0;
    document.addEventListener('show.bs.modal', () => {
        savedModalScrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    });
    document.addEventListener('shown.bs.modal', () => {
        const currentY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        if (savedModalScrollY > 0 && currentY === 0) {
            window.scrollTo({ top: savedModalScrollY, behavior: 'instant' });
        }
    });
    document.addEventListener('hidden.bs.modal', () => {
        if (typeof savedModalScrollY === 'number') {
            window.scrollTo({ top: savedModalScrollY, behavior: 'instant' });
        }
        // Limpieza de seguridad contra backdrops huérfanos o pantallas bloqueadas
        setTimeout(() => {
            if (!document.querySelector('.modal.show')) {
                document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
                document.body.classList.remove('modal-open');
                document.body.style.removeProperty('padding-right');
                document.body.style.removeProperty('overflow');
            }
        }, 120);
    });

    const itemStatsModalEl = document.getElementById('itemStatsModal');
    if (itemStatsModalEl) {
        itemStatsModalEl.addEventListener('hidden.bs.modal', () => {
            itemStatsHistory = [];
            currentOpenStats = null;
        });
    }
    // Prevenir touchmove detrás del modal en dispositivos táctiles
    document.addEventListener('touchmove', function(e) {
        if (document.body.classList.contains('modal-open')) {
            if (!e.target.closest('.modal-body') && !e.target.closest('.modal-dialog')) {
                e.preventDefault();
            }
        }
    }, { passive: false });

    // Acciones de Actualización PWA / Forzar Limpieza
    if (menuForceUpdate) {
        menuForceUpdate.addEventListener('click', forceAppUpdate);
    }
    if (btnApplyUpdate) {
        btnApplyUpdate.addEventListener('click', forceAppUpdate);
    }

    // Buscador en tiempo real con soporte para escape
    if (filterSearchInput) {
        filterSearchInput.addEventListener('input', handleFilterSearch);
        filterSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                filterSearchInput.value = '';
                if (typeof filterSearchDebounceTimer !== 'undefined' && filterSearchDebounceTimer) {
                    clearTimeout(filterSearchDebounceTimer);
                }
                filterSearchInput.blur();
                renderCurrentItems(currentLoadedItems);
            }
        });
    }

    // Acciones de Análisis y Estadísticas
    if (menuOpenHabits) {
        menuOpenHabits.addEventListener('click', openHabitsModal);
    }
    if (menuOpenForgotten) {
        menuOpenForgotten.addEventListener('click', openForgottenModal);
    }
    if (menuOpenVersus) {
        menuOpenVersus.addEventListener('click', openVersusModal);
    }
    if (menuOpenRecords) {
        menuOpenRecords.addEventListener('click', openRecordsModal);
    }
    if (menuOpenCurator) {
        menuOpenCurator.addEventListener('click', openPlaylistCurator);
    }
    if (btnOpenCuratorNav) {
        btnOpenCuratorNav.addEventListener('click', openPlaylistCurator);
    }

    const menuOpenTrophies = document.getElementById('menu-open-trophies');
    if (menuOpenTrophies) {
        menuOpenTrophies.addEventListener('click', openTrophiesModal);
    }
    const btnOpenTrophiesNav = document.getElementById('btn-open-trophies-nav');
    if (btnOpenTrophiesNav) {
        btnOpenTrophiesNav.addEventListener('click', openTrophiesModal);
    }
    const btnToggleMilestonePush = document.getElementById('btn-toggle-milestone-push');
    if (btnToggleMilestonePush) {
        btnToggleMilestonePush.addEventListener('click', toggleMilestonePushNotifications);
    }
    const btnEnableMilestonePush = document.getElementById('btn-enable-milestone-push');
    if (btnEnableMilestonePush) {
        btnEnableMilestonePush.addEventListener('click', toggleMilestonePushNotifications);
    }

    const menuOpenProgress = document.getElementById('menu-open-progress');
    if (menuOpenProgress) {
        menuOpenProgress.addEventListener('click', openProfileSection);
    }
    const btnOpenProgressNav = document.getElementById('btn-open-progress-nav');
    if (btnOpenProgressNav) {
        btnOpenProgressNav.addEventListener('click', openProfileSection);
    }

    const menuOpenCapsule = document.getElementById('menu-open-capsule');
    if (menuOpenCapsule) {
        menuOpenCapsule.addEventListener('click', openCapsuleModal);
    }
    const menuOpenTrivia = document.getElementById('menu-open-trivia');
    if (menuOpenTrivia) {
        menuOpenTrivia.addEventListener('click', openTriviaModal);
    }
    const menuOpenIceberg = document.getElementById('menu-open-iceberg');
    if (menuOpenIceberg) {
        menuOpenIceberg.addEventListener('click', openIcebergModal);
    }
    const menuOpenEras = document.getElementById('menu-open-eras');
    if (menuOpenEras) {
        menuOpenEras.addEventListener('click', openErasModal);
    }

    // Acciones del Menú Hamburguesa
    if (menuSavePlaylist) {
        menuSavePlaylist.addEventListener('click', handleSavePlaylist);
    }
    if (menuOpenShare) {
        menuOpenShare.addEventListener('click', prepareShareCard);
    }
    if (menuLastFmConnect) {
        menuLastFmConnect.addEventListener('click', openLastFmModal);
    }
    if (menuInstallApp) {
        menuInstallApp.addEventListener('click', triggerInstallFlow);
    }
    if (menuLogout) {
        menuLogout.addEventListener('click', handleLogout);
    }

    // Modal Last.fm
    if (btnLastFmSave) {
        btnLastFmSave.addEventListener('click', handleSaveLastFm);
    }
    if (lastFmUsernameInput) {
        lastFmUsernameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSaveLastFm();
            }
        });
    }
    if (btnLastFmDisconnect) {
        btnLastFmDisconnect.addEventListener('click', handleDisconnectLastFm);
    }

    // Modal Descargar Tarjeta PNG
    if (btnDownloadCard) {
        btnDownloadCard.addEventListener('click', handleDownloadCard);
    }

    // Instalación PWA botones
    if (btnInstallLogin) {
        btnInstallLogin.addEventListener('click', triggerInstallFlow);
    }
    if (btnInstallFab) {
        btnInstallFab.addEventListener('click', triggerInstallFlow);
    }

    // Base de Datos en la Nube (Supabase - Central)
    if (menuGdriveConnect) {
        menuGdriveConnect.addEventListener('click', openGoogleDriveModal);
    }
    if (curatorBtnCloud) {
        curatorBtnCloud.addEventListener('click', openGoogleDriveModal);
    }
    if (btnGdriveUpload) {
        btnGdriveUpload.addEventListener('click', () => saveToCloudDatabase(false));
    }
    if (btnGdriveDownload) {
        btnGdriveDownload.addEventListener('click', () => loadFromCloudDatabase());
    }
    if (gdriveAutosyncToggle) {
        gdriveAutosyncToggle.addEventListener('change', (e) => {
            cloudAutoSync = e.target.checked;
            localStorage.setItem(CLOUD_AUTOSYNC_KEY, String(cloudAutoSync));
        });
    }
}

// ----------------------------------------------------
// GESTIÓN DE FUENTES DE DATOS: UNIFICADO / SPOTIFY / LAST.FM
// ----------------------------------------------------
let fullDbPromise = null;

function triggerBackgroundFullDbLoad() {
    if (fullDbPromise) return fullDbPromise;
    fullDbPromise = (async () => {
        isUnifiedDbLoading = true;
        try {
            const res = await fetch('/data/unified_history.json');
            if (res.ok) {
                const full = await res.json();
                full._isFastCache = false;
                unifiedDb = full;
                await loadTidalEstimates();
                console.log('Base de datos Unificada completa cargada:', full.summary);

                // Guardar snapshot ultraligero (~40 KB) para que Inicio cargue en 0ms
                try {
                    const fastSnapshot = {
                        summary: full.summary,
                        yearlyTops: {
                            '2026': full.yearlyTops?.['2026'] || {},
                            overall: {
                                plays: full.yearlyTops?.overall?.plays,
                                hours: full.yearlyTops?.overall?.hours,
                                tracks: (full.yearlyTops?.overall?.tracks || []).slice(0, 30),
                                artists: (full.yearlyTops?.overall?.artists || []).slice(0, 30)
                            }
                        }
                    };
                    localStorage.setItem('tunetracker_fast_home_cache', JSON.stringify(fastSnapshot));
                } catch (e) {}
            }
        } catch (e) {
            console.warn('Error al cargar unified_history.json:', e);
        } finally {
            isUnifiedDbLoading = false;
        }
        return unifiedDb;
    })();
    return fullDbPromise;
}

async function loadUnifiedDatabase(requireFull = false) {
    // Si estamos en Modo Demo o el usuario no es el dueño, NUNCA cargar los datos personales del creador
    if (isDemoMode() || !isAppOwner()) {
        if (!unifiedDb || !unifiedDb._isDemoDb) {
            unifiedDb = buildDemoDatabase();
            unifiedDb._isDemoDb = true;
        }
        return unifiedDb;
    }

    if (unifiedDb && !unifiedDb._isFastCache && !unifiedDb._isDemoDb) return unifiedDb;

    if (!requireFull && unifiedDb && unifiedDb._isFastCache) {
        return unifiedDb;
    }

    if (!requireFull) {
        try {
            const rawFast = localStorage.getItem('tunetracker_fast_home_cache');
            if (rawFast) {
                const parsed = JSON.parse(rawFast);
                if (parsed && parsed.summary && parsed.yearlyTops) {
                    parsed._isFastCache = true;
                    unifiedDb = parsed;
                    loadTidalEstimates().catch(() => {});
                    // Cargar la base de datos completa en segundo plano sin congelar la UI
                    setTimeout(() => triggerBackgroundFullDbLoad(), 80);
                    return unifiedDb;
                }
            }
        } catch (e) {}

        // Fallback ultrarrápido para móviles y arranque en frío: fast_home.json (85 KB vs 8.42 MB)
        try {
            const fastRes = await fetch('/data/fast_home.json');
            if (fastRes.ok) {
                const fastData = await fastRes.json();
                if (fastData && fastData.summary && fastData.yearlyTops) {
                    fastData._isFastCache = true;
                    unifiedDb = fastData;
                    try {
                        localStorage.setItem('tunetracker_fast_home_cache', JSON.stringify(fastData));
                    } catch (_) {}
                    loadTidalEstimates().catch(() => {});
                    setTimeout(() => triggerBackgroundFullDbLoad(), 120);
                    return unifiedDb;
                }
            }
        } catch (e) {
            console.warn('Fallback fast_home.json fetch failed:', e);
        }
    }

    return await triggerBackgroundFullDbLoad();
}

async function loadSpotifyDatabase(requireFull = false) {
    return await loadUnifiedDatabase(requireFull);
}

async function getActiveDatabase(requireFull = false) {
    return await loadUnifiedDatabase(requireFull);
}

async function fetchLastFmDelta(force = false) {
    if (hasFetchedLastFmDelta && !force) return lastFmRecentDelta;
    const { user, key } = getLastFmCredentials();
    if (!user || !key) return lastFmRecentDelta;

    try {
        let maxUTS = 0;
        if (!force && Array.isArray(lastFmRecentDelta) && lastFmRecentDelta.length > 0) {
            lastFmRecentDelta.forEach(t => {
                const u = parseInt(t.date?.uts, 10);
                if (u > maxUTS) maxUTS = u;
            });
        }

        const cutoffUTS = (maxUTS > 0) ? (maxUTS + 1) : Math.floor(new Date('2026-10-14T21:59:34Z').getTime() / 1000);
        const newTracks = [];
        let page = 1;
        let totalPages = 1;
        let ok = true;
        const maxPages = (maxUTS > 0) ? 3 : 25;

        while (page <= totalPages && page <= maxPages) {
            const res = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(user)}&from=${cutoffUTS}&api_key=${encodeURIComponent(key)}&limit=200&page=${page}&format=json`);
            if (!res.ok) { ok = false; break; }
            const data = await res.json();
            const raw = data?.recenttracks?.track || [];
            const list = Array.isArray(raw) ? raw : (raw ? [raw] : []);
            list.forEach(t => { if (t && t.date && t.date.uts) newTracks.push(t); });
            totalPages = parseInt(data?.recenttracks?.['@attr']?.totalPages || '1', 10) || 1;
            page++;
        }

        if (ok) {
            const map = new Map();
            (lastFmRecentDelta || []).forEach(t => {
                const u = t?.date?.uts || t?.uts;
                if (u) map.set(`${u}:::${t.name}`, t);
            });
            newTracks.forEach(t => {
                const u = t?.date?.uts || t?.uts;
                if (u) map.set(`${u}:::${t.name}`, t);
            });
            lastFmRecentDelta = Array.from(map.values()).sort((a, b) => {
                const utsb = parseInt(b.date?.uts || b.uts, 10) || 0;
                const utsa = parseInt(a.date?.uts || a.uts, 10) || 0;
                return utsb - utsa;
            });
            hasFetchedLastFmDelta = true;
            try {
                localStorage.setItem('tunetracker_delta_cache', JSON.stringify(lastFmRecentDelta));
            } catch (e) {}
        }
    } catch (e) {
        console.warn('Error al consultar delta de Last.fm:', e);
    }
    return lastFmRecentDelta;
}

async function switchDataSource(source) {
    if (currentSource === source) return;
    currentSource = source;

    if (source === 'lastfm') {
        if (stripHoursWrapper) stripHoursWrapper.classList.add('d-none');
        if (stripHoursDot) stripHoursDot.classList.add('d-none');
        if (customDatePickerContainer) customDatePickerContainer.classList.add('d-none');

        renderPeriodSelectOptions(currentRange || 'overall');
        if (selectMonth) {
            selectMonth.disabled = true;
            selectMonth.innerHTML = '<option value="all" selected>Todo el año</option>';
        }
        currentRange = 'overall';
        fetchLastFmGlobalStats();
    } else {
        // 'unified' o 'spotify'
        if (stripHoursWrapper) stripHoursWrapper.classList.remove('d-none');
        if (stripHoursDot) stripHoursDot.classList.remove('d-none');
        if (customDatePickerContainer) customDatePickerContainer.classList.add('d-none');

        renderPeriodSelectOptions(currentRange || 'overall');
        if (selectMonth) {
            selectMonth.disabled = true;
            selectMonth.innerHTML = '<option value="all" selected>Todo el año</option>';
        }
        currentRange = 'overall';
        updateStatStrip();
    }

    loadStats();
}

function handleTimePeriodChange(val) {
    if (val === 'curator') {
        openPlaylistCurator();
        if (selectTimePeriod) selectTimePeriod.value = currentRange || 'overall';
        return;
    }

    if (val === 'custom') {
        if (customDatePickerContainer) customDatePickerContainer.classList.remove('d-none');
        if (selectMonth) {
            selectMonth.disabled = true;
            selectMonth.innerHTML = '<option value="all" selected>Todo el año</option>';
        }
        applyCustomDateRange();
        return;
    }

    if (customDatePickerContainer) customDatePickerContainer.classList.add('d-none');

    if (val === 'this-week' || val === '7day') {
        if (selectMonth) {
            selectMonth.disabled = true;
            selectMonth.innerHTML = '<option value="all" selected>Esta semana</option>';
        }
        currentRange = 'this-week';
    } else if (val === 'last-month' || val === '1month') {
        if (selectMonth) {
            selectMonth.disabled = true;
            selectMonth.innerHTML = '<option value="all" selected>Mes pasado</option>';
        }
        currentRange = 'last-month';
    } else if (val === 'last-6-months' || val === '6month') {
        if (selectMonth) {
            selectMonth.disabled = true;
            selectMonth.innerHTML = '<option value="all" selected>Hace 6 meses</option>';
        }
        currentRange = 'last-6-months';
    } else if (val === 'current-month') {
        if (selectMonth) {
            selectMonth.disabled = true;
            selectMonth.innerHTML = '<option value="all" selected>Este mes</option>';
        }
        currentRange = 'current-month';
    } else if (val === '4weeks') {
        if (selectMonth) {
            selectMonth.disabled = true;
            selectMonth.innerHTML = '<option value="all" selected>Últimas 4 semanas</option>';
        }
        currentRange = '4weeks';
    } else if (val === 'era-tidal') {
        if (selectMonth) {
            selectMonth.disabled = true;
            selectMonth.innerHTML = '<option value="all" selected>Todo el periodo</option>';
        }
        currentRange = 'era-tidal';
    } else if (val === 'era-spotify') {
        if (selectMonth) {
            selectMonth.disabled = true;
            selectMonth.innerHTML = '<option value="all" selected>Todo el periodo</option>';
        }
        currentRange = 'era-spotify';
    } else if (val === 'era-lastfm') {
        if (selectMonth) {
            selectMonth.disabled = true;
            selectMonth.innerHTML = '<option value="all" selected>Todo el periodo</option>';
        }
        currentRange = 'era-lastfm';
    } else if (val.startsWith('year-')) {
        const year = val.replace('year-', '');
        updateMonthDropdown(year);
        if (selectMonth) {
            selectMonth.disabled = false;
            selectMonth.value = 'all';
        }
        currentRange = val;
    } else {
        if (selectMonth) {
            selectMonth.disabled = true;
            selectMonth.innerHTML = '<option value="all" selected>Todo el año</option>';
        }
        currentRange = val || 'overall';
    }
    updateStatStrip();
    loadStats();
}

function applyCustomDateRange() {
    let from = inputDateFrom?.value || '2019-05-01';
    let to = inputDateTo?.value;

    if (!to) {
        const todayStr = new Date().toISOString().split('T')[0];
        to = todayStr > '2026-12-31' ? '2026-12-31' : todayStr;
        if (inputDateTo) inputDateTo.value = to;
    }

    if (from > to) {
        const tmp = from;
        from = to;
        to = tmp;
        if (inputDateFrom) inputDateFrom.value = from;
        if (inputDateTo) inputDateTo.value = to;
    }

    currentRange = `dates_${from}_to_${to}`;
    updateStatStrip();
    loadStats();
}

function getRangeTopData(activeDb, fromDateStr, toDateStr) {
    if (!activeDb || !activeDb.yearlyTops) return null;

    const fromYM = (fromDateStr || '2019-05-01').slice(0, 7);
    const toYM = (toDateStr || '2026-12-31').slice(0, 7);

    const trackMap = new Map();
    const artistMap = new Map();
    const albumMap = new Map();
    let totalPlays = 0;

    const startYear = parseInt(fromYM.split('-')[0], 10);
    const endYear = parseInt(toYM.split('-')[0], 10);

    for (let y = startYear; y <= endYear; y++) {
        const yData = activeDb.yearlyTops[String(y)];
        if (!yData || !yData.months) continue;

        for (let m = 1; m <= 12; m++) {
            const ymKey = `${y}-${String(m).padStart(2, '0')}`;
            if (ymKey < fromYM || ymKey > toYM) continue;

            const mData = yData.months[String(m)];
            if (!mData) continue;

            totalPlays += (mData.plays || 0);

            (mData.tracks || []).forEach(t => {
                const k = `${normalizeKey(t.name)}:::${normalizeKey(t.artist || '')}`;
                const cur = trackMap.get(k) || {
                    name: t.name,
                    artist: t.artist,
                    album: t.album,
                    plays: 0,
                    uri: t.uri
                };
                cur.plays += t.plays;
                trackMap.set(k, cur);
            });

            (mData.artists || []).forEach(a => {
                const k = normalizeKey(a.name);
                const cur = artistMap.get(k) || {
                    name: a.name,
                    plays: 0
                };
                cur.plays += a.plays;
                artistMap.set(k, cur);
            });

            (mData.albums || []).forEach(al => {
                const k = `${normalizeKey(al.name)}:::${normalizeKey(al.artist || '')}`;
                const cur = albumMap.get(k) || {
                    name: al.name,
                    artist: al.artist,
                    plays: 0
                };
                cur.plays += al.plays;
                albumMap.set(k, cur);
            });
        }
    }

    const sortedTracks = Array.from(trackMap.values()).sort((a, b) => b.plays - a.plays);
    const sortedArtists = Array.from(artistMap.values()).sort((a, b) => b.plays - a.plays);
    const sortedAlbums = Array.from(albumMap.values()).sort((a, b) => b.plays - a.plays);
    const approxHours = (totalPlays * 3.4 / 60).toFixed(1);

    return {
        plays: totalPlays,
        hours: approxHours,
        tracks: sortedTracks,
        artists: sortedArtists,
        albums: sortedAlbums
    };
}

function handleMonthChange(val) {
    if (val === 'all') {
        currentRange = selectTimePeriod?.value || 'overall';
    } else {
        const year = (selectTimePeriod?.value || 'year-2026').replace('year-', '');
        currentRange = `month-${year}-${val}`;
    }
    updateStatStrip();
    loadStats();
}

function updateMonthDropdown(year) {
    if (!selectMonth) return;
    const targetYear = parseInt(year, 10);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1 = Enero, 11 = Noviembre, etc.

    let minMonth = 1;
    let maxMonth = 12;

    if (targetYear === currentYear) {
        // En el año en curso, mostrar todos los meses transcurridos hasta el mes actual (sin meses futuros)
        maxMonth = currentMonth;
    } else if (targetYear > currentYear) {
        maxMonth = 0; // Años futuros no tienen meses disponibles
    } else if (targetYear === 2019) {
        // En 2019 la biblioteca inició en Mayo
        minMonth = 5;
    }

    const availableMonths = [];
    for (let m = minMonth; m <= maxMonth; m++) {
        availableMonths.push(m);
    }

    selectMonth.innerHTML = '<option value="all" selected>Todo el año</option>';
    availableMonths.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = MONTH_NAMES[m - 1];
        selectMonth.appendChild(opt);
    });
}

function navigateToCatalog(type = 'tracks', targetRange = 'current-month') {
    switchAppView('catalog');
    currentType = type || 'tracks';

    // Sincronizar pestañas secundarias de categorías (Temas, Artistas, Álbumes, Scrobbles)
    document.querySelectorAll('#content-type-tabs .lastfm-nav-tab, #content-type-tabs .segmented-tab').forEach(b => {
        if (b.getAttribute('data-type') === currentType) {
            b.classList.add('active');
        } else {
            b.classList.remove('active');
        }
    });

    if (targetRange === 'current-month') {
        selectLastFmDatePreset('current-month');
    } else if (targetRange) {
        selectLastFmDatePreset(targetRange);
    } else {
        selectLastFmDatePreset('overall');
    }

    // Scroll suave hacia la sección de tops y catálogo
    const catSection = document.getElementById('section-catalog');
    if (catSection) {
        catSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}
window.navigateToCatalog = navigateToCatalog;

function toggleLastFmDateMenu() {
    const menu = document.getElementById('lastfm-date-dropdown-menu');
    const btn = document.getElementById('lastfm-date-picker-btn');
    if (!menu) return;
    const isHidden = menu.classList.contains('d-none');
    if (isHidden) {
        menu.classList.remove('d-none');
        btn?.classList.add('is-open');
        renderLastFmYearMonthChips();
    } else {
        menu.classList.add('d-none');
        btn?.classList.remove('is-open');
    }
}
window.toggleLastFmDateMenu = toggleLastFmDateMenu;

function closeLastFmDateMenu() {
    const menu = document.getElementById('lastfm-date-dropdown-menu');
    const btn = document.getElementById('lastfm-date-picker-btn');
    if (menu) menu.classList.add('d-none');
    if (btn) btn.classList.remove('is-open');
}
window.closeLastFmDateMenu = closeLastFmDateMenu;

document.addEventListener('click', (e) => {
    const wrapper = document.querySelector('.lastfm-date-selector-wrapper');
    if (wrapper && !wrapper.contains(e.target)) {
        closeLastFmDateMenu();
    }
});

function selectLastFmDatePreset(periodKey) {
    const now = new Date();
    const curY = now.getFullYear();
    const curM = now.getMonth() + 1;
    const monthNamesEs = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    let displayLabel = 'Todo el tiempo';

    if (periodKey === 'overall') {
        currentRange = 'overall';
        displayLabel = 'Todo el tiempo';
        if (selectTimePeriod) selectTimePeriod.value = 'overall';
        if (selectMonth) {
            selectMonth.disabled = true;
            selectMonth.value = 'all';
        }
    } else if (periodKey === 'current-month') {
        currentRange = `month-${curY}-${curM}`;
        displayLabel = `${monthNamesEs[curM - 1]} ${curY}`;
        if (selectTimePeriod) selectTimePeriod.value = `year-${curY}`;
        updateMonthDropdown(curY);
        if (selectMonth) {
            selectMonth.disabled = false;
            selectMonth.value = String(curM);
        }
    } else if (periodKey === 'this-week') {
        currentRange = 'this-week';
        displayLabel = 'Últimos 7 días';
        if (selectTimePeriod) selectTimePeriod.value = 'this-week';
        if (selectMonth) {
            selectMonth.disabled = true;
            selectMonth.value = 'all';
        }
    } else if (periodKey === 'last-month') {
        currentRange = 'last-month';
        displayLabel = 'Últimos 30 días';
        if (selectTimePeriod) selectTimePeriod.value = 'last-month';
        if (selectMonth) {
            selectMonth.disabled = true;
            selectMonth.value = 'all';
        }
    } else if (periodKey === 'last-6-months') {
        currentRange = 'last-6-months';
        displayLabel = 'Últimos 180 días';
        if (selectTimePeriod) selectTimePeriod.value = 'last-6-months';
        if (selectMonth) {
            selectMonth.disabled = true;
            selectMonth.value = 'all';
        }
    } else if (periodKey === 'year-2026') {
        currentRange = 'year-2026';
        displayLabel = 'Año 2026';
        if (selectTimePeriod) selectTimePeriod.value = 'year-2026';
        updateMonthDropdown(2026);
        if (selectMonth) {
            selectMonth.disabled = false;
            selectMonth.value = 'all';
        }
    } else if (periodKey.startsWith('year-')) {
        const y = periodKey.replace('year-', '');
        currentRange = periodKey;
        displayLabel = `Año ${y}`;
        if (selectTimePeriod) selectTimePeriod.value = periodKey;
        updateMonthDropdown(y);
        if (selectMonth) {
            selectMonth.disabled = false;
            selectMonth.value = 'all';
        }
    } else if (periodKey.startsWith('month-')) {
        const parts = periodKey.split('-');
        const y = parts[1];
        const m = parseInt(parts[2], 10);
        currentRange = periodKey;
        displayLabel = `${monthNamesEs[m - 1]} ${y}`;
        if (selectTimePeriod) selectTimePeriod.value = `year-${y}`;
        updateMonthDropdown(y);
        if (selectMonth) {
            selectMonth.disabled = false;
            selectMonth.value = String(m);
        }
    } else if (periodKey === 'era-spotify') {
        currentRange = 'era-spotify';
        displayLabel = 'Era Spotify (2019-2025)';
        if (selectTimePeriod) selectTimePeriod.value = 'era-spotify';
    } else if (periodKey === 'era-tidal') {
        currentRange = 'era-tidal';
        displayLabel = 'Era Tidal (2025-2026)';
        if (selectTimePeriod) selectTimePeriod.value = 'era-tidal';
    } else if (periodKey === 'era-lastfm') {
        currentRange = 'era-lastfm';
        displayLabel = 'Era Last.fm (2025-Hoy)';
        if (selectTimePeriod) selectTimePeriod.value = 'era-lastfm';
    } else {
        currentRange = periodKey;
        displayLabel = periodKey;
    }

    updateLastFmDateLabel(displayLabel);
    updateLastFmActivePresets(periodKey);
    closeLastFmDateMenu();

    updateStatStrip();
    loadStats();
}
window.selectLastFmDatePreset = selectLastFmDatePreset;

function updateLastFmDateLabel(label) {
    const lbl = document.getElementById('lastfm-date-btn-label');
    if (lbl) lbl.textContent = label;
}

function updateLastFmActivePresets(periodKey) {
    document.querySelectorAll('.lastfm-preset-item').forEach(btn => {
        if (btn.getAttribute('data-period') === periodKey) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    document.querySelectorAll('.lastfm-pill-chip').forEach(btn => {
        if (btn.getAttribute('data-period') === periodKey) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function updateQuickFilterPills(periodKey) {
    updateLastFmActivePresets(periodKey);
}
window.updateQuickFilterPills = updateQuickFilterPills;

function renderLastFmYearMonthChips() {
    const yearsContainer = document.getElementById('lastfm-years-chips');
    const monthsContainer = document.getElementById('lastfm-months-chips');
    if (!yearsContainer) return;

    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth() + 1;
    const years = ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'];

    let selectedYear = curYear;
    if (currentRange && currentRange.startsWith('year-')) {
        selectedYear = parseInt(currentRange.replace('year-', ''), 10);
    } else if (currentRange && currentRange.startsWith('month-')) {
        selectedYear = parseInt(currentRange.split('-')[1], 10);
    }

    yearsContainer.innerHTML = years.map(yr => {
        const isYearActive = (currentRange === `year-${yr}`) || (selectedYear === parseInt(yr, 10) && currentRange.startsWith('month-'));
        return `<button type="button" class="lastfm-pill-chip ${isYearActive ? 'active' : ''}" data-period="year-${yr}" onclick="selectLastFmDatePreset('year-${yr}')">${yr}</button>`;
    }).join('');

    if (monthsContainer) {
        const monthNamesShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        let maxM = 12;
        let minM = 1;
        if (selectedYear === curYear) {
            maxM = curMonth;
        } else if (selectedYear === 2019) {
            minM = 5;
        }

        const monthsHtml = [];
        for (let m = minM; m <= maxM; m++) {
            const mKey = `month-${selectedYear}-${m}`;
            const isMonthActive = (currentRange === mKey) || (currentRange === 'current-month' && selectedYear === curYear && m === curMonth);
            monthsHtml.push(`<button type="button" class="lastfm-pill-chip ${isMonthActive ? 'active' : ''}" data-period="${mKey}" onclick="selectLastFmDatePreset('${mKey}')">${monthNamesShort[m - 1]}</button>`);
        }
        monthsContainer.innerHTML = monthsHtml.join('');
    }
}
window.renderLastFmYearMonthChips = renderLastFmYearMonthChips;

function applyCustomDateRange() {
    const fromInput = document.getElementById('input-date-from');
    const toInput = document.getElementById('input-date-to');
    const from = fromInput?.value || '2019-05-01';
    const to = toInput?.value || '2026-11-05';

    currentRange = `dates_${from}_to_${to}`;
    updateLastFmDateLabel(`${from} → ${to}`);
    closeLastFmDateMenu();

    updateStatStrip();
    loadStats();
}
window.applyCustomDateRange = applyCustomDateRange;

function renderCatalogActivityChart(periodRange, db) {
    const container = document.getElementById('catalog-activity-chart-container');
    if (!container) return;
    if (!db || !db.yearlyTops) {
        container.innerHTML = '';
        return;
    }

    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth() + 1;
    let dataPoints = [];
    let periodTitle = 'Histórico';

    if (periodRange === 'overall' || !periodRange) {
        periodTitle = 'Histórico Total (2019 - 2026)';
        const years = ['2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'];
        dataPoints = years.map(yr => {
            let p = db.yearlyTops[yr]?.plays || 0;
            if (yr === '2026' && Array.isArray(lastFmRecentDelta)) {
                p += lastFmRecentDelta.filter(dt => {
                    if (!dt.date?.uts) return false;
                    return new Date(parseInt(dt.date.uts, 10) * 1000).getFullYear() === 2026;
                }).length;
            }
            return {
                label: yr,
                fullLabel: yr,
                plays: p,
                isActive: yr === String(curYear),
                filterKey: `year-${yr}`
            };
        });
    } else if (periodRange.startsWith('year-')) {
        const targetY = periodRange.replace('year-', '');
        periodTitle = `Año ${targetY}`;
        const mNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const yData = db.yearlyTops[targetY]?.months || {};
        dataPoints = mNames.map((mn, idx) => {
            const mNum = idx + 1;
            let p = yData[String(mNum)]?.plays || 0;
            if (String(targetY) === String(curYear) && Array.isArray(lastFmRecentDelta)) {
                p += lastFmRecentDelta.filter(dt => {
                    if (!dt.date?.uts) return false;
                    const d = new Date(parseInt(dt.date.uts, 10) * 1000);
                    return d.getFullYear() === curYear && (d.getMonth() + 1) === mNum;
                }).length;
            }
            return {
                label: mn,
                fullLabel: `${mn} ${targetY}`,
                plays: p,
                isActive: (String(targetY) === String(curYear) && mNum === curMonth),
                filterKey: `month-${targetY}-${mNum}`
            };
        });
    } else if (periodRange === 'current-month' || periodRange.startsWith('month-')) {
        let targetY = curYear;
        let targetM = curMonth;
        if (periodRange.startsWith('month-')) {
            const parts = periodRange.split('-');
            targetY = parseInt(parts[1], 10) || curYear;
            targetM = parseInt(parts[2], 10) || curMonth;
        }
        const mNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        periodTitle = `${mNames[targetM - 1]} ${targetY}`;

        const daysInMonth = new Date(targetY, targetM, 0).getDate();
        const dailyCounts = {};
        for (let d = 1; d <= daysInMonth; d++) dailyCounts[d] = 0;

        if (Array.isArray(lastFmRecentDelta)) {
            lastFmRecentDelta.forEach(dt => {
                if (!dt.date?.uts) return;
                const d = new Date(parseInt(dt.date.uts, 10) * 1000);
                if (d.getFullYear() === targetY && (d.getMonth() + 1) === targetM) {
                    const day = d.getDate();
                    dailyCounts[day] = (dailyCounts[day] || 0) + 1;
                }
            });
        }

        const baseMonthPlays = db.yearlyTops[String(targetY)]?.months?.[String(targetM)]?.plays || 0;
        const recordedLivePlays = Object.values(dailyCounts).reduce((a, b) => a + b, 0);
        const maxDayToShow = (targetY === curYear && targetM === curMonth) ? Math.min(daysInMonth, now.getDate()) : daysInMonth;

        dataPoints = Array.from({ length: maxDayToShow }, (_, i) => {
            const dayNum = i + 1;
            let p = dailyCounts[dayNum] || 0;
            if (recordedLivePlays === 0 && baseMonthPlays > 0) {
                p = Math.round(baseMonthPlays / daysInMonth);
            }
            return {
                label: `Día ${dayNum}`,
                fullLabel: `${dayNum} ${mNames[targetM - 1]}`,
                plays: p,
                isActive: (targetY === curYear && targetM === curMonth && dayNum === now.getDate())
            };
        });
    } else if (periodRange === 'this-week') {
        periodTitle = 'Esta Semana';
        const dNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        const weekMap = [0, 0, 0, 0, 0, 0, 0];
        const { fromD, toD } = getThisWeekDateRange();

        if (Array.isArray(lastFmRecentDelta)) {
            lastFmRecentDelta.forEach(dt => {
                if (!dt.date?.uts) return;
                const d = new Date(parseInt(dt.date.uts, 10) * 1000);
                const iso = d.toISOString().slice(0, 10);
                if (iso >= fromD && iso <= toD) {
                    const dayIdx = (d.getDay() + 6) % 7;
                    weekMap[dayIdx] = (weekMap[dayIdx] || 0) + 1;
                }
            });
        }

        const todayIdx = (now.getDay() + 6) % 7;
        dataPoints = dNames.map((name, idx) => ({
            label: name,
            fullLabel: name,
            plays: weekMap[idx],
            isActive: idx === todayIdx
        }));
    } else if (periodRange === 'last-month') {
        const lm = getLastMonthInfo();
        const mNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        periodTitle = `Mes Pasado (${mNames[lm.prevM - 1]} ${lm.prevY})`;
        const daysInMonth = new Date(lm.prevY, lm.prevM, 0).getDate();
        const mPlays = db.yearlyTops[String(lm.prevY)]?.months?.[String(lm.prevM)]?.plays || 0;
        dataPoints = Array.from({ length: daysInMonth }, (_, i) => {
            const dayNum = i + 1;
            return {
                label: `Día ${dayNum}`,
                fullLabel: `${dayNum} ${mNames[lm.prevM - 1]}`,
                plays: Math.round(mPlays / daysInMonth),
                isActive: false
            };
        });
    } else if (periodRange === 'last-6-months') {
        periodTitle = 'Últimos 6 Meses';
        const mNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        dataPoints = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(curYear, (curMonth - 1) - i, 1);
            const y = d.getFullYear();
            const m = d.getMonth() + 1;
            let p = db.yearlyTops[String(y)]?.months?.[String(m)]?.plays || 0;
            if (y === curYear && m === curMonth && Array.isArray(lastFmRecentDelta)) {
                p += lastFmRecentDelta.filter(dt => {
                    if (!dt.date?.uts) return false;
                    const dtDate = new Date(parseInt(dt.date.uts, 10) * 1000);
                    return dtDate.getFullYear() === curYear && (dtDate.getMonth() + 1) === curMonth;
                }).length;
            }
            dataPoints.push({
                label: `${mNames[m - 1]} '${String(y).slice(2)}`,
                fullLabel: `${mNames[m - 1]} ${y}`,
                plays: p,
                isActive: (y === curYear && m === curMonth),
                filterKey: `month-${y}-${m}`
            });
        }
    } else if (periodRange === 'era-spotify') {
        periodTitle = 'Era Spotify (2019 - 2025)';
        const years = ['2019', '2020', '2021', '2022', '2023', '2024', '2025'];
        dataPoints = years.map(yr => ({
            label: yr,
            fullLabel: yr,
            plays: db.yearlyTops[yr]?.plays || 0,
            isActive: false,
            filterKey: `year-${yr}`
        }));
    } else if (periodRange === 'era-tidal' || periodRange === 'era-lastfm') {
        periodTitle = periodRange === 'era-tidal' ? 'Era Tidal (2025 - 2026)' : 'Era Last.fm (2025 - Hoy)';
        const years = ['2025', '2026'];
        dataPoints = years.map(yr => {
            let p = db.yearlyTops[yr]?.plays || 0;
            if (yr === '2026' && Array.isArray(lastFmRecentDelta)) {
                p += lastFmRecentDelta.filter(dt => {
                    if (!dt.date?.uts) return false;
                    return new Date(parseInt(dt.date.uts, 10) * 1000).getFullYear() === 2026;
                }).length;
            }
            return {
                label: yr,
                fullLabel: yr,
                plays: p,
                isActive: yr === String(curYear),
                filterKey: `year-${yr}`
            };
        });
    } else {
        periodTitle = 'Actividad Histórica';
        const years = ['2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'];
        dataPoints = years.map(yr => ({
            label: yr,
            fullLabel: yr,
            plays: db.yearlyTops[yr]?.plays || 0,
            isActive: yr === String(curYear),
            filterKey: `year-${yr}`
        }));
    }

    const isDayLevel = dataPoints.some(pt => pt.label && pt.label.startsWith('Día '));
    const listMaxHeight = isDayLevel ? '195px' : '280px';
    const totalPlays = dataPoints.reduce((sum, pt) => sum + pt.plays, 0);
    const maxPlays = Math.max(1, ...dataPoints.map(pt => pt.plays));

    container.classList.remove('d-none');
    container.innerHTML = `
        <div class="lastfm-h-chart ${isDayLevel ? 'is-day-level' : ''}">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-secondary fw-semibold text-truncate me-2" style="font-size: 0.72rem;">
                    <i class="fa-solid fa-chart-simple text-danger me-1"></i>${periodTitle}
                </span>
                <span class="badge rounded-pill bg-dark border border-white border-opacity-15 text-white flex-shrink-0" style="font-size: 0.68rem;">
                    <i class="fa-solid fa-headphones text-danger me-1"></i>${formatNumber(totalPlays)}
                </span>
            </div>
            <div class="lastfm-h-bars-list ${isDayLevel ? 'is-days-scroll' : ''}" style="max-height: ${listMaxHeight}; overflow-y: auto; padding-right: 4px;">
                ${dataPoints.map(pt => {
                    const pct = Math.min(100, Math.max(pt.plays > 0 ? 3 : 0, Math.round((pt.plays / maxPlays) * 100)));
                    const clickAttr = pt.filterKey ? `onclick="selectLastFmDatePreset('${pt.filterKey}')" style="cursor: pointer;"` : '';
                    return `
                        <div class="lastfm-h-bar-row" ${clickAttr} title="${pt.fullLabel}: ${formatNumber(pt.plays)} streams">
                            <span class="lastfm-h-bar-label ${pt.isActive ? 'is-active' : ''}">${pt.label}</span>
                            <div class="lastfm-h-bar-track">
                                <div class="lastfm-h-bar-fill ${pt.isActive ? 'is-active' : ''}" style="width: ${pct}%;"></div>
                            </div>
                            <span class="lastfm-h-bar-value">${formatNumber(pt.plays)}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;

    if (isDayLevel) {
        setTimeout(() => {
            const activeEl = container.querySelector('.lastfm-h-bar-fill.is-active, .lastfm-h-bar-label.is-active');
            if (activeEl) {
                const row = activeEl.closest('.lastfm-h-bar-row');
                if (row) {
                    row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                }
            }
        }, 50);
    }
}
window.renderCatalogActivityChart = renderCatalogActivityChart;

function updateStatStrip() {
    if (!statStrip) return;
    statStrip.classList.remove('d-none');
    statStrip.classList.add('d-flex');

    function setStatValues(plays, hours, artists, albums, periodDesc = '') {
        const playsExact = Math.round(plays || 0);
        const hoursFloat = parseFloat(hours || 0);
        const hoursExact = Math.round(hoursFloat);
        const minutesExact = Math.round(hoursFloat * 60);
        const artistsExact = Math.round(artists || 0);
        const albumsExact = Math.round(albums || 0);

        if (stripPlaycount) {
            stripPlaycount.textContent = playsExact.toLocaleString('es-ES');
            stripPlaycount.title = `${playsExact.toLocaleString('es-ES')} scrobblings reales registrados${periodDesc ? ' (' + periodDesc + ')' : ''}`;
        }
        if (stripHours) {
            stripHours.textContent = hoursExact.toLocaleString('es-ES');
        }
        if (stripHoursWrapper) {
            stripHoursWrapper.title = `${minutesExact.toLocaleString('es-ES')} minutos en total (${hoursFloat.toFixed(1)} horas)`;
            stripHoursWrapper.style.cursor = 'help';
        }
        if (stripArtists) {
            stripArtists.textContent = artistsExact.toLocaleString('es-ES');
            stripArtists.title = `${artistsExact.toLocaleString('es-ES')} artistas únicos reales${periodDesc ? ' (' + periodDesc + ')' : ''}`;
        }
        if (stripAlbums) {
            stripAlbums.textContent = albumsExact.toLocaleString('es-ES');
            stripAlbums.title = `${albumsExact.toLocaleString('es-ES')} álbumes únicos reales${periodDesc ? ' (' + periodDesc + ')' : ''}`;
        }
    }

    if (currentSource === 'lastfm') {
        if (stripHoursWrapper) stripHoursWrapper.classList.add('d-none');
        if (stripHoursDot) stripHoursDot.classList.add('d-none');
        return;
    }

    if (stripHoursWrapper) stripHoursWrapper.classList.remove('d-none');
    if (stripHoursDot) stripHoursDot.classList.remove('d-none');

    const activeDb = (currentSource === 'unified') ? (unifiedDb || spotifyDb) : spotifyDb;

    if (!activeDb) {
        if (currentSource === 'unified') {
            setStatValues(71700, 3691, 1676, 3847);
        } else {
            setStatValues(63124, 3192, 1654, 3465);
        }
        return;
    }

    const deltaCount = (currentSource === 'unified') ? lastFmRecentDelta.length : 0;
    const deltaHours = deltaCount * (3.5 / 60);

    // Periodo: Esta semana
    if (currentRange === 'this-week' || currentRange === '7day') {
        const { fromD, toD } = getThisWeekDateRange();
        const rData = getRangeTopData(activeDb, fromD, toD);
        const thisWeekDelta = (currentSource === 'unified') ? lastFmRecentDelta.filter(t => isDeltaItemInCurrentRange(t, 'this-week')) : [];
        const extra = thisWeekDelta.length;
        const extraH = extra * (3.5 / 60);
        const baseP = rData ? rData.plays : 0;
        const baseH = rData ? parseFloat(rData.hours || 0) : 0;
        const deltaArt = new Set(thisWeekDelta.map(t => t.artist?.['#text'] || t.artist?.name).filter(Boolean)).size;
        const deltaAlb = new Set(thisWeekDelta.map(t => t.album?.['#text'] || t.album?.name).filter(Boolean)).size;
        setStatValues(baseP + extra, baseH + extraH, (rData?.artists?.length || 0) + deltaArt, (rData?.albums?.length || 0) + deltaAlb, 'esta semana');
        return;
    }

    // Periodo: Mes pasado
    if (currentRange === 'last-month' || currentRange === '1month') {
        const lm = getLastMonthInfo();
        const rData = activeDb.yearlyTops?.[lm.prevY]?.months?.[lm.prevM] || getRangeTopData(activeDb, lm.fromD, lm.toD);
        const lmDelta = (currentSource === 'unified') ? lastFmRecentDelta.filter(t => isDeltaItemInCurrentRange(t, 'last-month')) : [];
        const extra = lmDelta.length;
        const extraH = extra * (3.5 / 60);
        const baseP = rData ? rData.plays : 0;
        const baseH = rData ? parseFloat(rData.hours || 0) : 0;
        const deltaArt = new Set(lmDelta.map(t => t.artist?.['#text'] || t.artist?.name).filter(Boolean)).size;
        const deltaAlb = new Set(lmDelta.map(t => t.album?.['#text'] || t.album?.name).filter(Boolean)).size;
        setStatValues(baseP + extra, baseH + extraH, (rData?.artists?.length || 0) + deltaArt, (rData?.albums?.length || 0) + deltaAlb, 'mes pasado');
        return;
    }

    // Periodo: Hace 6 meses
    if (currentRange === 'last-6-months' || currentRange === '6month') {
        const { fromD, toD } = getLast6MonthsRange();
        const rData = getRangeTopData(activeDb, fromD, toD);
        const sixMDelta = (currentSource === 'unified') ? lastFmRecentDelta.filter(t => isDeltaItemInCurrentRange(t, 'last-6-months')) : [];
        const extra = sixMDelta.length;
        const extraH = extra * (3.5 / 60);
        const baseP = rData ? rData.plays : 0;
        const baseH = rData ? parseFloat(rData.hours || 0) : 0;
        const deltaArt = new Set(sixMDelta.map(t => t.artist?.['#text'] || t.artist?.name).filter(Boolean)).size;
        const deltaAlb = new Set(sixMDelta.map(t => t.album?.['#text'] || t.album?.name).filter(Boolean)).size;
        setStatValues(baseP + extra, baseH + extraH, (rData?.artists?.length || 0) + deltaArt, (rData?.albums?.length || 0) + deltaAlb, 'últimos 6 meses');
        return;
    }

    // Periodo: Este mes
    if (currentRange === 'current-month') {
        const now = new Date();
        const curY = String(now.getFullYear());
        const curM = String(now.getMonth() + 1);
        const mData = activeDb.yearlyTops?.[curY]?.months?.[curM];
        const mDelta = (currentSource === 'unified') ? lastFmRecentDelta.filter(t => isDeltaItemInCurrentRange(t, `month-${curY}-${curM}`)) : [];
        const extra = mDelta.length;
        const extraH = extra * (3.5 / 60);
        const baseP = mData ? (mData.plays || 0) : 0;
        const baseH = mData ? parseFloat(mData.hours || 0) : 0;
        const deltaArtists = new Set(mDelta.map(t => t.artist?.['#text'] || t.artist?.name).filter(Boolean)).size;
        const deltaAlbums = new Set(mDelta.map(t => t.album?.['#text'] || t.album?.name).filter(Boolean)).size;
        const artCount = (mData?.artists?.length || 0) + deltaArtists;
        const albCount = (mData?.albums?.length || 0) + deltaAlbums;
        setStatValues(baseP + extra, baseH + extraH, artCount, albCount, 'este mes');
        return;
    }

    // Periodo: Últimas 4 semanas (28 días)
    if (currentRange === '4weeks') {
        const rData = getRangeTopData(activeDb, '2026-09-23', '2026-10-21');
        if (rData) {
            const extra = (currentSource === 'unified') ? deltaCount : 0;
            const extraH = (currentSource === 'unified') ? deltaHours : 0;
            setStatValues(rData.plays + extra, parseFloat(rData.hours) + extraH, rData.artists.length, rData.albums.length, 'últimas 4 semanas');
            return;
        }
    }

    // Periodo: Era Tidal (Ago 2025 - Jul 2026)
    if (currentRange === 'era-tidal') {
        setStatValues(16200, 850, 48, 85, 'era tidal');
        return;
    }
    // Periodo: Era Spotify (2019 - Ago 2025)
    if (currentRange === 'era-spotify') {
        const rData = getRangeTopData(activeDb, '2019-05-01', '2025-08-31');
        if (rData) {
            setStatValues(rData.plays, parseFloat(rData.hours), rData.artists.length, rData.albums.length, 'era spotify');
            return;
        }
    }

    // Periodo: Nueva Era Last.fm / Otras plataformas (Ago 2025 - Actualidad)
    if (currentRange === 'era-lastfm') {
        const rData = getRangeTopData(activeDb, '2025-08-01', '2026-12-31');
        if (rData) {
            const extra = (currentSource === 'unified') ? deltaCount : 0;
            const extraH = (currentSource === 'unified') ? deltaHours : 0;
            setStatValues(rData.plays + extra, parseFloat(rData.hours) + extraH, rData.artists.length, rData.albums.length, 'era last.fm');
            return;
        }
    }

    // Periodo: Rango de fechas personalizado (dates_YYYY-MM-DD_to_YYYY-MM-DD)
    if (currentRange && currentRange.startsWith('dates_')) {
        const [fromD, toD] = currentRange.replace('dates_', '').split('_to_');
        const rData = getRangeTopData(activeDb, fromD, toD);
        if (rData) {
            const extra = (currentSource === 'unified' && toD >= '2026-10-01') ? deltaCount : 0;
            const extraH = (currentSource === 'unified' && toD >= '2026-10-01') ? deltaHours : 0;
            setStatValues(rData.plays + extra, parseFloat(rData.hours) + extraH, rData.artists.length, rData.albums.length, `${fromD} a ${toD}`);
            return;
        }
    }

    // Periodo: Año específico
    if (currentRange.startsWith('year-')) {
        const y = currentRange.replace('year-', '');
        const yData = activeDb.yearlyTops?.[y];
        if (yData) {
            const extra = ((y === '2026') ? deltaCount : 0) + ((y === '2025' || y === '2026') ? getCustomOverrideDeltaPlays(y) : 0);
            const extraH = (y === '2026') ? deltaHours : 0;
            let artCount = yData.totalArtists || (yData.artists ? yData.artists.length : 0);
            let albCount = yData.totalAlbums || (yData.albums ? yData.albums.length : 0);
            if (y === '2026' && currentSource === 'unified') {
                const deltaArt = new Set(lastFmRecentDelta.map(t => t.artist?.['#text'] || t.artist?.name).filter(Boolean)).size;
                const deltaAlb = new Set(lastFmRecentDelta.map(t => t.album?.['#text'] || t.album?.name).filter(Boolean)).size;
                artCount = Math.max(artCount, 294 + deltaArt);
                albCount = Math.max(albCount, 300 + deltaAlb);
            }
            setStatValues((yData.plays || 0) + extra, parseFloat(yData.hours || 0) + extraH, artCount, albCount, `año ${y}`);
            return;
        }
    }

    // Periodo: Mes específico (month-YYYY-M)
    if (currentRange.startsWith('month-')) {
        const parts = currentRange.split('-');
        const y = parts[1];
        const m = parts[2];
        const mData = activeDb.yearlyTops?.[y]?.months?.[m] || activeDb.yearlyTops?.[y]?.months?.[String(parseInt(m, 10))];
        const mDelta = (currentSource === 'unified') ? lastFmRecentDelta.filter(t => isDeltaItemInCurrentRange(t, currentRange)) : [];
        const extra = mDelta.length;
        const extraH = extra * (3.5 / 60);
        const baseP = mData ? (mData.plays || 0) : 0;
        const baseH = mData ? parseFloat(mData.hours || 0) : 0;
        const baseArt = mData?.artists?.length || 0;
        const baseAlb = mData?.albums?.length || 0;
        const deltaArtists = new Set(mDelta.map(t => t.artist?.['#text'] || t.artist?.name).filter(Boolean)).size;
        const deltaAlbums = new Set(mDelta.map(t => t.album?.['#text'] || t.album?.name).filter(Boolean)).size;
        setStatValues(baseP + extra, baseH + extraH, baseArt + deltaArtists, baseAlb + deltaAlbums, 'mes');
        return;
    }

    // Apartado General / Histórico Total Unificado o Spotify
    const s = activeDb.summary || {};
    const totalStreams = (s.validStreams || 0) + deltaCount + getCustomOverrideDeltaPlays(null);
    const homeBentoTotal = document.getElementById('home-bento-total-plays');
    if (homeBentoTotal) homeBentoTotal.textContent = totalStreams.toLocaleString('es-ES');
    const totalHFloat = parseFloat(s.totalHours || 0) + deltaHours;

    // CRÍTICO: Usar los totales reales de s.totalArtists y s.totalAlbums (1,654 y 3,847), NUNCA yearlyTops.overall.artists.length que está acotado a 300!
    const baseArtists = s.totalArtists || 1654;
    const baseAlbums = s.totalAlbums || 3847;
    const deltaArtistCount = (currentSource === 'unified') ? new Set(lastFmRecentDelta.map(t => t.artist?.['#text'] || t.artist?.name).filter(Boolean)).size : 0;
    const deltaAlbumCount = (currentSource === 'unified') ? new Set(lastFmRecentDelta.map(t => t.album?.['#text'] || t.album?.name).filter(Boolean)).size : 0;
    const totalArtistsReal = baseArtists + deltaArtistCount;
    const totalAlbumsReal = baseAlbums + deltaAlbumCount;

    setStatValues(totalStreams, totalHFloat, totalArtistsReal, totalAlbumsReal, 'todo el tiempo');
}

async function forceAppUpdate() {
    if (menuForceUpdate) {
        menuForceUpdate.innerHTML = '<span class="spinner-border spinner-border-sm me-2 text-info"></span><span class="text-info">Actualizando...</span>';
    }
    try {
        if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map(k => caches.delete(k)));
        }
        if ('serviceWorker' in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            for (let r of regs) {
                await r.unregister();
            }
        }
    } catch (e) {
        console.error('Error al limpiar caché:', e);
    }
    window.location.href = window.location.origin + '/?v=' + Date.now();
}

function handleLogout() {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_token_expires_at');
    localStorage.removeItem('code_verifier');
    localStorage.removeItem('lastfm_user');
    localStorage.removeItem('lastfm_key');
    localStorage.removeItem('tunetracker_owner_mode');
    localStorage.setItem('spoti_logged_out', 'true');
    isDemoSession = false;
    sessionStorage.removeItem('tunetracker_demo_session');
    accessToken = null;
    userProfileData = null;
    unifiedDb = null;

    if (currentlyPlayingTimer) {
        clearInterval(currentlyPlayingTimer);
        currentlyPlayingTimer = null;
    }

    // Resetear datos visuales del perfil
    if (drawerUserName) drawerUserName.textContent = 'Usuario';
    if (drawerUserFollowers) drawerUserFollowers.textContent = '';
    if (drawerUserImg) drawerUserImg.src = DEFAULT_AVATAR_SVG;
    if (userImg) userImg.src = DEFAULT_AVATAR_SVG;
    if (drawerLastFmStatus) {
        drawerLastFmStatus.textContent = 'Opcional';
        drawerLastFmStatus.className = 'badge bg-secondary bg-opacity-25';
    }
    if (currentlyPlayingContainer) currentlyPlayingContainer.innerHTML = '';

    showLogin();
}

// ----------------------------------------------------
// MOSTRAR VISTAS
// ----------------------------------------------------
function showLogin() {
    const authLoadingView = document.getElementById('auth-loading-view');
    if (authLoadingView) authLoadingView.classList.add('d-none');

    loginView.classList.remove('d-none');
    dashboardView.classList.add('d-none');
    navActions.classList.add('d-none');

    const bottomNav = document.getElementById('bottom-nav-bar');
    if (bottomNav) bottomNav.classList.add('d-none');
    document.body.classList.remove('with-bottom-nav');

    if (btnInstallFab) btnInstallFab.classList.add('d-none');

    if (currentlyPlayingTimer) {
        clearInterval(currentlyPlayingTimer);
        currentlyPlayingTimer = null;
    }
}

async function showDashboard() {
    const authLoadingView = document.getElementById('auth-loading-view');
    if (authLoadingView) authLoadingView.classList.add('d-none');

    loginView.classList.add('d-none');
    dashboardView.classList.remove('d-none');
    navActions.classList.remove('d-none');

    // Mostrar Bottom Navigation Bar y añadir padding inferior al body
    const bottomNav = document.getElementById('bottom-nav-bar');
    if (bottomNav) bottomNav.classList.remove('d-none');
    document.body.classList.add('with-bottom-nav');

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (!isStandalone && btnInstallFab) {
        btnInstallFab.classList.remove('d-none');
    } else if (btnInstallFab) {
        btnInstallFab.classList.add('d-none');
    }

    initLastFmState();
    applyRoleBasedUI();
    startCurrentlyPlayingPolling();

    // Sincronizar perfil con auto-refresh de token y fallback a Last.fm
    syncUserProfile();

    // Inicializar selects de la barra de herramientas
    if (selectDataSource) selectDataSource.value = currentSource;
    if (selectLimit) selectLimit.value = String(currentLimit);

    // Iniciar con la vista de Inicio por defecto (portada)
    switchAppView('home');

    try {
        if (currentSource === 'unified') {
            const db = await loadUnifiedDatabase(false);
            if (db) {
                initEngagement(db);
                updateStatStrip();
                refreshHomeView();
            }
            fetchLastFmDelta().then(() => {
                updateStatStrip();
                refreshHomeView();
            });
        } else if (currentSource === 'spotify') {
            const db = await loadSpotifyDatabase();
            if (db) {
                initEngagement(db);
                updateStatStrip();
                refreshHomeView();
            }
            loadStats();
        } else {
            refreshHomeView();
            loadStats();
        }
    } catch (err) {
        console.error('Error durante la carga inicial de showDashboard:', err);
        refreshHomeView();
        loadStats();
    }
}

// ----------------------------------------------------
// SPOTIFY AUTH (OPCIONAL / PARA GUARDAR PLAYLISTS)
// ----------------------------------------------------
function generateRandomString(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

async function redirectToSpotifyLogin() {
    const verifier = generateRandomString(128);
    const challenge = await generateCodeChallenge(verifier);
    localStorage.setItem('code_verifier', verifier);

    const scope = 'user-read-private user-read-email user-top-read user-read-currently-playing user-read-recently-played playlist-modify-public playlist-modify-private';
    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        scope: scope,
        code_challenge_method: 'S256',
        code_challenge: challenge
    });

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

async function fetchAccessToken(code) {
    const verifier = localStorage.getItem('code_verifier');
    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        code_verifier: verifier
    });

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params
        });
        const data = await response.json();
        if (data.access_token) {
            accessToken = data.access_token;
            localStorage.setItem('spotify_access_token', accessToken);
            if (data.refresh_token) {
                localStorage.setItem('spotify_refresh_token', data.refresh_token);
            }
            const expiresAt = Date.now() + ((data.expires_in || 3600) * 1000);
            localStorage.setItem('spotify_token_expires_at', String(expiresAt));
            localStorage.removeItem('spoti_logged_out');
            window.history.replaceState({}, document.title, window.location.origin + '/');
            showDashboard();
        } else {
            console.warn('Spotify auth token warning:', data);
            window.history.replaceState({}, document.title, window.location.origin + '/');
            showDashboard();
        }
    } catch (err) {
        console.error('fetchAccessToken exception:', err);
        window.history.replaceState({}, document.title, window.location.origin + '/');
        showDashboard();
    }
}

let isRefreshingToken = false;
let refreshPromise = null;

async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('spotify_refresh_token');
    if (!refreshToken) return null;

    if (isRefreshingToken && refreshPromise) {
        return refreshPromise;
    }

    isRefreshingToken = true;
    refreshPromise = (async () => {
        try {
            const params = new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: CLIENT_ID
            });

            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params
            });

            const data = await response.json();
            if (data.access_token) {
                accessToken = data.access_token;
                localStorage.setItem('spotify_access_token', accessToken);
                if (data.refresh_token) {
                    localStorage.setItem('spotify_refresh_token', data.refresh_token);
                }
                const expiresAt = Date.now() + ((data.expires_in || 3600) * 1000);
                localStorage.setItem('spotify_token_expires_at', String(expiresAt));
                return accessToken;
            } else {
                console.warn('No se pudo refrescar el token de Spotify:', data);
                if (data.error === 'invalid_grant') {
                    localStorage.removeItem('spotify_access_token');
                    localStorage.removeItem('spotify_refresh_token');
                    localStorage.removeItem('spotify_token_expires_at');
                    accessToken = null;
                }
                return null;
            }
        } catch (err) {
            console.error('Error al refrescar token de Spotify:', err);
            return null;
        } finally {
            isRefreshingToken = false;
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

async function getValidAccessToken() {
    if (!accessToken) {
        accessToken = localStorage.getItem('spotify_access_token') || null;
    }
    const expiresAt = parseInt(localStorage.getItem('spotify_token_expires_at') || '0', 10);
    const refreshToken = localStorage.getItem('spotify_refresh_token');

    // Si ya expiró o expira en menos de 90 segundos y tenemos refresh_token
    if ((!accessToken || (expiresAt && Date.now() > expiresAt - 90000)) && refreshToken) {
        const refreshedToken = await refreshAccessToken();
        if (refreshedToken) return refreshedToken;
    }
    return accessToken;
}

async function spotifyFetch(endpoint, options = {}) {
    let token = await getValidAccessToken();
    if (!token) return null;
    try {
        let res = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
            ...options,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...(options.headers || {})
            }
        });

        if (res.status === 401) {
            const newToken = await refreshAccessToken();
            if (newToken) {
                res = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
                    ...options,
                    headers: {
                        'Authorization': `Bearer ${newToken}`,
                        'Content-Type': 'application/json',
                        ...(options.headers || {})
                    }
                });
            } else {
                localStorage.removeItem('spotify_access_token');
                accessToken = null;
                return null;
            }
        }

        if (res.status === 204) return { success: true };
        if (!res.ok) {
            const errBody = await res.text().catch(() => '');
            console.warn(`spotifyFetch error [${res.status}] ${endpoint}:`, errBody);
            return null;
        }
        return await res.json();
    } catch (err) {
        console.warn(`spotifyFetch exception on ${endpoint}:`, err);
        return null;
    }
}

async function createSpotifyPlaylistWithDetails(payload) {
    let token = await getValidAccessToken();
    if (!token) {
        throw new Error('Tu sesión de Spotify no es válida. Inicia sesión de nuevo.');
    }

    const requestCreate = async (authToken) => fetch('https://api.spotify.com/v1/me/playlists', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + authToken,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    let res = await requestCreate(token);
    if (res.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
            res = await requestCreate(newToken);
        } else {
            localStorage.removeItem('spotify_access_token');
            accessToken = null;
            throw new Error('Tu sesión de Spotify expiró. Inicia sesión nuevamente.');
        }
    }

    if (res.ok) {
        return await res.json();
    }

    let detailMessage = `Spotify devolvió un error (${res.status}).`;
    try {
        const errData = await res.json();
        const spotifyMessage = errData?.error?.message || errData?.message;
        if (spotifyMessage) {
            detailMessage = `Spotify: ${spotifyMessage}`;
        } else if (res.statusText) {
            detailMessage = `Spotify (${res.status}): ${res.statusText}`;
        }
    } catch (e) {
        if (res.statusText) {
            detailMessage = `Spotify (${res.status}): ${res.statusText}`;
        }
    }

    throw new Error(detailMessage);
}

async function fetchUserProfile() {
    const data = await spotifyFetch('me');
    if (!data) return false;
    userProfileData = data;
    if (drawerUserName) drawerUserName.textContent = data.display_name || 'Usuario';
    if (drawerUserFollowers) drawerUserFollowers.textContent = `${data.followers ? formatNumber(data.followers.total) : 0} seguidores en Spotify`;
    const avatarUrl = data.images && data.images.length > 0 ? data.images[0].url : null;
    if (userImg) userImg.src = avatarUrl || DEFAULT_AVATAR_SVG;
    if (drawerUserImg) drawerUserImg.src = avatarUrl || DEFAULT_AVATAR_SVG;
    return true;
}

async function syncUserProfile() {
    if (isDemoMode()) {
        if (drawerUserName) drawerUserName.textContent = 'Modo Demo';
        if (drawerUserFollowers) drawerUserFollowers.textContent = 'Datos de ejemplo • Sin cuenta vinculada';
        if (userImg) userImg.src = DEFAULT_AVATAR_SVG;
        if (drawerUserImg) drawerUserImg.src = DEFAULT_AVATAR_SVG;
        return;
    }

    await fetchLastFmGlobalStats({ updateProfileUI: true });
}

// ----------------------------------------------------
// EN VIVO: DETECCIÓN DE REPRODUCCIÓN ACTUAL
// ----------------------------------------------------
let currentlyPlayingTimer = null;
let lastPlayingTrackKey = null;

async function fetchCurrentlyPlaying() {
    if (!navigator.onLine) return;

    if (isDemoMode()) {
        if (currentlyPlayingContainer) {
            currentlyPlayingContainer.classList.remove('d-none');
            const demoTrack = 'Starboy';
            const demoArtist = 'The Weeknd';
            const artKey = `track::${normalizeKey(demoTrack)}::${normalizeKey(demoArtist)}`;
            const cover = artCache[artKey] || FALLBACK_ART_SVG;
            currentlyPlayingContainer.innerHTML = `
                <div class="dynamic-island" onclick="showItemStats('track', '${escapeJsStr(demoTrack)}', '${escapeJsStr(demoArtist)}')" title="Reproductor de demostración">
                    <img id="dynamic-island-cover" src="${cover}" class="dynamic-island-art" alt="Cover" onerror="safeImgError(this)">
                    <div class="overflow-hidden text-start" style="max-width: 300px;">
                        <div class="d-flex align-items-center gap-1.5">
                            <span style="font-size: 0.66rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #30d158;">
                                ● EN REPRODUCCIÓN (DEMO)
                            </span>
                        </div>
                        <div class="fw-bold text-truncate text-white" style="font-size: 0.94rem; line-height: 1.25;">${escapeHtml(demoTrack)}</div>
                        <small class="text-secondary text-truncate d-block" style="font-size: 0.78rem;">${escapeHtml(demoArtist)}</small>
                    </div>
                    <div class="island-eq ms-2" title="Vista previa en vivo">
                        <span></span><span></span><span></span><span></span>
                    </div>
                </div>
            `;
            if (!artCache[artKey]) {
                resolveSpotifyArtwork(demoTrack, demoArtist, 'track', 'dynamic-island-cover');
            }
        }
        return;
    }

    const { user, key } = getLastFmCredentials();
    if (!user || !key) {
        if (currentlyPlayingContainer) {
            currentlyPlayingContainer.innerHTML = '';
            currentlyPlayingContainer.classList.add('d-none');
        }
        return;
    }
    if (currentlyPlayingContainer) {
        currentlyPlayingContainer.classList.remove('d-none');
    }
    try {
            const lfRes = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&user=${encodeURIComponent(user)}&api_key=${encodeURIComponent(key)}&limit=2&format=json`);
            const lfData = await lfRes.json();
            const tracksArr = Array.isArray(lfData?.recenttracks?.track) ? lfData.recenttracks.track : (lfData?.recenttracks?.track ? [lfData.recenttracks.track] : []);
            const firstTrack = tracksArr[0];
            handleLiveScrobbleCheck(tracksArr);
            const isPlaying = firstTrack && firstTrack['@attr']?.nowplaying === 'true';

            if (firstTrack) {
                const trackName = firstTrack.name || '';
                const artistName = firstTrack.artist ? (firstTrack.artist['#text'] || firstTrack.artist.name) : '';
                const trackKey = `${trackName}:::${artistName}:::${isPlaying ? 'live' : 'recent'}`;

                if (trackKey === lastPlayingTrackKey && currentlyPlayingContainer && currentlyPlayingContainer.innerHTML.trim() !== '') {
                    return;
                }
                lastPlayingTrackKey = trackKey;

                const artKey = `track::${normalizeKey(trackName)}::${normalizeKey(artistName)}`;
                const lfCover = extractLastFmImg(firstTrack.image);
                if (lfCover && !artCache[artKey]) {
                    artCache[artKey] = lfCover;
                    saveArtCache();
                }
                const cover = artCache[artKey] || lfCover || FALLBACK_ART_SVG;

                if (currentlyPlayingContainer) {
                    currentlyPlayingContainer.innerHTML = `
                        <div class="dynamic-island" onclick="showItemStats('track', '${escapeJsStr(trackName)}', '${escapeJsStr(artistName)}')" title="Toca para ver las estadísticas e historial de esta canción">
                            <img id="dynamic-island-cover" src="${cover}" class="dynamic-island-art" alt="Cover" onerror="safeImgError(this)">
                            <div class="overflow-hidden text-start" style="max-width: 300px;">
                                <div class="d-flex align-items-center gap-1.5">
                                    <span style="font-size: 0.66rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: ${isPlaying ? '#30d158' : '#a1a1aa'};">
                                        ${isPlaying ? '● EN REPRODUCCIÓN' : 'ÚLTIMA ESCUCHA'}
                                    </span>
                                </div>
                                <div class="fw-bold text-truncate text-white" style="font-size: 0.94rem; line-height: 1.25;">${escapeHtml(trackName)}</div>
                                <small class="text-secondary text-truncate d-block" style="font-size: 0.78rem;">${escapeHtml(artistName)}</small>
                            </div>
                            ${isPlaying ? `
                                <div class="island-eq ms-2" title="Sonando en vivo">
                                    <span></span><span></span><span></span><span></span>
                                </div>
                            ` : `
                                <span class="badge rounded-pill ms-1" style="background: rgba(255,255,255,0.08); color: #a1a1aa; font-size: 0.68rem;">
                                    <i class="fa-solid fa-chart-simple me-1 text-info"></i>Stats
                                </span>
                            `}
                        </div>
                    `;
                    if (!artCache[artKey]) {
                        resolveSpotifyArtwork(trackName, artistName, 'track', 'dynamic-island-cover');
                    }
                }
                return;
            }
    } catch (e) {}
}

// Detecta scrobbles nuevos y refresca home, listados y modales sin recargar la página
let lastSeenScrobbleUts = null;
let liveRefreshRunning = false;
let lastLiveDayKey = null;
function handleLiveScrobbleCheck(rawTracks) {
    const todayK = localDateKey();
    if (lastLiveDayKey === null) lastLiveDayKey = todayK;
    else if (lastLiveDayKey !== todayK) { lastLiveDayKey = todayK; refreshLiveData(); }
    const list = Array.isArray(rawTracks) ? rawTracks : (rawTracks ? [rawTracks] : []);
    const done = list.find(t => t && t.date && t.date.uts);
    if (!done) return;
    const uts = String(done.date.uts);
    if (lastSeenScrobbleUts === null) { lastSeenScrobbleUts = uts; return; }
    if (uts === lastSeenScrobbleUts) return;
    lastSeenScrobbleUts = uts;
    refreshLiveData();
}

async function refreshLiveData() {
    if (liveRefreshRunning) return;
    liveRefreshRunning = true;
    try {
        await fetchLastFmDelta(true);
        todayPlaysCache = { day: '', at: 0, plays: [] };
        try { updateStatStrip(); } catch (e) {}
        const db = await getActiveDatabase();
        if (db) { try { checkArtistMilestones(db); } catch (e) {} }
        if (currentActiveView === 'catalog') await loadStats(true);
        else if (currentActiveView === 'home') await refreshHomeView();
        else if (currentActiveView === 'profile') renderProfileSection();
        try { refreshEngagement(); } catch (e) {}
        const modalEl = document.getElementById('itemStatsModal');
        if (modalEl && modalEl.classList.contains('show') && currentOpenStats) {
            await showItemStats(currentOpenStats.type, currentOpenStats.name, currentOpenStats.artist, true);
        }
    } catch (e) {
        console.warn('Error en actualización en vivo:', e);
    } finally {
        liveRefreshRunning = false;
    }
}
window.refreshLiveData = refreshLiveData;
function startCurrentlyPlayingPolling() {
    if (currentlyPlayingTimer) clearInterval(currentlyPlayingTimer);
    fetchCurrentlyPlaying();
    currentlyPlayingTimer = setInterval(fetchCurrentlyPlaying, 7000);

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            fetchCurrentlyPlaying();
        }
    });

    window.addEventListener('focus', () => {
        fetchCurrentlyPlaying();
    });
}

// ----------------------------------------------------
// MOTOR PRINCIPAL DE DATOS: LAST.FM
// ----------------------------------------------------
function initLastFmState() {
    const { user, key } = getLastFmCredentials();

    if (user && key) {
        if (drawerLastFmStatus) {
            drawerLastFmStatus.textContent = `@${user}`;
            drawerLastFmStatus.className = 'badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-25';
        }
        if (btnLastFmDisconnect) btnLastFmDisconnect.classList.remove('d-none');
    } else {
        if (drawerLastFmStatus) {
            drawerLastFmStatus.textContent = 'Opcional';
            drawerLastFmStatus.className = 'badge bg-secondary bg-opacity-25';
        }
        if (btnLastFmDisconnect) btnLastFmDisconnect.classList.add('d-none');
    }
}

async function fetchLastFmGlobalStats(options = {}) {
    const { updateProfileUI = true } = options;
    const { user, key } = getLastFmCredentials();
    if (!user || !key) return;

    try {
        const res = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${encodeURIComponent(user)}&api_key=${encodeURIComponent(key)}&format=json`);
        const data = await res.json();
        if (data && data.user) {
            if (statStrip) {
                statStrip.classList.remove('d-none');
                statStrip.classList.add('d-flex');
            }
            if (stripPlaycount) stripPlaycount.textContent = formatNumber(data.user.playcount);
            if (stripArtists) stripArtists.textContent = formatNumber(data.user.artist_count);
            if (stripAlbums) stripAlbums.textContent = formatNumber(data.user.album_count);

            if (updateProfileUI) {
                const lfImg = data.user.image && data.user.image[1] && data.user.image[1]['#text'];
                if (userImg) userImg.src = lfImg || DEFAULT_AVATAR_SVG;
                if (drawerUserImg) drawerUserImg.src = lfImg || DEFAULT_AVATAR_SVG;
                if (drawerUserName) drawerUserName.textContent = data.user.name || `@${user}`;
                if (drawerUserFollowers) drawerUserFollowers.textContent = `${formatNumber(data.user.playcount)} scrobbles en Last.fm`;
            }

            const regUTS = parseInt(data.user.registered?.unixtime || data.user.registered?.['#text'] || 0, 10);
            if (regUTS) {
                const regDate = new Date(regUTS * 1000);
                const regYear = regDate.getFullYear();
                const regMonth = regDate.getMonth() + 1;
                renderYearsFilter(regYear, regMonth);
            }
        }
    } catch (e) {
        console.warn(e);
    }
}


function renderSkeletons(count = 10) {
    if (!statsList) return;
    statsList.innerHTML = Array.from({ length: count }).map((_, i) => `
        <div class="skeleton-card">
            <div class="skeleton" style="width: 22px; height: 16px;"></div>
            <div class="skeleton rounded" style="width: 36px; height: 36px; flex-shrink: 0;"></div>
            <div class="overflow-hidden flex-grow-1 d-flex flex-column gap-1.5" style="min-width: 0;">
                <div class="skeleton" style="width: ${60 + (i % 4) * 10}%; height: 13px;"></div>
                <div class="skeleton" style="width: ${40 + (i % 3) * 12}%; height: 10px;"></div>
            </div>
            <div class="skeleton rounded-pill" style="width: 48px; height: 18px; flex-shrink: 0;"></div>
        </div>
    `).join('');
}
window.renderSkeletons = renderSkeletons;

function renderErrorState(container, title, message, retryFnName) {
    if (!container) return;
    container.innerHTML = `
        <div class="text-center py-5 p-4 rounded border border-danger border-opacity-25 my-3" style="background-color: var(--bg-surface); grid-column: 1 / -1;">
            <i class="fa-solid fa-triangle-exclamation text-danger mb-3" style="font-size: 2.2rem;"></i>
            <h5 class="fw-bold text-white mb-2">${title}</h5>
            <p class="text-secondary small mx-auto mb-3" style="max-width: 440px;">${message}</p>
            <button class="btn btn-sm btn-outline-danger px-4 py-2 rounded-pill fw-semibold" onclick="${retryFnName}()">
                <i class="fa-solid fa-arrow-rotate-right me-1.5"></i> Reintentar
            </button>
        </div>
    `;
}
window.renderErrorState = renderErrorState;

// ====================================================
// CÁLCULO UNIFICADO Y EXACTO DE STREAMS REALES
// Sincroniza vistas previas, búsquedas, tops y modal
// ====================================================
function getStaticItemBasePlays(type, name, artist, baseItem = null, periodRange = currentRange) {
    const normN = normalizeKey(name || '');
    const normA = normalizeKey(artist || '');
    if (!normN && !normA) return 0;

    // 1. Obtener item base de los Lookups si no se pasó (búsqueda instantánea O(1))
    let item = baseItem;
    const db = unifiedDb || spotifyDb;
    if (!item && db) {
        if (type === 'track') {
            const k = `${normN}:::${normA}`;
            item = db.tracksLookup?.[k];
        } else if (type === 'artist') {
            item = db.artistsLookup?.[normN] || db.artistsLookup?.[normA];
        } else if (type === 'album') {
            const k = `${normN}:::${normA}`;
            item = db.albumsLookup?.[k];
        }
    }

    // 2. Extraer reproducciones base según periodo
    let basePlays = 0;
    if (item) {
        if (!periodRange || periodRange === 'overall' || periodRange === 'era-spotify') {
            basePlays = item.plays || 0;
        } else if (periodRange === 'this-week' || periodRange === '7day') {
            const { fromD, toD } = getThisWeekDateRange();
            if (item.months) {
                Object.entries(item.months).forEach(([ym, cnt]) => {
                    const mStart = `${ym}-01`;
                    const mEnd = `${ym}-31`;
                    if (mEnd >= fromD && mStart <= toD) {
                        basePlays += cnt;
                    }
                });
            }
        } else if (periodRange === 'last-month' || periodRange === '1month') {
            const lm = getLastMonthInfo();
            basePlays = item.months?.[lm.ym] || 0;
        } else if (periodRange === 'last-6-months' || periodRange === '6month') {
            const { fromD, toD } = getLast6MonthsRange();
            const fromYM = fromD.slice(0, 7);
            const toYM = toD.slice(0, 7);
            if (item.months) {
                Object.entries(item.months).forEach(([ym, cnt]) => {
                    if (ym >= fromYM && ym <= toYM) basePlays += cnt;
                });
            }
        } else if (periodRange.startsWith('year-')) {
            const yr = periodRange.replace('year-', '');
            basePlays = item.years?.[yr] || 0;
        } else if (periodRange.startsWith('month-')) {
            const ym = periodRange.replace('month-', '');
            const [y, m] = ym.split('-');
            const paddedYM = `${y}-${String(m).padStart(2, '0')}`;
            const unpaddedYM = `${y}-${parseInt(m, 10)}`;
            basePlays = item.months?.[paddedYM] || item.months?.[unpaddedYM] || 0;
        } else if (periodRange === 'current-month') {
            const now = new Date();
            const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            basePlays = item.months?.[ym] || 0;
        } else if (periodRange.startsWith('dates_')) {
            const [fromD, toD] = periodRange.replace('dates_', '').split('_to_');
            if (item.months) {
                Object.entries(item.months).forEach(([ym, cnt]) => {
                    const mStart = `${ym}-01`;
                    const mEnd = `${ym}-31`;
                    if (mEnd >= fromD && mStart <= toD) {
                        basePlays += cnt;
                    }
                });
            } else {
                basePlays = item.plays || 0;
            }
        } else {
            basePlays = item.plays || 0;
        }
    }

    // 3. Sumar Tidal / Ajustes manuales
    let tidalContribution = 0;
    if (currentSource === 'unified' && isAppOwner() && tidalEstimates) {
        if (type === 'track') {
            const trackEntry = tidalEstimates.tracks?.[normN + ':::' + normA] || tidalEstimates.tracks?.[normN + ':::'] || Object.entries(tidalEstimates.tracks || {}).find(([k]) => k.startsWith(normN + ':::'))?.[1];
            if (trackEntry) {
                if (!periodRange || periodRange === 'overall') {
                    tidalContribution = trackEntry.plays || 0;
                } else if (periodRange.startsWith('year-')) {
                    tidalContribution = trackEntry.years?.[periodRange.replace('year-', '')] || 0;
                } else if (periodRange.startsWith('month-')) {
                    tidalContribution = trackEntry.months?.[periodRange.replace('month-', '')] || 0;
                }
            }
        } else if (type === 'artist') {
            const artKey = Object.keys(tidalEstimates.artists || {}).find(k => normalizeKey(k) === normN || normalizeKey(k).includes(normN) || normN.includes(normalizeKey(k)));
            if (artKey && tidalEstimates.artists[artKey]) {
                const artEntry = tidalEstimates.artists[artKey];
                if (!periodRange || periodRange === 'overall') {
                    tidalContribution = artEntry.plays || 0;
                } else if (periodRange.startsWith('year-')) {
                    tidalContribution = artEntry.years?.[periodRange.replace('year-', '')] || 0;
                }
            }
        }
    }

    return basePlays + tidalContribution;
}
window.getStaticItemBasePlays = getStaticItemBasePlays;

let deltaIndexCache = {
    range: null,
    deltaLength: -1,
    tracks: new Map(),
    artists: new Map(),
    albums: new Map()
};

function getDeltaIndexForRange(periodRange = currentRange) {
    if (!Array.isArray(lastFmRecentDelta) || lastFmRecentDelta.length === 0) {
        return null;
    }
    if (deltaIndexCache.range === periodRange && deltaIndexCache.deltaLength === lastFmRecentDelta.length) {
        return deltaIndexCache;
    }

    const tracks = new Map();
    const artists = new Map();
    const albums = new Map();

    for (let i = 0; i < lastFmRecentDelta.length; i++) {
        const t = lastFmRecentDelta[i];
        if (!isDeltaItemInCurrentRange(t, periodRange)) continue;

        const tName = t._normName !== undefined ? t._normName : normalizeKey(t.name || '');
        const tArtist = t._normArtist !== undefined ? t._normArtist : normalizeKey(t.artist ? (t.artist['#text'] || t.artist.name || '') : '');
        const tAlbum = t._normAlbum !== undefined ? t._normAlbum : normalizeKey(t.album ? (t.album['#text'] || t.album.name || '') : '');

        if (tName) {
            const tk = `${tName}:::${tArtist}`;
            tracks.set(tk, (tracks.get(tk) || 0) + 1);
            if (!tracks.has(tName)) tracks.set(tName, 0);
            tracks.set(tName, tracks.get(tName) + 1);
        }
        if (tArtist) {
            artists.set(tArtist, (artists.get(tArtist) || 0) + 1);
        }
        if (tAlbum) {
            const ak = `${tAlbum}:::${tArtist}`;
            albums.set(ak, (albums.get(ak) || 0) + 1);
            if (!albums.has(tAlbum)) albums.set(tAlbum, 0);
            albums.set(tAlbum, albums.get(tAlbum) + 1);
        }
    }

    deltaIndexCache = {
        range: periodRange,
        deltaLength: lastFmRecentDelta.length,
        tracks,
        artists,
        albums
    };
    return deltaIndexCache;
}

function getRealItemPlays(type, name, artist, baseItem = null, periodRange = currentRange) {
    const staticBase = getStaticItemBasePlays(type, name, artist, baseItem, periodRange);

    const normN = normalizeKey(name || '');
    const normA = normalizeKey(artist || '');
    if (!normN && !normA) return staticBase;

    // 4. Sumar Delta en vivo de Last.fm con índice O(1) de alto rendimiento
    let deltaContribution = 0;
    if (currentSource === 'unified' && Array.isArray(lastFmRecentDelta) && lastFmRecentDelta.length > 0) {
        const dIdx = getDeltaIndexForRange(periodRange);
        if (dIdx) {
            if (type === 'track') {
                const fullKey = `${normN}:::${normA}`;
                if (dIdx.tracks.has(fullKey)) {
                    deltaContribution = dIdx.tracks.get(fullKey);
                } else if (!normA && dIdx.tracks.has(normN)) {
                    deltaContribution = dIdx.tracks.get(normN);
                } else {
                    // Fallback para nombres con feat/variaciones leves de artista
                    for (const [k, count] of dIdx.tracks.entries()) {
                        if (!k.includes(':::')) continue;
                        const [kN, kA] = k.split(':::');
                        if (kN === normN && (!normA || !kA || kA.includes(normA) || normA.includes(kA))) {
                            deltaContribution += count;
                        }
                    }
                }
            } else if (type === 'artist') {
                deltaContribution = dIdx.artists.get(normN) || 0;
            } else if (type === 'album') {
                const fullKey = `${normN}:::${normA}`;
                if (dIdx.albums.has(fullKey)) {
                    deltaContribution = dIdx.albums.get(fullKey);
                } else if (!normA && dIdx.albums.has(normN)) {
                    deltaContribution = dIdx.albums.get(normN);
                }
            }
        }
    }

    return staticBase + deltaContribution;
}
window.getRealItemPlays = getRealItemPlays;

async function loadStats(silent = false) {
    if (silent !== true) {
        if (filterSearchInput) filterSearchInput.value = '';
        if (typeof filterSearchDebounceTimer !== 'undefined' && filterSearchDebounceTimer) {
            clearTimeout(filterSearchDebounceTimer);
        }
        renderSkeletons(currentLimit === 'all' ? 20 : Math.min(parseInt(currentLimit, 10) || 12, 16));
    }
    if (loader) loader.classList.add('d-none');

    // ====================================================
    // MODO HISTORIAL EXTENDIDO SPOTIFY (2019 - 2026) / UNIFICADO
    // ====================================================
    if (currentSource === 'spotify' || currentSource === 'unified') {
        const activeDb = await getActiveDatabase(true);
        if (currentSource === 'unified' && !hasFetchedLastFmDelta) {
            await fetchLastFmDelta();
        }
        loader.classList.add('d-none');

        if (!activeDb) {
            renderErrorState(statsList, 'Error al cargar la biblioteca', 'No se pudo leer la base de datos histórica unificada.', 'loadStats');
            return;
        }

        updateStatStrip();
        updateQuickFilterPills(currentRange);
        renderCatalogActivityChart(currentRange, activeDb);
        checkArtistMilestones(activeDb);
        initEngagement(activeDb);

        let topData = activeDb.yearlyTops?.overall;
        let isDateRange = false;
        let dateRangeTo = '';

        if (currentRange === 'this-week' || currentRange === '7day') {
            const { fromD, toD } = getThisWeekDateRange();
            topData = getRangeTopData(activeDb, fromD, toD);
            isDateRange = true;
            dateRangeTo = toD;
        } else if (currentRange === 'last-month' || currentRange === '1month') {
            const lm = getLastMonthInfo();
            topData = activeDb.yearlyTops?.[lm.prevY]?.months?.[lm.prevM] || getRangeTopData(activeDb, lm.fromD, lm.toD);
            isDateRange = true;
            dateRangeTo = lm.toD;
        } else if (currentRange === 'last-6-months' || currentRange === '6month') {
            const { fromD, toD } = getLast6MonthsRange();
            topData = getRangeTopData(activeDb, fromD, toD);
            isDateRange = true;
            dateRangeTo = toD;
        } else if (currentRange === 'current-month') {
            const now = new Date();
            const curY = now.getFullYear();
            const curM = String(now.getMonth() + 1).padStart(2, '0');
            const lastDay = new Date(curY, now.getMonth() + 1, 0).getDate();
            topData = getRangeTopData(activeDb, `${curY}-${curM}-01`, `${curY}-${curM}-${lastDay}`);
            isDateRange = true;
            dateRangeTo = `${curY}-${curM}-${lastDay}`;
        } else if (currentRange === '4weeks') {
            const now = new Date();
            const fourWeeksAgo = new Date(now.getTime() - (28 * 24 * 60 * 60 * 1000));
            const fromD = fourWeeksAgo.toISOString().slice(0, 10);
            const toD = now.toISOString().slice(0, 10);
            topData = getRangeTopData(activeDb, fromD, toD);
            isDateRange = true;
            dateRangeTo = toD;
        } else if (currentRange === 'era-tidal') {
            const tidal = tidalEstimates || await loadTidalEstimates();
            const tTracks = tidal ? Object.values(tidal.tracks).map(t => ({
                name: t.name,
                artist: t.artist,
                album: t.album,
                plays: t.plays,
                uri: null
            })).sort((a,b) => b.plays - a.plays) : [];
            const tArtists = tidal ? Object.entries(tidal.artists).map(([name, obj]) => ({
                name: name,
                plays: obj.plays
            })).sort((a,b) => b.plays - a.plays) : [];
            topData = {
                plays: 16000,
                hours: '850',
                tracks: tTracks,
                artists: tArtists,
                albums: []
            };
        } else if (currentRange === 'era-spotify') {
            topData = getRangeTopData(activeDb, '2019-05-01', '2025-08-31');
        } else if (currentRange === 'era-lastfm') {
            topData = getRangeTopData(activeDb, '2025-08-01', '2026-12-31');
            isDateRange = true;
            dateRangeTo = '2026-12-31';
        } else if (currentRange && currentRange.startsWith('dates_')) {
            const [fromD, toD] = currentRange.replace('dates_', '').split('_to_');
            topData = getRangeTopData(activeDb, fromD, toD);
            isDateRange = true;
            dateRangeTo = toD;
        } else if (currentRange.startsWith('year-')) {
            const y = currentRange.replace('year-', '');
            topData = activeDb.yearlyTops?.[y] || activeDb.yearlyTops?.overall;
        } else if (currentRange.startsWith('month-')) {
            const parts = currentRange.split('-');
            const y = parts[1];
            const m = parts[2];
            const mData = activeDb.yearlyTops?.[y]?.months?.[m] || activeDb.yearlyTops?.[y]?.months?.[String(parseInt(m, 10))];
            topData = mData || {
                plays: 0,
                hours: '0',
                tracks: [],
                artists: [],
                albums: []
            };
        }

        const appliesDelta = (currentSource === 'unified' && lastFmRecentDelta.length > 0 &&
            (currentRange === 'overall' || currentRange === 'this-week' || currentRange === '7day' || currentRange === 'last-month' || currentRange === '1month' || currentRange === 'last-6-months' || currentRange === '6month' || currentRange.startsWith('year-202') || currentRange.startsWith('month-202') || currentRange === 'current-month' || currentRange === '4weeks' || currentRange === 'era-lastfm' ||
             (isDateRange && dateRangeTo >= '2025-08-01')));

        if (currentType === 'tracks') {
            const rawTracks = topData?.tracks || [];
            if (rawTracks.length === 0 && (!appliesDelta || lastFmRecentDelta.length === 0)) {
                statsList.innerHTML = '<div class="text-center text-secondary py-5">No se encontraron canciones registradas para este periodo.</div>';
                return;
            }

            let combinedTracks = rawTracks.map(t => ({
                name: t.name,
                artist: t.artist,
                album: t.album,
                plays: t.plays,
                uri: t.uri
            }));

            // Integración de Tidal en Tops (Histórico Total, Años 2025/2026 o Meses de esa era)
            if (currentSource === 'unified' && currentRange !== 'era-tidal') {
                const tidal = tidalEstimates || await loadTidalEstimates();
                if (tidal && tidal.tracks) {
                    const trackMap = new Map();
                    combinedTracks.forEach(t => {
                        const key = `${normalizeKey(t.name)}:::${normalizeKey(t.artist || '')}`;
                        trackMap.set(key, t);
                    });

                    Object.entries(tidal.tracks).forEach(([k, tEntry]) => {
                        let addPlays = 0;
                        if (currentRange === 'overall') {
                            addPlays = tEntry.plays || 0;
                        } else if (currentRange === 'year-2025') {
                            addPlays = tEntry.years?.['2025'] || 0;
                        } else if (currentRange === 'year-2026') {
                            addPlays = tEntry.years?.['2026'] || 0;
                        } else if (currentRange.startsWith('month-2025-') || currentRange.startsWith('month-2026-')) {
                            const ym = currentRange.replace('month-', '');
                            const [cy, cm] = ym.split('-');
                            const paddedYm = `${cy}-${String(cm).padStart(2, '0')}`;
                            addPlays = tEntry.months?.[paddedYm] || 0;
                        } else if (currentRange.startsWith('dates_')) {
                            const [fromD, toD] = currentRange.replace('dates_', '').split('_to_');
                            if (tEntry.months) {
                                Object.entries(tEntry.months).forEach(([ym, cnt]) => {
                                    const mStart = `${ym}-01`;
                                    const mEnd = `${ym}-31`;
                                    if (mEnd >= fromD && mStart <= toD) {
                                        addPlays += cnt;
                                    }
                                });
                            }
                        }

                        if (addPlays > 0) {
                            const key = `${normalizeKey(tEntry.name)}:::${normalizeKey(tEntry.artist || '')}`;
                            if (trackMap.has(key)) {
                                trackMap.get(key).plays += addPlays;
                            } else {
                                const newEntry = {
                                    name: tEntry.name,
                                    artist: tEntry.artist,
                                    album: tEntry.album || '',
                                    plays: addPlays,
                                    uri: null
                                };
                                trackMap.set(key, newEntry);
                                combinedTracks.push(newEntry);
                            }
                        }
                    });
                    combinedTracks.sort((a, b) => b.plays - a.plays);
                }
            }

            if (appliesDelta) {
                const trackMap = new Map();
                combinedTracks.forEach(t => {
                    const key = `${normalizeKey(t.name)}:::${normalizeKey(t.artist || '')}`;
                    trackMap.set(key, t);
                });

                lastFmRecentDelta.forEach(dt => {
                    if (!isDeltaItemInCurrentRange(dt, currentRange)) return;
                    const dtName = dt.name;
                    const dtArtist = dt.artist ? (dt.artist['#text'] || dt.artist.name || '') : '';
                    const dtAlbum = dt.album ? (dt.album['#text'] || dt.album.name || '') : '';
                    const key = `${normalizeKey(dtName)}:::${normalizeKey(dtArtist)}`;
                    if (trackMap.has(key)) {
                        trackMap.get(key).plays += 1;
                    } else {
                        // Buscar si la pista ya existía en la base de datos principal (búsqueda instantánea O(1))
                        const baseLookup = activeDb.tracksLookup?.[key];
                        let baseP = 0;
                        if (baseLookup) {
                            baseP = getStaticItemBasePlays('track', dtName, dtArtist, baseLookup, currentRange);
                        }
                        const newEntry = {
                            name: dtName,
                            artist: dtArtist,
                            album: dtAlbum,
                            plays: baseP + 1,
                            uri: baseLookup?.uri || null
                        };
                        trackMap.set(key, newEntry);
                        combinedTracks.push(newEntry);
                    }
                });

                combinedTracks.sort((a, b) => b.plays - a.plays);
            }

            const tracks = combinedTracks.slice(0, currentLimit).map(t => ({
                name: t.name,
                artist: { name: t.artist },
                album: { name: t.album },
                playcount: t.plays,
                uri: t.uri
            }));
            currentLoadedItems = tracks;
            renderTracks(tracks);
            return;
        }

        if (currentType === 'artists') {
            const rawArtists = topData?.artists || [];
            if (rawArtists.length === 0 && (!appliesDelta || lastFmRecentDelta.length === 0)) {
                statsList.innerHTML = '<div class="text-center text-secondary py-5">No se encontraron artistas registrados para este periodo.</div>';
                return;
            }

            let combinedArtists = rawArtists.map(a => ({
                name: a.name,
                plays: a.plays
            }));

            // Integración de Artistas de Tidal en Tops
            if (currentSource === 'unified' && currentRange !== 'era-tidal') {
                const tidal = tidalEstimates || await loadTidalEstimates();
                if (tidal && tidal.artists) {
                    const artistMap = new Map();
                    combinedArtists.forEach(a => {
                        artistMap.set(normalizeKey(a.name), a);
                    });

                    Object.entries(tidal.artists).forEach(([artName, aEntry]) => {
                        let addPlays = 0;
                        if (currentRange === 'overall') {
                            addPlays = aEntry.plays || 0;
                        } else if (currentRange === 'year-2025') {
                            addPlays = aEntry.years?.['2025'] || 0;
                        } else if (currentRange === 'year-2026') {
                            addPlays = aEntry.years?.['2026'] || 0;
                        } else if (currentRange.startsWith('month-2025-') || currentRange.startsWith('month-2026-')) {
                            const ym = currentRange.replace('month-', '');
                            const [cy, cm] = ym.split('-');
                            const paddedYm = `${cy}-${String(cm).padStart(2, '0')}`;
                            if (tidal.months?.[paddedYm]?.artists?.[artName]) {
                                addPlays = tidal.months[paddedYm].artists[artName] || 0;
                            }
                        } else if (currentRange.startsWith('dates_')) {
                            const [fromD, toD] = currentRange.replace('dates_', '').split('_to_');
                            if (tidal.months) {
                                Object.entries(tidal.months).forEach(([ym, mObj]) => {
                                    const mStart = `${ym}-01`;
                                    const mEnd = `${ym}-31`;
                                    if (mEnd >= fromD && mStart <= toD && mObj.artists?.[artName]) {
                                        addPlays += mObj.artists[artName];
                                    }
                                });
                            }
                        }

                        if (addPlays > 0) {
                            const key = normalizeKey(artName);
                            if (artistMap.has(key)) {
                                artistMap.get(key).plays += addPlays;
                            } else {
                                const newEntry = { name: artName, plays: addPlays };
                                artistMap.set(key, newEntry);
                                combinedArtists.push(newEntry);
                            }
                        }
                    });
                    combinedArtists.sort((a, b) => b.plays - a.plays);
                }
            }

            if (appliesDelta) {
                const artistMap = new Map();
                combinedArtists.forEach(a => {
                    artistMap.set(normalizeKey(a.name), a);
                });

                lastFmRecentDelta.forEach(dt => {
                    if (!isDeltaItemInCurrentRange(dt, currentRange)) return;
                    const dtArtist = dt.artist ? (dt.artist['#text'] || dt.artist.name || '') : '';
                    if (!dtArtist) return;
                    const key = normalizeKey(dtArtist);
                    if (artistMap.has(key)) {
                        artistMap.get(key).plays += 1;
                    } else {
                        const baseArt = activeDb.artistsLookup?.[key];
                        let baseP = 0;
                        if (baseArt) {
                            baseP = getStaticItemBasePlays('artist', dtArtist, '', baseArt, currentRange);
                        }
                        const newEntry = { name: dtArtist, plays: baseP + 1 };
                        artistMap.set(key, newEntry);
                        combinedArtists.push(newEntry);
                    }
                });

                combinedArtists.sort((a, b) => b.plays - a.plays);
            }

            const artists = combinedArtists.slice(0, currentLimit).map(a => ({
                name: a.name,
                playcount: a.plays
            }));
            currentLoadedItems = artists;
            renderArtists(artists);
            return;
        }

        if (currentType === 'albums') {
            const rawAlbums = topData?.albums || [];
            if (rawAlbums.length === 0 && (!appliesDelta || lastFmRecentDelta.length === 0)) {
                statsList.innerHTML = '<div class="text-center text-secondary py-5">No se encontraron álbumes registrados para este periodo.</div>';
                return;
            }

            let combinedAlbums = rawAlbums.map(al => ({
                name: al.name,
                artist: al.artist,
                plays: al.plays
            }));

            if (appliesDelta) {
                const albumMap = new Map();
                combinedAlbums.forEach(al => {
                    const key = `${normalizeKey(al.name)}:::${normalizeKey(al.artist || '')}`;
                    albumMap.set(key, al);
                });

                lastFmRecentDelta.forEach(dt => {
                    if (!isDeltaItemInCurrentRange(dt, currentRange)) return;
                    const dtAlbum = dt.album ? (dt.album['#text'] || dt.album.name || '') : '';
                    const dtArtist = dt.artist ? (dt.artist['#text'] || dt.artist.name || '') : '';
                    if (!dtAlbum) return;
                    const key = `${normalizeKey(dtAlbum)}:::${normalizeKey(dtArtist)}`;
                    if (albumMap.has(key)) {
                        albumMap.get(key).plays += 1;
                    } else {
                        const baseAlb = activeDb.albumsLookup?.[key];
                        let baseP = 0;
                        if (baseAlb) {
                            baseP = getStaticItemBasePlays('album', dtAlbum, dtArtist, baseAlb, currentRange);
                        }
                        const newEntry = { name: dtAlbum, artist: dtArtist, plays: baseP + 1 };
                        albumMap.set(key, newEntry);
                        combinedAlbums.push(newEntry);
                    }
                });

                combinedAlbums.sort((a, b) => b.plays - a.plays);
            }

            const albums = combinedAlbums.slice(0, currentLimit).map(al => ({
                name: al.name,
                artist: { name: al.artist },
                playcount: al.plays
            }));
            currentLoadedItems = albums;
            renderAlbums(albums);
            return;
        }

        if (currentType === 'recent') {
            const rawRecent = activeDb.recent || [];

            let deltaFormatted = [];
            if (currentSource === 'unified' && lastFmRecentDelta.length > 0) {
                deltaFormatted = lastFmRecentDelta.map(dt => ({
                    name: dt.name,
                    artist: { name: dt.artist ? (dt.artist['#text'] || dt.artist.name || '') : '' },
                    album: { name: dt.album ? (dt.album['#text'] || dt.album.name || '') : '' },
                    date: dt.date?.uts ? { uts: parseInt(dt.date.uts, 10) } : { uts: Math.floor(Date.now() / 1000) },
                    uri: null,
                    '@attr': dt['@attr']
                }));
            }

            const spotifyFormatted = rawRecent.map(r => ({
                name: r.name,
                artist: { name: r.artist },
                album: { name: r.album },
                date: { uts: Math.floor(new Date(r.ts).getTime() / 1000) },
                uri: r.uri
            }));

            const combinedRecent = [...deltaFormatted, ...spotifyFormatted];
            combinedRecent.sort((a, b) => {
                const aNow = a['@attr']?.nowplaying === 'true';
                const bNow = b['@attr']?.nowplaying === 'true';
                if (aNow && !bNow) return -1;
                if (!aNow && bNow) return 1;
                const utsb = parseInt(b.date?.uts, 10) || 0;
                const utsa = parseInt(a.date?.uts, 10) || 0;
                return utsb - utsa;
            });

            if (combinedRecent.length === 0) {
                statsList.innerHTML = '<div class="text-center text-secondary py-5">No se encontraron reproducciones registradas.</div>';
                return;
            }

            const recent = combinedRecent.slice(0, currentLimit);
            currentLoadedItems = recent;
            renderRecent(recent);
            return;
        }
        return;
    }

    // ====================================================
    // MODO EN VIVO LAST.FM
    // ====================================================
    const { user, key } = getLastFmCredentials();

    if (!user || !key) {
        loader.classList.add('d-none');
        statsList.innerHTML = `
            <div class="text-center py-5 p-4 rounded border border-danger border-opacity-25 my-3" style="background-color: var(--bg-surface);">
                <i class="fa-brands fa-lastfm text-danger mb-3" style="font-size: 2.8rem;"></i>
                <h5 class="fw-bold mb-2">Conecta tu cuenta de Last.fm</h5>
                <p class="text-secondary small mx-auto mb-3" style="max-width: 420px;">
                    Para ver tus datos en vivo de Last.fm, ingresa tus credenciales.
                </p>
                <button class="btn btn-sm btn-danger px-3 py-2 rounded-pill fw-semibold" onclick="openLastFmModal()">
                    <i class="fa-brands fa-lastfm me-1"></i> Conectar con Last.fm
                </button>
            </div>
        `;
        return;
    }

    try {
        // Filtro por mes específico (ej: month-2026-9)
        if (currentRange.startsWith('month-')) {
            const parts = currentRange.split('-');
            const year = parseInt(parts[1], 10);
            const month = parseInt(parts[2], 10);
            const fromUTS = Math.floor(new Date(Date.UTC(year, month - 1, 1, 0, 0, 0)).getTime() / 1000);
            const toUTS = Math.floor(new Date(Date.UTC(year, month, 0, 23, 59, 59)).getTime() / 1000);
            await loadTimestampRangeStats(user, key, fromUTS, toUTS, `${MONTH_NAMES[month - 1]} de ${year}`);
            return;
        }

        // Filtro por año específico (ej: year-2026, year-2025)
        if (currentRange.startsWith('year-')) {
            const year = parseInt(currentRange.replace('year-', ''), 10);
            const fromUTS = Math.floor(new Date(Date.UTC(year, 0, 1, 0, 0, 0)).getTime() / 1000);
            const toUTS = Math.floor(new Date(Date.UTC(year, 11, 31, 23, 59, 59)).getTime() / 1000);
            await loadTimestampRangeStats(user, key, fromUTS, toUTS, `el año ${year}`);
            return;
        }

        let apiPeriod = currentRange;
        if (apiPeriod === 'this-week') apiPeriod = '7day';
        else if (apiPeriod === 'last-month') apiPeriod = '1month';
        else if (apiPeriod === 'last-6-months') apiPeriod = '6month';

        // 1. TOP CANCIONES (Ordenado por scrobbles)
        if (currentType === 'tracks') {
            const res = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getTopTracks&user=${encodeURIComponent(user)}&period=${apiPeriod}&limit=${currentLimit}&api_key=${encodeURIComponent(key)}&format=json`);
            const data = await res.json();
            loader.classList.add('d-none');
            const tracks = data?.toptracks?.track || [];
            if (tracks.length === 0) {
                statsList.innerHTML = '<div class="text-center text-secondary py-5">No se encontraron canciones registradas para este periodo.</div>';
                return;
            }
            currentLoadedItems = tracks;
            renderTracks(tracks);
            return;
        }

        // 2. TOP ARTISTAS (Ordenado por scrobbles)
        if (currentType === 'artists') {
            const res = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getTopArtists&user=${encodeURIComponent(user)}&period=${apiPeriod}&limit=${currentLimit}&api_key=${encodeURIComponent(key)}&format=json`);
            const data = await res.json();
            loader.classList.add('d-none');
            const artists = data?.topartists?.artist || [];
            if (artists.length === 0) {
                statsList.innerHTML = '<div class="text-center text-secondary py-5">No se encontraron artistas registrados para este periodo.</div>';
                return;
            }
            currentLoadedItems = artists;
            renderArtists(artists);
            return;
        }

        // 3. TOP ÁLBUMES (Ordenado por scrobbles)
        if (currentType === 'albums') {
            const res = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getTopAlbums&user=${encodeURIComponent(user)}&period=${apiPeriod}&limit=${currentLimit}&api_key=${encodeURIComponent(key)}&format=json`);
            const data = await res.json();
            loader.classList.add('d-none');
            const albums = data?.topalbums?.album || [];
            if (albums.length === 0) {
                statsList.innerHTML = '<div class="text-center text-secondary py-5">No se encontraron álbumes registrados para este periodo.</div>';
                return;
            }
            currentLoadedItems = albums;
            renderAlbums(albums);
            return;
        }

        // 4. RECIENTES (Historial cronológico)
        if (currentType === 'recent') {
            const res = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&user=${encodeURIComponent(user)}&limit=${currentLimit}&api_key=${encodeURIComponent(key)}&format=json`);
            const data = await res.json();
            loader.classList.add('d-none');
            const rawTracks = data?.recenttracks?.track || [];
            const tracks = Array.isArray(rawTracks) ? rawTracks : (rawTracks ? [rawTracks] : []);
            if (tracks.length === 0) {
                statsList.innerHTML = '<div class="text-center text-secondary py-5">No se encontraron reproducciones recientes.</div>';
                return;
            }
            tracks.sort((a, b) => {
                const aNow = a['@attr']?.nowplaying === 'true';
                const bNow = b['@attr']?.nowplaying === 'true';
                if (aNow && !bNow) return -1;
                if (!aNow && bNow) return 1;
                const utsb = parseInt(b.date?.uts || b.uts, 10) || 0;
                const utsa = parseInt(a.date?.uts || a.uts, 10) || 0;
                return utsb - utsa;
            });
            currentLoadedItems = tracks;
            renderRecent(tracks);
            return;
        }
    } catch (err) {
        console.error('Error al cargar stats:', err);
        if (loader) loader.classList.add('d-none');
        renderErrorState(statsList, 'Error de conexión con Last.fm', 'Hubo un inconveniente al consultar las estadísticas en tiempo real de Last.fm.', 'loadStats');
    }
}

// ----------------------------------------------------
// FILTRO POR AÑOS Y MESES ESPECÍFICOS DE USO DE LAST.FM
// ----------------------------------------------------
let userRegYear = null;
let userRegMonth = null;

function renderYearsFilter(regYear, regMonth) {
    userRegYear = regYear;
    userRegMonth = regMonth;
    if (!yearsFilterContainer || !yearsPillList) return;
    const currentYear = new Date().getFullYear();
    yearsPillList.innerHTML = '';

    const years = [];
    for (let y = currentYear; y >= regYear; y--) {
        years.push(y);
    }

    if (years.length === 0) {
        yearsFilterContainer.classList.add('d-none');
        yearsFilterContainer.classList.remove('d-flex');
        return;
    }

    yearsFilterContainer.classList.remove('d-none');
    yearsFilterContainer.classList.add('d-flex');

    years.forEach(year => {
        const btn = document.createElement('button');
        btn.type = 'button';
        const isYearActive = currentRange.startsWith(`year-${year}`) || currentRange.startsWith(`month-${year}-`);
        btn.className = `pill-btn year-pill-btn ${isYearActive ? 'active' : ''}`;
        btn.setAttribute('data-year', year);
        btn.textContent = year;

        btn.addEventListener('click', () => {
            // Deseleccionar botones de periodos relativos
            document.querySelectorAll('#time-range-tabs .pill-btn').forEach(b => b.classList.remove('active'));
            // Activar este botón de año
            document.querySelectorAll('.year-pill-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Renderizar los meses para este año
            currentRange = `year-${year}`;
            renderMonthsFilter(year, userRegYear, userRegMonth);
            loadStats();
        });

        yearsPillList.appendChild(btn);
    });
}

function renderMonthsFilter(year, regYear, regMonth) {
    if (!monthsFilterContainer || !monthsPillList) return;
    monthsPillList.innerHTML = '';

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // 1-12

    const startMonth = (year === regYear) ? (regMonth || 1) : 1;
    const endMonth = (year === currentYear) ? currentMonth : 12;

    monthsFilterContainer.classList.remove('d-none');
    monthsFilterContainer.classList.add('d-flex');

    // Botón "Todo el año"
    const allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = `pill-btn month-pill-btn ${currentRange === `year-${year}` ? 'active' : ''}`;
    allBtn.textContent = 'Todo el año';
    allBtn.addEventListener('click', () => {
        document.querySelectorAll('.month-pill-btn').forEach(b => b.classList.remove('active'));
        allBtn.classList.add('active');
        currentRange = `year-${year}`;
        loadStats();
    });
    monthsPillList.appendChild(allBtn);

    // Botones de cada mes disponible para ese año
    for (let m = startMonth; m <= endMonth; m++) {
        const mBtn = document.createElement('button');
        mBtn.type = 'button';
        mBtn.className = `pill-btn month-pill-btn ${currentRange === `month-${year}-${m}` ? 'active' : ''}`;
        mBtn.textContent = MONTH_SHORT_NAMES[m - 1];
        mBtn.setAttribute('title', `${MONTH_NAMES[m - 1]} ${year}`);

        mBtn.addEventListener('click', () => {
            document.querySelectorAll('#time-range-tabs .pill-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.month-pill-btn').forEach(b => b.classList.remove('active'));
            mBtn.classList.add('active');

            currentRange = `month-${year}-${m}`;
            loadStats();
        });

        monthsPillList.appendChild(mBtn);
    }
}

async function loadTimestampRangeStats(user, key, fromUTS, toUTS, emptyLabel) {
    try {
        // 1. TOP CANCIONES (user.getweeklytrackchart)
        if (currentType === 'tracks') {
            const res = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getweeklytrackchart&user=${encodeURIComponent(user)}&from=${fromUTS}&to=${toUTS}&api_key=${encodeURIComponent(key)}&format=json`);
            const data = await res.json();
            loader.classList.add('d-none');
            const tracks = data?.weeklytrackchart?.track || [];
            if (tracks.length === 0) {
                statsList.innerHTML = `<div class="text-center text-secondary py-5">No se encontraron canciones registradas para ${emptyLabel}.</div>`;
                return;
            }
            const sliced = tracks.slice(0, currentLimit);
            currentLoadedItems = sliced;
            renderTracks(sliced);
            return;
        }

        // 2. TOP ARTISTAS (user.getweeklyartistchart)
        if (currentType === 'artists') {
            const res = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getweeklyartistchart&user=${encodeURIComponent(user)}&from=${fromUTS}&to=${toUTS}&api_key=${encodeURIComponent(key)}&format=json`);
            const data = await res.json();
            loader.classList.add('d-none');
            const artists = data?.weeklyartistchart?.artist || [];
            if (artists.length === 0) {
                statsList.innerHTML = `<div class="text-center text-secondary py-5">No se encontraron artistas registrados para ${emptyLabel}.</div>`;
                return;
            }
            const sliced = artists.slice(0, currentLimit);
            currentLoadedItems = sliced;
            renderArtists(sliced);
            return;
        }

        // 3. TOP ÁLBUMES (user.getweeklyalbumchart)
        if (currentType === 'albums') {
            const res = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getweeklyalbumchart&user=${encodeURIComponent(user)}&from=${fromUTS}&to=${toUTS}&api_key=${encodeURIComponent(key)}&format=json`);
            const data = await res.json();
            loader.classList.add('d-none');
            const albums = data?.weeklyalbumchart?.album || [];
            if (albums.length === 0) {
                statsList.innerHTML = `<div class="text-center text-secondary py-5">No se encontraron álbumes registrados para ${emptyLabel}.</div>`;
                return;
            }
            const sliced = albums.slice(0, currentLimit);
            currentLoadedItems = sliced;
            renderAlbums(sliced);
            return;
        }

        // 4. HISTORIAL RECIENTE (user.getrecenttracks con from y to)
        if (currentType === 'recent') {
            const res = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(user)}&from=${fromUTS}&to=${toUTS}&limit=${currentLimit}&api_key=${encodeURIComponent(key)}&format=json`);
            const data = await res.json();
            loader.classList.add('d-none');
            const rawTracks = data?.recenttracks?.track || [];
            const tracks = Array.isArray(rawTracks) ? rawTracks : (rawTracks ? [rawTracks] : []);
            if (tracks.length === 0) {
                statsList.innerHTML = `<div class="text-center text-secondary py-5">No se encontraron reproducciones registradas en ${emptyLabel}.</div>`;
                return;
            }
            tracks.sort((a, b) => {
                const aNow = a['@attr']?.nowplaying === 'true';
                const bNow = b['@attr']?.nowplaying === 'true';
                if (aNow && !bNow) return -1;
                if (!aNow && bNow) return 1;
                const utsb = parseInt(b.date?.uts, 10) || 0;
                const utsa = parseInt(a.date?.uts, 10) || 0;
                return utsb - utsa;
            });
            currentLoadedItems = tracks;
            renderRecent(tracks);
            return;
        }
    } catch (err) {
        console.error('Error al cargar stats por rango:', err);
        if (loader) loader.classList.add('d-none');
        renderErrorState(statsList, 'Error de conexión con Last.fm', `Hubo un problema al consultar datos de ${emptyLabel}.`, 'loadStats');
    }
}

// ----------------------------------------------------
// RESOLUCIÓN DE IMÁGENES (SPOTIFY SIN LOGIN + LAST.FM + FALLBACKS)
// ----------------------------------------------------
const ART_CACHE_VERSION = 'v80_spotify_hd';
const artCache = JSON.parse(localStorage.getItem('spoti_art_cache') || '{}');

// Migración y saneamiento: Si la caché contiene URLs no oficiales o previas (Deezer/iTunes/placeholders), se descartan
(function sanitizeArtCache() {
    try {
        const currentVer = localStorage.getItem('spoti_art_cache_version');
        if (currentVer !== ART_CACHE_VERSION) {
            let removed = 0;
            for (const k of Object.keys(artCache)) {
                const val = artCache[k];
                // Mantener exclusivamente carátulas oficiales de Spotify (i.scdn.co o scdn.co)
                if (typeof val !== 'string' || !val.includes('scdn.co')) {
                    delete artCache[k];
                    removed++;
                }
            }
            localStorage.setItem('spoti_art_cache', JSON.stringify(artCache));
            localStorage.setItem('spoti_art_cache_version', ART_CACHE_VERSION);
            if (removed > 0) {
                console.log(`[TuneTracker] Caché de carátulas actualizada a Spotify HD. ${removed} imágenes obsoletas depuradas.`);
            }
        }
    } catch (e) {}
})();

function saveArtCache() {
    try {
        localStorage.setItem('spoti_art_cache', JSON.stringify(artCache));
    } catch (e) {}
}

function extractLastFmImg(images) {
    if (!Array.isArray(images) || images.length === 0) return null;
    const rev = [...images].reverse();
    for (const img of rev) {
        const url = img?.['#text'];
        if (url && typeof url === 'string' && url.startsWith('http') && !url.includes('2a96cbd8b46e442fc41c2b86b821562f.png')) {
            return url;
        }
    }
    return null;
}

async function resolveSpotifyArtwork(name, artist, type = 'track', elementId) {
    if (!navigator.onLine) return; // Si no hay conexión a internet, no consultar APIs externas

    const key = `${type}::${normalizeKey(name)}::${normalizeKey(artist || '')}`;

    // Si ya existe en caché y es oficial de Spotify, reutilizarla directamente
    if (artCache[key] && typeof artCache[key] === 'string' && artCache[key].includes('scdn.co')) {
        const el = document.getElementById(elementId);
        if (el) el.src = artCache[key];
        return artCache[key];
    }

    // 1. PRIORIDAD: Consultar el endpoint serverless unificado /api/artwork (Spotify HD sin login + Last.fm + CDN cache)
    try {
        const apiRes = await fetch(`/api/artwork?type=${encodeURIComponent(type)}&name=${encodeURIComponent(name)}&artist=${encodeURIComponent(artist || '')}`);
        if (apiRes.ok) {
            const apiData = await apiRes.json();
            if (apiData && apiData.url) {
                artCache[key] = apiData.url;
                saveArtCache();
                const el = document.getElementById(elementId);
                if (el) el.src = apiData.url;
                return apiData.url;
            }
        }
    } catch (e) {}

    // 2. Fallback Last.fm API directa en cliente
    const { key: lfKeyFromCreds } = (typeof getLastFmCredentials === 'function') ? getLastFmCredentials() : { key: null };
    const lfKey = lfKeyFromCreds || DEFAULT_LASTFM_KEY;
    if (lfKey) {
        try {
            let lfUrl = null;
            if (type === 'track') {
                if (artist) {
                    const lfRes = await fetch(`https://ws.audioscrobbler.com/2.0/?method=track.getinfo&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(name)}&api_key=${encodeURIComponent(lfKey)}&format=json`);
                    if (lfRes.ok) {
                        const lfData = await lfRes.json();
                        lfUrl = extractLastFmImg(lfData?.track?.album?.image);
                    }
                }
            } else if (type === 'album') {
                if (artist) {
                    const lfRes = await fetch(`https://ws.audioscrobbler.com/2.0/?method=album.getinfo&artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(name)}&api_key=${encodeURIComponent(lfKey)}&format=json`);
                    if (lfRes.ok) {
                        const lfData = await lfRes.json();
                        lfUrl = extractLastFmImg(lfData?.album?.image);
                    }
                }
                if (!lfUrl) {
                    const lfSearch = await fetch(`https://ws.audioscrobbler.com/2.0/?method=album.search&album=${encodeURIComponent(name)}&api_key=${encodeURIComponent(lfKey)}&limit=1&format=json`);
                    if (lfSearch.ok) {
                        const lfData = await lfSearch.json();
                        lfUrl = extractLastFmImg(lfData?.results?.albummatches?.album?.[0]?.image);
                    }
                }
            } else if (type === 'artist') {
                const lfRes = await fetch(`https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(name)}&api_key=${encodeURIComponent(lfKey)}&format=json`);
                if (lfRes.ok) {
                    const lfData = await lfRes.json();
                    lfUrl = extractLastFmImg(lfData?.artist?.image);
                }
            }

            if (lfUrl) {
                artCache[key] = lfUrl;
                saveArtCache();
                const el = document.getElementById(elementId);
                if (el) el.src = lfUrl;
                return lfUrl;
            }
        } catch (e) {}
    }
}

function getInitialImage(item, name, artist, type) {
    const key = `${type}::${normalizeKey(name)}::${normalizeKey(artist || '')}`;
    if (artCache[key] && typeof artCache[key] === 'string' && artCache[key].includes('scdn.co')) {
        return artCache[key];
    }
    if (type !== 'artist' && item && item.image) {
        const candidate = extractLastFmImg(item.image);
        if (candidate) {
            return candidate;
        }
    }
    return FALLBACK_ART_SVG;
}

function getImageFromItem(item) {
    if (!item) return FALLBACK_ART_SVG;
    const artistName = item.artist ? (item.artist.name || item.artist['#text'] || item.artist) : '';
    const itemType = currentType === 'artists' ? 'artist' : (currentType === 'albums' ? 'album' : 'track');
    const key = `${itemType}::${normalizeKey(item.name)}::${normalizeKey(artistName)}`;
    if (artCache[key] && typeof artCache[key] === 'string' && artCache[key].includes('scdn.co')) return artCache[key];
    return getInitialImage(item, item.name, artistName, itemType);
}

function buildPodiumCardHtml(type, index, name, subtitle, playcount, imgId, initialImg, isCircle = false, pct = 100) {
    const rankNum = index + 1;
    const medalIcon = rankNum === 1 ? '<i class="fa-solid fa-crown text-warning"></i> #1' : (rankNum === 2 ? '<i class="fa-solid fa-medal text-info"></i> #2' : '<i class="fa-solid fa-award" style="color:#c084fc;"></i> #3');
    const badgeColor = rankNum === 1 ? 'rgba(251, 191, 36, 0.2)' : (rankNum === 2 ? 'rgba(56, 189, 248, 0.2)' : 'rgba(192, 132, 252, 0.2)');
    const textColor = rankNum === 1 ? '#fbbf24' : (rankNum === 2 ? '#38bdf8' : '#c084fc');
    return `
        <div class="podium-card podium-${rankNum} position-relative overflow-hidden" onclick="showItemStats('${type}', '${escapeJsStr(name)}', '${escapeJsStr(type === 'artist' ? '' : subtitle)}')">
            <div class="chartlist-row-bar" style="width: ${pct}%; opacity: 0.35;"></div>
            <img id="${imgId}" src="${initialImg}" class="podium-cover ${isCircle ? 'rounded-circle' : ''}" alt="Cover" onerror="safeImgError(this)" style="position: relative; z-index: 1;">
            <div class="overflow-hidden flex-grow-1" style="min-width: 0; position: relative; z-index: 1;">
                <div class="d-flex align-items-center justify-content-between gap-1 mb-1">
                    <span class="badge rounded-pill fw-bold" style="background: ${badgeColor}; color: ${textColor}; font-size: 0.65rem;">${medalIcon}</span>
                    <span class="badge-scrobble" style="font-size: 0.66rem;"><i class="fa-solid fa-headphones"></i>${playcount}</span>
                </div>
                <div class="fw-bold text-truncate text-white" style="font-size: 0.90rem;" title="${escapeHtml(name)}">${escapeHtml(name)}</div>
                <small class="text-secondary text-truncate d-block" style="font-size: 0.74rem;">${escapeHtml(subtitle)}</small>
            </div>
        </div>
    `;
}

function renderTracks(tracks) {
    statsList.innerHTML = '';
    if (!tracks || tracks.length === 0) {
        statsList.innerHTML = '<div class="text-center text-muted py-5"><i class="fa-solid fa-music fa-2x mb-3 d-block opacity-50"></i>No se encontraron canciones en este periodo</div>';
        return;
    }
    const maxPlays = Math.max(1, Number(tracks[0]?.playcount) || 1);

    tracks.forEach((track, index) => {
        const item = document.createElement('div');
        item.className = 'lastfm-chartlist-row';
        const artistName = track.artist ? (track.artist.name || track.artist['#text'] || track.artist) : '';
        const playcount = formatNumber(track.playcount);
        const rawPlays = Number(track.playcount) || 0;
        const pct = Math.min(100, Math.max(2, Math.round((rawPlays / maxPlays) * 100)));
        const imgId = `art-track-${index}`;
        const initialImg = getInitialImage(track, track.name, artistName, 'track');
        const spotifySearch = `https://open.spotify.com/search/${encodeURIComponent(track.name + ' ' + artistName)}`;
        const rankClass = index === 0 ? 'top-1' : (index === 1 ? 'top-2' : (index === 2 ? 'top-3' : ''));

        item.innerHTML = `
            <span class="lastfm-chartlist-index ${rankClass}">#${String(index + 1).padStart(2, '0')}</span>
            <img id="${imgId}" src="${initialImg}" class="lastfm-chartlist-image" alt="Cover" onerror="safeImgError(this)">
            <div class="lastfm-chartlist-info">
                <div class="lastfm-chartlist-name" title="${escapeHtml(track.name)}">${escapeHtml(track.name)}</div>
                <div class="lastfm-chartlist-artist" title="${escapeHtml(artistName)}">${escapeHtml(artistName)}</div>
            </div>
            <div class="lastfm-chartlist-bar-meter" title="${pct}% del #1">
                <div class="lastfm-chartlist-bar-fill" style="width: ${pct}%;"></div>
            </div>
            <span class="lastfm-chartlist-count"><i class="fa-solid fa-headphones me-1 text-danger"></i>${playcount}</span>
            <div class="lastfm-chartlist-actions">
                <a href="${spotifySearch}" target="_blank" rel="noopener noreferrer" class="btn-card-action" title="Escuchar en Spotify">
                    <i class="fa-brands fa-spotify" style="color: #1ed760; font-size: 0.85rem;"></i>
                </a>
            </div>
        `;

        item.addEventListener('click', () => {
            showItemStats('track', track.name, artistName);
        });

        const spLink = item.querySelector('.btn-card-action');
        if (spLink) spLink.addEventListener('click', (e) => e.stopPropagation());

        statsList.appendChild(item);

        const key = `track::${normalizeKey(track.name)}::${normalizeKey(artistName)}`;
        if (!artCache[key] || (typeof artCache[key] === 'string' && !artCache[key].includes('scdn.co'))) {
            resolveSpotifyArtwork(track.name, artistName, 'track', imgId);
        }
    });
}

function renderArtists(artists) {
    statsList.innerHTML = '';
    if (!artists || artists.length === 0) {
        statsList.innerHTML = '<div class="text-center text-muted py-5"><i class="fa-solid fa-users fa-2x mb-3 d-block opacity-50"></i>No se encontraron artistas en este periodo</div>';
        return;
    }
    const maxPlays = Math.max(1, Number(artists[0]?.playcount || artists[0]?.plays) || 1);

    artists.forEach((artist, index) => {
        const item = document.createElement('div');
        item.className = 'lastfm-chartlist-row';
        const artistName = artist.name || '';
        const playcount = formatNumber(artist.playcount || artist.plays);
        const rawPlays = Number(artist.playcount || artist.plays) || 0;
        const pct = Math.min(100, Math.max(2, Math.round((rawPlays / maxPlays) * 100)));
        const imgId = `art-artist-${index}`;
        const initialImg = getInitialImage(artist, artistName, '', 'artist');
        const spotifySearch = `https://open.spotify.com/search/${encodeURIComponent(artistName)}`;
        const rankClass = index === 0 ? 'top-1' : (index === 1 ? 'top-2' : (index === 2 ? 'top-3' : ''));

        item.innerHTML = `
            <span class="lastfm-chartlist-index ${rankClass}">#${String(index + 1).padStart(2, '0')}</span>
            <img id="${imgId}" src="${initialImg}" class="lastfm-chartlist-image rounded-circle" alt="Artist" onerror="safeImgError(this)">
            <div class="lastfm-chartlist-info">
                <div class="lastfm-chartlist-name" title="${escapeHtml(artistName)}">${escapeHtml(artistName)}</div>
                <div class="lastfm-chartlist-artist">Artista</div>
            </div>
            <div class="lastfm-chartlist-bar-meter" title="${pct}% del #1">
                <div class="lastfm-chartlist-bar-fill" style="width: ${pct}%;"></div>
            </div>
            <span class="lastfm-chartlist-count"><i class="fa-solid fa-headphones me-1 text-danger"></i>${playcount}</span>
            <div class="lastfm-chartlist-actions">
                <a href="${spotifySearch}" target="_blank" rel="noopener noreferrer" class="btn-card-action" title="Ver en Spotify">
                    <i class="fa-brands fa-spotify" style="color: #1ed760; font-size: 0.85rem;"></i>
                </a>
            </div>
        `;

        item.addEventListener('click', () => {
            showItemStats('artist', artistName, '');
        });

        const spLink = item.querySelector('.btn-card-action');
        if (spLink) spLink.addEventListener('click', (e) => e.stopPropagation());

        statsList.appendChild(item);

        const key = `artist::${normalizeKey(artistName)}::`;
        if (!artCache[key] || (typeof artCache[key] === 'string' && !artCache[key].includes('scdn.co'))) {
            resolveSpotifyArtwork(artistName, '', 'artist', imgId);
        }
    });
}

function renderAlbums(albums) {
    statsList.innerHTML = '';
    if (!albums || albums.length === 0) {
        statsList.innerHTML = '<div class="text-center text-muted py-5"><i class="fa-solid fa-compact-disc fa-2x mb-3 d-block opacity-50"></i>No se encontraron álbumes en este periodo</div>';
        return;
    }
    const maxPlays = Math.max(1, Number(albums[0]?.playcount || albums[0]?.plays) || 1);

    albums.forEach((album, index) => {
        const item = document.createElement('div');
        item.className = 'lastfm-chartlist-row';
        const artistName = album.artist ? (album.artist.name || album.artist['#text'] || album.artist) : '';
        const playcount = formatNumber(album.playcount || album.plays);
        const rawPlays = Number(album.playcount || album.plays) || 0;
        const pct = Math.min(100, Math.max(2, Math.round((rawPlays / maxPlays) * 100)));
        const imgId = `art-album-${index}`;
        const initialImg = getInitialImage(album, album.name, artistName, 'album');
        const spotifySearch = `https://open.spotify.com/search/${encodeURIComponent(album.name + ' ' + artistName)}`;
        const rankClass = index === 0 ? 'top-1' : (index === 1 ? 'top-2' : (index === 2 ? 'top-3' : ''));

        item.innerHTML = `
            <span class="lastfm-chartlist-index ${rankClass}">#${String(index + 1).padStart(2, '0')}</span>
            <img id="${imgId}" src="${initialImg}" class="lastfm-chartlist-image" alt="Album" onerror="safeImgError(this)">
            <div class="lastfm-chartlist-info">
                <div class="lastfm-chartlist-name" title="${escapeHtml(album.name)}">${escapeHtml(album.name)}</div>
                <div class="lastfm-chartlist-artist" title="${escapeHtml(artistName)}">${escapeHtml(artistName)}</div>
            </div>
            <div class="lastfm-chartlist-bar-meter" title="${pct}% del #1">
                <div class="lastfm-chartlist-bar-fill" style="width: ${pct}%;"></div>
            </div>
            <span class="lastfm-chartlist-count"><i class="fa-solid fa-headphones me-1 text-danger"></i>${playcount}</span>
            <div class="lastfm-chartlist-actions">
                <a href="${spotifySearch}" target="_blank" rel="noopener noreferrer" class="btn-card-action" title="Escuchar en Spotify">
                    <i class="fa-brands fa-spotify" style="color: #1ed760; font-size: 0.85rem;"></i>
                </a>
            </div>
        `;

        item.addEventListener('click', () => {
            showItemStats('album', album.name, artistName);
        });

        const spLink = item.querySelector('.btn-card-action');
        if (spLink) spLink.addEventListener('click', (e) => e.stopPropagation());

        statsList.appendChild(item);

        const key = `album::${normalizeKey(album.name)}::${normalizeKey(artistName)}`;
        if (!artCache[key] || (typeof artCache[key] === 'string' && !artCache[key].includes('scdn.co'))) {
            resolveSpotifyArtwork(album.name, artistName, 'album', imgId);
        }
    });
}

function renderRecent(tracks) {
    statsList.innerHTML = '';
    if (!tracks || tracks.length === 0) {
        statsList.innerHTML = '<div class="text-center text-muted py-5"><i class="fa-solid fa-clock-rotate-left fa-2x mb-3 d-block opacity-50"></i>No hay scrobbles recientes</div>';
        return;
    }
    // Salvaguarda: garantizar orden cronológico inverso estricto (más reciente primero arriba de todo)
    const sortedTracks = [...tracks].sort((a, b) => {
        const aNow = a['@attr']?.nowplaying === 'true';
        const bNow = b['@attr']?.nowplaying === 'true';
        if (aNow && !bNow) return -1;
        if (!aNow && bNow) return 1;
        const utsb = parseInt(b.date?.uts || b.uts, 10) || 0;
        const utsa = parseInt(a.date?.uts || a.uts, 10) || 0;
        return utsb - utsa;
    });

    sortedTracks.forEach((track, index) => {
        const item = document.createElement('div');
        item.className = 'lastfm-chartlist-row';
        const artistName = track.artist ? (track.artist['#text'] || track.artist.name || track.artist) : '';
        const isNowPlaying = track['@attr']?.nowplaying === 'true';
        const playedAtStr = isNowPlaying ? 'En vivo' : formatDate(track.date?.uts);
        const dateObj = track.date?.uts ? new Date(parseInt(track.date.uts, 10) * 1000) : null;
        const fullDateTitle = dateObj ? dateObj.toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'medium' }) : '';
        const imgId = `art-recent-${index}`;
        const initialImg = getInitialImage(track, track.name, artistName, 'track');
        const spotifySearch = `https://open.spotify.com/search/${encodeURIComponent(track.name + ' ' + artistName)}`;

        item.innerHTML = `
            <span class="lastfm-chartlist-index"><i class="fa-solid ${isNowPlaying ? 'fa-volume-high text-danger' : 'fa-play text-muted'}" style="font-size: 0.72rem;"></i></span>
            <img id="${imgId}" src="${initialImg}" class="lastfm-chartlist-image" alt="Cover" onerror="safeImgError(this)">
            <div class="lastfm-chartlist-info">
                <div class="lastfm-chartlist-name" title="${escapeHtml(track.name)}">${escapeHtml(track.name)}</div>
                <div class="lastfm-chartlist-artist" title="${escapeHtml(artistName)}">${escapeHtml(artistName)}</div>
            </div>
            ${isNowPlaying ? `
                <span class="badge bg-danger bg-opacity-25 text-white border border-danger border-opacity-30 rounded-pill px-2.5 py-1" style="font-size: 0.68rem; letter-spacing: 0.02em;">
                    <i class="fa-solid fa-signal me-1 text-danger"></i>En vivo
                </span>
            ` : `
                <span class="lastfm-chartlist-timestamp" title="${escapeHtml(fullDateTitle)}">
                    <i class="fa-regular fa-clock me-1 text-muted"></i>${playedAtStr}
                </span>
            `}
            <div class="lastfm-chartlist-actions">
                <a href="${spotifySearch}" target="_blank" rel="noopener noreferrer" class="btn-card-action" title="Escuchar en Spotify">
                    <i class="fa-brands fa-spotify" style="color: #1ed760; font-size: 0.85rem;"></i>
                </a>
            </div>
        `;

        item.addEventListener('click', () => {
            showItemStats('track', track.name, artistName);
        });

        const spLink = item.querySelector('.btn-card-action');
        if (spLink) {
            spLink.addEventListener('click', (e) => e.stopPropagation());
        }

        statsList.appendChild(item);

        const key = `track::${normalizeKey(track.name)}::${normalizeKey(artistName)}`;
        if (!artCache[key] || (typeof artCache[key] === 'string' && !artCache[key].includes('scdn.co'))) {
            resolveSpotifyArtwork(track.name, artistName, 'track', imgId);
        }
    });
}

// ----------------------------------------------------
// MODAL: APARTADO DE ESTADÍSTICAS DE MIS ESCUCHAS
// ----------------------------------------------------
let itemStatsHistory = [];
let currentOpenStats = null;

function goBackItemStats() {
    if (itemStatsHistory.length > 0) {
        const prev = itemStatsHistory.pop();
        showItemStats(prev.type, prev.name, prev.artist, true);
    }
}

async function showItemStats(type, name, artist, isBack = false) {
    if (!isBack && currentOpenStats && (currentOpenStats.name !== name || currentOpenStats.type !== type)) {
        itemStatsHistory.push({ ...currentOpenStats });
    }
    currentOpenStats = { type, name, artist };

    const activeDb = await getActiveDatabase();

    const modalTitle = document.getElementById('item-stats-type-title');
    const modalBody = document.getElementById('item-stats-body');
    const spotifyBtn = document.getElementById('item-stats-spotify-btn');

    if (!modalBody) return;

    const normName = (name || '').trim().toLowerCase();
    const normArt = (artist || '').trim().toLowerCase();

    let data = null;

    if (type === 'track') {
        if (modalTitle) modalTitle.innerHTML = '<i class="fa-solid fa-music text-primary me-2"></i>Estadísticas de Canción';
        const key = `${normName}:::${normArt}`;
        data = activeDb?.tracksLookup?.[key];
        if (!data && activeDb?.tracksLookup) {
            const foundKey = Object.keys(activeDb.tracksLookup).find(k => k.startsWith(normName + ':::') || k.includes(normName));
            if (foundKey) data = activeDb.tracksLookup[foundKey];
        }
    } else if (type === 'album') {
        if (modalTitle) modalTitle.innerHTML = '<i class="fa-solid fa-compact-disc text-info me-2"></i>Estadísticas de Álbum';
        const key = `${normName}:::${normArt}`;
        data = activeDb?.albumsLookup?.[key];
        if (!data && activeDb?.albumsLookup) {
            const foundKey = Object.keys(activeDb.albumsLookup).find(k => k.startsWith(normName + ':::') || k.includes(normName));
            if (foundKey) data = activeDb.albumsLookup[foundKey];
        }
    } else if (type === 'artist') {
        if (modalTitle) modalTitle.innerHTML = '<i class="fa-solid fa-user-group text-warning me-2"></i>Estadísticas de Artista';
        data = activeDb?.artistsLookup?.[normName] || activeDb?.artistsLookup?.[normArt];
        if (!data && activeDb?.artistsLookup) {
            const foundKey = Object.keys(activeDb.artistsLookup).find(k => k.includes(normName) || k.includes(normArt));
            if (foundKey) data = activeDb.artistsLookup[foundKey];
        }
    }

    // Integración de escuchas estimadas de la Era Tidal + En vivo Last.fm en modo unificado
    let deltaItemPlays = 0;
    let lastDeltaIso = null;
    const deltaMonths = {};
    const deltaYears = {};
    let isTidalEstimatedItem = false;
    let tidalContributionPlays = 0;

    if (currentSource === 'unified' && isAppOwner()) {
        const tidal = tidalEstimates || await loadTidalEstimates();
        if (tidal) {
            const normN = normalizeKey(name);
            const normA = normalizeKey(artist || '');
            if (type === 'track') {
                const trackEntry = tidal.tracks?.[normN + ':::' + normA] || tidal.tracks?.[normN + ':::'] || Object.entries(tidal.tracks || {}).find(([k]) => k.startsWith(normN + ':::'))?.[1];
                if (trackEntry) {
                    isTidalEstimatedItem = true;
                    tidalContributionPlays = trackEntry.plays || 0;
                    deltaItemPlays += tidalContributionPlays;
                    Object.entries(trackEntry.months || {}).forEach(([mk, cnt]) => {
                        deltaMonths[mk] = (deltaMonths[mk] || 0) + cnt;
                    });
                    Object.entries(trackEntry.years || {}).forEach(([yk, cnt]) => {
                        deltaYears[yk] = (deltaYears[yk] || 0) + cnt;
                    });
                }
            } else if (type === 'artist') {
                const artKey = Object.keys(tidal.artists || {}).find(k => normalizeKey(k) === normN || normalizeKey(k).includes(normN) || normN.includes(normalizeKey(k)));
                if (artKey && tidal.artists[artKey]) {
                    const artEntry = tidal.artists[artKey];
                    isTidalEstimatedItem = true;
                    tidalContributionPlays = artEntry.plays || 0;
                    deltaItemPlays += tidalContributionPlays;
                    Object.entries(artEntry.years || {}).forEach(([yk, cnt]) => {
                        deltaYears[yk] = (deltaYears[yk] || 0) + cnt;
                    });
                }
            }
        }
    }
    if (currentSource === 'unified' && lastFmRecentDelta.length > 0) {
        const normN = normalizeKey(name);
        const normA = normalizeKey(artist || '');
        lastFmRecentDelta.forEach(t => {
            const tName = normalizeKey(t.name);
            const tArtist = normalizeKey(t.artist ? (t.artist['#text'] || t.artist.name || '') : '');
            const tAlbum = normalizeKey(t.album ? (t.album['#text'] || t.album.name || '') : '');
            let match = false;
            if (type === 'track') {
                if (tName === normN && (!normA || !tArtist || tArtist.includes(normA) || normA.includes(tArtist))) match = true;
            } else if (type === 'artist') {
                if (tArtist && (tArtist === normN || tArtist.includes(normN) || normN.includes(tArtist))) match = true;
            } else if (type === 'album') {
                if (tAlbum === normN && (!normA || !tArtist || tArtist.includes(normA) || normA.includes(tArtist))) match = true;
            }
            if (match && t.date?.uts) {
                deltaItemPlays++;
                const dObj = new Date(parseInt(t.date.uts, 10) * 1000);
                const mKey = `${dObj.getFullYear()}-${String(dObj.getMonth() + 1).padStart(2, '0')}`;
                deltaMonths[mKey] = (deltaMonths[mKey] || 0) + 1;
                deltaYears[String(dObj.getFullYear())] = (deltaYears[String(dObj.getFullYear())] || 0) + 1;
                const iso = dObj.toISOString();
                if (!lastDeltaIso || iso > lastDeltaIso) lastDeltaIso = iso;
            }
        });
    }

    if (!data && deltaItemPlays > 0) {
        data = {
            name: name,
            artist: artist,
            plays: 0,
            ms: deltaItemPlays * 210000,
            skips: 0,
            first: lastDeltaIso,
            last: lastDeltaIso,
            years: {},
            months: {}
        };
    }

    // Cover artwork resolution
    const artKey = `${type}::${normalizeKey(name)}::${normalizeKey(artist || '')}`;
    const coverImg = (artCache[artKey] && typeof artCache[artKey] === 'string' && artCache[artKey].includes('scdn.co')) ? artCache[artKey] : (artCache[artKey] || '/logo.png');

    // Spotify Link
    const spotifyQuery = encodeURIComponent(`${name} ${artist || ''}`.trim());
    let spotifyUrl = `https://open.spotify.com/search/${spotifyQuery}`;
    if (data?.uri) {
        const parts = data.uri.split(':');
        if (parts.length === 3) {
            spotifyUrl = `https://open.spotify.com/${parts[1]}/${parts[2]}`;
        }
    }
    if (spotifyBtn) {
        spotifyBtn.href = spotifyUrl;
    }

    function formatSimpleDate(isoStr) {
        if (!isoStr) return 'N/A';
        try {
            const d = new Date(isoStr);
            return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch (e) {
            return (isoStr || '').split('T')[0] || 'N/A';
        }
    }

    const backBtnHtml = itemStatsHistory.length > 0 ? `
        <div class="mb-2.5">
            <button type="button" class="btn btn-sm text-white border-0 px-2.5 py-1 d-inline-flex align-items-center gap-1.5" onclick="goBackItemStats()" style="background-color: rgba(255, 255, 255, 0.08); font-size: 0.74rem; border-radius: 6px; cursor: pointer; transition: background 0.15s ease;" onmouseover="this.style.backgroundColor='rgba(255,255,255,0.15)'" onmouseout="this.style.backgroundColor='rgba(255,255,255,0.08)'">
                <i class="fa-solid fa-arrow-left"></i> Volver a ${itemStatsHistory[itemStatsHistory.length - 1].name}
            </button>
        </div>
    ` : '';

    if (!data) {
        modalBody.innerHTML = `
            ${backBtnHtml}
            <div class="d-flex align-items-center gap-3 mb-3 p-2 rounded" style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06);">
                <img id="item-stats-modal-img" src="${coverImg}" class="rounded ${type === 'artist' ? 'rounded-circle' : ''}" style="width: 56px; height: 56px; object-fit: cover;" onerror="safeImgError(this)">
                <div class="overflow-hidden flex-grow-1">
                    <h6 class="fw-bold mb-0 text-white text-truncate">${name}</h6>
                    <small class="text-secondary text-truncate d-block">${artist || 'Artista'}</small>
                </div>
                ${isAppOwner() ? `
                <button type="button" class="btn btn-sm btn-outline-info rounded-pill px-2.5 py-1 text-nowrap d-inline-flex align-items-center gap-1.5 flex-shrink-0" style="font-size: 0.72rem;" onclick="openStreamAdjustmentModal('${type}', '${escapeJsStr(name)}', '${escapeJsStr(artist || '')}')">
                    <i class="fa-solid fa-sliders"></i>
                    <span>+ Ajustar</span>
                </button>
                ` : ''}
            </div>
            <div class="p-3 rounded border border-secondary border-opacity-20 text-center" style="background-color: rgba(255, 255, 255, 0.02);">
                <i class="fa-solid fa-clock-rotate-left text-secondary mb-2" style="font-size: 1.8rem;"></i>
                <p class="mb-1 text-white fw-semibold">Sin registro en el historial exportado</p>
                <small class="text-secondary d-block">Esta pista fue registrada recientemente o con ortografía distinta en Last.fm. Las estadísticas detalladas de 2019 a 2026 corresponden a tu archivo oficial de Spotify.</small>
            </div>
        `;
        const modalEl = document.getElementById('itemStatsModal');
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
        if (!modalEl.classList.contains('show')) {
            modalInstance.show();
        } else {
            modalEl.querySelector('.modal-body')?.scrollTo({ top: 0, behavior: 'smooth' });
        }
        if (!artCache[artKey] || (typeof artCache[artKey] === 'string' && !artCache[artKey].includes('scdn.co'))) {
            resolveSpotifyArtwork(name, artist, type, 'item-stats-modal-img');
        }
        return;
    }

    // Métricas principales unificadas
    const totalPlays = (data.plays || 0) + deltaItemPlays;
    const totalMs = (data.ms || 0) + (deltaItemPlays * 210000);
    const hours = (totalMs / (1000 * 60 * 60));
    const timeFormatted = hours >= 1 ? `${hours.toFixed(1)} hrs` : `${Math.max(1, Math.round(totalMs / 60000))} mins`;
    const skips = data.skips || 0;

    // Barras de evolución anual (2019-2026) con suma en vivo y cuadratura estricta
    const yearsObj = { ...(data.years || {}) };
    Object.entries(deltaYears).forEach(([y, c]) => { yearsObj[y] = (yearsObj[y] || 0) + c; });

    // Cuadratura matemática estricta: la suma de las barras de los años DEBE igualar a totalPlays
    const sumYearsPlays = Object.values(yearsObj).reduce((a, b) => a + b, 0);
    if (sumYearsPlays !== totalPlays) {
        const diff = totalPlays - sumYearsPlays;
        if (diff > 0) {
            // Asignar diferencia pendiente: si el artista solo tiene reproducciones en 2026, no inventar 2025
            if (!yearsObj['2025'] && yearsObj['2026']) {
                yearsObj['2026'] = (yearsObj['2026'] || 0) + diff;
            } else {
                const add25 = Math.round(diff * 0.35);
                const add26 = diff - add25;
                yearsObj['2025'] = (yearsObj['2025'] || 0) + add25;
                yearsObj['2026'] = (yearsObj['2026'] || 0) + add26;
            }
        } else if (diff < 0) {
            yearsObj['2026'] = Math.max(0, (yearsObj['2026'] || 0) + diff);
        }
    }

    // Primera y última escucha consistente con reproducciones reales (>0 plays)
    let effectiveFirstDate = data.first;
    if (effectiveFirstDate) {
        const firstYr = String(new Date(effectiveFirstDate).getFullYear());
        if (!yearsObj[firstYr] || yearsObj[firstYr] === 0) {
            const activeY = Object.keys(yearsObj).filter(y => (yearsObj[y] || 0) > 0).sort()[0];
            if (activeY) {
                effectiveFirstDate = (activeY === '2025') ? '2025-08-01T00:00:00Z' : `${activeY}-01-01T00:00:00Z`;
            } else if (lastDeltaIso) {
                effectiveFirstDate = lastDeltaIso;
            }
        }
    }
    const firstDate = formatSimpleDate(effectiveFirstDate || lastDeltaIso);
    const lastDate = lastDeltaIso ? `${formatSimpleDate(lastDeltaIso)} (En vivo)` : formatSimpleDate(data.last);

    const yearsList = [];
    for (let y = 2019; y <= Math.max(2026, new Date().getFullYear()); y++) yearsList.push(String(y));
    const maxYearPlays = Math.max(1, ...Object.values(yearsObj));

    const annualBarsHtml = yearsList.map(y => {
        const yPlays = yearsObj[y] || 0;
        const pct = Math.round((yPlays / maxYearPlays) * 100);
        const barColor = yPlays > 0 ? 'linear-gradient(90deg, #a855f7 0%, #c084fc 100%)' : 'rgba(255, 255, 255, 0.05)';
        return `
            <div class="d-flex align-items-center gap-2 mb-1.5" style="font-size: 0.74rem;">
                <span class="text-secondary fw-semibold" style="width: 34px;">${y}</span>
                <div class="progress flex-grow-1" style="height: 7px; background-color: rgba(255, 255, 255, 0.06); border-radius: 4px;">
                    <div class="progress-bar" style="width: ${pct}%; background: ${barColor}; border-radius: 4px;"></div>
                </div>
                <span class="text-end fw-semibold ${yPlays > 0 ? 'text-white' : 'text-muted'}" style="width: 48px; font-size: 0.72rem;">${yPlays}</span>
            </div>
        `;
    }).join('');

    // Meses con mayor actividad (Top 3)
    let peakMonthsHtml = '';
    let monthsObj = { ...(data.months || {}) };
    if (type === 'artist' && Object.keys(monthsObj).length === 0 && activeDb?.tracksLookup) {
        const normCurrentArt = normalizeKey(name);
        Object.values(activeDb.tracksLookup).forEach(t => {
            if (normalizeKey(t.artist) === normCurrentArt && t.months) {
                Object.entries(t.months).forEach(([mk, cnt]) => {
                    monthsObj[mk] = (monthsObj[mk] || 0) + cnt;
                });
            }
        });
    }
    Object.entries(deltaMonths).forEach(([mk, c]) => { monthsObj[mk] = (monthsObj[mk] || 0) + c; });
    if (Object.keys(monthsObj).length > 0) {
        const sortedMonths = Object.entries(monthsObj).sort((a, b) => b[1] - a[1]).slice(0, 3);
        peakMonthsHtml = `
            <div class="mt-2.5 p-2 rounded" style="background-color: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05);">
                <div class="fw-semibold text-secondary mb-1.5" style="font-size: 0.72rem;"><i class="fa-solid fa-fire text-warning me-1"></i> Meses pico de más escuchas</div>
                <div class="d-flex flex-wrap gap-1.5">
                    ${sortedMonths.map(([mKey, count]) => {
                        const [y, m] = mKey.split('-');
                        const mLabel = `${MONTH_SHORT_NAMES[parseInt(m, 10) - 1]} ${y}`;
                        return `<span class="badge border border-secondary border-opacity-20 text-white" style="background-color: rgba(168, 85, 247, 0.15); font-size: 0.72rem;"><strong class="text-info">${mLabel}:</strong> ${count} reps</span>`;
                    }).join('')}
                </div>
            </div>
        `;
    }

    // Plataformas (para track)
    let platformsHtml = '';
    if (data.platforms && Object.keys(data.platforms).length > 0) {
        const sortedPlatforms = Object.entries(data.platforms).sort((a, b) => b[1] - a[1]);
        platformsHtml = `
            <div class="mt-2.5 p-2 rounded" style="background-color: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05);">
                <div class="fw-semibold text-secondary mb-1.5" style="font-size: 0.72rem;"><i class="fa-solid fa-mobile-screen-button text-success me-1"></i> Dispositivos y Plataformas</div>
                <div class="d-flex flex-wrap gap-1">
                    ${sortedPlatforms.map(([plat, count]) => {
                        const cleanPlat = plat.includes('Android') ? 'Android' : (plat.includes('Windows') ? 'Windows' : plat);
                        return `<span class="badge bg-dark border border-secondary border-opacity-25 text-secondary" style="font-size: 0.68rem;">${cleanPlat}: <strong class="text-white">${count}</strong></span>`;
                    }).join('')}
                </div>
            </div>
        `;
    }

    // Canciones de este Álbum (para álbum)
    let albumTracksHtml = '';
    if (type === 'album' && data.tracks && data.tracks.length > 0) {
        albumTracksHtml = `
            <div class="mt-3 pt-2.5 border-top border-secondary border-opacity-15">
                <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="fw-bold text-white" style="font-size: 0.78rem;"><i class="fa-solid fa-list-ol text-info me-1.5"></i> Canciones de este Álbum</span>
                    <small class="text-secondary">${data.tracks.length} canciones</small>
                </div>
                <div class="d-flex flex-column gap-1.5" style="max-height: 200px; overflow-y: auto;">
                    ${data.tracks.map((t, idx) => `
                        <div class="d-flex align-items-center justify-content-between py-1.5 px-2 rounded cursor-pointer" onclick="showItemStats('track', '${(t.name || '').replace(/'/g, "\\'")}', '${(data.artist || artist || '').replace(/'/g, "\\'")}')" style="background-color: rgba(255, 255, 255, 0.03); font-size: 0.72rem; cursor: pointer; transition: background 0.15s ease;" onmouseover="this.style.backgroundColor='rgba(255,255,255,0.08)'" onmouseout="this.style.backgroundColor='rgba(255,255,255,0.03)'">
                            <span class="text-truncate me-2">
                                <strong class="text-secondary me-1.5">#${idx + 1}</strong>
                                <span class="text-white">${t.name}</span>
                                ${(currentSource === 'unified' && t.gap > 0) ? `<span class="badge border border-info border-opacity-30 text-info ms-1" style="font-size: 0.58rem; padding: 1px 4px;">+${formatNumber(t.gap)}</span>` : ''}
                            </span>
                            <span class="badge bg-secondary bg-opacity-25 text-white flex-shrink-0">${formatNumber(t.plays)} reps</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Top Canciones de este Artista (para artista)
    let artistTracksHtml = '';
    if (type === 'artist') {
        const rawArtistTracks = (data && data.tracks) ? [...data.tracks] : [];
        if (currentSource === 'unified') {
            const tidal = tidalEstimates;
            if (tidal && tidal.tracks) {
                const normCurrentArt = normalizeKey(name);
                const artTracksMap = new Map();
                rawArtistTracks.forEach(t => artTracksMap.set(normalizeKey(t.name), { ...t }));
                Object.entries(tidal.tracks).forEach(([k, tEntry]) => {
                    if (normalizeKey(tEntry.artist) === normCurrentArt) {
                        const tKey = normalizeKey(tEntry.name);
                        if (artTracksMap.has(tKey)) {
                            artTracksMap.get(tKey).plays = (artTracksMap.get(tKey).plays || 0) + (tEntry.plays || 0);
                            artTracksMap.get(tKey).gap = (artTracksMap.get(tKey).gap || 0) + (tEntry.plays || 0);
                        } else {
                            artTracksMap.set(tKey, {
                                name: tEntry.name,
                                plays: tEntry.plays || 0,
                                gap: tEntry.plays || 0
                            });
                        }
                    }
                });
                rawArtistTracks.length = 0;
                rawArtistTracks.push(...Array.from(artTracksMap.values()).sort((a,b) => b.plays - a.plays));
            }
        }

        if (rawArtistTracks.length > 0) {
            artistTracksHtml = `
                <div class="mt-3 pt-2.5 border-top border-secondary border-opacity-15">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="fw-bold text-white" style="font-size: 0.78rem;"><i class="fa-solid fa-fire text-warning me-1.5"></i> Canciones Top de este Artista</span>
                        <small class="text-secondary">${rawArtistTracks.length} destacadas</small>
                    </div>
                    <div class="d-flex flex-column gap-1.5" style="max-height: 200px; overflow-y: auto;">
                        ${rawArtistTracks.map((t, idx) => `
                            <div class="d-flex align-items-center justify-content-between py-1.5 px-2 rounded cursor-pointer" onclick="showItemStats('track', '${(t.name || '').replace(/'/g, "\\'")}', '${name.replace(/'/g, "\\'")}')" style="background-color: rgba(255, 255, 255, 0.03); font-size: 0.72rem; cursor: pointer; transition: background 0.15s ease;" onmouseover="this.style.backgroundColor='rgba(255,255,255,0.08)'" onmouseout="this.style.backgroundColor='rgba(255,255,255,0.03)'">
                                <span class="text-truncate me-2">
                                    <strong class="text-secondary me-1.5">#${idx + 1}</strong>
                                    <span class="text-white">${t.name}</span>
                                    ${(currentSource === 'unified' && t.gap > 0) ? `<span class="badge border border-info border-opacity-30 text-info ms-1" style="font-size: 0.58rem; padding: 1px 4px;">+${formatNumber(t.gap)}</span>` : ''}
                                </span>
                                <span class="badge bg-secondary bg-opacity-25 text-white flex-shrink-0">${formatNumber(t.plays)} reps</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }

    modalBody.innerHTML = `
        ${backBtnHtml}
        <!-- Hero Header -->
        <div class="d-flex align-items-center gap-3 mb-3 p-2 rounded" style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06);">
            <img id="item-stats-modal-img" src="${coverImg}" class="rounded ${type === 'artist' ? 'rounded-circle' : ''}" style="width: 58px; height: 58px; object-fit: cover; flex-shrink: 0;" alt="Cover" onerror="safeImgError(this)">
            <div class="overflow-hidden flex-grow-1" style="min-width: 0;">
                <div class="d-flex align-items-center gap-1.5 mb-0.5">
                    <h6 class="fw-bold mb-0 text-white text-truncate" style="font-size: 0.95rem;" title="${name}">${name}</h6>
                    ${currentSource === 'unified' ? `<span class="badge border border-success border-opacity-30 text-success flex-shrink-0" style="background-color: rgba(34, 197, 94, 0.12); font-size: 0.62rem; padding: 2px 6px;"><i class="fa-solid fa-sparkles me-1"></i>Unificado</span>` : ''}
                    ${(isTidalEstimatedItem && isAppOwner()) ? `<span class="badge border border-info border-opacity-40 text-info flex-shrink-0" style="background-color: rgba(6, 182, 212, 0.15); font-size: 0.62rem; padding: 2px 6px;" title="Incluye +${formatNumber(tidalContributionPlays)} reproducciones recuperadas de la Era Tidal (Ago 2025 - Jul 2026)"><i class="fa-solid fa-water me-1"></i>≈ Tidal (+${formatNumber(tidalContributionPlays)})</span>` : ''}
                </div>
                <small class="text-secondary text-truncate d-block" style="font-size: 0.76rem;">${artist || (type === 'artist' ? 'Artista' : '')}</small>
                ${data.album && data.album !== name ? `<small class="text-muted text-truncate d-block" style="font-size: 0.68rem;"><i class="fa-solid fa-compact-disc me-1"></i>${data.album}</small>` : ''}
            </div>
            ${isAppOwner() ? `
            <button type="button" class="btn btn-sm btn-outline-info rounded-pill px-2.5 py-1 text-nowrap d-inline-flex align-items-center gap-1.5 flex-shrink-0 ms-auto" style="font-size: 0.72rem;" onclick="openStreamAdjustmentModal('${type}', '${escapeJsStr(name)}', '${escapeJsStr(artist || '')}')" title="Modificar o añadir streams a esta pista">
                <i class="fa-solid fa-sliders"></i>
                <span class="d-none d-sm-inline">${tidalContributionPlays > 0 ? 'Modificar' : '+ Ajustar'}</span>
            </button>
            ` : ''}
        </div>

        ${(currentSource === 'unified' && data.gap > 0) ? `
            <div class="d-flex align-items-center gap-2 p-2 px-2.5 mb-2.5 rounded border border-info border-opacity-25" style="background-color: rgba(6, 182, 212, 0.08); font-size: 0.74rem;">
                <i class="fa-solid fa-sparkles text-info fs-6 flex-shrink-0"></i>
                <div class="overflow-hidden">
                    <strong class="text-white">+${formatNumber(data.gap)} reproducciones unificadas</strong>
                    <span class="text-secondary d-block" style="font-size: 0.68rem;">Escuchadas en YouTube / otras plataformas (vía Last.fm) y sumadas al historial.</span>
                </div>
            </div>
        ` : ''}

        <!-- Metrics Grid -->
        <div class="row g-2 mb-3">
            <div class="col-6 col-sm-3">
                <div class="p-2 rounded text-center" style="background-color: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.25);">
                    <small class="text-secondary d-block" style="font-size: 0.66rem;">Reproducciones</small>
                    <strong class="text-white fs-6">${formatNumber(totalPlays)}</strong>
                </div>
            </div>
            <div class="col-6 col-sm-3">
                <div class="p-2 rounded text-center" style="background-color: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.25);">
                    <small class="text-secondary d-block" style="font-size: 0.66rem;">Tiempo Total</small>
                    <strong class="text-white fs-6">${timeFormatted}</strong>
                </div>
            </div>
            <div class="col-6 col-sm-3">
                <div class="p-2 rounded text-center" style="background-color: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.25);">
                    <small class="text-secondary d-block" style="font-size: 0.66rem;">Primera Escucha</small>
                    <strong class="text-white" style="font-size: 0.74rem;">${firstDate}</strong>
                </div>
            </div>
            <div class="col-6 col-sm-3">
                <div class="p-2 rounded text-center" style="background-color: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.25);">
                    <small class="text-secondary d-block" style="font-size: 0.66rem;">Última Escucha</small>
                    <strong class="text-white" style="font-size: 0.74rem;">${lastDate}</strong>
                </div>
            </div>
        </div>

        ${type === 'track' && skips > 0 ? `
            <div class="d-flex align-items-center justify-content-between p-1.5 px-2.5 mb-2.5 rounded border border-secondary border-opacity-15" style="background-color: rgba(255, 255, 255, 0.02); font-size: 0.72rem;">
                <span class="text-secondary"><i class="fa-solid fa-forward me-1 text-muted"></i> Veces salteada antes de tiempo:</span>
                <span class="badge bg-secondary bg-opacity-25 text-white">${skips} skips</span>
            </div>
        ` : ''}

        <!-- Annual Evolution Bars -->
        <div class="p-2.5 rounded border border-secondary border-opacity-15" style="background-color: rgba(255, 255, 255, 0.02);">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="fw-bold text-white" style="font-size: 0.76rem;"><i class="fa-solid fa-chart-column text-primary me-1.5"></i> Evolución por Años (2019-2026)</span>
                <small class="text-secondary" style="font-size: 0.68rem;">streams / año</small>
            </div>
            ${annualBarsHtml}
        </div>

        ${peakMonthsHtml}
        ${platformsHtml}
        ${albumTracksHtml}
        ${artistTracksHtml}
    `;

    const modalEl = document.getElementById('itemStatsModal');
    const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
    if (!modalEl.classList.contains('show')) {
        modalInstance.show();
    } else {
        modalEl.querySelector('.modal-body')?.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (!artCache[artKey] || (typeof artCache[artKey] === 'string' && !artCache[artKey].includes('scdn.co'))) {
        resolveSpotifyArtwork(name, artist, type, 'item-stats-modal-img');
    }
}

// ----------------------------------------------------
// MODAL LAST.FM CONFIGURACIÓN (SIN PEDIR API KEY AL USUARIO)
// ----------------------------------------------------
function openLastFmModal() {
    const { user } = getLastFmCredentials();
    if (lastFmUsernameInput) lastFmUsernameInput.value = user || '';
    if (lastFmError) lastFmError.classList.add('d-none');

    const modal = bootstrap.Modal.getOrCreateInstance(lastFmModalEl);
    modal.show();
}

async function handleSaveLastFm() {
    const user = lastFmUsernameInput ? lastFmUsernameInput.value.trim() : '';
    const key = DEFAULT_LASTFM_KEY;

    if (!user) {
        if (lastFmError) {
            lastFmError.textContent = 'Por favor ingresa tu nombre de usuario de Last.fm.';
            lastFmError.classList.remove('d-none');
        }
        return;
    }

    btnLastFmSave.disabled = true;
    btnLastFmSave.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Conectando...';

    try {
        let testRes = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${encodeURIComponent(user)}&api_key=${encodeURIComponent(key)}&format=json`);
        let testData = await testRes.json();

        if (testData.error === 8) {
            await new Promise(r => setTimeout(r, 1200));
            testRes = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${encodeURIComponent(user)}&api_key=${encodeURIComponent(key)}&format=json`);
            testData = await testRes.json();
        }

        if (testData.error) {
            if (lastFmError) {
                lastFmError.textContent = `No se encontró el usuario "${user}" en Last.fm. Verifica que esté bien escrito.`;
                lastFmError.classList.remove('d-none');
            }
            btnLastFmSave.disabled = false;
            btnLastFmSave.innerHTML = '<i class="fa-solid fa-plug me-1.5"></i> Conectar y Sincronizar';
            return;
        }

        localStorage.removeItem('spoti_logged_out');
        isDemoSession = false;
        sessionStorage.removeItem('tunetracker_demo_session');
        unifiedDb = null;
        localStorage.setItem('lastfm_user', user);
        localStorage.setItem('lastfm_key', key);
        applyRoleBasedUI();
        showDashboard();
        initLastFmState();
        fetchLastFmGlobalStats();

        const modal = bootstrap.Modal.getInstance(lastFmModalEl);
        if (modal) modal.hide();

        loadStats();
    } catch (e) {
        if (lastFmError) {
            lastFmError.textContent = 'Error al conectar con los servidores de Last.fm.';
            lastFmError.classList.remove('d-none');
        }
    } finally {
        btnLastFmSave.disabled = false;
        btnLastFmSave.innerHTML = '<i class="fa-solid fa-plug me-1.5"></i> Conectar y Sincronizar';
    }
}

function handleDisconnectLastFm() {
    localStorage.removeItem('lastfm_user');
    localStorage.removeItem('lastfm_key');
    if (statStrip) statStrip.classList.add('d-none');
    if (yearsFilterContainer) yearsFilterContainer.classList.add('d-none');
    if (monthsFilterContainer) monthsFilterContainer.classList.add('d-none');
    if (currentlyPlayingContainer) {
        currentlyPlayingContainer.innerHTML = '';
        currentlyPlayingContainer.classList.add('d-none');
    }
    initLastFmState();
    applyRoleBasedUI();

    const modal = bootstrap.Modal.getInstance(lastFmModalEl);
    if (modal) modal.hide();

    loadStats();
}

// ----------------------------------------------------
// ACCIÓN: GUARDAR PLAYLIST EN SPOTIFY (OPCIONAL)
// ----------------------------------------------------
async function handleSavePlaylist() {
    if (!accessToken) {
        if (confirm('Para guardar una playlist en tu Spotify necesitas iniciar sesión con tu cuenta de Spotify.\n\n¿Deseas iniciar sesión ahora?')) {
            redirectToSpotifyLogin();
        }
        return;
    }

    try {
        if (!currentLoadedItems || currentLoadedItems.length === 0) {
            alert('No hay canciones cargadas en este momento.');
            return;
        }

        const trackCandidates = (currentLoadedItems || [])
            .map(item => ({
                name: (item?.name || '').trim(),
                artist: (typeof item?.artist === 'string'
                    ? item.artist
                    : (item?.artist?.name || item?.artist?.['#text'] || '')).trim(),
                uri: (item?.uri || '').trim()
            }))
            .filter(t => t.name && t.artist);

        if (trackCandidates.length === 0) {
            throw new Error('La vista actual no contiene canciones exportables. Cambia a la vista de canciones o recientes.');
        }

        const periodName = getRangeLabel(currentRange);
        const payload = {
            name: `Mi Top (${periodName}) - SpotiTracker`,
            description: `Playlist creada con mis canciones más escuchadas según Last.fm. Fecha: ${new Date().toLocaleDateString()}`,
            public: false
        };

        const createRes = await createSpotifyPlaylistWithDetails(payload);

        if (!createRes || !createRes.id) {
            throw new Error('Spotify no devolvió un identificador de playlist.');
        }

        const urisToAdd = [];
        const seenUris = new Set();
        for (const t of trackCandidates) {
            let resolvedUri = '';
            if (t.uri && t.uri.startsWith('spotify:track:')) {
                resolvedUri = t.uri;
            } else {
                try {
                    const q = encodeURIComponent(`track:${t.name} artist:${t.artist}`);
                    let sRes = await spotifyFetch(`search?type=track&limit=1&q=${q}`);
                    let foundUri = sRes?.tracks?.items?.[0]?.uri;
                    if (!foundUri) {
                        const fallbackQ = encodeURIComponent(`${t.name} ${t.artist}`.trim());
                        sRes = await spotifyFetch(`search?type=track&limit=1&q=${fallbackQ}`);
                        foundUri = sRes?.tracks?.items?.[0]?.uri;
                    }
                    if (foundUri && foundUri.startsWith('spotify:track:')) {
                        resolvedUri = foundUri;
                    }
                } catch (e) {
                    // Ignorar fallos de búsqueda individuales
                }
            }

            if (resolvedUri && !seenUris.has(resolvedUri)) {
                seenUris.add(resolvedUri);
                urisToAdd.push(resolvedUri);
            }
        }

        if (urisToAdd.length === 0) {
            throw new Error('Se creó la playlist, pero no se pudieron resolver canciones para agregar.');
        }

        let tracksAddedCount = 0;
        for (let i = 0; i < urisToAdd.length; i += 100) {
            const chunk = urisToAdd.slice(i, i + 100);
            let addRes = await spotifyFetch(`playlists/${createRes.id}/tracks`, {
                method: 'POST',
                body: JSON.stringify({ uris: chunk })
            });

            if (!addRes) {
                const queryUris = encodeURIComponent(chunk.join(','));
                addRes = await spotifyFetch(`playlists/${createRes.id}/tracks?uris=${queryUris}`, {
                    method: 'POST'
                });
            }

            if (addRes) tracksAddedCount += chunk.length;
        }

        if (tracksAddedCount > 0) {
            alert(`¡Playlist "${payload.name}" creada con éxito en tu Spotify con ${tracksAddedCount} canciones!`);
        } else {
            alert(`Playlist "${payload.name}" creada en Spotify, pero hubo un problema al sincronizar las canciones.\n\nTip: Si tus permisos de Spotify son antiguos, cierra sesión y vuelve a iniciar sesión en Spotify para otorgar permisos de playlist.`);
        }
        if (createRes.external_urls?.spotify) {
            window.open(createRes.external_urls.spotify, '_blank');
        }
    } catch (err) {
        console.error(err);
        alert(err?.message || 'Ocurrió un error al guardar la playlist.');
    }
}

// ----------------------------------------------------
// ACCIÓN: TARJETA PARA COMPARTIR
// ----------------------------------------------------
let currentShareCardTheme = 'apple';

function setShareCardTheme(theme, btn) {
    currentShareCardTheme = theme;
    document.querySelectorAll('.share-theme-btn').forEach(b => {
        b.classList.remove('active', 'btn-brand');
        b.classList.add('btn-outline-secondary', 'text-white');
    });
    if (btn) {
        btn.classList.add('active', 'btn-brand');
        btn.classList.remove('btn-outline-secondary', 'text-white');
    }
    const wrapper = document.getElementById('share-card-canvas-wrapper');
    if (wrapper) {
        wrapper.classList.remove('theme-apple', 'theme-receipt', 'theme-neon');
        wrapper.classList.add('theme-' + theme);
    }
    renderShareCardContent();
}
window.setShareCardTheme = setShareCardTheme;

function renderShareCardContent() {
    const wrapper = document.getElementById('share-card-canvas-wrapper');
    if (!wrapper) return;
    const { user } = getLastFmCredentials();
    const userName = userProfileData?.display_name || user || 'Vrak_23';
    const dateStr = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    const periodLabel = getRangeLabel(currentRange);
    const items = (currentLoadedItems || []).slice(0, 8);

    if (currentShareCardTheme === 'receipt') {
        const totalPlays = items.reduce((acc, it) => acc + (parseInt(it.playcount || it.plays, 10) || 0), 0);
        wrapper.innerHTML = `
            <div class="text-center pb-2 mb-2" style="border-bottom: 1.5px dashed #52525b;">
                <div class="fw-bold" style="font-size: 1.15rem; letter-spacing: 0.08em;">SPOTITRACKER RECEIPT</div>
                <div style="font-size: 0.68rem;">CLIENTE: ${escapeHtml(userName.toUpperCase())}</div>
                <div style="font-size: 0.65rem;">PERIODO: ${escapeHtml(periodLabel.toUpperCase())} · ${dateStr}</div>
            </div>
            <div class="d-flex justify-content-between fw-bold pb-1 mb-1" style="font-size: 0.66rem; border-bottom: 1px dashed #71717a;">
                <span>CANT. / TEMA</span>
                <span>STREAMS</span>
            </div>
            <div class="d-flex flex-column gap-1.5 mb-2 text-start">
                ${items.map((item, idx) => {
                    const name = item.name || '';
                    const sub = item.artist ? (item.artist.name || item.artist['#text'] || item.artist) : '';
                    const plays = formatNumber(item.playcount || item.plays || 0);
                    return `
                        <div class="d-flex justify-content-between align-items-start" style="font-size: 0.72rem; line-height: 1.25;">
                            <div class="pe-2 overflow-hidden">
                                <strong>0${idx + 1} ${escapeHtml(name.toUpperCase())}</strong>
                                ${sub ? `<div style="font-size: 0.62rem; opacity: 0.75;">${escapeHtml(sub)}</div>` : ''}
                            </div>
                            <strong class="flex-shrink-0">${plays}</strong>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="pt-2 mt-2 d-flex justify-content-between fw-bold" style="border-top: 1.5px dashed #52525b; font-size: 0.78rem;">
                <span>TOTAL TOP ${items.length}</span>
                <span>${formatNumber(totalPlays)} REPS</span>
            </div>
            <div class="text-center mt-3 pt-1" style="font-size: 0.62rem;">
                <div style="letter-spacing: 3px; font-weight: 900; font-size: 0.95rem;">||| |||| || ||||| ||| ||||</div>
                <div>tune-tracker-pro.vercel.app</div>
            </div>
        `;
        return;
    }

    const top5 = items.slice(0, 5);
    wrapper.innerHTML = `
        <div class="d-flex align-items-center justify-content-between mb-3 border-bottom border-secondary border-opacity-25 pb-2">
            <div class="d-flex align-items-center gap-2">
                <img src="/logo.png" style="width: 30px; height: 30px; object-fit: contain;">
                <div class="text-start leading-tight">
                    <div class="fw-bold small" style="color: #f5f5f7;">${currentShareCardTheme === 'apple' ? 'Replay Pro' : 'SpotiTracker'}</div>
                    <small id="card-period-label" class="text-secondary" style="font-size: 0.68rem;">${escapeHtml(periodLabel)}</small>
                </div>
            </div>
            <div class="text-end">
                <div id="card-user-name" class="fw-bold small text-truncate text-white" style="max-width: 120px;">${escapeHtml(userName)}</div>
                <small id="card-date" class="text-secondary" style="font-size: 0.65rem;">${dateStr}</small>
            </div>
        </div>
        <div id="card-items-list" class="text-start d-flex flex-column gap-2 mb-3">
            ${top5.map((item, idx) => {
                const name = item.name;
                const sub = item.artist ? (item.artist.name || item.artist['#text'] || item.artist) : '';
                const img = getImageFromItem(item);
                return `
                    <div class="d-flex align-items-center gap-2.5 py-1">
                        <span class="fw-bold" style="width: 22px; font-size: 0.82rem; color: ${idx === 0 ? '#fbbf24' : '#c084fc'};">#${idx + 1}</span>
                        <img src="${img}" class="rounded-3" style="width: 36px; height: 36px; object-fit: cover;" alt="cover" onerror="safeImgError(this)">
                        <div class="overflow-hidden flex-grow-1 text-start">
                            <div class="fw-bold text-truncate text-white" style="font-size: 0.82rem;">${escapeHtml(name)}</div>
                            <small class="text-secondary text-truncate d-block" style="font-size: 0.70rem;">${escapeHtml(sub)}</small>
                        </div>
                        <span class="badge-scrobble" style="font-size: 0.66rem;">${formatNumber(item.playcount || item.plays)}</span>
                    </div>
                `;
            }).join('')}
        </div>
        <div class="border-top border-secondary border-opacity-25 pt-2 d-flex justify-content-between align-items-center text-secondary" style="font-size: 0.68rem;">
            <span>tune-tracker-pro.vercel.app</span>
            <span class="badge rounded-pill" style="background: rgba(191,90,242,0.25); color: #e9d5ff;">Top 5 Pro</span>
        </div>
    `;
}

async function prepareShareCard() {
    if (!shareCardModal) return;
    const modalEl = bootstrap.Modal.getOrCreateInstance(shareCardModal);
    modalEl.show();
    renderShareCardContent();
}

async function handleDownloadCard() {
    const cardWrapper = document.getElementById('share-card-canvas-wrapper');
    btnDownloadCard.disabled = true;
    btnDownloadCard.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Generando...';

    try {
        const bg = currentShareCardTheme === 'receipt' ? '#f4f1ea' : '#09090b';
        const canvas = await html2canvas(cardWrapper, {
            backgroundColor: bg,
            scale: 2,
            useCORS: true
        });

        const link = document.createElement('a');
        link.download = `SpotiTracker-${currentShareCardTheme}-${currentRange}-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (err) {
        console.error('Error al generar tarjeta:', err);
        if (typeof showEngagementToast === 'function') {
            showEngagementToast('<i class="fa-solid fa-triangle-exclamation text-danger"></i>', 'Error de Imagen', 'No se pudo generar la tarjeta descargable.');
        }
    } finally {
        btnDownloadCard.disabled = false;
        btnDownloadCard.innerHTML = '<i class="fa-solid fa-download me-1"></i> Descargar Imagen';
    }
}

// ----------------------------------------------------
// 6. BUSCADOR GLOBAL EN TIEMPO REAL (OPTIMIZADO)
// ----------------------------------------------------
let filterSearchDebounceTimer = null;

function renderCurrentItems(items) {
    if (currentType === 'tracks') renderTracks(items);
    else if (currentType === 'artists') renderArtists(items);
    else if (currentType === 'albums') renderAlbums(items);
    else if (currentType === 'recent') renderRecent(items);
}

function handleFilterSearch(e) {
    const rawVal = e?.target?.value || '';
    const q = rawVal.trim().toLowerCase();

    // 1. Si se borra todo el texto, restaurar inmediatamente sin delay
    if (!q) {
        if (filterSearchDebounceTimer) clearTimeout(filterSearchDebounceTimer);
        renderCurrentItems(currentLoadedItems);
        return;
    }

    // 2. Debounce de 120ms: permite teclear o borrar súper rápido sin congelar la interfaz
    if (filterSearchDebounceTimer) clearTimeout(filterSearchDebounceTimer);
    filterSearchDebounceTimer = setTimeout(() => {
        executeFilterSearch(q);
    }, 120);
}

async function executeFilterSearch(q) {
    if (!q) {
        renderCurrentItems(currentLoadedItems);
        return;
    }

    // Buscar en la base de datos completa de canciones registradas
    const activeDb = unifiedDb || spotifyDb || await getActiveDatabase();
    if (activeDb) {
        if (currentType === 'tracks' && activeDb.tracksLookup) {
            // Reusar lista en memoria para no crear Object.values() en cada tecla
            if (!activeDb._cachedTracksList) {
                activeDb._cachedTracksList = Object.values(activeDb.tracksLookup);
            }
            const all = activeDb._cachedTracksList;
            const matches = all.filter(t => {
                const name = (t.name || '').toLowerCase();
                const artist = (t.artist || '').toLowerCase();
                const album = (t.album || '').toLowerCase();
                return name.includes(q) || artist.includes(q) || album.includes(q);
            });

            if (matches.length === 0) {
                statsList.innerHTML = `
                    <div class="w-100 text-center py-5 text-secondary" style="grid-column: 1 / -1;">
                        <i class="fa-solid fa-magnifying-glass mb-2" style="font-size: 1.5rem; opacity: 0.5;"></i>
                        <div>No se encontraron canciones para "<strong>${escapeHtml(q)}</strong>"</div>
                    </div>
                `;
                return;
            }

            // Si hay muchos resultados, ordenar por popularidad base y tomar los mejores 80
            if (matches.length > 80) {
                matches.sort((a, b) => (b.plays || 0) - (a.plays || 0));
            }
            const topSlice = matches.slice(0, 80);

            // Enriquecer con reproducciones reales unificadas (O(1) ultra rápido)
            const enriched = topSlice.map(t => ({
                name: t.name,
                artist: { name: t.artist },
                album: { name: t.album },
                playcount: getRealItemPlays('track', t.name, t.artist, t, currentRange),
                uri: t.uri
            }));

            enriched.sort((a, b) => b.playcount - a.playcount);
            renderTracks(enriched);

            // Banner indicador de búsqueda en catálogo global
            const banner = document.createElement('div');
            banner.className = 'w-100 d-flex align-items-center justify-content-between py-1.5 px-3 mb-2 rounded border';
            banner.style = 'grid-column: 1 / -1; background: rgba(168, 85, 247, 0.08); border-color: rgba(168, 85, 247, 0.25) !important; font-size: 0.74rem;';
            banner.innerHTML = `
                <div class="d-flex align-items-center gap-1.5 text-white">
                    <i class="fa-solid fa-magnifying-glass text-primary"></i>
                    <span><strong>${matches.length}</strong> canciones encontradas en tu catálogo completo</span>
                </div>
                <span class="badge" style="font-family: var(--font-mono); font-size: 0.65rem; background: rgba(255,255,255,0.08); color: #cbd5e1;">Historial Global</span>
            `;
            statsList.prepend(banner);
            return;
        } else if (currentType === 'artists') {
            if (!activeDb._cachedArtistsList) {
                activeDb._cachedArtistsList = activeDb.artistsLookup ? Object.values(activeDb.artistsLookup) : (activeDb.top?.overall?.artists || (activeDb.artists ? Object.values(activeDb.artists) : []));
            }
            const allArtists = activeDb._cachedArtistsList;
            if (allArtists.length > 0) {
                const matches = allArtists.filter(a => (a.name || '').toLowerCase().includes(q));
                if (matches.length === 0) {
                    statsList.innerHTML = `
                        <div class="w-100 text-center py-5 text-secondary" style="grid-column: 1 / -1;">
                            <i class="fa-solid fa-magnifying-glass mb-2" style="font-size: 1.5rem; opacity: 0.5;"></i>
                            <div>No se encontraron artistas para "<strong>${escapeHtml(q)}</strong>"</div>
                        </div>
                    `;
                    return;
                }

                if (matches.length > 60) {
                    matches.sort((a, b) => (b.plays || 0) - (a.plays || 0));
                }
                const topSlice = matches.slice(0, 60);

                const enriched = topSlice.map(a => ({
                    name: a.name,
                    playcount: getRealItemPlays('artist', a.name, '', a, currentRange)
                }));
                enriched.sort((a, b) => b.playcount - a.playcount);
                renderArtists(enriched);

                const banner = document.createElement('div');
                banner.className = 'w-100 d-flex align-items-center justify-content-between py-1.5 px-3 mb-2 rounded border';
                banner.style = 'grid-column: 1 / -1; background: rgba(168, 85, 247, 0.08); border-color: rgba(168, 85, 247, 0.25) !important; font-size: 0.74rem;';
                banner.innerHTML = `
                    <div class="d-flex align-items-center gap-1.5 text-white">
                        <i class="fa-solid fa-magnifying-glass text-primary"></i>
                        <span><strong>${matches.length}</strong> artistas encontrados en tu catálogo completo</span>
                    </div>
                    <span class="badge" style="font-family: var(--font-mono); font-size: 0.65rem; background: rgba(255,255,255,0.08); color: #cbd5e1;">Historial Global</span>
                `;
                statsList.prepend(banner);
                return;
            }
        } else if (currentType === 'albums') {
            if (!activeDb._cachedAlbumsList) {
                activeDb._cachedAlbumsList = activeDb.albumsLookup ? Object.values(activeDb.albumsLookup) : (activeDb.top?.overall?.albums || (activeDb.albums ? Object.values(activeDb.albums) : []));
            }
            const allAlbums = activeDb._cachedAlbumsList;
            if (allAlbums.length > 0) {
                const matches = allAlbums.filter(a => {
                    const name = (a.name || '').toLowerCase();
                    const artist = (a.artist || '').toLowerCase();
                    return name.includes(q) || artist.includes(q);
                });
                if (matches.length === 0) {
                    statsList.innerHTML = `
                        <div class="w-100 text-center py-5 text-secondary" style="grid-column: 1 / -1;">
                            <i class="fa-solid fa-magnifying-glass mb-2" style="font-size: 1.5rem; opacity: 0.5;"></i>
                            <div>No se encontraron álbumes para "<strong>${escapeHtml(q)}</strong>"</div>
                        </div>
                    `;
                    return;
                }

                if (matches.length > 60) {
                    matches.sort((a, b) => (b.plays || 0) - (a.plays || 0));
                }
                const topSlice = matches.slice(0, 60);

                const enriched = topSlice.map(a => ({
                    name: a.name,
                    artist: { name: a.artist },
                    playcount: getRealItemPlays('album', a.name, a.artist, a, currentRange)
                }));
                enriched.sort((a, b) => b.playcount - a.playcount);
                renderAlbums(enriched);

                const banner = document.createElement('div');
                banner.className = 'w-100 d-flex align-items-center justify-content-between py-1.5 px-3 mb-2 rounded border';
                banner.style = 'grid-column: 1 / -1; background: rgba(168, 85, 247, 0.08); border-color: rgba(168, 85, 247, 0.25) !important; font-size: 0.74rem;';
                banner.innerHTML = `
                    <div class="d-flex align-items-center gap-1.5 text-white">
                        <i class="fa-solid fa-magnifying-glass text-primary"></i>
                        <span><strong>${matches.length}</strong> álbumes encontrados en tu catálogo completo</span>
                    </div>
                    <span class="badge" style="font-family: var(--font-mono); font-size: 0.65rem; background: rgba(255,255,255,0.08); color: #cbd5e1;">Historial Global</span>
                `;
                statsList.prepend(banner);
                return;
            }
        }
    }

    // Fallback: buscar en los items cargados actualmente
    const filtered = (currentLoadedItems || []).filter(item => {
        const name = (item.name || '').toLowerCase();
        const artist = (item.artist?.name || item.artist?.['#text'] || item.artist || '').toLowerCase();
        const album = (item.album?.name || item.album?.['#text'] || item.album || '').toLowerCase();
        return name.includes(q) || artist.includes(q) || album.includes(q);
    });
    renderCurrentItems(filtered);
}

// ----------------------------------------------------
// CARGA Y CACHÉ DE INSIGHTS (HÁBITOS, RÉCORDS, OLVIDADOS)
// ----------------------------------------------------
let cachedInsights = null;

async function loadInsightsData() {
    if (cachedInsights) return cachedInsights;
    if (unifiedDb && unifiedDb.insights) {
        cachedInsights = unifiedDb.insights;
        return cachedInsights;
    }
    try {
        const res = await fetch('/data/insights.json');
        if (res.ok) {
            cachedInsights = await res.json();
            return cachedInsights;
        }
    } catch (e) {
        console.warn('Error al cargar insights.json:', e);
    }
    return null;
}

// ----------------------------------------------------
// 2. HÁBITOS DE ESCUCHA (GRÁFICOS DE HORAS Y DÍAS)
// ----------------------------------------------------
async function openHabitsModal() {
    const habitsBody = document.getElementById('habits-body');
    if (!habitsBody) return;
    habitsBody.innerHTML = '<div class="text-center py-4 text-secondary"><span class="spinner-border spinner-border-sm text-info me-2"></span>Cargando tus hábitos...</div>';
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('habitsModal'));
    modal.show();

    const insights = await loadInsightsData();
    if (!insights || !insights.habits) {
        habitsBody.innerHTML = '<div class="text-secondary text-center py-3">No se encontraron datos de hábitos disponibles.</div>';
        return;
    }

    const h = insights.habits;
    const maxHourVal = Math.max(...h.hourly, 1);
    const maxDayVal = Math.max(...h.weekday, 1);

    let hourlyBarsHtml = '';
    h.hourly.forEach((count, hour) => {
        const pct = Math.round((count / maxHourVal) * 100);
        const label = `${String(hour).padStart(2, '0')}:00`;
        const isPeak = hour === h.peakHour;
        hourlyBarsHtml += `
            <div class="d-flex align-items-center gap-2 mb-1" style="font-size: 0.72rem;">
                <span class="text-secondary text-end font-monospace" style="width: 42px;">${label}</span>
                <div class="flex-grow-1 bg-black rounded" style="height: 7px; overflow: hidden; border: 1px solid var(--border-subtle);">
                    <div style="width: ${pct}%; height: 100%; background: ${isPeak ? 'var(--brand-primary)' : '#475569'}; border-radius: 3px;"></div>
                </div>
                <span class="${isPeak ? 'text-white fw-bold' : 'text-secondary'} font-monospace" style="width: 45px; text-align: right;">${formatNumber(count)}</span>
            </div>
        `;
    });

    let dayBarsHtml = '';
    h.weekdayNames.forEach((name, idx) => {
        const count = h.weekday[idx];
        const pct = Math.round((count / maxDayVal) * 100);
        const isPeak = name === h.peakWeekday;
        dayBarsHtml += `
            <div class="d-flex align-items-center gap-2 mb-1" style="font-size: 0.72rem;">
                <span class="text-secondary text-end" style="width: 65px;">${name}</span>
                <div class="flex-grow-1 bg-black rounded" style="height: 7px; overflow: hidden; border: 1px solid var(--border-subtle);">
                    <div style="width: ${pct}%; height: 100%; background: ${isPeak ? '#06b6d4' : '#475569'}; border-radius: 3px;"></div>
                </div>
                <span class="${isPeak ? 'text-white fw-bold' : 'text-secondary'} font-monospace" style="width: 45px; text-align: right;">${formatNumber(count)}</span>
            </div>
        `;
    });

    habitsBody.innerHTML = `
        <div class="p-2.5 rounded-3 border mb-3" style="background-color: var(--bg-surface-hover); border-color: var(--border-subtle) !important;">
            <div class="d-flex align-items-center gap-2 mb-1 text-info fw-semibold" style="font-size: 0.78rem;">
                <i class="fa-solid fa-bolt"></i> Tu Momento Favorito
            </div>
            <div class="text-white" style="font-size: 0.81rem;">
                Tu hora pico del día son las <strong>${h.peakHour}:00 hrs</strong> y tu día con mayor actividad musical es el <strong>${h.peakWeekday}</strong>.
            </div>
        </div>

        <div class="fw-bold text-white mb-2" style="font-size: 0.80rem;">Distribución por Día de la Semana</div>
        <div class="mb-3">${dayBarsHtml}</div>

        <div class="fw-bold text-white mb-2" style="font-size: 0.80rem;">Distribución por Hora del Día (0:00 - 23:00)</div>
        <div style="max-height: 220px; overflow-y: auto; padding-right: 4px;">${hourlyBarsHtml}</div>
    `;
}

// ----------------------------------------------------
// 3. SECCIÓN DE ARTISTAS OLVIDADOS
// ----------------------------------------------------
async function openForgottenModal() {
    const modalEl = document.getElementById('forgottenModal');
    if (!modalEl) return;
    const forgottenBody = document.getElementById('forgotten-body');
    if (!forgottenBody) return;
    forgottenBody.innerHTML = '<div class="text-center py-4 text-secondary"><span class="spinner-border spinner-border-sm text-warning me-2"></span>Buscando artistas olvidados...</div>';
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();

    const insights = await loadInsightsData();
    const list = insights?.forgottenArtists || [];

    if (list.length === 0) {
        forgottenBody.innerHTML = '<div class="text-secondary text-center py-3">¡No tienes artistas olvidados! Sigues escuchando tu biblioteca activamente.</div>';
        return;
    }

    forgottenBody.innerHTML = `
        <div class="text-secondary mb-2" style="font-size: 0.76rem;">
            Artistas que escuchabas intensamente en el pasado y no has reproducido en más de 1 año:
        </div>
        <div id="forgotten-items-container" style="max-height: 380px; overflow-y: auto; padding-right: 2px;"></div>
    `;

    const container = document.getElementById('forgotten-items-container');
    list.forEach((art, idx) => {
        const lastDate = art.last ? new Date(art.last).toLocaleDateString([], { month: 'short', year: 'numeric' }) : 'Antiguo';
        const spSearch = `https://open.spotify.com/search/${encodeURIComponent(art.name)}`;
        const row = document.createElement('div');
        row.className = 'card-uniform mb-1';
        row.style.minHeight = '44px';
        row.style.padding = '5px 8px';
        row.innerHTML = `
            <span class="card-rank text-muted">#${idx + 1}</span>
            <div class="overflow-hidden flex-grow-1">
                <div class="fw-bold text-truncate text-white" style="font-size: 0.81rem;">${art.name}</div>
                <small class="text-secondary d-block text-truncate" style="font-size: 0.69rem;"><i class="fa-regular fa-clock me-1"></i>Última vez: ${lastDate} • Top: ${art.topTrack}</small>
            </div>
            <span class="badge-scrobble"><i class="fa-solid fa-headphones"></i>${formatNumber(art.plays)}</span>
            <a href="${spSearch}" target="_blank" rel="noopener noreferrer" class="btn-card-action" title="Volver a escuchar">
                <i class="fa-brands fa-spotify"></i>
            </a>
        `;
        row.addEventListener('click', () => {
            showItemStats('artist', art.name, '');
        });
        const spLink = row.querySelector('.btn-card-action');
        if (spLink) spLink.addEventListener('click', (e) => e.stopPropagation());
        container.appendChild(row);
    });
}

// ----------------------------------------------------
// 4. COMPARADOR MUSICAL ("VERSUS")
// ----------------------------------------------------
async function openVersusModal() {
    const modalEl = document.getElementById('versusModal');
    if (!modalEl) return;
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();

    const db = await getActiveDatabase();
    if (!db || !db.artistsLookup) return;

    const selectA = document.getElementById('versus-select-a');
    const selectB = document.getElementById('versus-select-b');
    if (!selectA || !selectB) return;

    const allArtists = Object.values(db.artistsLookup).sort((a, b) => b.plays - a.plays).slice(0, 150);

    selectA.innerHTML = '';
    selectB.innerHTML = '';

    allArtists.forEach((a, i) => {
        const optA = document.createElement('option');
        optA.value = a.name;
        optA.textContent = `#${i + 1} ${a.name} (${formatNumber(a.plays)})`;
        selectA.appendChild(optA);

        const optB = document.createElement('option');
        optB.value = a.name;
        optB.textContent = `#${i + 1} ${a.name} (${formatNumber(a.plays)})`;
        selectB.appendChild(optB);
    });

    if (allArtists.length > 0) selectA.value = allArtists[0].name;
    if (allArtists.length > 1) selectB.value = allArtists[1].name;

    selectA.onchange = () => updateVersusResults(db);
    selectB.onchange = () => updateVersusResults(db);

    updateVersusResults(db);
}

function updateVersusResults(db) {
    const nameA = document.getElementById('versus-select-a')?.value;
    const nameB = document.getElementById('versus-select-b')?.value;
    const resultsContainer = document.getElementById('versus-comparison-results');
    if (!resultsContainer) return;

    const artMap = db.artistsLookup || {};
    const keyA = normalizeKey(nameA);
    const keyB = normalizeKey(nameB);

    const artA = artMap[keyA] || Object.values(artMap).find(a => normalizeKey(a.name) === keyA);
    const artB = artMap[keyB] || Object.values(artMap).find(a => normalizeKey(a.name) === keyB);

    if (!artA || !artB) return;

    const playsA = artA.plays || 0;
    const playsB = artB.plays || 0;
    const hoursA = (artA.ms ? (artA.ms / 3600000).toFixed(1) : (playsA * 3.5 / 60).toFixed(1));
    const hoursB = (artB.ms ? (artB.ms / 3600000).toFixed(1) : (playsB * 3.5 / 60).toFixed(1));
    const topSongA = artA.tracks?.[0]?.name || 'N/A';
    const topSongB = artB.tracks?.[0]?.name || 'N/A';

    const totalPlays = playsA + playsB || 1;
    const pctA = Math.round((playsA / totalPlays) * 100);
    const pctB = 100 - pctA;

    const winner = playsA >= playsB ? 'A' : 'B';

    resultsContainer.innerHTML = `
        <div class="p-2.5 rounded-3 border mb-3" style="background-color: var(--bg-surface-hover); border-color: var(--border-subtle) !important;">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <div class="text-start" style="width: 45%;">
                    <div class="fw-bold text-truncate text-white" style="font-size: 0.88rem;">
                        ${winner === 'A' ? '<i class="fa-solid fa-crown text-warning me-1"></i>' : ''}${artA.name}
                    </div>
                    <small class="text-secondary">${pctA}% cuota</small>
                </div>
                <div class="text-center text-muted fw-bold" style="font-size: 0.76rem;">VS</div>
                <div class="text-end" style="width: 45%;">
                    <div class="fw-bold text-truncate text-white" style="font-size: 0.88rem;">
                        ${winner === 'B' ? '<i class="fa-solid fa-crown text-warning me-1"></i>' : ''}${artB.name}
                    </div>
                    <small class="text-secondary">${pctB}% cuota</small>
                </div>
            </div>

            <!-- Comparison Bar -->
            <div class="d-flex rounded overflow-hidden mb-2" style="height: 8px; background-color: #272733;">
                <div style="width: ${pctA}%; background: linear-gradient(90deg, #a855f7, #c084fc);"></div>
                <div style="width: ${pctB}%; background: linear-gradient(90deg, #06b6d4, #22d3ee);"></div>
            </div>
        </div>

        <!-- Comparative Metrics -->
        <div class="d-flex flex-column gap-2" style="font-size: 0.78rem;">
            <div class="d-flex justify-content-between border-bottom pb-1" style="border-color: var(--border-subtle) !important;">
                <span class="fw-bold text-white">${formatNumber(playsA)}</span>
                <span class="text-muted">Reproducciones</span>
                <span class="fw-bold text-white">${formatNumber(playsB)}</span>
            </div>
            <div class="d-flex justify-content-between border-bottom pb-1" style="border-color: var(--border-subtle) !important;">
                <span class="fw-bold text-white">${hoursA} h</span>
                <span class="text-muted">Horas Totales</span>
                <span class="fw-bold text-white">${hoursB} h</span>
            </div>
            <div class="d-flex justify-content-between border-bottom pb-1" style="border-color: var(--border-subtle) !important;">
                <span class="text-white text-truncate text-start" style="max-width: 40%;" title="${topSongA}">${topSongA}</span>
                <span class="text-muted text-center" style="min-width: 80px;">Canción Top</span>
                <span class="text-white text-truncate text-end" style="max-width: 40%;" title="${topSongB}">${topSongB}</span>
            </div>
        </div>
    `;
}

// ----------------------------------------------------
// 5. RÉCORDS Y LOGROS PERSONALES
// ----------------------------------------------------
async function openRecordsModal() {
    const recordsBody = document.getElementById('records-body');
    if (!recordsBody) return;
    recordsBody.innerHTML = '<div class="text-center py-4 text-secondary"><span class="spinner-border spinner-border-sm text-warning me-2"></span>Calculando tus récords...</div>';
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('recordsModal'));
    modal.show();

    const insights = await loadInsightsData();
    const rec = insights?.records;
    if (!rec) {
        recordsBody.innerHTML = '<div class="text-secondary text-center py-3">No hay datos de récords disponibles.</div>';
        return;
    }

    const topDayDate = rec.topDay?.date ? new Date(rec.topDay.date + 'T12:00:00Z').toLocaleDateString([], { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A';
    const marathonDate = rec.marathonArtist?.date ? new Date(rec.marathonArtist.date + 'T12:00:00Z').toLocaleDateString([], { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A';

    let topDaysHtml = '';
    (rec.topDaysList || []).forEach((d, i) => {
        const fDate = new Date(d.date + 'T12:00:00Z').toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
        topDaysHtml += `
            <div class="d-flex justify-content-between py-1 border-bottom" style="border-color: var(--border-subtle) !important; font-size: 0.74rem;">
                <span class="text-white">#${i + 1} ${fDate}</span>
                <span class="badge-scrobble">${d.count} streams</span>
            </div>
        `;
    });

    recordsBody.innerHTML = `
        <div class="row g-2 mb-3">
            <div class="col-12">
                <div class="p-3 rounded-3 border" style="background-color: var(--bg-surface-hover); border-color: var(--border-subtle) !important;">
                    <div class="d-flex align-items-center gap-2 mb-1 text-warning fw-semibold" style="font-size: 0.76rem;">
                        <i class="fa-solid fa-trophy"></i> Día Récord Histórico
                    </div>
                    <div class="display-6 fw-bold text-white mb-0" style="font-size: 1.5rem;">${rec.topDay.count} <span style="font-size: 0.82rem;" class="fw-normal text-secondary">canciones</span></div>
                    <div class="text-secondary" style="font-size: 0.76rem;">El <strong>${topDayDate}</strong> fue el día con más música en toda tu vida registrada.</div>
                </div>
            </div>

            <div class="col-12">
                <div class="p-3 rounded-3 border" style="background-color: var(--bg-surface-hover); border-color: var(--border-subtle) !important;">
                    <div class="d-flex align-items-center gap-2 mb-1 text-info fw-semibold" style="font-size: 0.76rem;">
                        <i class="fa-solid fa-fire"></i> Artista Más Maratoneado
                    </div>
                    <div class="h6 fw-bold text-white mb-0">${rec.marathonArtist.artist} (${rec.marathonArtist.count} reproducciones)</div>
                    <div class="text-secondary" style="font-size: 0.76rem;">Escuchado intensamente en una sola jornada el <strong>${marathonDate}</strong>.</div>
                </div>
            </div>

            <div class="col-6">
                <div class="p-2.5 rounded-3 border" style="background-color: var(--bg-surface-hover); border-color: var(--border-subtle) !important;">
                    <div class="text-muted" style="font-size: 0.68rem;">Días con Música</div>
                    <div class="fw-bold text-white mb-0" style="font-size: 0.88rem;">${formatNumber(rec.totalDaysActive)} días</div>
                </div>
            </div>

            <div class="col-6">
                <div class="p-2.5 rounded-3 border" style="background-color: var(--bg-surface-hover); border-color: var(--border-subtle) !important;">
                    <div class="text-muted" style="font-size: 0.68rem;">Promedio Diario</div>
                    <div class="fw-bold text-white mb-0" style="font-size: 0.88rem;">~${rec.avgPlaysPerDay} canciones/día</div>
                </div>
            </div>
        </div>

        <div class="fw-bold text-white mb-2" style="font-size: 0.80rem;">Top 5 Días con Más Escuchas</div>
        <div>${topDaysHtml}</div>
    `;
}

// ----------------------------------------------------
// 5. SALA DE TROFEOS, HITOS (+100 STREAMS) & GAMIFICACIÓN
// ----------------------------------------------------
const MILESTONE_STORAGE_KEY = 'spoti_artist_milestones';
let hasCheckedMilestonesThisSession = false;

function getStoredArtistMilestones() {
    try {
        const raw = localStorage.getItem(MILESTONE_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function saveStoredArtistMilestones(milestones) {
    try {
        localStorage.setItem(MILESTONE_STORAGE_KEY, JSON.stringify(milestones));
    } catch (e) {}
}

async function checkArtistMilestones(activeDb) {
    if (!activeDb || !activeDb.artistsLookup) return;
    if (hasCheckedMilestonesThisSession) return;
    hasCheckedMilestonesThisSession = true;

    let stored = getStoredArtistMilestones();
    const isFirstRun = stored === null;
    if (!stored) stored = {};

    const allArtists = Object.values(activeDb.artistsLookup);
    const newCelebrations = [];

    allArtists.forEach(art => {
        let totalPlays = art.plays || 0;
        if (currentSource === 'unified' && lastFmRecentDelta.length > 0) {
            const normA = normalizeKey(art.name);
            const deltaCount = lastFmRecentDelta.filter(t => {
                const tArt = normalizeKey(t.artist ? (t.artist['#text'] || t.artist.name || '') : '');
                return tArt === normA || tArt.includes(normA) || normA.includes(tArt);
            }).length;
            totalPlays += deltaCount;
        }

        if (totalPlays >= 100) {
            const currentMilestone = Math.floor(totalPlays / 100) * 100;
            const normKey = normalizeKey(art.name);
            const prevMilestone = stored[normKey] || 0;

            if (currentMilestone > prevMilestone) {
                stored[normKey] = currentMilestone;
                if (!isFirstRun) {
                    newCelebrations.push({
                        name: art.name,
                        milestone: currentMilestone,
                        totalPlays: totalPlays
                    });
                }
            }
        }
    });

    saveStoredArtistMilestones(stored);

    if (newCelebrations.length > 0) {
        newCelebrations.sort((a, b) => b.milestone - a.milestone);
        const topHito = newCelebrations[0];

        sendPushMilestoneNotification(topHito.name, topHito.milestone);

        setTimeout(() => {
            showArtistMilestoneCelebration(topHito);
        }, 800);
    }
}

async function toggleMilestonePushNotifications() {
    if (!('Notification' in window)) {
        alert('Tu navegador no admite notificaciones web.');
        return;
    }

    if (Notification.permission === 'granted') {
        alert('¡Las notificaciones push para hitos ya están activas en este dispositivo!');
        updatePushButtonsUI();
        return;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            sendPushMilestoneNotification('Notificaciones Activadas', '100');
            updatePushButtonsUI();
        } else {
            alert('Has denegado o cancelado el permiso de notificaciones.');
            updatePushButtonsUI();
        }
    } catch (err) {
        console.error('Error solicitando permisos de notificación:', err);
    }
}

function updatePushButtonsUI() {
    const isGranted = 'Notification' in window && Notification.permission === 'granted';
    const btnToggle = document.getElementById('btn-toggle-milestone-push');
    const pushPrompt = document.getElementById('milestone-push-prompt');

    if (btnToggle) {
        if (isGranted) {
            btnToggle.classList.remove('btn-outline-warning');
            btnToggle.classList.add('btn-warning');
            btnToggle.innerHTML = '<i class="fa-solid fa-check me-1"></i> Alertas Activas';
        } else {
            btnToggle.classList.add('btn-outline-warning');
            btnToggle.classList.remove('btn-warning');
            btnToggle.innerHTML = 'Activar Alertas';
        }
    }

    if (pushPrompt) {
        if (isGranted) {
            pushPrompt.classList.add('d-none');
        } else {
            pushPrompt.classList.remove('d-none');
        }
    }
}

function sendPushMilestoneNotification(artistName, milestone) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const title = `🎉 ¡Hito Alcanzado en Spotify Tracker!`;
    const options = {
        body: `¡${artistName} acaba de superar las ${milestone} reproducciones en tu biblioteca!`,
        icon: '/logo.png',
        badge: '/logo.png',
        tag: `milestone-${normalizeKey(artistName)}-${milestone}`,
        renotify: true
    };

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => {
            reg.showNotification(title, options);
        }).catch(() => {
            new Notification(title, options);
        });
    } else {
        new Notification(title, options);
    }
}

async function showArtistMilestoneCelebration(data) {
    const { name, milestone } = data;
    const modalEl = document.getElementById('artistMilestoneModal');
    if (!modalEl) return;

    const nameEl = document.getElementById('milestone-artist-name');
    const countEl = document.getElementById('milestone-plays-count');
    const badgeEl = document.getElementById('milestone-badge-pill');
    const congratsEl = document.getElementById('milestone-congrats-text');
    const imgEl = document.getElementById('milestone-artist-img');
    const viewStatsBtn = document.getElementById('btn-milestone-view-stats');

    if (nameEl) nameEl.textContent = name;
    if (countEl) countEl.textContent = formatNumber(milestone);
    if (badgeEl) badgeEl.textContent = `+${milestone}`;

    if (congratsEl) {
        if (milestone >= 1000) {
            congratsEl.innerHTML = `<strong>¡Hito Legendario!</strong> ${name} ha sobrepasado las <strong>${formatNumber(milestone)} reproducciones</strong>. Es uno de los pilares de tu historia musical.`;
        } else if (milestone >= 500) {
            congratsEl.innerHTML = `<strong>¡Medio Millar de Escuchas!</strong> Superar los <strong>${milestone} streams</strong> sitúa a ${name} en el podio más alto de tu biblioteca.`;
        } else if (milestone >= 200) {
            congratsEl.innerHTML = `<strong>¡Doble Centenar!</strong> ${name} acumula más de <strong>${milestone} streams</strong> demostrando una fidelidad continua en tus listas.`;
        } else {
            congratsEl.innerHTML = `<strong>¡Bienvenido al Club de los 100!</strong> ${name} acaba de superar sus primeras <strong>100 reproducciones</strong> oficiales en tu cuenta.`;
        }
    }

    if (imgEl) {
        imgEl.src = '/logo.png';
        const artKey = `artist::${normalizeKey(name)}::`;
        if (artCache[artKey]) {
            imgEl.src = artCache[artKey];
        } else {
            resolveSpotifyArtwork(name, '', 'artist', 'milestone-artist-img');
        }
    }

    if (viewStatsBtn) {
        viewStatsBtn.onclick = () => {
            const mInstance = bootstrap.Modal.getInstance(modalEl);
            if (mInstance) mInstance.hide();
            showItemStats('artist', name, '');
        };
    }

    updatePushButtonsUI();

    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();

    if (typeof confetti === 'function') {
        confetti({
            particleCount: 90,
            spread: 80,
            origin: { y: 0.6 }
        });
        setTimeout(() => {
            confetti({
                particleCount: 50,
                angle: 60,
                spread: 60,
                origin: { x: 0.1, y: 0.7 }
            });
            confetti({
                particleCount: 50,
                angle: 120,
                spread: 60,
                origin: { x: 0.9, y: 0.7 }
            });
        }, 280);
    }
}

async function openTrophiesModal() {
    const modalEl = document.getElementById('trophiesModal');
    if (!modalEl) return;

    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();

    updatePushButtonsUI();

    const db = await getActiveDatabase();
    if (!db || !db.artistsLookup) return;

    renderTrophiesMilestonesTab(db);
    renderTrophiesBadgesTab(db);
}

function renderTrophiesMilestonesTab(db) {
    const nearContainer = document.getElementById('near-milestones-container');
    const achievedContainer = document.getElementById('achieved-milestones-container');
    const countLabel = document.getElementById('milestones-count-label');

    if (!nearContainer || !achievedContainer) return;

    const allArtists = Object.values(db.artistsLookup || {}).map(art => {
        let totalPlays = art.plays || 0;
        if (currentSource === 'unified' && lastFmRecentDelta.length > 0) {
            const normA = normalizeKey(art.name);
            const deltaCount = lastFmRecentDelta.filter(t => {
                const tArt = normalizeKey(t.artist ? (t.artist['#text'] || t.artist.name || '') : '');
                return tArt === normA || tArt.includes(normA) || normA.includes(tArt);
            }).length;
            totalPlays += deltaCount;
        }
        return {
            ...art,
            effectivePlays: totalPlays
        };
    });

    // 1. Artistas cerca de su próximo centenar (a falta de 1 a 25 reproducciones)
    const nearList = allArtists
        .filter(a => {
            const r = a.effectivePlays % 100;
            return (a.effectivePlays >= 75 && r >= 75 && r < 100);
        })
        .map(a => {
            const r = a.effectivePlays % 100;
            const nextMilestone = (Math.floor(a.effectivePlays / 100) + 1) * 100;
            const remaining = nextMilestone - a.effectivePlays;
            return {
                ...a,
                nextMilestone,
                remaining,
                progressPct: r
            };
        })
        .sort((a, b) => a.remaining - b.remaining)
        .slice(0, 6);

    if (nearList.length === 0) {
        nearContainer.innerHTML = `
            <div class="p-2.5 rounded text-center border border-secondary border-opacity-10 text-secondary" style="background: rgba(255,255,255,0.02); font-size: 0.74rem;">
                No hay artistas a menos de 25 canciones de un hito en este momento. ¡Sigue escuchando música!
            </div>
        `;
    } else {
        nearContainer.innerHTML = nearList.map(a => {
            const safeName = a.name.replace(/'/g, "\\'");
            const artKey = `artist::${normalizeKey(a.name)}::`;
            const cover = artCache[artKey] || '/logo.png';
            const imgId = `near-art-img-${Math.abs(normalizeKey(a.name).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0))}`;
            return `
                <div class="card-uniform p-2" onclick="showItemStats('artist', '${safeName}', '')" style="cursor: pointer; min-height: 48px;">
                    <img id="${imgId}" src="${cover}" class="rounded-circle flex-shrink-0" style="width: 38px; height: 38px; object-fit: cover;" onerror="safeAvatarError(this)">
                    <div class="flex-grow-1 overflow-hidden">
                        <div class="d-flex align-items-center justify-content-between mb-0.5">
                            <span class="fw-bold text-white text-truncate" style="font-size: 0.8rem;">${a.name}</span>
                            <span class="badge border border-warning border-opacity-30 text-warning" style="background: rgba(234, 179, 8, 0.12); font-size: 0.68rem; padding: 1px 6px;">
                                ¡Faltan ${a.remaining}!
                            </span>
                        </div>
                        <div class="progress" style="height: 5px; background: rgba(255,255,255,0.06); border-radius: 3px;">
                            <div class="progress-bar" style="width: ${a.progressPct}%; background: linear-gradient(90deg, #f59e0b, #eab308);"></div>
                        </div>
                        <div class="d-flex justify-content-between text-secondary mt-0.5" style="font-size: 0.64rem;">
                            <span>${a.effectivePlays} escuchas</span>
                            <span>Meta: ${a.nextMilestone}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        nearList.forEach(a => {
            const artKey = `artist::${normalizeKey(a.name)}::`;
            if (!artCache[artKey]) {
                const imgId = `near-art-img-${Math.abs(normalizeKey(a.name).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0))}`;
                resolveSpotifyArtwork(a.name, '', 'artist', imgId);
            }
        });
    }

    // 2. Club de los +100 Streams
    const achieved = allArtists.filter(a => a.effectivePlays >= 100).sort((a, b) => b.effectivePlays - a.effectivePlays);
    if (countLabel) countLabel.textContent = `${achieved.length} artistas en el club`;

    if (achieved.length === 0) {
        achievedContainer.innerHTML = `
            <div class="text-center py-4 text-secondary" style="font-size: 0.78rem;">
                Aún no tienes artistas con 100 o más reproducciones registradas.
            </div>
        `;
    } else {
        achievedContainer.innerHTML = achieved.map((a, idx) => {
            const safeName = a.name.replace(/'/g, "\\'");
            const milestone = Math.floor(a.effectivePlays / 100) * 100;
            const artKey = `artist::${normalizeKey(a.name)}::`;
            const cover = artCache[artKey] || '/logo.png';
            const imgId = `achieved-art-img-${idx}`;
            return `
                <div class="card-uniform p-1.5 px-2.5" style="min-height: 44px;">
                    <span class="card-rank text-muted" style="width: 24px;">#${idx + 1}</span>
                    <img id="${imgId}" src="${cover}" class="rounded-circle flex-shrink-0" style="width: 34px; height: 34px; object-fit: cover;" onerror="safeAvatarError(this)">
                    <div class="overflow-hidden flex-grow-1 cursor-pointer" onclick="showItemStats('artist', '${safeName}', '')" title="Ver estadísticas">
                        <div class="fw-bold text-white text-truncate" style="font-size: 0.78rem;">${a.name}</div>
                        <small class="text-secondary" style="font-size: 0.68rem;">${formatNumber(a.effectivePlays)} reproducciones totales</small>
                    </div>
                    <span class="badge border border-warning border-opacity-30 text-warning px-2 py-1 flex-shrink-0" style="background: rgba(234, 179, 8, 0.12); font-size: 0.7rem;">
                        +${formatNumber(milestone)}
                    </span>
                    <button type="button" class="btn btn-sm btn-outline-secondary border-0 text-warning px-2 py-1 flex-shrink-0" onclick="showArtistMilestoneCelebration({ name: '${safeName}', milestone: ${milestone}, totalPlays: ${a.effectivePlays} })" title="Revivir celebración con confeti" style="font-size: 0.75rem;">
                        <i class="fa-solid fa-wand-magic-sparkles"></i>
                    </button>
                </div>
            `;
        }).join('');

        achieved.slice(0, 30).forEach((a, idx) => {
            const artKey = `artist::${normalizeKey(a.name)}::`;
            if (!artCache[artKey]) {
                resolveSpotifyArtwork(a.name, '', 'artist', `achieved-art-img-${idx}`);
            }
        });
    }
}

async function renderTrophiesBadgesTab(db) {
    const container = document.getElementById('badges-container');
    if (!container) return;

    container.innerHTML = '<div class="text-center py-4 text-secondary col-12"><span class="spinner-border spinner-border-sm text-info me-2"></span>Calculando tus medallas...</div>';

    const insights = await loadInsightsData();
    const rec = insights?.records || {};
    const habits = insights?.habits || {};

    const allArtists = Object.values(db.artistsLookup || {});
    const allTracks = Object.values(db.tracksLookup || {});

    const totalDistinctArtists = allArtists.length;
    const totalDistinctTracks = allTracks.length;
    const topArtistPlays = allArtists.length > 0 ? Math.max(...allArtists.map(a => a.plays || 0)) : 0;
    const topTrackPlays = allTracks.length > 0 ? Math.max(...allTracks.map(t => t.plays || 0)) : 0;
    const artistsOver100Count = allArtists.filter(a => (a.plays || 0) >= 100).length;
    const topDayCount = rec.topDay?.count || 0;
    const activeDays = rec.totalDaysActive || 0;

    const hoursMap = habits.hours || {};
    const totalHourStreams = Object.values(hoursMap).reduce((a, b) => a + b, 0) || 1;
    const nightStreams = [0, 1, 2, 3, 4, 5].reduce((sum, h) => sum + (hoursMap[String(h)] || 0), 0);
    const nightPct = Math.round((nightStreams / totalHourStreams) * 100);

    const morningStreams = [6, 7, 8, 9, 10].reduce((sum, h) => sum + (hoursMap[String(h)] || 0), 0);
    const morningPct = Math.round((morningStreams / totalHourStreams) * 100);

    const has2019or2020 = Boolean(db.yearlyTops?.['2019'] || db.yearlyTops?.['2020']);

    const bestStreakNow = getStreakInfo().best;
    const streakBadges = STREAK_MEDALS.map(n => ({
        icon: 'fa-solid fa-fire text-danger',
        title: `Racha de ${n} días`,
        desc: `Mantén ${n} días seguidos con actividad en la app`,
        achieved: bestStreakNow >= n,
        progress: `${Math.min(bestStreakNow, n)} / ${n} días`,
        pct: Math.min(100, Math.round((bestStreakNow / n) * 100))
    }));

    const badges = [
        {
            icon: 'fa-solid fa-moon text-info',
            title: 'Búho Nocturno',
            desc: 'Más del 15% de tus escuchas son de madrugada (12am a 6am)',
            achieved: nightPct >= 15,
            progress: `${nightPct}% / 15%`,
            pct: Math.min(100, Math.round((nightPct / 15) * 100))
        },
        {
            icon: 'fa-solid fa-sun text-warning',
            title: 'Madrugador Sonoro',
            desc: 'Más del 15% de tus escuchas ocurren en la mañana (6am a 11am)',
            achieved: morningPct >= 15,
            progress: `${morningPct}% / 15%`,
            pct: Math.min(100, Math.round((morningPct / 15) * 100))
        },
        {
            icon: 'fa-solid fa-crown text-warning',
            title: 'Devoción Absoluta',
            desc: 'Superar 1,000 reproducciones con un mismo artista',
            achieved: topArtistPlays >= 1000,
            progress: `${formatNumber(topArtistPlays)} / 1,000`,
            pct: Math.min(100, Math.round((topArtistPlays / 1000) * 100))
        },
        {
            icon: 'fa-solid fa-certificate text-success',
            title: 'Club Centenario',
            desc: 'Tener al menos 10 artistas con +100 reproducciones',
            achieved: artistsOver100Count >= 10,
            progress: `${artistsOver100Count} / 10 artistas`,
            pct: Math.min(100, Math.round((artistsOver100Count / 10) * 100))
        },
        {
            icon: 'fa-solid fa-compass text-primary',
            title: 'Arqueólogo Musical',
            desc: 'Tener música y escuchas registradas desde 2019 o 2020',
            achieved: has2019or2020,
            progress: has2019or2020 ? 'Registros de 2019/2020' : 'Solo reciente',
            pct: has2019or2020 ? 100 : 25
        },
        {
            icon: 'fa-solid fa-person-running text-danger',
            title: 'Maratonista Sonoro',
            desc: 'Escuchar más de 100 canciones en un solo día',
            achieved: topDayCount >= 100,
            progress: `${topDayCount} / 100 canciones`,
            pct: Math.min(100, Math.round((topDayCount / 100) * 100))
        },
        {
            icon: 'fa-solid fa-compass-drafting text-info',
            title: 'Explorador Compulsivo',
            desc: 'Haber descubierto más de 500 artistas distintos',
            achieved: totalDistinctArtists >= 500,
            progress: `${formatNumber(totalDistinctArtists)} / 500 artistas`,
            pct: Math.min(100, Math.round((totalDistinctArtists / 500) * 100))
        },
        {
            icon: 'fa-solid fa-compact-disc text-warning',
            title: 'Gran Fonoteca',
            desc: 'Más de 1,000 canciones únicas escuchadas',
            achieved: totalDistinctTracks >= 1000,
            progress: `${formatNumber(totalDistinctTracks)} / 1,000 temas`,
            pct: Math.min(100, Math.round((totalDistinctTracks / 1000) * 100))
        },
        {
            icon: 'fa-solid fa-repeat text-primary',
            title: 'Adicto al Bucle',
            desc: 'Repetir una misma canción más de 100 veces',
            achieved: topTrackPlays >= 100,
            progress: `${formatNumber(topTrackPlays)} / 100 reps`,
            pct: Math.min(100, Math.round((topTrackPlays / 100) * 100))
        },
        {
            icon: 'fa-solid fa-bolt text-warning',
            title: 'Racha Legendaria',
            desc: 'Superar los 500 días con música activa en tu historia',
            achieved: activeDays >= 500,
            progress: `${formatNumber(activeDays)} / 500 días`,
            pct: Math.min(100, Math.round((activeDays / 500) * 100))
        }
    ];

    container.innerHTML = [...badges, ...streakBadges].map(b => `
        <div class="col-12 col-sm-6">
            <div class="p-2.5 rounded-3 border h-100 d-flex flex-column justify-content-between" style="background: ${b.achieved ? 'rgba(168, 85, 247, 0.08)' : 'rgba(255, 255, 255, 0.02)'}; border-color: ${b.achieved ? 'rgba(168, 85, 247, 0.35)' : 'rgba(255, 255, 255, 0.06)'} !important;">
                <div>
                    <div class="d-flex align-items-center justify-content-between mb-1.5">
                        <div class="d-flex align-items-center gap-2">
                            <i class="${b.icon} fs-5"></i>
                            <span class="fw-bold text-white" style="font-size: 0.82rem;">${b.title}</span>
                        </div>
                        <span class="badge ${b.achieved ? 'bg-success text-white' : 'bg-secondary bg-opacity-25 text-secondary'}" style="font-size: 0.64rem;">
                            ${b.achieved ? '✓ Desbloqueado' : 'En progreso'}
                        </span>
                    </div>
                    <p class="text-secondary mb-2" style="font-size: 0.72rem; line-height: 1.3;">${b.desc}</p>
                </div>
                <div>
                    <div class="progress mb-1" style="height: 5px; background: rgba(255,255,255,0.06); border-radius: 3px;">
                        <div class="progress-bar ${b.achieved ? 'bg-success' : 'bg-primary'}" style="width: ${b.pct}%;"></div>
                    </div>
                    <div class="d-flex justify-content-between text-muted" style="font-size: 0.65rem;">
                        <span>Progreso:</span>
                        <span class="${b.achieved ? 'text-success fw-semibold' : 'text-white'}">${b.progress}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// ----------------------------------------------------
// CURADOR DE PLAYLISTS SEMESTRALES
// ----------------------------------------------------
let curatorSelectedTracks = [];
let curatorBenchTracks = [];
let curatorCurrentCycleInfo = {
    year: '',
    half: '',
    periodStr: 'Sin periodo seleccionado',
    cycleStart: ''
};

async function openPlaylistCurator() {
    switchAppView('curator');
}
async function initCuratorSectionIfNeeded() {
    if (!window._curatorInitialized) {
        window._curatorInitialized = true;
        initCuratorEvents();
    }
    if (curatorPlaylistName && !curatorPlaylistName.value) {
        const cached = localStorage.getItem('curator_playlist_name');
        if (cached) {
            curatorPlaylistName.value = cached;
        } else {
            updateCuratorDefaultNameSuggestion();
        }
    }
    const year = curatorYear?.value || '';
    const half = curatorHalf?.value || '';
    if (!year || !half) {
        curatorCurrentCycleInfo = {
            year: '',
            half: '',
            periodStr: 'Sin periodo seleccionado',
            cycleStart: ''
        };
        curatorSelectedTracks = [];
        curatorBenchTracks = [];
        renderCuratorView();
    }
}
window.openPlaylistCurator = openPlaylistCurator;
window.openPlaylistCuratorModal = openPlaylistCurator;

function updateCuratorDefaultNameSuggestion() {
    if (!curatorPlaylistName) return;
    const currentVal = (curatorPlaylistName.value || '').trim();
    const year = curatorYear?.value || '';
    const half = curatorHalf?.value || '';
    if (year && half) {
        const suggestion = `Top ${year} - ${half === '1' ? '1ra Mitad' : '2da Mitad'}`;
        if (!currentVal || currentVal.startsWith('Top 20') || currentVal === 'Mi Tracklist') {
            curatorPlaylistName.value = suggestion;
            localStorage.setItem('curator_playlist_name', suggestion);
        }
    }
}

function initCuratorEvents() {
    if (curatorPlaylistName) {
        const cached = localStorage.getItem('curator_playlist_name');
        if (cached && !curatorPlaylistName.value) {
            curatorPlaylistName.value = cached;
        }
        curatorPlaylistName.addEventListener('input', () => {
            localStorage.setItem('curator_playlist_name', curatorPlaylistName.value.trim());
        });
    }
    if (curatorBtnSaveCloud) {
        curatorBtnSaveCloud.addEventListener('click', () => promptAndSaveCuratorToCloud());
    }
    if (curatorBtnGenerate) {
        curatorBtnGenerate.addEventListener('click', generateCuratorSelection);
    }
    if (curatorYear) {
        curatorYear.addEventListener('change', () => {
            updateCuratorDefaultNameSuggestion();
            const shouldAutoSelect = curatorSelectedTracks.length > 0;
            loadCuratorCandidates(shouldAutoSelect);
        });
    }
    if (curatorHalf) {
        curatorHalf.addEventListener('change', () => {
            updateCuratorDefaultNameSuggestion();
            const shouldAutoSelect = curatorSelectedTracks.length > 0;
            loadCuratorCandidates(shouldAutoSelect);
        });
    }
    if (curatorExcludePast) {
        curatorExcludePast.addEventListener('change', () => {
            const shouldAutoSelect = curatorSelectedTracks.length > 0;
            loadCuratorCandidates(shouldAutoSelect);
        });
    }
    if (curatorTargetCount) {
        curatorTargetCount.addEventListener('change', () => {
            const newTarget = parseInt(curatorTargetCount.value, 10) || 18;
            if (newTarget < 5) curatorTargetCount.value = 5;
            if (newTarget > 50) curatorTargetCount.value = 50;
            renderCuratorView();
        });
    }

    if (curatorTabSelected && curatorTabBench) {
        curatorTabSelected.addEventListener('click', () => {
            curatorTabSelected.classList.add('active');
            curatorTabBench.classList.remove('active');
            if (curatorSelectedView) curatorSelectedView.classList.remove('d-none');
            if (curatorBenchView) curatorBenchView.classList.add('d-none');
        });
        curatorTabBench.addEventListener('click', () => {
            curatorTabBench.classList.add('active');
            curatorTabSelected.classList.remove('active');
            if (curatorBenchView) curatorBenchView.classList.remove('d-none');
            if (curatorSelectedView) curatorSelectedView.classList.add('d-none');
        });
    }

    if (curatorBenchSearch) {
        curatorBenchSearch.addEventListener('input', () => {
            renderCuratorBenchList();
        });
    }

    if (curatorBtnCopy) {
        curatorBtnCopy.addEventListener('click', copyCuratorPlaylistText);
    }
    if (curatorBtnClear) {
        curatorBtnClear.addEventListener('click', clearCuratorSelection);
    }
    if (curatorBtnYtMusic) {
        curatorBtnYtMusic.addEventListener('click', exportCuratorYouTubeMusic);
    }
    if (curatorBtnSpotify) {
        curatorBtnSpotify.addEventListener('click', createCuratorSpotifyPlaylist);
    }
}

function getCuratorStageMonths(targetYear, targetHalf) {
    const y = parseInt(targetYear, 10);
    if (targetHalf === '1') {
        return [
            `${y - 1}-11`,
            `${y - 1}-12`,
            `${y}-01`,
            `${y}-02`,
            `${y}-03`,
            `${y}-04`,
            `${y}-05`
        ];
    } else {
        return [
            `${y}-05`,
            `${y}-06`,
            `${y}-07`,
            `${y}-08`,
            `${y}-09`,
            `${y}-10`,
            `${y}-11`
        ];
    }
}

function getCuratorTrackStagePlays(track, targetYear, targetHalf) {
    if (!track || !track.months) return 0;
    const mList = getCuratorStageMonths(targetYear, targetHalf);
    let count = 0;
    for (const m of mList) {
        if (track.months[m]) count += track.months[m];
    }
    return count;
}

function getCuratorTrackPriorStageMax(t, currentYearNum, currentHalf) {
    let maxPlays = 0;
    for (let y = 2018; y <= currentYearNum; y++) {
        for (const h of ['1', '2']) {
            if (y === currentYearNum && h === currentHalf) {
                return maxPlays;
            }
            const stagePlays = getCuratorTrackStagePlays(t, y, h);
            if (stagePlays > maxPlays) {
                maxPlays = stagePlays;
            }
        }
    }
    return maxPlays;
}

async function loadCuratorCandidates(autoSelect = true) {
    const year = curatorYear?.value || '';
    const half = curatorHalf?.value || '';

    if (!year || !half) {
        curatorCurrentCycleInfo = {
            year: '',
            half: '',
            periodStr: 'Sin periodo seleccionado',
            cycleStart: ''
        };
        curatorSelectedTracks = [];
        curatorBenchTracks = [];
        renderCuratorView();
        return;
    }

    const activeDb = await getActiveDatabase();
    if (!activeDb || !activeDb.tracksLookup) return;

    if (curatorSelectedList && autoSelect) {
        curatorSelectedList.innerHTML = '<div class="text-center text-secondary py-4"><i class="fa-solid fa-spinner fa-spin me-2"></i>Calculando candidatos de este periodo...</div>';
    }

    const targetCount = parseInt(curatorTargetCount?.value, 10) || 18;
    const excludePast = curatorExcludePast ? curatorExcludePast.checked : true;

    const yNum = parseInt(year, 10);
    const months = getCuratorStageMonths(year, half);
    let cycleStart = '';
    let periodStr = '';

    if (half === '1') {
        cycleStart = `${yNum - 1}-11-01`;
        periodStr = `21 Nov ${yNum - 1} — 20 May ${year}`;
    } else {
        cycleStart = `${year}-05-01`;
        periodStr = `21 May ${year} — 20 Nov ${year}`;
    }

    curatorCurrentCycleInfo = {
        year,
        half,
        periodStr,
        cycleStart
    };

    // Recorrer catálogo
    const allCandidates = [];
    const tracksArray = Object.values(activeDb.tracksLookup);

    // Integración de escuchas delta en tiempo real de Last.fm si aplica
    const deltaMap = new Map();
    if (currentSource === 'unified' && year === '2026' && half === '2' && lastFmRecentDelta.length > 0) {
        lastFmRecentDelta.forEach(t => {
            const k = `${normalizeKey(t.name)}:::${normalizeKey(t.artist ? (t.artist['#text'] || t.artist.name || '') : '')}`;
            deltaMap.set(k, (deltaMap.get(k) || 0) + 1);
        });
    }

    for (const t of tracksArray) {
        let periodPlays = 0;
        for (const m of months) {
            if (t.months && t.months[m]) {
                periodPlays += t.months[m];
            }
        }

        const trackKey = `${normalizeKey(t.name)}:::${normalizeKey(t.artist || '')}`;
        if (deltaMap.has(trackKey)) {
            periodPlays += deltaMap.get(trackKey);
        }

        if (periodPlays > 0) {
            const firstDate = t.first || '';
            const isPastDiscovered = Boolean(firstDate && firstDate < cycleStart);

            let isTrulyPastYear = false;
            let isSurgeOrPeak = false;
            let priorMax = 0;

            if (isPastDiscovered) {
                priorMax = getCuratorTrackPriorStageMax(t, yNum, half);

                // Criterio de picos de escuchas:
                // Solo se considera pico si alcanzó su récord en su respectiva etapa semestral actual
                if (periodPlays >= priorMax) {
                    isSurgeOrPeak = true;
                } else {
                    isTrulyPastYear = true;
                }
            }

            allCandidates.push({
                name: t.name,
                artist: t.artist,
                album: t.album,
                uri: t.uri,
                plays: periodPlays,
                first: t.first,
                isPastYear: isTrulyPastYear,
                isSurgeOrPeak,
                priorMax
            });
        }
    }

    allCandidates.sort((a, b) => b.plays - a.plays);

    curatorSelectedTracks = [];
    curatorBenchTracks = [];

    if (autoSelect) {
        for (const item of allCandidates) {
            if (excludePast && item.isPastYear) {
                curatorBenchTracks.push(item);
            } else {
                if (curatorSelectedTracks.length < targetCount) {
                    curatorSelectedTracks.push(item);
                } else {
                    curatorBenchTracks.push(item);
                }
            }
        }
    } else {
        curatorBenchTracks = allCandidates;
    }

    renderCuratorView();
}

async function generateCuratorSelection() {
    const year = curatorYear?.value || '';
    const half = curatorHalf?.value || '';
    if (!year || !half) {
        alert('Por favor selecciona primero un año y un periodo (1ra o 2da mitad) en los selectores superiores.');
        return;
    }
    await loadCuratorCandidates(true);
    triggerGoogleDriveAutoSync();
}

// ====================================================
// HACEDOR DE TRACKLIST / CURADOR: DRAG & DROP & SELECCIÓN
// ====================================================

let draggedCuratorTrack = null;
let curatorBenchSelectedKeys = new Set();

window.onTracklistDragStart = function(event, index) {
    draggedCuratorTrack = { source: 'tracklist', index: index, data: curatorSelectedTracks[index] };
    event.dataTransfer.effectAllowed = 'move';
    try {
        event.dataTransfer.setData('text/plain', JSON.stringify(draggedCuratorTrack));
    } catch (e) {}
    event.currentTarget.classList.add('curator-dragging');
};

window.onTracklistDragOver = function(event, index) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const targetEl = event.currentTarget;
    const rect = targetEl.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    if (event.clientY < midY) {
        targetEl.classList.add('drag-over-top');
        targetEl.classList.remove('drag-over-bottom');
    } else {
        targetEl.classList.add('drag-over-bottom');
        targetEl.classList.remove('drag-over-top');
    }
};

window.onTracklistDragLeave = function(event, index) {
    event.currentTarget.classList.remove('drag-over-top', 'drag-over-bottom');
};

window.onTracklistDrop = function(event, targetIndex) {
    event.preventDefault();
    const targetEl = event.currentTarget;
    const isAbove = targetEl.classList.contains('drag-over-top');
    targetEl.classList.remove('drag-over-top', 'drag-over-bottom');

    let dropIndex = isAbove ? targetIndex : targetIndex + 1;

    let payload = draggedCuratorTrack;
    if (!payload) {
        try {
            const raw = event.dataTransfer.getData('text/plain');
            if (raw) payload = JSON.parse(raw);
        } catch (e) {}
    }

    if (!payload) return;

    if (payload.source === 'tracklist') {
        const fromIdx = payload.index;
        if (fromIdx === targetIndex) return;
        const [moved] = curatorSelectedTracks.splice(fromIdx, 1);
        if (fromIdx < dropIndex) dropIndex--;
        if (dropIndex < 0) dropIndex = 0;
        if (dropIndex > curatorSelectedTracks.length) dropIndex = curatorSelectedTracks.length;
        curatorSelectedTracks.splice(dropIndex, 0, moved);
        renderCuratorSelectedList();
        triggerGoogleDriveAutoSync();
    } else if (payload.source === 'bench') {
        const name = payload.data?.name || payload.name;
        const artist = payload.data?.artist || payload.artist;
        let trackObj = null;

        const bIdx = curatorBenchTracks.findIndex(t => t.name === name && t.artist === artist);
        if (bIdx !== -1) {
            [trackObj] = curatorBenchTracks.splice(bIdx, 1);
        } else if (payload.data) {
            trackObj = payload.data;
        }

        if (trackObj) {
            if (dropIndex > curatorSelectedTracks.length) dropIndex = curatorSelectedTracks.length;
            curatorSelectedTracks.splice(dropIndex, 0, trackObj);
            renderCuratorView();
            triggerGoogleDriveAutoSync();
        }
    }
    draggedCuratorTrack = null;
};

window.onTracklistDragEnd = function(event) {
    if (event.currentTarget) event.currentTarget.classList.remove('curator-dragging');
    document.querySelectorAll('.curator-track-item').forEach(el => {
        el.classList.remove('drag-over-top', 'drag-over-bottom', 'curator-dragging');
    });
    draggedCuratorTrack = null;
};

window.onBenchTrackDragStart = function(event, benchIndex, encName, encArtist) {
    const name = decodeURIComponent(encName);
    const artist = decodeURIComponent(encArtist);
    const benchItem = curatorBenchTracks.find(t => t.name === name && t.artist === artist) || { name, artist };
    draggedCuratorTrack = { source: 'bench', index: benchIndex, name, artist, data: benchItem };
    event.dataTransfer.effectAllowed = 'copyMove';
    try {
        event.dataTransfer.setData('text/plain', JSON.stringify(draggedCuratorTrack));
    } catch (e) {}
    event.currentTarget.classList.add('curator-dragging');
};

window.onTracklistContainerDragOver = function(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    const container = document.getElementById('curator-selected-list');
    if (container) container.classList.add('curator-container-dropzone-active');
};

window.onTracklistContainerDragLeave = function(event) {
    const container = document.getElementById('curator-selected-list');
    if (container && !container.contains(event.relatedTarget)) {
        container.classList.remove('curator-container-dropzone-active');
    }
};

window.onTracklistContainerDrop = function(event) {
    event.preventDefault();
    const container = document.getElementById('curator-selected-list');
    if (container) container.classList.remove('curator-container-dropzone-active');

    if (event.target.closest('.curator-track-item')) return;

    let payload = draggedCuratorTrack;
    if (!payload) {
        try {
            const raw = event.dataTransfer.getData('text/plain');
            if (raw) payload = JSON.parse(raw);
        } catch (e) {}
    }

    if (!payload) return;

    if (payload.source === 'bench') {
        const name = payload.data?.name || payload.name;
        const artist = payload.data?.artist || payload.artist;
        let trackObj = null;

        const bIdx = curatorBenchTracks.findIndex(t => t.name === name && t.artist === artist);
        if (bIdx !== -1) {
            [trackObj] = curatorBenchTracks.splice(bIdx, 1);
        } else if (payload.data) {
            trackObj = payload.data;
        }

        if (trackObj) {
            curatorSelectedTracks.push(trackObj);
            renderCuratorView();
            triggerGoogleDriveAutoSync();
        }
    } else if (payload.source === 'tracklist') {
        const fromIdx = payload.index;
        if (fromIdx !== undefined && fromIdx < curatorSelectedTracks.length - 1) {
            const [moved] = curatorSelectedTracks.splice(fromIdx, 1);
            curatorSelectedTracks.push(moved);
            renderCuratorSelectedList();
            triggerGoogleDriveAutoSync();
        }
    }
    draggedCuratorTrack = null;
};

// Selección Múltiple
window.toggleBenchItemSelect = function(event, encName, encArtist) {
    event.stopPropagation();
    const name = decodeURIComponent(encName);
    const artist = decodeURIComponent(encArtist);
    const key = `${normalizeKey(name)}:::${normalizeKey(artist)}`;
    if (event.target.checked) {
        curatorBenchSelectedKeys.add(key);
    } else {
        curatorBenchSelectedKeys.delete(key);
    }
    updateCuratorBulkBar();
};

window.toggleSelectAllBenchVisible = function(event) {
    const isChecked = event.target.checked;
    const checkboxes = document.querySelectorAll('.curator-bench-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = isChecked;
        const key = cb.getAttribute('data-track-key');
        if (key) {
            if (isChecked) curatorBenchSelectedKeys.add(key);
            else curatorBenchSelectedKeys.delete(key);
        }
    });
    updateCuratorBulkBar();
};

window.clearBenchSelection = function() {
    curatorBenchSelectedKeys.clear();
    const selectAllCb = document.getElementById('curator-select-all-bench');
    if (selectAllCb) selectAllCb.checked = false;
    document.querySelectorAll('.curator-bench-checkbox').forEach(cb => cb.checked = false);
    updateCuratorBulkBar();
};

window.addSelectedBenchTracks = function() {
    if (curatorBenchSelectedKeys.size === 0) return;
    const countToAdd = curatorBenchSelectedKeys.size;

    const remainingBench = [];
    const activeDb = currentSource === 'unified' ? unifiedDb : spotifyDb;

    for (const t of curatorBenchTracks) {
        const k = `${normalizeKey(t.name)}:::${normalizeKey(t.artist)}`;
        if (curatorBenchSelectedKeys.has(k)) {
            curatorSelectedTracks.push(t);
            curatorBenchSelectedKeys.delete(k);
        } else {
            remainingBench.push(t);
        }
    }
    curatorBenchTracks = remainingBench;

    if (curatorBenchSelectedKeys.size > 0 && activeDb && activeDb.tracksLookup) {
        for (const k of curatorBenchSelectedKeys) {
            const t = activeDb.tracksLookup[k];
            if (t) {
                curatorSelectedTracks.push({
                    name: t.name,
                    artist: t.artist,
                    album: t.album,
                    uri: t.uri,
                    plays: t.plays || 0,
                    first: t.first,
                    isPastYear: true,
                    isSurgeOrPeak: false
                });
            }
        }
    }

    curatorBenchSelectedKeys.clear();
    const selectAllCb = document.getElementById('curator-select-all-bench');
    if (selectAllCb) selectAllCb.checked = false;

    renderCuratorView();
    triggerGoogleDriveAutoSync();

    if (typeof showEngagementToast === 'function') {
        showEngagementToast('<i class="fa-solid fa-list-check text-brand"></i>', 'Tracklist Actualizado', `Se añadieron ${countToAdd} canciones al tracklist.`);
    }
};

function updateCuratorBulkBar() {
    const bulkBar = document.getElementById('curator-bulk-bar');
    const bulkCount = document.getElementById('curator-bulk-count');
    const bulkBtn = document.getElementById('curator-bulk-add-btn');
    const size = curatorBenchSelectedKeys.size;
    if (!bulkBar) return;

    if (size > 0) {
        bulkBar.classList.remove('d-none');
        if (bulkCount) bulkCount.textContent = `${size} seleccionada${size === 1 ? '' : 's'}`;
        if (bulkBtn) bulkBtn.innerHTML = `<i class="fa-solid fa-plus me-1"></i> Añadir (${size})`;
    } else {
        bulkBar.classList.add('d-none');
    }
}

// Mezcla / Shuffle de Tracklist
window.shuffleCuratorTracklist = function() {
    if (curatorSelectedTracks.length <= 1) return;
    for (let i = curatorSelectedTracks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [curatorSelectedTracks[i], curatorSelectedTracks[j]] = [curatorSelectedTracks[j], curatorSelectedTracks[i]];
    }
    renderCuratorSelectedList();
    triggerGoogleDriveAutoSync();
    if (typeof showEngagementToast === 'function') {
        showEngagementToast('<i class="fa-solid fa-shuffle text-primary"></i>', 'Tracklist Mezclado', 'Se reordenó aleatoriamente el tracklist.');
    }
};

function renderCuratorView() {
    if (curatorPeriodBadge) {
        curatorPeriodBadge.innerHTML = `<i class="fa-regular fa-clock me-1"></i> ${curatorCurrentCycleInfo.periodStr}`;
    }

    const targetCount = parseInt(curatorTargetCount?.value, 10) || 18;
    const selectedCount = curatorSelectedTracks.length;

    if (curatorCounterBadge) {
        curatorCounterBadge.textContent = `${selectedCount} / ${targetCount} en tracklist`;
        if (selectedCount === targetCount) {
            curatorCounterBadge.style.color = '#4ade80';
            curatorCounterBadge.style.background = 'rgba(34, 197, 94, 0.14)';
            curatorCounterBadge.style.borderColor = 'rgba(34, 197, 94, 0.35)';
        } else if (selectedCount < targetCount) {
            curatorCounterBadge.style.color = '#fde047';
            curatorCounterBadge.style.background = 'rgba(234, 179, 8, 0.14)';
            curatorCounterBadge.style.borderColor = 'rgba(234, 179, 8, 0.35)';
        } else {
            curatorCounterBadge.style.color = '#38bdf8';
            curatorCounterBadge.style.background = 'rgba(56, 189, 248, 0.14)';
            curatorCounterBadge.style.borderColor = 'rgba(56, 189, 248, 0.35)';
        }
    }

    if (curatorSelectedNum) curatorSelectedNum.textContent = selectedCount;
    if (curatorBenchNum) curatorBenchNum.textContent = curatorBenchTracks.length;
    const benchBadge = document.getElementById('curator-bench-count-badge');
    if (benchBadge) benchBadge.textContent = curatorBenchTracks.length;

    renderCuratorSelectedList();
    renderCuratorBenchList();
}

window.changeCuratorTrackPosition = function(fromIndex, newPosVal) {
    let targetPos = parseInt(newPosVal, 10);
    const max = curatorSelectedTracks.length;
    if (isNaN(targetPos)) {
        renderCuratorSelectedList();
        return;
    }
    if (targetPos < 1) targetPos = 1;
    if (targetPos > max) targetPos = max;

    const toIndex = targetPos - 1;
    if (toIndex === fromIndex) {
        renderCuratorSelectedList();
        return;
    }

    const [moved] = curatorSelectedTracks.splice(fromIndex, 1);
    curatorSelectedTracks.splice(toIndex, 0, moved);
    renderCuratorSelectedList();
    triggerGoogleDriveAutoSync();
};

function renderCuratorSelectedList() {
    if (!curatorSelectedList) return;

    if (!curatorCurrentCycleInfo.year || !curatorCurrentCycleInfo.half) {
        curatorSelectedList.innerHTML = `
            <div class="text-center py-5 text-secondary">
                <i class="fa-regular fa-calendar-check fs-2 mb-2 text-primary opacity-50"></i>
                <div class="fw-semibold text-white mb-1">Sin periodo seleccionado</div>
                <div class="small text-muted" style="max-width: 360px; margin: 0 auto; font-size: 0.76rem;">
                    Elige un año y un periodo (1ra o 2da mitad) en los selectores superiores para comenzar.
                </div>
            </div>
        `;
        return;
    }

    if (curatorSelectedTracks.length === 0) {
        curatorSelectedList.innerHTML = `
            <div class="curator-dropzone-empty p-4 text-center rounded-3 border border-dashed border-secondary border-opacity-30"
                 ondragover="onTracklistContainerDragOver(event)"
                 ondrop="onTracklistContainerDrop(event)">
                <div class="rounded-circle p-3 d-inline-flex align-items-center justify-content-center mb-2" style="background: rgba(168,85,247,0.12); color: #c084fc;">
                    <i class="fa-solid fa-compact-disc fs-3"></i>
                </div>
                <div class="fw-bold text-white mb-1" style="font-size: 0.90rem;">Tu tracklist está vacío</div>
                <div class="small text-muted mb-3" style="max-width: 360px; margin: 0 auto; font-size: 0.74rem;">
                    Arrastra canciones aquí desde el banco, marca casillas para añadir en bloque, o presiona <b>"Generar Selección"</b> para autocompletar con los temas más escuchados.
                </div>
                <button type="button" class="btn btn-sm btn-brand rounded-pill px-3 py-1 fw-semibold" onclick="generateCuratorSelection()" style="font-size: 0.76rem;">
                    <i class="fa-solid fa-rotate me-1"></i> Generar Selección Automática
                </button>
            </div>
        `;
        return;
    }

    const totalTracks = curatorSelectedTracks.length;
    let html = '';
    curatorSelectedTracks.forEach((t, i) => {
        const trackName = t.name || t.track || t.title || 'Sin título';
        const trackArtist = t.artist || t.artistName || 'Artista desconocido';
        const artKey = `track::${normalizeKey(trackName)}::${normalizeKey(trackArtist)}`;
        const coverImg = artCache[artKey] || FALLBACK_ART_SVG;
        const imgId = `curator-art-sel-${i}`;

        html += `
            <div class="curator-track-item"
                 draggable="true"
                 data-index="${i}"
                 ondragstart="onTracklistDragStart(event, ${i})"
                 ondragover="onTracklistDragOver(event, ${i})"
                 ondragleave="onTracklistDragLeave(event, ${i})"
                 ondrop="onTracklistDrop(event, ${i})"
                 ondragend="onTracklistDragEnd(event)">
                <img id="${imgId}" src="${coverImg}" class="rounded flex-shrink-0" style="width: 38px; height: 38px; object-fit: cover;" onerror="safeImgError(this)" alt="Cover">
                <div class="curator-track-info">
                    <div class="curator-track-title" title="${trackName}">${trackName}</div>
                    <div class="d-flex align-items-center gap-1.5 flex-wrap">
                        <span class="curator-track-artist" title="${trackArtist}">${trackArtist}</span>
                        ${t.isSurgeOrPeak ? `<span class="curator-badge-peak" title="Pico de escuchas en esta etapa (${t.plays} plays vs récord previo de ${t.priorMax || 0})"><i class="fa-solid fa-arrow-trend-up"></i> Pico</span>` : (t.isPastYear ? '<span class="curator-badge-past">Año Pasado</span>' : '')}
                    </div>
                </div>
                <div class="d-flex align-items-center gap-1.5 flex-shrink-0 ms-auto">
                    <span class="curator-badge-plays" title="${t.plays} reproducciones">
                        ${t.plays}
                    </span>
                    <input type="number"
                           class="curator-pos-input"
                           value="${i + 1}"
                           min="1"
                           max="${totalTracks}"
                           onchange="changeCuratorTrackPosition(${i}, this.value)"
                           onkeydown="if(event.key==='Enter'){this.blur();}"
                           title="Posición en tracklist (cambia el número para reordenar)">
                    <button type="button" class="curator-action-btn text-danger p-1" onclick="removeCuratorTrack(${i})" title="Quitar de mi tracklist">
                        <i class="fa-solid fa-xmark" style="font-size: 0.85rem;"></i>
                    </button>
                </div>
            </div>
        `;

        if (!artCache[artKey]) {
            resolveSpotifyArtwork(trackName, trackArtist, 'track', imgId);
        }
    });

    curatorSelectedList.innerHTML = html;
}

function renderCuratorBenchList() {
    if (!curatorBenchList) return;

    if (!curatorCurrentCycleInfo.year || !curatorCurrentCycleInfo.half) {
        curatorBenchList.innerHTML = `
            <div class="text-center py-5 text-secondary">
                <i class="fa-solid fa-layer-group fs-2 mb-2 text-secondary opacity-40"></i>
                <div class="fw-semibold text-white mb-1">Banco en espera</div>
                <div class="small text-muted" style="max-width: 300px; margin: 0 auto; font-size: 0.74rem;">
                    Selecciona un año y un periodo arriba para cargar los candidatos de la banca.
                </div>
            </div>
        `;
        return;
    }

    const query = (curatorBenchSearch?.value || '').trim().toLowerCase();
    let filtered = curatorBenchTracks;

    if (query) {
        const benchMatches = curatorBenchTracks.filter(t =>
            (t.name || '').toLowerCase().includes(query) ||
            (t.artist || '').toLowerCase().includes(query) ||
            (t.album || '').toLowerCase().includes(query)
        );

        const existingKeys = new Set(curatorSelectedTracks.map(t => `${normalizeKey(t.name)}:::${normalizeKey(t.artist)}`));
        benchMatches.forEach(t => existingKeys.add(`${normalizeKey(t.name)}:::${normalizeKey(t.artist)}`));

        const catalogMatches = [];
        const activeDb = currentSource === 'unified' ? unifiedDb : spotifyDb;
        if (activeDb && activeDb.tracksLookup) {
            for (const t of Object.values(activeDb.tracksLookup)) {
                const k = `${normalizeKey(t.name)}:::${normalizeKey(t.artist)}`;
                if (existingKeys.has(k)) continue;
                if ((t.name || '').toLowerCase().includes(query) ||
                    (t.artist || '').toLowerCase().includes(query) ||
                    (t.album || '').toLowerCase().includes(query)) {
                    catalogMatches.push({
                        name: t.name,
                        artist: t.artist,
                        album: t.album,
                        uri: t.uri,
                        plays: t.plays || 0,
                        first: t.first,
                        isPastYear: true,
                        isSurgeOrPeak: false,
                        fromFullCatalog: true
                    });
                }
            }
            catalogMatches.sort((a, b) => b.plays - a.plays);
        }

        filtered = [...benchMatches, ...catalogMatches];
    }

    const benchBadge = document.getElementById('curator-bench-count-badge');
    if (benchBadge) benchBadge.textContent = filtered.length;

    if (filtered.length === 0) {
        curatorBenchList.innerHTML = `
            <div class="text-center py-4 text-secondary">
                <i class="fa-solid fa-magnifying-glass fs-5 mb-1 opacity-50"></i>
                <div class="small">No se encontraron canciones en la banca o catálogo.</div>
            </div>
        `;
        updateCuratorBulkBar();
        return;
    }

    let html = '';
    filtered.slice(0, 100).forEach((t, i) => {
        const trackName = t.name || t.track || t.title || 'Sin título';
        const trackArtist = t.artist || t.artistName || 'Artista desconocido';
        const artKey = `track::${normalizeKey(trackName)}::${normalizeKey(trackArtist)}`;
        const coverImg = artCache[artKey] || FALLBACK_ART_SVG;
        const imgId = `curator-art-bench-${i}`;
        const trackKey = `${normalizeKey(trackName)}:::${normalizeKey(trackArtist)}`;
        const isChecked = curatorBenchSelectedKeys.has(trackKey);

        html += `
            <div class="curator-track-item">
                <input type="checkbox"
                       class="form-check-input curator-bench-checkbox flex-shrink-0"
                       data-track-key="${trackKey}"
                       ${isChecked ? 'checked' : ''}
                       onchange="toggleBenchItemSelect(event, '${encodeURIComponent(trackName)}', '${encodeURIComponent(trackArtist)}')"
                       style="cursor: pointer; width: 15px; height: 15px; margin: 0;">
                <img id="${imgId}" src="${coverImg}" class="rounded flex-shrink-0" style="width: 36px; height: 36px; object-fit: cover;" onerror="safeImgError(this)" alt="Cover">
                <div class="curator-track-info">
                    <div class="curator-track-title" title="${trackName}">${trackName}</div>
                    <div class="d-flex align-items-center gap-1 flex-wrap">
                        <span class="curator-track-artist" title="${trackArtist}">${trackArtist}</span>
                        ${t.fromFullCatalog ? '<span class="curator-badge-past" title="Canción de tu catálogo completo">Catálogo Total</span>' : (t.isSurgeOrPeak ? `<span class="curator-badge-peak" title="Pico de escuchas en esta etapa"><i class="fa-solid fa-arrow-trend-up"></i> Pico</span>` : (t.isPastYear ? `<span class="curator-badge-past">Año Pasado</span>` : ''))}
                    </div>
                </div>
                <div class="d-flex align-items-center gap-1.5 flex-shrink-0 ms-auto">
                    <span class="curator-badge-plays" title="${t.plays} reproducciones">
                        ${t.plays}
                    </span>
                    <button type="button" class="btn btn-sm btn-outline-brand rounded-circle p-0 d-flex align-items-center justify-content-center flex-shrink-0" style="width: 26px; height: 26px;" onclick="addCuratorTrackFromBench('${encodeURIComponent(trackName)}', '${encodeURIComponent(trackArtist)}')" title="Añadir a mi tracklist">
                        <i class="fa-solid fa-plus" style="font-size: 0.72rem;"></i>
                    </button>
                </div>
            </div>
        `;

        if (!artCache[artKey]) {
            resolveSpotifyArtwork(trackName, trackArtist, 'track', imgId);
        }
    });

    curatorBenchList.innerHTML = html;
    updateCuratorBulkBar();
}

window.moveCuratorTrack = function(index, direction) {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= curatorSelectedTracks.length) return;
    const tmp = curatorSelectedTracks[index];
    curatorSelectedTracks[index] = curatorSelectedTracks[targetIdx];
    curatorSelectedTracks[targetIdx] = tmp;
    renderCuratorSelectedList();
    triggerGoogleDriveAutoSync();
};

window.removeCuratorTrack = function(index) {
    if (index < 0 || index >= curatorSelectedTracks.length) return;
    const [removed] = curatorSelectedTracks.splice(index, 1);
    if (removed) {
        curatorBenchTracks.unshift(removed);
        curatorBenchTracks.sort((a, b) => b.plays - a.plays);
    }
    renderCuratorView();
    triggerGoogleDriveAutoSync();
};

window.addCuratorTrackFromBench = function(encName, encArtist) {
    const name = decodeURIComponent(encName);
    const artist = decodeURIComponent(encArtist);
    const idx = curatorBenchTracks.findIndex(t => t.name === name && t.artist === artist);
    if (idx !== -1) {
        const [item] = curatorBenchTracks.splice(idx, 1);
        curatorSelectedTracks.push(item);
        renderCuratorView();
        triggerGoogleDriveAutoSync();
    } else {
        const activeDb = currentSource === 'unified' ? unifiedDb : spotifyDb;
        if (activeDb && activeDb.tracksLookup) {
            const key = `${normalizeKey(name)}:::${normalizeKey(artist)}`;
            const t = activeDb.tracksLookup[key];
            if (t) {
                curatorSelectedTracks.push({
                    name: t.name,
                    artist: t.artist,
                    album: t.album,
                    uri: t.uri,
                    plays: t.plays || 0,
                    first: t.first,
                    isPastYear: true,
                    isSurgeOrPeak: false
                });
                renderCuratorView();
                triggerGoogleDriveAutoSync();
            }
        }
    }
};

async function copyCuratorPlaylistText() {
    if (curatorSelectedTracks.length === 0) {
        alert('No hay canciones en la selección actual para copiar.');
        return;
    }

    const { year, half, periodStr } = curatorCurrentCycleInfo;
    const halfName = half === '1' ? '1ra Mitad (Ene-May)' : '2da Mitad (Jun-Nov)';
    const customName = (curatorPlaylistName?.value || localStorage.getItem('curator_playlist_name') || '').trim();
    const title = customName || (year && half ? `Mi Playlist ${year} - ${halfName}` : 'Mi Playlist Curada');

    let text = `🎵 ${title}\n📅 Periodo: ${periodStr}\n\n`;
    curatorSelectedTracks.forEach((t, i) => {
        text += `${i + 1}. ${t.artist} - ${t.name}\n`;
    });
    text += `\nGenerado con SpotiTracker`;

    try {
        await navigator.clipboard.writeText(text);
        alert(`¡Lista copiada al portapapeles!\n\n${curatorSelectedTracks.length} canciones listas para pegar.`);
    } catch (err) {
        prompt('Copia tu lista manualmente:', text);
    }
}

async function createCuratorSpotifyPlaylist() {
    if (!accessToken) {
        if (confirm('Para guardar la playlist directamente en tu cuenta de Spotify necesitas iniciar sesión con Spotify.\n\n¿Deseas iniciar sesión ahora?')) {
            redirectToSpotifyLogin();
        }
        return;
    }

    if (curatorSelectedTracks.length === 0) {
        alert('No hay canciones seleccionadas en la playlist.');
        return;
    }

    const { year, half, periodStr } = curatorCurrentCycleInfo;
    const halfName = half === '1' ? '1ra Mitad' : '2da Mitad';
    const customName = (curatorPlaylistName?.value || localStorage.getItem('curator_playlist_name') || '').trim();
    const playlistTitle = customName || (year && half ? `Top ${year} - ${halfName} (SpotiTracker)` : 'Top Curada (SpotiTracker)');

    try {
        const payload = {
            name: playlistTitle,
            description: `Playlist semestral curada (${periodStr}) con ${curatorSelectedTracks.length} temas. Generada en SpotiTracker.`,
            public: false
        };

        const createRes = await createSpotifyPlaylistWithDetails(payload);

        if (!createRes || !createRes.id) {
            throw new Error('Spotify no devolvió un identificador de playlist.');
        }

        const urisToAdd = [];
        const activeDb = await getActiveDatabase();

        for (const t of curatorSelectedTracks) {
            let trackUri = t.uri;

            // 1. Si no tiene URI o no empieza con spotify:track:, buscar en los catálogos cargados
            if (!trackUri || !trackUri.startsWith('spotify:track:')) {
                const k = `${normalizeKey(t.name)}:::${normalizeKey(t.artist || '')}`;
                if (activeDb?.tracksLookup?.[k]?.uri) {
                    trackUri = activeDb.tracksLookup[k].uri;
                } else if (spotifyDb?.tracksLookup?.[k]?.uri) {
                    trackUri = spotifyDb.tracksLookup[k].uri;
                } else if (unifiedDb?.tracksLookup?.[k]?.uri) {
                    trackUri = unifiedDb.tracksLookup[k].uri;
                }
            }

            // 2. Si sigue sin URI, buscar en la API de Spotify
            if (!trackUri || !trackUri.startsWith('spotify:track:')) {
                try {
                    const cleanTitle = (t.name || '')
                        .replace(/\(feat\..*?\)/gi, '')
                        .replace(/\[feat\..*?\]/gi, '')
                        .replace(/\(with.*?\)/gi, '')
                        .replace(/- .*?remaster.*?/gi, '')
                        .trim();
                    const tArtist = (t.artist || '').trim();

                    let sRes = await spotifyFetch(`search?type=track&limit=1&q=${encodeURIComponent(`${cleanTitle} ${tArtist}`)}`);
                    let foundUri = sRes?.tracks?.items?.[0]?.uri;
                    if (!foundUri) {
                        sRes = await spotifyFetch(`search?type=track&limit=1&q=${encodeURIComponent(`track:${cleanTitle} artist:${tArtist}`)}`);
                        foundUri = sRes?.tracks?.items?.[0]?.uri;
                    }
                    if (!foundUri) {
                        sRes = await spotifyFetch(`search?type=track&limit=1&q=${encodeURIComponent(`${t.name} ${tArtist}`)}`);
                        foundUri = sRes?.tracks?.items?.[0]?.uri;
                    }
                    if (foundUri) trackUri = foundUri;
                } catch (e) {
                    console.warn('Error resolviendo URI en Spotify:', t.name, e);
                }
            }

            if (trackUri && trackUri.startsWith('spotify:track:')) {
                urisToAdd.push(trackUri);
            }
        }

        let tracksAddedCount = 0;
        if (urisToAdd.length > 0) {
            for (let i = 0; i < urisToAdd.length; i += 100) {
                const chunk = urisToAdd.slice(i, i + 100);
                let addRes = await spotifyFetch(`playlists/${createRes.id}/tracks`, {
                    method: 'POST',
                    body: JSON.stringify({ uris: chunk })
                });

                if (!addRes) {
                    const queryUris = encodeURIComponent(chunk.join(','));
                    addRes = await spotifyFetch(`playlists/${createRes.id}/tracks?uris=${queryUris}`, {
                        method: 'POST'
                    });
                }

                if (addRes) tracksAddedCount += chunk.length;
            }
        }

        if (tracksAddedCount > 0) {
            alert(`¡Playlist "${payload.name}" creada con éxito en tu Spotify con ${tracksAddedCount} canciones!`);
        } else {
            alert(`Playlist "${payload.name}" creada en Spotify, pero hubo un problema al sincronizar las canciones.\n\nTip: Si tus permisos de Spotify son antiguos, cierra sesión y vuelve a iniciar sesión en Spotify para otorgar permisos de playlist.`);
        }

        if (createRes.external_urls?.spotify) {
            window.open(createRes.external_urls.spotify, '_blank');
        }
    } catch (err) {
        console.error(err);
        alert(err?.message || 'Ocurrió un error al crear la playlist en Spotify.');
    }
}

function clearCuratorSelection() {
    if (curatorSelectedTracks.length === 0) return;
    if (!confirm('¿Deseas vaciar tu tracklist actual y regresar las canciones a la banca?')) return;
    for (const t of curatorSelectedTracks) {
        curatorBenchTracks.push(t);
    }
    curatorBenchTracks.sort((a, b) => b.plays - a.plays);
    curatorSelectedTracks = [];
    renderCuratorView();
    triggerGoogleDriveAutoSync();
}

async function exportCuratorYouTubeMusic() {
    if (curatorSelectedTracks.length === 0) {
        alert('No hay canciones en la selección actual para exportar a YouTube Music.');
        return;
    }

    const cleanList = curatorSelectedTracks.map(t => `${t.artist} - ${t.name}`).join('\n');
    try {
        await navigator.clipboard.writeText(cleanList);
    } catch (e) {
        // Fallback
    }

    const firstTrackQuery = encodeURIComponent(`${curatorSelectedTracks[0].name} ${curatorSelectedTracks[0].artist}`);
    const ytMusicUrl = `https://music.youtube.com/search?q=${firstTrackQuery}`;

    const msg = `🎵 Lista de ${curatorSelectedTracks.length} canciones copiada al portapapeles en formato "Artista - Canción".\n\nIdeal para importar en TuneMyMusic, Soundiiz o buscar en YouTube Music.\n\n¿Deseas abrir YouTube Music en una nueva pestaña?`;
    if (confirm(msg)) {
        window.open(ytMusicUrl, '_blank');
    }
}

window.clearCuratorSelection = clearCuratorSelection;
window.exportCuratorYouTubeMusic = exportCuratorYouTubeMusic;

// ====================================================
// PERSISTENCIA EN LA NUBE: SUPABASE (Central-de-estudio)
// (Constantes SUPABASE inicializadas en cabecera para prevenir TDZ)
// ====================================================

let cloudAutoSync = localStorage.getItem(CLOUD_AUTOSYNC_KEY) !== 'false';
let cloudDebounceTimer = null;
let isCloudSyncing = false;

function updateCloudUI(status = 'active', customMsg = '') {
    const lastSync = localStorage.getItem(CLOUD_LAST_SYNC_KEY);

    if (gdriveAutosyncToggle) {
        gdriveAutosyncToggle.checked = cloudAutoSync;
    }

    if (drawerGdriveStatus) {
        drawerGdriveStatus.textContent = status === 'syncing' ? 'Sincronizando...' : 'Supabase Activo';
        drawerGdriveStatus.style.background = 'rgba(16, 185, 129, 0.15)';
        drawerGdriveStatus.style.color = '#10b981';
    }

    if (curatorCloudLabel) {
        curatorCloudLabel.textContent = customMsg || (status === 'syncing' ? 'Guardando...' : 'Nube Activa');
    }

    if (gdriveStatusTitle) {
        gdriveStatusTitle.textContent = status === 'syncing' ? 'Sincronizando con Supabase...' : 'Conectado a Central-de-estudio';
    }

    if (gdriveStatusDesc) {
        gdriveStatusDesc.textContent = customMsg || (lastSync
            ? `Último respaldo: ${new Date(lastSync).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}`
            : 'Base de datos PostgreSQL lista para respaldar tus selecciones.');
    }

    if (gdriveSyncBadge) {
        gdriveSyncBadge.textContent = status === 'syncing' ? 'GUARDANDO...' : 'EN LÍNEA';
        gdriveSyncBadge.style.color = status === 'syncing' ? '#38bdf8' : '#10b981';
        gdriveSyncBadge.style.background = status === 'syncing' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(16, 185, 129, 0.15)';
        gdriveSyncBadge.style.borderColor = status === 'syncing' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(16, 185, 129, 0.3)';
    }

    if (btnGdriveUpload) btnGdriveUpload.disabled = isCloudSyncing;
    if (btnGdriveDownload) btnGdriveDownload.disabled = isCloudSyncing;
}

function showCloudAlert(message, type = 'info') {
    if (!gdriveAlert) return;
    gdriveAlert.className = `alert alert-${type} py-1.5 px-2.5 small mt-3 mb-0`;
    gdriveAlert.innerHTML = message;
    gdriveAlert.classList.remove('d-none');
    setTimeout(() => {
        gdriveAlert.classList.add('d-none');
    }, 4500);
}

function openGoogleDriveModal() {
    updateCloudUI('active');
    const modal = bootstrap.Modal.getOrCreateInstance(gdriveModalEl);
    modal.show();
}

async function promptAndSaveCuratorToCloud() {
    if (isCloudSyncing) return;
    const currentVal = (curatorPlaylistName?.value || localStorage.getItem('curator_playlist_name') || '').trim();
    let defaultSuggestion = currentVal;
    if (!defaultSuggestion) {
        const year = curatorCurrentCycleInfo.year || curatorYear?.value || '';
        const half = curatorCurrentCycleInfo.half || curatorHalf?.value || '';
        if (year && half) {
            defaultSuggestion = `Top ${year} - ${half === '1' ? '1ra Mitad' : '2da Mitad'}`;
        } else {
            defaultSuggestion = 'Mi Tracklist';
        }
    }

    const enteredName = prompt('Nombre para guardar este tracklist en la base de datos:', defaultSuggestion);
    if (enteredName === null) {
        return; // Cancelado por el usuario
    }

    const finalName = enteredName.trim() || defaultSuggestion;
    if (curatorPlaylistName) curatorPlaylistName.value = finalName;
    localStorage.setItem('curator_playlist_name', finalName);

    await saveToCloudDatabase(false, finalName);
}

async function saveToCloudDatabase(isSilent = false, customName = '') {
    if (isCloudSyncing) return false;
    try {
        isCloudSyncing = true;
        updateCloudUI('syncing', 'Guardando...');

        const playlistName = (customName || curatorPlaylistName?.value || localStorage.getItem('curator_playlist_name') || '').trim() || (curatorCurrentCycleInfo.year ? `Top ${curatorCurrentCycleInfo.year} - ${curatorCurrentCycleInfo.half === '1' ? '1ra Mitad' : '2da Mitad'}` : 'Mi Tracklist');
        localStorage.setItem('curator_playlist_name', playlistName);
        if (curatorPlaylistName && !curatorPlaylistName.value) curatorPlaylistName.value = playlistName;

        const payload = {
            id: 'default',
            user_id: 'Vrak_23',
            cycle_year: curatorCurrentCycleInfo.year || (curatorYear?.value || ''),
            cycle_half: curatorCurrentCycleInfo.half || (curatorHalf?.value || ''),
            target_count: parseInt(curatorTargetCount?.value || '18', 10),
            selected_tracks: curatorSelectedTracks || [],
            honorable_mentions: window.curatorHonorableTracks || [],
            year_favorites: window.curatorYearFavorites || [],
            settings: {
                excludePast: curatorExcludePast ? curatorExcludePast.checked : true,
                playlist_name: playlistName
            },
            updated_at: new Date().toISOString()
        };

        const res = await fetch(SUPABASE_REST_URL, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const nowIso = new Date().toISOString();
            localStorage.setItem(CLOUD_LAST_SYNC_KEY, nowIso);
            updateCloudUI('active', 'Nube Sincronizada');
            if (!isSilent) {
                showCloudAlert(`¡Guardado exitoso en Supabase! "${playlistName}" (${payload.selected_tracks.length} canciones sincronizadas)`, 'success');
                if (typeof showEngagementToast === 'function') showEngagementToast('<i class="fa-solid fa-cloud-arrow-up text-success"></i>', 'Nube Sincronizada', `Se respaldó "${playlistName}" con ${payload.selected_tracks.length} canciones.`);
            }
            return true;
        } else {
            const errTxt = await res.text();
            console.error('Error guardando en Supabase:', errTxt);
            if (!isSilent) {
                showCloudAlert('Error al guardar en Supabase. Revisa la consola.', 'danger');
            }
        }
    } catch (err) {
        console.error('Error saveToCloudDatabase:', err);
        if (!isSilent) {
            showCloudAlert('Error al conectar con Supabase. <button class="btn btn-sm btn-link text-danger p-0 ms-2 fw-bold text-decoration-underline" onclick="saveToCloudDatabase(false)"><i class="fa-solid fa-rotate-right me-1"></i>Reintentar</button>', 'danger');
        }
    } finally {
        isCloudSyncing = false;
        setTimeout(() => updateCloudUI('active'), 2000);
    }
    return false;
}

async function loadFromCloudDatabase() {
    if (isCloudSyncing) return false;
    try {
        isCloudSyncing = true;
        updateCloudUI('syncing', 'Cargando...');

        const res = await fetch(`${SUPABASE_REST_URL}?id=eq.default&select=*`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });

        if (res.ok) {
            const data = await res.json();
            const row = Array.isArray(data) ? data[0] : data;
            if (row && Array.isArray(row.selected_tracks) && row.selected_tracks.length > 0) {
                curatorSelectedTracks = row.selected_tracks;
                if (row.cycle_year && curatorYear) curatorYear.value = row.cycle_year;
                if (row.cycle_half && curatorHalf) curatorHalf.value = row.cycle_half;
                if (row.target_count && curatorTargetCount) curatorTargetCount.value = row.target_count;
                if (row.settings && row.settings.excludePast !== undefined && curatorExcludePast) {
                    curatorExcludePast.checked = row.settings.excludePast;
                }

                const savedName = row.settings?.playlist_name || row.playlist_name || row.name || '';
                if (savedName) {
                    if (curatorPlaylistName) curatorPlaylistName.value = savedName;
                    localStorage.setItem('curator_playlist_name', savedName);
                }

                curatorCurrentCycleInfo.year = row.cycle_year || '';
                curatorCurrentCycleInfo.half = row.cycle_half || '';
                curatorCurrentCycleInfo.periodStr = row.cycle_year && row.cycle_half
                    ? (row.cycle_half === '1' ? `1 Ene — 20 May ${row.cycle_year}` : `1 Jun — 20 Nov ${row.cycle_year}`)
                    : 'Sin periodo seleccionado';

                if (row.cycle_year && row.cycle_half) {
                    await loadCuratorCandidates(false);
                } else {
                    renderCuratorView();
                }

                const nowIso = new Date().toISOString();
                localStorage.setItem(CLOUD_LAST_SYNC_KEY, nowIso);
                updateCloudUI('active', 'Nube Sincronizada');
                const displayName = savedName ? `"${savedName}"` : `${curatorSelectedTracks.length} canciones`;
                showCloudAlert(`¡Restaurado ${displayName} (${curatorSelectedTracks.length} canciones) desde Supabase!`, 'success');
                if (typeof showEngagementToast === 'function') showEngagementToast('<i class="fa-solid fa-cloud-arrow-down text-info"></i>', 'Datos Restaurados', `Se restauró ${displayName} y tus ajustes desde la nube.`);
                return true;
            } else {
                showCloudAlert('No hay canciones guardadas aún en la base de datos.', 'warning');
                if (typeof showEngagementToast === 'function') showEngagementToast('<i class="fa-solid fa-circle-info text-warning"></i>', 'Sin Selección Previa', 'No se encontró selección curada previa en la nube.');
            }
        } else {
            showCloudAlert('Error al consultar datos en Supabase.', 'danger');
        }
    } catch (err) {
        console.error('Error loadFromCloudDatabase:', err);
        showCloudAlert('Error al consultar Supabase. <button class="btn btn-sm btn-link text-danger p-0 ms-2 fw-bold text-decoration-underline" onclick="loadFromCloudDatabase()"><i class="fa-solid fa-rotate-right me-1"></i>Reintentar</button>', 'danger');
    } finally {
        isCloudSyncing = false;
        setTimeout(() => updateCloudUI('active'), 1500);
    }
    return false;
}

function triggerGoogleDriveAutoSync() {
    if (!cloudAutoSync) return;
    clearTimeout(cloudDebounceTimer);
    cloudDebounceTimer = setTimeout(() => {
        saveToCloudDatabase(true);
    }, 1500);
}

// ----------------------------------------------------
// 6. CÁPSULA DEL TIEMPO ("ESTE MES EN LA HISTORIA")
// ----------------------------------------------------
let currentCapsuleYear = null;

async function openCapsuleModal() {
    const modalEl = document.getElementById('capsuleModal');
    if (!modalEl) return;

    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();

    const db = await getActiveDatabase();
    if (!db || !db.yearlyTops) return;

    initCapsuleView(db);
}

function initCapsuleView(db) {
    const nav = document.getElementById('capsule-years-nav');
    const content = document.getElementById('capsule-content-area');
    if (!nav || !content) return;

    const now = new Date();
    const curMonthNum = now.getMonth() + 1;
    const curMonthKey = String(curMonthNum);
    const monthName = MONTH_NAMES[curMonthNum - 1] || 'este mes';

    // Años disponibles con datos para este mes
    const availableYears = ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'].filter(y => {
        return db.yearlyTops[y]?.months?.[curMonthKey];
    });

    if (availableYears.length === 0) {
        content.innerHTML = `<div class="text-center py-4 text-secondary">No se encontraron registros de ${monthName} en años anteriores.</div>`;
        return;
    }

    if (!currentCapsuleYear || !availableYears.includes(currentCapsuleYear)) {
        currentCapsuleYear = availableYears.find(y => y !== '2026') || availableYears[0];
    }

    nav.innerHTML = availableYears.map(y => {
        const isActive = y === currentCapsuleYear;
        const diff = 2026 - parseInt(y, 10);
        const subLabel = diff === 0 ? 'En vivo' : (diff === 1 ? 'Hace 1 año' : `Hace ${diff} años`);
        return `
            <button type="button" class="btn btn-sm ${isActive ? 'btn-brand fw-bold' : 'btn-outline-secondary text-secondary'} rounded-pill px-3 py-1 flex-shrink-0" onclick="selectCapsuleYear('${y}')" style="font-size: 0.76rem;">
                ${y} <span class="opacity-75" style="font-size: 0.65rem;">(${subLabel})</span>
            </button>
        `;
    }).join('');

    renderCapsuleContent(db, currentCapsuleYear, curMonthKey, monthName);
}

async function selectCapsuleYear(year) {
    currentCapsuleYear = year;
    const db = await getActiveDatabase();
    if (db) initCapsuleView(db);
}

function renderCapsuleContent(db, year, monthKey, monthName) {
    const content = document.getElementById('capsule-content-area');
    if (!content) return;

    const monthData = db.yearlyTops[year]?.months?.[monthKey];
    if (!monthData) {
        content.innerHTML = `<div class="text-center py-4 text-secondary">Sin datos para ${monthName} ${year}.</div>`;
        return;
    }

    const topTracks = (monthData.tracks || []).slice(0, 10);
    const topArtist = (monthData.artists || [])[0];
    const plays = monthData.plays || topTracks.reduce((acc, t) => acc + (t.plays || 0), 0);

    const artKey = topArtist ? `artist::${normalizeKey(topArtist.name)}::` : '';
    const topArtistCover = artCache[artKey] || '/logo.png';

    content.innerHTML = `
        <div class="p-3 rounded-3 mb-3 border border-info border-opacity-20" style="background: rgba(6, 182, 212, 0.08);">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="fw-bold text-white fs-6"><i class="fa-solid fa-calendar-check text-info me-1.5"></i> ${monthName} de ${year}</span>
                <span class="badge rounded-pill px-2.5 py-1 fw-bold" style="background: rgba(6, 182, 212, 0.15) !important; color: #22d3ee !important; border: 1px solid rgba(6, 182, 212, 0.35) !important; font-size: 0.74rem;">
                    <i class="fa-solid fa-headphones me-1"></i> ${formatNumber(plays)} reproducciones
                </span>
            </div>
            ${topArtist ? `
                <div class="d-flex align-items-center gap-2.5 pt-1">
                    <img id="capsule-top-art-img" src="${topArtistCover}" class="rounded-circle border border-info border-opacity-40" style="width: 44px; height: 44px; object-fit: cover;" onerror="safeAvatarError(this)">
                    <div class="overflow-hidden">
                        <small class="text-secondary d-block" style="font-size: 0.68rem;">Artista más escuchado de esa época:</small>
                        <strong class="text-white text-truncate d-block" style="font-size: 0.88rem;">${topArtist.name}</strong>
                    </div>
                </div>
            ` : ''}
        </div>

        <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="fw-bold text-white" style="font-size: 0.78rem;"><i class="fa-solid fa-list-ol text-primary me-1"></i> Canciones que no parabas de escuchar</span>
            <small class="text-secondary" style="font-size: 0.7rem;">Top 10 de esa época</small>
        </div>

        <div class="d-flex flex-column gap-1.5" style="max-height: 280px; overflow-y: auto;">
            ${topTracks.map((t, idx) => {
                const safeName = (t.name || '').replace(/'/g, "\\'");
                const safeArtist = (t.artist || '').replace(/'/g, "\\'");
                const tArtKey = `track::${normalizeKey(t.name)}::${normalizeKey(t.artist || '')}`;
                const cover = artCache[tArtKey] || '/logo.png';
                const imgId = `capsule-trk-img-${idx}`;
                return `
                    <div class="card-uniform p-1.5 px-2.5 cursor-pointer" onclick="showItemStats('track', '${safeName}', '${safeArtist}')" style="min-height: 42px;">
                        <span class="card-rank text-muted" style="width: 22px;">#${idx + 1}</span>
                        <img id="${imgId}" src="${cover}" class="rounded flex-shrink-0" style="width: 34px; height: 34px; object-fit: cover;" onerror="safeImgError(this)">
                        <div class="overflow-hidden flex-grow-1">
                            <div class="fw-bold text-white text-truncate" style="font-size: 0.78rem;">${t.name}</div>
                            <small class="text-secondary text-truncate d-block" style="font-size: 0.68rem;">${t.artist}</small>
                        </div>
                        <span class="badge bg-secondary bg-opacity-25 text-white flex-shrink-0" style="font-size: 0.68rem;">${t.plays} reps</span>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    if (topArtist && !artCache[artKey]) {
        resolveSpotifyArtwork(topArtist.name, '', 'artist', 'capsule-top-art-img');
    }
    topTracks.forEach((t, idx) => {
        const tArtKey = `track::${normalizeKey(t.name)}::${normalizeKey(t.artist || '')}`;
        if (!artCache[tArtKey]) {
            resolveSpotifyArtwork(t.name, t.artist || '', 'track', `capsule-trk-img-${idx}`);
        }
    });
}

// ----------------------------------------------------
// 7. TRIVIA MUSICAL PERSONAL (QUIZ INTERACTIVO)
// ----------------------------------------------------
let triviaCurrentQuestions = [];
let triviaCurrentIndex = 0;
let triviaScore = 0;

async function openTriviaModal() {
    const modalEl = document.getElementById('triviaModal');
    if (!modalEl) return;

    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();

    const db = await getActiveDatabase();
    if (!db) return;

    startTriviaGame(db);
}

function startTriviaGame(db) {
    triviaCurrentQuestions = generateTriviaQuestions(db);
    triviaCurrentIndex = 0;
    triviaScore = 0;
    renderTriviaQuestion();
}

function generateTriviaQuestions(db) {
    const questions = [];
    const allArtists = Object.values(db.artistsLookup || {}).filter(a => a.plays >= 30);
    const allTracks = Object.values(db.tracksLookup || {}).filter(t => t.plays >= 20);

    const years = ['2021', '2022', '2023', '2024'].filter(y => db.yearlyTops?.[y]?.tracks?.length > 3);
    if (years.length > 0) {
        const randY = years[Math.floor(Math.random() * years.length)];
        const correctTrack = db.yearlyTops[randY].tracks[0];
        const decoys = db.yearlyTops[randY].tracks.slice(1, 6).sort(() => 0.5 - Math.random()).slice(0, 3);
        const options = [correctTrack, ...decoys].sort(() => 0.5 - Math.random());
        questions.push({
            title: `¿Cuál fue tu canción #1 en todo el año ${randY}?`,
            correctIndex: options.indexOf(correctTrack),
            options: options.map(t => `${t.name} - ${t.artist}`),
            explanation: `Tu tema más escuchado en ${randY} fue "${correctTrack.name}" con ${correctTrack.plays} reproducciones.`
        });
    }

    if (allArtists.length >= 4) {
        const sampleArtists = [...allArtists].sort(() => 0.5 - Math.random()).slice(0, 4);
        sampleArtists.sort((a, b) => b.plays - a.plays);
        const correct = sampleArtists[0];
        const shuffled = [...sampleArtists].sort(() => 0.5 - Math.random());
        questions.push({
            title: `¿Cuál de estos artistas tiene MÁS reproducciones en tu historia?`,
            correctIndex: shuffled.indexOf(correct),
            options: shuffled.map(a => `${a.name}`),
            explanation: `¡${correct.name} lidera con ${formatNumber(correct.plays)} escuchas en tu biblioteca!`
        });
    }

    const discoverArtists = allArtists.filter(a => a.first && a.plays >= 50);
    if (discoverArtists.length > 0) {
        const art = discoverArtists[Math.floor(Math.random() * discoverArtists.length)];
        const correctYear = new Date(art.first).getFullYear().toString();
        const possibleYears = ['2019', '2020', '2021', '2022', '2023', '2024', '2025'].filter(y => y !== correctYear);
        const decoyYears = possibleYears.sort(() => 0.5 - Math.random()).slice(0, 3);
        const options = [correctYear, ...decoyYears].sort(() => 0.5 - Math.random());
        questions.push({
            title: `¿En qué año empezaste a escuchar a "${art.name}"?`,
            correctIndex: options.indexOf(correctYear),
            options: options,
            explanation: `Tu primer registro de ${art.name} fue en ${new Date(art.first).toLocaleDateString([], { month: 'long', year: 'numeric' })}.`
        });
    }

    const albumYears = ['2022', '2023', '2024'].filter(y => db.yearlyTops?.[y]?.albums?.length > 3);
    if (albumYears.length > 0) {
        const y = albumYears[Math.floor(Math.random() * albumYears.length)];
        const topAlb = db.yearlyTops[y].albums[0];
        const decoys = db.yearlyTops[y].albums.slice(1, 5).sort(() => 0.5 - Math.random()).slice(0, 3);
        const options = [topAlb, ...decoys].sort(() => 0.5 - Math.random());
        questions.push({
            title: `¿Cuál fue tu álbum estrella en ${y}?`,
            correctIndex: options.indexOf(topAlb),
            options: options.map(a => `${a.name} (${a.artist})`),
            explanation: `En ${y}, "${topAlb.name}" de ${topAlb.artist} fue tu álbum #1 con ${topAlb.plays} reproducciones.`
        });
    }

    if (allTracks.length >= 8) {
        const highPlays = [...allTracks].sort((a, b) => b.plays - a.plays).slice(5, 25).sort(() => 0.5 - Math.random())[0];
        const decoys = [...allTracks].filter(t => t.name !== highPlays.name).sort(() => 0.5 - Math.random()).slice(0, 3);
        const options = [highPlays, ...decoys].sort(() => 0.5 - Math.random());
        questions.push({
            title: `¿Cuál de estas canciones has reproducido más de ${Math.floor(highPlays.plays * 0.8)} veces?`,
            correctIndex: options.indexOf(highPlays),
            options: options.map(t => `${t.name} - ${t.artist}`),
            explanation: `"${highPlays.name}" acumula ${highPlays.plays} reproducciones en tu cuenta.`
        });
    }

    return questions.slice(0, 5);
}

function renderTriviaQuestion() {
    const body = document.getElementById('trivia-modal-body');
    if (!body) return;

    if (triviaCurrentIndex >= triviaCurrentQuestions.length) {
        renderTriviaResults();
        return;
    }

    const q = triviaCurrentQuestions[triviaCurrentIndex];
    const qNum = triviaCurrentIndex + 1;
    const totalQ = triviaCurrentQuestions.length;

    body.innerHTML = `
        <div class="d-flex align-items-center justify-content-between mb-3 text-secondary" style="font-size: 0.74rem;">
            <span><strong class="text-white">Pregunta ${qNum}</strong> de ${totalQ}</span>
            <span class="badge border border-primary border-opacity-30 text-white" style="background: rgba(168, 85, 247, 0.15);">Aciertos: ${triviaScore}</span>
        </div>

        <div class="progress mb-3" style="height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px;">
            <div class="progress-bar bg-primary" style="width: ${(qNum / totalQ) * 100}%;"></div>
        </div>

        <h5 class="fw-bold text-white mb-3" style="font-size: 1.05rem; line-height: 1.4;">${q.title}</h5>

        <div class="d-flex flex-column gap-2 mb-3">
            ${q.options.map((opt, idx) => `
                <button type="button" class="btn btn-outline-secondary text-start text-white p-2.5 rounded-3 d-flex align-items-center justify-content-between trivia-opt-btn" onclick="handleTriviaAnswer(${idx})" style="background: rgba(255, 255, 255, 0.03); border-color: rgba(255, 255, 255, 0.1); font-size: 0.82rem; transition: all 0.15s ease;">
                    <span class="text-truncate">${opt}</span>
                    <i class="fa-regular fa-circle text-secondary fs-6 flex-shrink-0 ms-2"></i>
                </button>
            `).join('')}
        </div>

        <div id="trivia-feedback-box" class="d-none p-2.5 rounded-3 border mb-3" style="font-size: 0.76rem;"></div>
        <div id="trivia-next-container" class="d-none text-end">
            <button type="button" class="btn btn-sm btn-brand rounded-pill px-4 py-1.5 fw-semibold" onclick="advanceTriviaQuestion()" style="font-size: 0.8rem;">
                ${qNum === totalQ ? 'Ver Resultados' : 'Siguiente Pregunta <i class="fa-solid fa-arrow-right ms-1"></i>'}
            </button>
        </div>
    `;
}

function handleTriviaAnswer(selectedIndex) {
    const q = triviaCurrentQuestions[triviaCurrentIndex];
    const buttons = document.querySelectorAll('.trivia-opt-btn');
    buttons.forEach(b => b.disabled = true);

    const isCorrect = selectedIndex === q.correctIndex;
    if (isCorrect) triviaScore++;

    const feedback = document.getElementById('trivia-feedback-box');
    const nextBtn = document.getElementById('trivia-next-container');

    buttons.forEach((b, idx) => {
        if (idx === q.correctIndex) {
            b.style.background = 'rgba(34, 197, 94, 0.2)';
            b.style.borderColor = '#22c55e';
            b.querySelector('i').className = 'fa-solid fa-circle-check text-success fs-6';
        } else if (idx === selectedIndex && !isCorrect) {
            b.style.background = 'rgba(239, 68, 68, 0.2)';
            b.style.borderColor = '#ef4444';
            b.querySelector('i').className = 'fa-solid fa-circle-xmark text-danger fs-6';
        }
    });

    if (feedback) {
        feedback.classList.remove('d-none');
        if (isCorrect) {
            feedback.style.background = 'rgba(34, 197, 94, 0.08)';
            feedback.style.borderColor = 'rgba(34, 197, 94, 0.3)';
            feedback.innerHTML = `<strong class="text-success"><i class="fa-solid fa-check me-1"></i> ¡Correcto!</strong> <span class="text-secondary">${q.explanation}</span>`;
        } else {
            feedback.style.background = 'rgba(239, 68, 68, 0.08)';
            feedback.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            feedback.innerHTML = `<strong class="text-danger"><i class="fa-solid fa-xmark me-1"></i> Casi...</strong> <span class="text-secondary">${q.explanation}</span>`;
        }
    }

    if (nextBtn) nextBtn.classList.remove('d-none');
}

function advanceTriviaQuestion() {
    triviaCurrentIndex++;
    renderTriviaQuestion();
}

function renderTriviaResults() {
    const body = document.getElementById('trivia-modal-body');
    if (!body) return;

    let title = '';
    let icon = '';
    const total = triviaCurrentQuestions.length;

    if (triviaScore === total) {
        title = 'Dios de tu Propio Universo Musical';
        icon = 'fa-trophy text-warning';
    } else if (triviaScore >= 3) {
        title = 'Melómano Experto';
        icon = 'fa-fire text-primary';
    } else {
        title = 'Oyente Casual en Evolución';
        icon = 'fa-headphones text-info';
    }

    body.innerHTML = `
        <div class="text-center py-3">
            <div class="mb-3 d-inline-flex align-items-center justify-content-center" style="width: 76px; height: 76px; border-radius: 50%; background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(234, 179, 8, 0.25)); border: 2px solid rgba(234, 179, 8, 0.5);">
                <i class="fa-solid ${icon} fs-1"></i>
            </div>
            <h4 class="fw-bold text-white mb-1">${title}</h4>
            <div class="text-secondary small mb-3">
                Acertaste <strong class="text-white">${triviaScore}</strong> de <strong class="text-white">${total}</strong> preguntas sobre tu propio historial.
            </div>

            <div class="p-3 rounded-3 mb-4 border border-secondary border-opacity-15 text-start" style="background: rgba(255, 255, 255, 0.02); font-size: 0.78rem;">
                <div class="text-white fw-semibold mb-1"><i class="fa-solid fa-sparkles text-warning me-1"></i> Resumen de la Partida</div>
                <div class="text-secondary">Tu memoria sonora refleja ${Math.round((triviaScore / total) * 100)}% de precisión con tus hábitos históricos registrados entre 2019 y 2026.</div>
            </div>

            <div class="d-flex align-items-center justify-content-center gap-2">
                <button type="button" class="btn btn-sm btn-brand rounded-pill px-4 py-1.5 fw-semibold" onclick="openTriviaModal()" style="font-size: 0.8rem;">
                    <i class="fa-solid fa-rotate me-1"></i> Jugar Otra Partida
                </button>
                <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1.5 text-white" data-bs-dismiss="modal" style="font-size: 0.8rem;">
                    Cerrar
                </button>
            </div>
        </div>
    `;

    if (triviaScore >= 3 && typeof confetti === 'function') {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    }
}

// ----------------------------------------------------
// 9. ICEBERG MUSICAL PERSONALIZADO
// ----------------------------------------------------
async function openIcebergModal() {
    const modalEl = document.getElementById('icebergModal');
    if (!modalEl) return;

    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();

    const db = await getActiveDatabase();
    if (!db || !db.artistsLookup) return;

    renderIcebergView(db);
}

function renderIcebergView(db) {
    const body = document.getElementById('iceberg-modal-body');
    if (!body) return;

    const all = Object.values(db.artistsLookup).sort((a, b) => b.plays - a.plays);

    const layer1 = all.filter(a => a.plays >= 400).slice(0, 12);
    const layer2 = all.filter(a => a.plays >= 150 && a.plays < 400).slice(0, 15);
    const layer3 = all.filter(a => a.plays >= 50 && a.plays < 150).slice(0, 18);
    const layer4 = all.filter(a => a.plays >= 15 && a.plays < 50).slice(0, 20);
    const layer5 = all.filter(a => a.plays < 15).slice(0, 20);

    const renderLayerBadges = (list) => {
        if (list.length === 0) return '<span class="text-muted small">Sin artistas en este estrato</span>';
        return list.map(a => `
            <span class="badge border border-white border-opacity-10 text-white rounded-pill px-2 py-1 cursor-pointer" onclick="showItemStats('artist', '${a.name.replace(/'/g, "\\'")}', '')" style="background: rgba(255,255,255,0.06); font-size: 0.7rem; transition: background 0.15s ease;" onmouseover="this.style.backgroundColor='rgba(255,255,255,0.18)'" onmouseout="this.style.backgroundColor='rgba(255,255,255,0.06)'">
                ${a.name} <strong class="text-warning opacity-75">${formatNumber(a.plays)}</strong>
            </span>
        `).join(' ');
    };

    body.innerHTML = `
        <div class="text-secondary small mb-3">
            Tus artistas clasificados en 5 estratos de profundidad marina. Haz clic en cualquiera para ver sus estadísticas:
        </div>

        <div class="d-flex flex-column gap-2">
            <!-- Nivel 1: Cielo / Punta del Iceberg -->
            <div class="p-3 rounded-3 border border-warning border-opacity-30" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(59, 130, 246, 0.15));">
                <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="fw-bold text-warning" style="font-size: 0.78rem;"><i class="fa-solid fa-sun me-1.5"></i> Nivel 1: Cielo / Élite Visible (+400 streams)</span>
                    <small class="text-secondary">${layer1.length} artistas</small>
                </div>
                <div class="d-flex flex-wrap gap-1.5">${renderLayerBadges(layer1)}</div>
            </div>

            <!-- Nivel 2: Superficie del Mar -->
            <div class="p-3 rounded-3 border border-info border-opacity-30" style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(14, 116, 144, 0.2));">
                <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="fw-bold text-info" style="font-size: 0.78rem;"><i class="fa-solid fa-water me-1.5"></i> Nivel 2: Superficie (150 - 399 streams)</span>
                    <small class="text-secondary">${layer2.length} artistas</small>
                </div>
                <div class="d-flex flex-wrap gap-1.5">${renderLayerBadges(layer2)}</div>
            </div>

            <!-- Nivel 3: Aguas Medias -->
            <div class="p-3 rounded-3 border border-primary border-opacity-30" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(30, 58, 138, 0.25));">
                <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="fw-bold text-primary" style="font-size: 0.78rem;"><i class="fa-solid fa-fish me-1.5"></i> Nivel 3: Aguas Medias (50 - 149 streams)</span>
                    <small class="text-secondary">${layer3.length} artistas</small>
                </div>
                <div class="d-flex flex-wrap gap-1.5">${renderLayerBadges(layer3)}</div>
            </div>

            <!-- Nivel 4: Profundidades -->
            <div class="p-3 rounded-3 border border-secondary border-opacity-25" style="background: linear-gradient(135deg, rgba(30, 27, 75, 0.4), rgba(15, 23, 42, 0.6));">
                <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="fw-bold text-secondary text-white-50" style="font-size: 0.78rem;"><i class="fa-solid fa-anchor me-1.5"></i> Nivel 4: Profundidades (15 - 49 streams)</span>
                    <small class="text-secondary">${layer4.length} artistas</small>
                </div>
                <div class="d-flex flex-wrap gap-1.5">${renderLayerBadges(layer4)}</div>
            </div>

            <!-- Nivel 5: Abismo Submarino -->
            <div class="p-3 rounded-3 border border-dark border-opacity-50" style="background: #030408;">
                <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="fw-bold text-secondary" style="font-size: 0.78rem;"><i class="fa-solid fa-gem text-info me-1.5"></i> Nivel 5: Fosas Abisales / Rarezas (&lt;15 streams)</span>
                    <small class="text-secondary">${layer5.length} artistas</small>
                </div>
                <div class="d-flex flex-wrap gap-1.5">${renderLayerBadges(layer5)}</div>
            </div>
        </div>
    `;
}

// ----------------------------------------------------
// 10. CARRERA DE ERAS (BAR CHART RACE ANIMADO)
// ----------------------------------------------------
let erasRaceTimer = null;
let erasRaceFrames = [];
let erasRaceCurrentFrame = 0;
let erasRaceIsPlaying = false;
let erasRaceSpeed = 1000;

async function openErasModal() {
    const modalEl = document.getElementById('erasModal');
    if (!modalEl) return;

    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();

    const db = await getActiveDatabase();
    if (!db || !db.yearlyTops) return;

    prepareErasRaceFrames(db);
    renderErasRaceUI();
}

function prepareErasRaceFrames(db) {
    erasRaceFrames = [];
    const years = ['2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'];
    const cumulativeArtistMap = {};

    years.forEach(y => {
        const yData = db.yearlyTops[y];
        if (!yData) return;

        (yData.artists || []).forEach(a => {
            cumulativeArtistMap[a.name] = (cumulativeArtistMap[a.name] || 0) + a.plays;
        });

        const top8 = Object.entries(cumulativeArtistMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([name, plays], idx) => ({ rank: idx + 1, name, plays }));

        erasRaceFrames.push({
            label: `Año ${y}`,
            year: y,
            top: top8
        });
    });

    erasRaceCurrentFrame = 0;
    erasRaceIsPlaying = false;
    clearInterval(erasRaceTimer);
}

function renderErasRaceUI() {
    const body = document.getElementById('eras-modal-body');
    if (!body || erasRaceFrames.length === 0) return;

    body.innerHTML = `
        <div class="d-flex align-items-center justify-content-between p-2.5 mb-3 rounded-3 border border-secondary border-opacity-15" style="background: rgba(255,255,255,0.02);">
            <div class="d-flex align-items-center gap-2">
                <button type="button" id="btn-eras-play" class="btn btn-sm btn-brand rounded-pill px-3 py-1 fw-semibold" onclick="toggleErasRacePlay()">
                    <i class="fa-solid fa-play me-1"></i> Reproducir
                </button>
                <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-2.5 py-1 text-white" onclick="resetErasRace()" title="Reiniciar">
                    <i class="fa-solid fa-rotate-left"></i>
                </button>
            </div>
            <div class="d-flex align-items-center gap-2">
                <span id="eras-frame-label" class="fw-bold text-white fs-6">Año 2019</span>
            </div>
        </div>

        <input type="range" class="form-range mb-3" id="eras-scrubber" min="0" max="${erasRaceFrames.length - 1}" value="0" oninput="scrubErasRace(this.value)">

        <div id="eras-bars-container" class="d-flex flex-column gap-2" style="min-height: 320px;">
        </div>
    `;

    renderErasBars();
}

function renderErasBars() {
    const container = document.getElementById('eras-bars-container');
    const label = document.getElementById('eras-frame-label');
    const scrubber = document.getElementById('eras-scrubber');
    if (!container || erasRaceFrames.length === 0) return;

    const frame = erasRaceFrames[erasRaceCurrentFrame];
    if (!frame) return;

    if (label) label.textContent = frame.label;
    if (scrubber) scrubber.value = erasRaceCurrentFrame;

    const maxPlays = Math.max(1, frame.top[0]?.plays || 1);

    container.innerHTML = frame.top.map(item => {
        const pct = Math.max(8, Math.round((item.plays / maxPlays) * 100));
        return `
            <div class="d-flex align-items-center gap-2" style="font-size: 0.78rem;">
                <span class="text-secondary fw-bold" style="width: 24px;">#${item.rank}</span>
                <span class="text-white text-truncate fw-semibold" style="width: 120px;" title="${item.name}">${item.name}</span>
                <div class="progress flex-grow-1" style="height: 18px; background: rgba(255,255,255,0.04); border-radius: 6px;">
                    <div class="progress-bar d-flex align-items-center justify-content-end pe-2 text-dark fw-bold" style="width: ${pct}%; background: linear-gradient(90deg, #a855f7, #ec4899); border-radius: 6px; font-size: 0.68rem; transition: width 0.4s ease;">
                        ${formatNumber(item.plays)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function toggleErasRacePlay() {
    const playBtn = document.getElementById('btn-eras-play');
    if (erasRaceIsPlaying) {
        clearInterval(erasRaceTimer);
        erasRaceIsPlaying = false;
        if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-play me-1"></i> Reproducir';
    } else {
        erasRaceIsPlaying = true;
        if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-pause me-1"></i> Pausar';
        if (erasRaceCurrentFrame >= erasRaceFrames.length - 1) erasRaceCurrentFrame = 0;
        erasRaceTimer = setInterval(() => {
            if (erasRaceCurrentFrame < erasRaceFrames.length - 1) {
                erasRaceCurrentFrame++;
                renderErasBars();
            } else {
                toggleErasRacePlay();
            }
        }, erasRaceSpeed);
    }
}

function scrubErasRace(val) {
    erasRaceCurrentFrame = parseInt(val, 10);
    renderErasBars();
}

function resetErasRace() {
    clearInterval(erasRaceTimer);
    erasRaceIsPlaying = false;
    erasRaceCurrentFrame = 0;
    const playBtn = document.getElementById('btn-eras-play');
    if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-play me-1"></i> Reproducir';
    renderErasBars();
}

// ----------------------------------------------------
// 11. ENGAGEMENT: RACHA DIARIA, RETO DEL DÍA, NIVEL Y XP
// ----------------------------------------------------
const PROFILE_KEY = 'spoti_profile_v1';
const PROFILE_CLOUD_URL = `${SUPABASE_PROJECT_URL}/rest/v1/spotitracker_profile`;
const STREAK_MEDALS = [7, 30, 100];
const LEVEL_RANKS = [
    { min: 1, name: 'Novato', icon: '<i class="fa-solid fa-seedling text-success"></i>' },
    { min: 5, name: 'Oyente', icon: '<i class="fa-solid fa-headphones text-info"></i>' },
    { min: 10, name: 'Melómano', icon: '<i class="fa-solid fa-guitar text-primary"></i>' },
    { min: 15, name: 'Experto', icon: '<i class="fa-solid fa-fire text-warning"></i>' },
    { min: 25, name: 'Leyenda', icon: '<i class="fa-solid fa-crown text-warning"></i>' },
    { min: 40, name: 'Inmortal', icon: '<i class="fa-solid fa-star text-light"></i>' }
];

let profileState = null;
let engagementInitialized = false;
let engagementRefreshing = false;
let engagementTimer = null;
let profileSyncTimer = null;
let todayPlaysCache = { day: '', at: 0, plays: [] };
let lastEngagementInfo = null;

function localDateKey(d = new Date()) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function getProfileState() {
    if (profileState) return profileState;
    let s = {};
    try {
        s = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}') || {};
    } catch (e) {
        s = {};
    }
    profileState = {
        visitDays: Array.isArray(s.visitDays) ? s.visitDays : [],
        completed: s.completed || {},
        rerolls: s.rerolls || {},
        lastLevel: s.lastLevel || 0,
        bestStreak: s.bestStreak || 0,
        streamOverrides: s.streamOverrides || getCustomStreamOverrides()
    };
    return profileState;
}

function saveProfileState() {
    try {
        const st = getProfileState();
        st.streamOverrides = getCustomStreamOverrides();
        localStorage.setItem(PROFILE_KEY, JSON.stringify(st));
    } catch (e) {}
    clearTimeout(profileSyncTimer);
    profileSyncTimer = setTimeout(pushProfileToCloud, 1800);
}

function mergeStreamOverridesObjects(localOvr, remoteOvr) {
    const merged = { tracks: { ...(localOvr?.tracks || {}) }, artists: { ...(localOvr?.artists || {}) } };
    if (remoteOvr?.tracks) {
        Object.entries(remoteOvr.tracks).forEach(([k, rVal]) => {
            const lVal = merged.tracks[k];
            if (!lVal || (rVal.updatedAt && (!lVal.updatedAt || rVal.updatedAt > lVal.updatedAt))) {
                merged.tracks[k] = rVal;
            }
        });
    }
    if (remoteOvr?.artists) {
        Object.entries(remoteOvr.artists).forEach(([k, rVal]) => {
            const lVal = merged.artists[k];
            if (!lVal || (rVal.updatedAt && (!lVal.updatedAt || rVal.updatedAt > lVal.updatedAt))) {
                merged.artists[k] = rVal;
            }
        });
    }
    return merged;
}

async function pushProfileToCloud() {
    const st = getProfileState();
    st.streamOverrides = getCustomStreamOverrides();
    const payload = {
        id: 'default',
        user_id: 'Vrak_23',
        state: st,
        updated_at: new Date().toISOString()
    };

    // 1. Push to Supabase
    try {
        await fetch(PROFILE_CLOUD_URL, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.warn('No se pudo respaldar el perfil en Supabase:', e);
    }

    // 2. Push to Firebase Firestore (spotitracker-87628) if initialized
    try {
        if (firestoreDb) {
            await firestoreDb.collection('spotitracker_profile').doc('default').set(payload, { merge: true });
        }
    } catch (e) {
        console.warn('Firebase Firestore push warning:', e);
    }
}

async function pullProfileFromCloud() {
    let remote = null;

    // 1. Try pulling from Supabase
    try {
        const res = await fetch(`${PROFILE_CLOUD_URL}?id=eq.default&select=state`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        if (res.ok) {
            const rows = await res.json();
            if (rows?.[0]?.state) remote = rows[0].state;
        }
    } catch (e) {
        console.warn('No se pudo leer el perfil desde Supabase:', e);
    }

    // 2. Also check Firebase Firestore
    try {
        if (firestoreDb) {
            const docSnap = await firestoreDb.collection('spotitracker_profile').doc('default').get();
            if (docSnap.exists) {
                const fbState = docSnap.data()?.state;
                if (fbState && typeof fbState === 'object') {
                    if (!remote) {
                        remote = fbState;
                    } else if (fbState.streamOverrides) {
                        remote.streamOverrides = mergeStreamOverridesObjects(remote.streamOverrides, fbState.streamOverrides);
                    }
                }
            }
        }
    } catch (e) {}

    if (!remote || typeof remote !== 'object') return;

    const local = getProfileState();
    const days = new Set([...(local.visitDays || []), ...(remote.visitDays || [])]);
    local.visitDays = Array.from(days).sort();
    local.completed = { ...(remote.completed || {}), ...local.completed };
    local.rerolls = { ...(remote.rerolls || {}), ...local.rerolls };
    local.lastLevel = Math.max(local.lastLevel || 0, remote.lastLevel || 0);
    local.bestStreak = Math.max(local.bestStreak || 0, remote.bestStreak || 0);

    if (remote.streamOverrides && (remote.streamOverrides.tracks || remote.streamOverrides.artists)) {
        const localOvr = getCustomStreamOverrides();
        const mergedOvr = mergeStreamOverridesObjects(localOvr, remote.streamOverrides);
        local.streamOverrides = mergedOvr;
        saveCustomStreamOverridesToStorage(mergedOvr, true);
        applyCustomOverridesToTidal();
        if (typeof updateStatStrip === 'function') updateStatStrip();
    }

    saveProfileState();
}

function registerVisitToday() {
    const st = getProfileState();
    const today = localDateKey();
    if (!st.visitDays.includes(today)) {
        st.visitDays.push(today);
        st.visitDays.sort();
        saveProfileState();
    }
}

function lastFmArtistName(t) {
    return t?.artist?.['#text'] || t?.artist?.name || '';
}

function getActivityDaySet() {
    const set = new Set(getProfileState().visitDays);
    (lastFmRecentDelta || []).forEach(t => {
        if (t?.date?.uts) set.add(localDateKey(new Date(parseInt(t.date.uts, 10) * 1000)));
    });
    const db = unifiedDb || spotifyDb;
    (db?.recent || []).forEach(r => {
        if (r?.ts) set.add(localDateKey(new Date(r.ts)));
    });
    (todayPlaysCache.plays || []).forEach(p => set.add(localDateKey(p.date)));
    return set;
}

function getStreakInfo() {
    const days = getActivityDaySet();
    const cursor = new Date();
    cursor.setHours(12, 0, 0, 0);
    if (!days.has(localDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);

    let current = 0;
    while (days.has(localDateKey(cursor))) {
        current++;
        cursor.setDate(cursor.getDate() - 1);
    }

    // Mejor racha histórica entre los días registrados
    const sorted = Array.from(days).sort();
    let best = 0;
    let run = 0;
    let prev = null;
    sorted.forEach(k => {
        const d = new Date(`${k}T12:00:00`);
        if (prev && Math.round((d - prev) / 86400000) === 1) run++;
        else run = 1;
        if (run > best) best = run;
        prev = d;
    });

    const st = getProfileState();
    best = Math.max(best, current, st.bestStreak || 0);
    if (best > (st.bestStreak || 0)) {
        st.bestStreak = best;
        saveProfileState();
    }
    return { current, best, days };
}

// ---------- Retos del día ----------
function dbArtistLookup(db, name) {
    const l = db?.artistsLookup;
    if (!l) return null;
    return l[(name || '').trim().toLowerCase()] || l[normalizeKey(name)] || null;
}

function dbTrackLookup(db, name, artist) {
    const l = db?.tracksLookup;
    if (!l) return null;
    return l[`${(name || '').trim().toLowerCase()}:::${(artist || '').trim().toLowerCase()}`] || null;
}

const DAILY_CHALLENGES = [
    {
        id: 'count', icon: 'fa-headphones', title: 'Maratón ligero',
        desc: 'Escucha 15 canciones hoy', target: 15,
        evaluate: (plays) => plays.length
    },
    {
        id: 'variety', icon: 'fa-users', title: 'Variedad total',
        desc: 'Escucha 4 artistas distintos hoy', target: 4,
        evaluate: (plays) => new Set(plays.map(p => normalizeKey(p.artist))).size
    },
    {
        id: 'morning', icon: 'fa-sun', title: 'Arranque sonoro',
        desc: 'Escucha 5 canciones antes del mediodía', target: 5,
        evaluate: (plays) => plays.filter(p => p.date.getHours() < 12).length
    },
    {
        id: 'comeback', icon: 'fa-rotate-left', title: 'Reencuentro',
        desc: 'Escucha un artista que no oías hace más de 1 año', target: 1,
        evaluate: (plays, db, known) => {
            const found = new Set();
            plays.forEach(p => {
                const k = normalizeKey(p.artist);
                if (known.has(k)) return;
                const a = dbArtistLookup(db, p.artist);
                if (a?.last && (Date.now() - new Date(a.last).getTime()) > 365 * 86400000) found.add(k);
            });
            return found.size;
        }
    },
    {
        id: 'throwback', icon: 'fa-clock-rotate-left', title: 'Máquina del tiempo',
        desc: 'Escucha 3 canciones que descubriste entre 2019 y 2021', target: 3,
        evaluate: (plays, db) => plays.filter(p => {
            const t = dbTrackLookup(db, p.name, p.artist);
            return t?.first && new Date(t.first).getFullYear() <= 2021;
        }).length
    },
    {
        id: 'discover', icon: 'fa-compass', title: 'Explorador',
        desc: 'Escucha un artista que nunca habías escuchado', target: 1,
        evaluate: (plays, db, known) => {
            const found = new Set();
            plays.forEach(p => {
                const k = normalizeKey(p.artist);
                if (!k || known.has(k)) return;
                if (!dbArtistLookup(db, p.artist)) found.add(k);
            });
            return found.size;
        }
    }
];

function getTodayChallenge() {
    const today = localDateKey();
    const seed = today.split('-').reduce((acc, n) => acc * 31 + parseInt(n, 10), 7);
    const offset = getProfileState().rerolls[today] || 0;
    return DAILY_CHALLENGES[(seed + offset) % DAILY_CHALLENGES.length];
}

async function getTodayPlays(db) {
    const todayKey = localDateKey();
    const startToday = new Date();
    startToday.setHours(0, 0, 0, 0);
    const { user, key } = getLastFmCredentials();
    const hasSource = !!(user && key);

    if (todayPlaysCache.day !== todayKey) todayPlaysCache = { day: todayKey, at: 0, plays: [] };

    if (hasSource) {
        await fetchLastFmDelta();
        if (Date.now() - todayPlaysCache.at > 90000) {
            try {
                const startUTS = Math.floor(startToday.getTime() / 1000);
                const res = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(user)}&from=${startUTS}&api_key=${encodeURIComponent(key)}&limit=200&format=json`);
                if (res.ok) {
                    const data = await res.json();
                    const raw = data?.recenttracks?.track || [];
                    const list = Array.isArray(raw) ? raw : [raw];
                    todayPlaysCache = {
                        day: todayKey,
                        at: Date.now(),
                        plays: list.filter(t => t?.date?.uts).map(t => ({
                            name: t.name,
                            artist: lastFmArtistName(t),
                            album: t.album?.['#text'] || '',
                            date: new Date(parseInt(t.date.uts, 10) * 1000)
                        }))
                    };
                }
            } catch (e) {
                console.warn('No se pudieron leer las escuchas de hoy:', e);
            }
        }
    }

    const knownBefore = new Set();
    (lastFmRecentDelta || []).forEach(t => {
        if (t?.date?.uts && parseInt(t.date.uts, 10) * 1000 < startToday.getTime()) {
            knownBefore.add(normalizeKey(lastFmArtistName(t)));
        }
    });
    (db?.recent || []).forEach(r => {
        if (r?.ts && new Date(r.ts).getTime() < startToday.getTime()) knownBefore.add(normalizeKey(r.artist));
    });

    return { plays: todayPlaysCache.plays, knownBefore, hasSource };
}

async function evaluateDailyChallenge(db) {
    const ch = getTodayChallenge();
    const { plays, knownBefore, hasSource } = await getTodayPlays(db);
    const raw = ch.evaluate(plays, db, knownBefore);
    const progress = Math.min(ch.target, raw);
    return { ch, progress, done: progress >= ch.target, hasSource, playsToday: plays.length };
}

function rerollDailyChallenge() {
    const st = getProfileState();
    const today = localDateKey();
    if (st.rerolls[today] || st.completed[today]) return;
    st.rerolls[today] = 1;
    saveProfileState();
    refreshEngagement();
}

// ---------- Nivel y XP ----------
function computeLevelInfo(db) {
    const st = getProfileState();
    const artists = Object.values(db?.artistsLookup || {});
    const streams = db?.summary?.validStreams || artists.reduce((a, x) => a + (x.plays || 0), 0);

    const xpPlays = Math.floor(streams / 20);
    const xpMilestones = artists.reduce((a, x) => a + Math.floor((x.plays || 0) / 100), 0) * 10;
    const xpChallenges = Object.keys(st.completed).length * 40;
    const xpDays = st.visitDays.length * 5;
    const xp = xpPlays + xpMilestones + xpChallenges + xpDays;

    const level = Math.max(1, Math.floor((1 + Math.sqrt(1 + 4 * xp / 75)) / 2));
    const floorXp = 75 * level * (level - 1);
    const nextXp = 75 * (level + 1) * level;
    const pct = Math.min(100, Math.round(((xp - floorXp) / (nextXp - floorXp)) * 100));
    const rank = [...LEVEL_RANKS].reverse().find(r => level >= r.min) || LEVEL_RANKS[0];

    return {
        xp, level, rank, floorXp, nextXp, pct,
        breakdown: { xpPlays, xpMilestones, xpChallenges, xpDays }
    };
}

function showEngagementToast(icon, title, text) {
    const el = document.createElement('div');
    el.className = 'engagement-toast';
    el.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2100;max-width:92vw;min-width:260px;padding:12px 16px;border-radius:14px;background:rgba(20,20,28,0.96);border:1px solid rgba(168,85,247,0.45);box-shadow:0 10px 30px rgba(0,0,0,0.5);color:#fff;display:flex;align-items:center;gap:12px;';
    el.innerHTML = `
        <span style="font-size:1.6rem;">${icon}</span>
        <div><div class="fw-bold" style="font-size:0.88rem;">${title}</div><div class="text-secondary" style="font-size:0.76rem;">${text}</div></div>
    `;
    document.body.appendChild(el);
    setTimeout(() => {
        el.style.transition = 'opacity 0.4s ease';
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 450);
    }, 4600);
}

function engagementConfetti() {
    if (typeof confetti === 'function') {
        confetti({ particleCount: 80, spread: 75, origin: { y: 0.7 } });
    }
}

async function initEngagement(db) {
    if (!db || engagementInitialized) return;
    engagementInitialized = true;
    getProfileState();
    registerVisitToday();
    await pullProfileFromCloud();
    engagementTimer = setInterval(refreshEngagement, 120000);
    await refreshEngagement();
}

async function refreshEngagement() {
    if (engagementRefreshing) return;
    engagementRefreshing = true;
    try {
        const db = await getActiveDatabase();
        if (!db) return;

        const st = getProfileState();
        const today = localDateKey();
        const challenge = await evaluateDailyChallenge(db);
        const alreadyDone = !!st.completed[today];

        if (challenge.done && !alreadyDone) {
            st.completed[today] = challenge.ch.id;
            saveProfileState();
            showEngagementToast('<i class="fa-solid fa-award text-warning"></i>', '¡Reto del día completado!', `${challenge.ch.title}: +40 XP`);
            engagementConfetti();
        }
        challenge.done = challenge.done || !!st.completed[today];

        const streak = getStreakInfo();
        const level = computeLevelInfo(db);

        if (st.lastLevel && level.level > st.lastLevel) {
            setTimeout(() => {
                showEngagementToast(level.rank.icon, `¡Subiste al nivel ${level.level}!`, `Ahora eres ${level.rank.name}`);
                engagementConfetti();
            }, challenge.done && !alreadyDone ? 1800 : 0);
        }
        if (level.level !== st.lastLevel) {
            st.lastLevel = level.level;
            saveProfileState();
        }

        lastEngagementInfo = { challenge, streak, level };
        // renderEngagementStrip(lastEngagementInfo);
        renderEngagementPill(lastEngagementInfo);

        const modalEl = document.getElementById('progressModal');
        if (modalEl && modalEl.classList.contains('show')) renderProgressModal(lastEngagementInfo);
    } catch (e) {
        console.warn('Error actualizando engagement:', e);
    } finally {
        engagementRefreshing = false;
    }
}

function renderEngagementPill({ streak, level }) {
    const pill = document.getElementById('btn-open-progress-nav');
    if (pill) {
        pill.classList.remove('d-none');
        pill.innerHTML = `<span><i class="fa-solid fa-fire me-1 text-warning"></i>${streak.current}</span><span class="text-secondary">·</span><span>Nv ${level.level}</span>`;
        pill.title = `Racha de ${streak.current} día(s) · Nivel ${level.level} ${level.rank.name}`;
    }

    // Actualizar también la tarjeta de usuario en el menú drawer si existe
    const drawerStreak = document.getElementById('drawer-streak-num');
    if (drawerStreak) drawerStreak.textContent = streak.current;
    const drawerLevelTitle = document.getElementById('drawer-level-title');
    if (drawerLevelTitle) drawerLevelTitle.textContent = `Nivel ${level.level} · ${level.rank.name}`;
    const drawerLevelBar = document.getElementById('drawer-level-progress-bar');
    if (drawerLevelBar) drawerLevelBar.style.width = `${level.pct}%`;
}

function renderEngagementStrip({ challenge, streak, level }) {
    const strip = document.getElementById('engagement-strip');
    if (!strip) return;
    strip.classList.remove('d-none');

    const { ch, progress, done, hasSource } = challenge;
    const pct = Math.min(100, Math.round((progress / ch.target) * 100));
    const status = done
        ? '<span class="text-success fw-semibold"><i class="fa-solid fa-circle-check me-1"></i>¡Completado!</span>'
        : (hasSource ? `${progress} / ${ch.target}` : 'Conecta Last.fm');

    strip.innerHTML = `
        <div onclick="openProfileSection()" class="d-flex align-items-center justify-content-between gap-3 px-3 py-2 rounded-3 border" style="cursor:pointer;background:linear-gradient(90deg, rgba(168,85,247,0.06), rgba(255,255,255,0.02));border-color:rgba(255,255,255,0.08) !important;transition:border-color 0.2s;" onmouseenter="this.style.borderColor='rgba(168,85,247,0.3)'" onmouseleave="this.style.borderColor='rgba(255,255,255,0.08)'">
            <!-- Nivel e Icono -->
            <div class="d-flex align-items-center gap-2 flex-shrink-0">
                <span style="font-size:1.35rem;line-height:1;">${level.rank.icon}</span>
                <div style="min-width:85px;">
                    <div class="fw-bold text-white text-truncate" style="font-size:0.75rem;">Nv ${level.level} · ${level.rank.name}</div>
                    <div class="progress" style="height:4px;background:rgba(255,255,255,0.08);border-radius:2px;margin-top:2px;">
                        <div class="progress-bar" style="width:${level.pct}%;background:linear-gradient(90deg,#a855f7,#ec4899);"></div>
                    </div>
                </div>
            </div>

            <!-- Reto del día compacto -->
            <div class="flex-grow-1 overflow-hidden px-1" style="min-width:140px;">
                <div class="d-flex align-items-center justify-content-between gap-2" style="font-size:0.72rem;">
                    <span class="text-white text-truncate">
                        <i class="fa-solid ${ch.icon} text-warning me-1"></i>
                        <strong>${ch.title}:</strong>
                        <span class="text-secondary d-none d-sm-inline ms-1">${ch.desc}</span>
                    </span>
                    <span class="text-secondary flex-shrink-0" style="font-size:0.68rem;">${status}</span>
                </div>
                <div class="progress mt-1" style="height:4px;background:rgba(255,255,255,0.08);border-radius:2px;">
                    <div class="progress-bar ${done ? 'bg-success' : ''}" style="width:${pct}%;${done ? '' : 'background:linear-gradient(90deg,#f59e0b,#eab308);'}"></div>
                </div>
            </div>

            <!-- Racha y link -->
            <div class="d-flex align-items-center gap-2 flex-shrink-0">
                <div class="text-center" style="line-height:1.1;">
                    <div class="fw-bold text-white" style="font-size:0.85rem;"><i class="fa-solid fa-fire me-1 text-warning"></i>${streak.current}</div>
                    <div class="text-secondary" style="font-size:0.60rem;">días</div>
                </div>
                <i class="fa-solid fa-chevron-right text-muted opacity-50 ms-1" style="font-size:0.70rem;"></i>
            </div>
        </div>
    `;
}

function renderStreakCalendar(daySet) {
    // Registro Semanal de Actividad (Lunes a Domingo con días claros y estadísticas comprensibles)
    const today = new Date();
    const dayOfWeek = (today.getDay() + 6) % 7; // 0=Lun, 1=Mar, ..., 6=Dom
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek);
    monday.setHours(12, 0, 0, 0);

    const dayLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    let completedThisWeek = 0;

    let weekChips = '';
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const key = localDateKey(d);
        const isToday = i === dayOfWeek;
        const isFuture = i > dayOfWeek;
        const active = daySet && daySet.has(key);
        if (active) completedThisWeek++;

        const bg = active 
            ? 'background: linear-gradient(135deg, rgba(168, 85, 247, 0.35), rgba(236, 72, 153, 0.25)); border: 1.5px solid #a855f7;' 
            : (isFuture ? 'background: rgba(255, 255, 255, 0.02); border: 1px dashed rgba(255, 255, 255, 0.1); opacity: 0.45;' : 'background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.1);');
        
        const badgeIcon = active 
            ? '<i class="fa-solid fa-check text-success fs-6"></i>' 
            : (isToday ? '<i class="fa-solid fa-fire text-warning animate-pulse"></i>' : '<i class="fa-regular fa-circle text-secondary opacity-50"></i>');

        weekChips += `
            <div class="flex-grow-1 p-2 rounded-3 text-center" style="${bg} min-width: 44px; ${isToday ? 'box-shadow: 0 0 12px rgba(251, 191, 36, 0.25); border-color: #fbbf24 !important;' : ''}">
                <div class="fw-bold mb-1 ${isToday ? 'text-warning' : 'text-secondary'}" style="font-size: 0.72rem;">${dayLabels[i]}</div>
                <div class="d-flex align-items-center justify-content-center" style="height: 26px;">${badgeIcon}</div>
                <small class="text-secondary d-block mt-0.5" style="font-size: 0.65rem;">${d.getDate()}</small>
            </div>
        `;
    }

    return `
        <div class="mt-2 mb-2 p-2.5 rounded-3" style="background: rgba(0, 0, 0, 0.25); border: 1px solid rgba(255, 255, 255, 0.06);">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-secondary small fw-semibold" style="font-size: 0.74rem;">
                    <i class="fa-regular fa-calendar-check text-info me-1.5"></i>Actividad de esta semana
                </span>
                <span class="badge" style="background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); font-size: 0.70rem;">
                    ${completedThisWeek} de 7 días completados
                </span>
            </div>
            <div class="d-flex gap-1.5 justify-content-between overflow-x-auto pb-1" style="scrollbar-width: none;">
                ${weekChips}
            </div>
            <div class="d-flex align-items-center justify-content-between mt-2 pt-1 border-top border-secondary border-opacity-10 text-secondary" style="font-size: 0.70rem;">
                <span><i class="fa-solid fa-circle-info me-1 text-primary"></i>Ingresa cada día y escucha música para mantener tu racha viva.</span>
                <strong class="text-white">${daySet ? daySet.size : 0} días activos en total</strong>
            </div>
        </div>
    `;
}

function renderProgressModal({ challenge, streak, level }) {
    const body = document.getElementById('profile-section-content') || document.getElementById('progress-modal-body');
    if (!body) return;

    const st = getProfileState();
    const today = localDateKey();
    const { ch, progress, done, hasSource } = challenge;
    const pct = Math.round((progress / ch.target) * 100);
    const completedCount = Object.keys(st.completed).length;
    const canReroll = !done && !st.rerolls[today];
    const b = level.breakdown;

    const medals = STREAK_MEDALS.map(n => {
        const got = streak.best >= n;
        return `<span class="badge rounded-pill px-2.5 py-1" style="background:${got ? 'rgba(234,179,8,0.15)' : 'rgba(255,255,255,0.04)'};border:1px solid ${got ? 'rgba(234,179,8,0.45)' : 'rgba(255,255,255,0.1)'};color:${got ? '#fbbf24' : '#8b8b99'};font-size:0.72rem;"><i class="fa-solid ${got ? 'fa-award text-warning' : 'fa-lock opacity-50'} me-1"></i>${n} días</span>`;
    }).join(' ');

    body.innerHTML = `
        <!-- Nivel -->
        <div class="p-3 rounded-3 mb-3" style="background:linear-gradient(135deg,rgba(168,85,247,0.14),rgba(236,72,153,0.08));border:1px solid rgba(168,85,247,0.3);">
            <div class="d-flex align-items-center gap-3 mb-2">
                <span style="font-size:2.2rem;line-height:1;">${level.rank.icon}</span>
                <div class="flex-grow-1">
                    <div class="fw-bold text-white" style="font-size:1.05rem;">Nivel ${level.level} · ${level.rank.name}</div>
                    <div class="text-secondary" style="font-size:0.74rem;">${formatNumber(level.xp)} XP en total</div>
                </div>
            </div>
            <div class="progress" style="height:8px;background:rgba(255,255,255,0.08);border-radius:4px;">
                <div class="progress-bar" style="width:${level.pct}%;background:linear-gradient(90deg,#a855f7,#ec4899);"></div>
            </div>
            <div class="d-flex justify-content-between text-secondary mt-1" style="font-size:0.68rem;">
                <span>Nv ${level.level}</span>
                <span>Faltan ${formatNumber(level.nextXp - level.xp)} XP para Nv ${level.level + 1}</span>
            </div>
            <div class="row g-1 mt-2" style="font-size:0.68rem;">
                <div class="col-6"><span class="text-secondary">Reproducciones</span> <strong class="text-white float-end">+${formatNumber(b.xpPlays)}</strong></div>
                <div class="col-6"><span class="text-secondary">Hitos +100</span> <strong class="text-white float-end">+${formatNumber(b.xpMilestones)}</strong></div>
                <div class="col-6"><span class="text-secondary">Retos (${completedCount})</span> <strong class="text-white float-end">+${formatNumber(b.xpChallenges)}</strong></div>
                <div class="col-6"><span class="text-secondary">Días activos</span> <strong class="text-white float-end">+${formatNumber(b.xpDays)}</strong></div>
            </div>
        </div>

        <!-- Reto del día -->
        <div class="p-3 rounded-3 mb-3" style="background:rgba(234,179,8,0.07);border:1px solid rgba(234,179,8,0.28);">
            <div class="d-flex align-items-center justify-content-between mb-1">
                <span class="fw-bold text-white" style="font-size:0.84rem;"><i class="fa-solid ${ch.icon} text-warning me-1.5"></i>Reto del día: ${ch.title}</span>
                <span class="badge" style="background:rgba(234,179,8,0.15);color:#fbbf24;border:1px solid rgba(234,179,8,0.35);">+40 XP</span>
            </div>
            <div class="text-secondary mb-2" style="font-size:0.78rem;">${ch.desc}</div>
            <div class="progress" style="height:8px;background:rgba(255,255,255,0.08);border-radius:4px;">
                <div class="progress-bar ${done ? 'bg-success' : ''}" style="width:${pct}%;${done ? '' : 'background:linear-gradient(90deg,#f59e0b,#eab308);'}"></div>
            </div>
            <div class="d-flex align-items-center justify-content-between mt-2" style="font-size:0.74rem;">
                <span class="${done ? 'text-success fw-semibold' : 'text-secondary'}">${done ? '✓ ¡Completado hoy!' : (hasSource ? `Progreso: ${progress} / ${ch.target}` : 'Conecta Last.fm para registrar tus escuchas del día')}</span>
                ${canReroll ? '<button type="button" class="btn btn-sm btn-outline-secondary text-white rounded-pill py-0 px-2" style="font-size:0.7rem;" onclick="rerollDailyChallenge()"><i class="fa-solid fa-shuffle me-1"></i>Cambiar reto</button>' : ''}
            </div>
        </div>

        <!-- Racha -->
        <div class="p-3 rounded-3" style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="fw-bold text-white" style="font-size:0.84rem;"><i class="fa-solid fa-fire text-warning me-1"></i> Racha: ${streak.current} día${streak.current === 1 ? '' : 's'}</span>
                <span class="text-secondary" style="font-size:0.72rem;">Mejor racha: <strong class="text-white">${streak.best}</strong></span>
            </div>
            ${renderStreakCalendar(streak.days)}
            <div class="d-flex flex-wrap gap-1.5 mt-2">${medals}</div>
        </div>
    `;
}

async function openProfileSection() {
    switchAppView('profile');
}
window.openProgressModal = openProfileSection;
window.openProfileSection = openProfileSection;


// ----------------------------------------------------
// SISTEMA DE NAVEGACIÓN POR VISTAS (HOME / TOPS / HUB / PERFIL)
// ----------------------------------------------------
let currentActiveView = 'home';

function switchAppView(viewName) {
    if (!viewName) viewName = 'home';

    // Control de acceso para Playlists Semestrales (Curador) - Exclusivo Admin
    if (viewName === 'curator') {
        if (!isAppOwner()) {
            switchAppView('home');
            return;
        }
    }

    currentActiveView = viewName;

    // 1. Alternar secciones visibles
    const sections = {
        home: document.getElementById('section-home'),
        catalog: document.getElementById('section-catalog'),
        hub: document.getElementById('section-hub'),
        curator: document.getElementById('section-curator'),
        profile: document.getElementById('section-profile')
    };

    Object.keys(sections).forEach(key => {
        const el = sections[key];
        if (!el) return;
        if (key === viewName) {
            el.classList.remove('d-none');
        } else {
            el.classList.add('d-none');
        }
    });

    // 2. Sincronizar estilos activos en Bottom Navigation Bar
    document.querySelectorAll('.bottom-nav-item').forEach(btn => {
        const tab = btn.getAttribute('data-tab');
        if (tab === viewName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // 3. Sincronizar estilos activos en Desktop Top Tabs
    document.querySelectorAll('.desktop-nav-btn').forEach(btn => {
        const tab = btn.getAttribute('data-tab');
        if (tab === viewName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // 4. Acciones diferidas para que el navegador pinte el cambio de vista al instante (0ms lag)
    setTimeout(() => {
        if (viewName === 'home') {
            refreshHomeView();
        } else if (viewName === 'catalog') {
            if (!currentLoadedItems || currentLoadedItems.length === 0) {
                loadStats();
            }
        } else if (viewName === 'curator') {
            initCuratorSectionIfNeeded();
        } else if (viewName === 'profile') {
            renderProfileSection();
            renderWrappedTeaser();
        }
    }, 15);

    // Scroll suave hacia el inicio
    window.scrollTo({ top: 0, behavior: 'instant' });
}
window.switchAppView = switchAppView;

async function refreshHomeView() {
    try {
        // 1. Saludo según hora del día y usuario
        const greetingEl = document.getElementById('home-greeting');
        if (greetingEl) {
            const hour = new Date().getHours();
            let greeting = '¡Hola de nuevo!';
            if (hour >= 5 && hour < 12) greeting = 'Buenos días';
            else if (hour >= 12 && hour < 19) greeting = 'Buenas tardes';
            else greeting = 'Buenas noches';

            const lfmUser = (localStorage.getItem('lastfm_user') || '').trim();
            let name = 'Explorador';
            if (isDemoMode()) {
                name = 'Explorador';
            } else if (isAppOwner()) {
                name = 'Rodrigo';
            } else if (lfmUser) {
                name = `@${lfmUser}`;
            } else if (userProfileData && userProfileData.display_name) {
                name = userProfileData.display_name.split(' ')[0];
            }
            greetingEl.innerHTML = `${greeting}, <span style="color: var(--brand-primary);">${escapeHtml(name)}</span>`;
        }

        // 2. Racha en home usando getStreakInfo
        const streakInfo = getStreakInfo();
        const streakCountEl = document.getElementById('home-streak-count');
        if (streakCountEl) streakCountEl.textContent = streakInfo.current;

        // 3. Métricas clave (Streams, Horas, Artistas)
        const db = await getActiveDatabase();
        if (db) {
            if (!engagementInitialized) {
                setTimeout(() => initEngagement(db), 60);
            }
            if (!currentHomeHookQuestion) {
                generateHomeHookGame(db);
            }

            // 4. Tu #1 y Mini-Top 5
            await renderHomeHighlights(db);
        }
    } catch (err) {
        console.error('Error al actualizar Home View:', err);
    }
}

async function renderHomeHighlights(db) {
    const spotlightEl = document.getElementById('home-spotlight-content');
    const miniListEl = document.getElementById('home-top-mini-list');
    if (!db) return;

    try {
        const now = new Date();
        const curY = String(now.getFullYear());
        const curM = String(now.getMonth() + 1);
        const curYM = `month-${curY}-${curM.padStart(2, '0')}`;
        const monthNamesEs = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const currentMonthName = monthNamesEs[now.getMonth()];

        // OJO: Solo canciones del mes EN CURSO para Bento 1 ("#1 EN ROTACIÓN")
        const baseTracks = (db.yearlyTops?.[curY]?.months?.[curM]?.tracks) || [];
        const tracksMap = new Map();
        baseTracks.forEach(t => {
            const artistName = t.artist ? (t.artist.name || t.artist['#text'] || t.artist) : '';
            const k = `${normalizeKey(t.name)}:::${normalizeKey(artistName)}`;
            tracksMap.set(k, {
                name: t.name,
                artist: artistName,
                album: t.album || '',
                plays: t.plays || 0,
                uri: t.uri || null
            });
        });

        // OJO: Artistas del mes EN CURSO para Bento 4 ("TOP 5 ARTISTAS EN ROTACIÓN")
        const baseArtists = (db.yearlyTops?.[curY]?.months?.[curM]?.artists) || [];
        const artistsMap = new Map();
        baseArtists.forEach(a => {
            const aName = a.name || a['#text'] || '';
            if (!aName) return;
            const k = normalizeKey(aName);
            artistsMap.set(k, {
                name: aName,
                plays: a.plays || a.playcount || 0
            });
        });

        // Sumar scrobbles en vivo de Last.fm que pertenezcan ESTRICTAMENTE a este mes actual
        if (Array.isArray(lastFmRecentDelta)) {
            lastFmRecentDelta.forEach(dt => {
                if (!dt.date?.uts) return;
                const d = new Date(parseInt(dt.date.uts, 10) * 1000);
                if (String(d.getFullYear()) !== curY || String(d.getMonth() + 1) !== curM) return;

                const dtName = dt.name;
                const dtArtist = dt.artist ? (dt.artist['#text'] || dt.artist.name || '') : '';
                const dtAlbum = dt.album ? (dt.album['#text'] || dt.album.name || '') : '';

                if (dtName) {
                    const k = `${normalizeKey(dtName)}:::${normalizeKey(dtArtist)}`;
                    const existing = tracksMap.get(k);
                    if (existing) {
                        existing.plays += 1;
                    } else {
                        tracksMap.set(k, {
                            name: dtName,
                            artist: dtArtist,
                            album: dtAlbum,
                            plays: 1,
                            uri: null
                        });
                    }
                }

                if (dtArtist) {
                    const kArt = normalizeKey(dtArtist);
                    const existingArt = artistsMap.get(kArt);
                    if (existingArt) {
                        existingArt.plays += 1;
                    } else {
                        artistsMap.set(kArt, {
                            name: dtArtist,
                            plays: 1
                        });
                    }
                }
            });
        }

        const sorted = Array.from(tracksMap.values()).filter(t => t.plays > 0).sort((a, b) => b.plays - a.plays);
        const sortedArtists = Array.from(artistsMap.values()).filter(a => a.plays > 0).sort((a, b) => b.plays - a.plays);

        // 1. Destacado #1 del mes (Canción en rotación)
        if (spotlightEl) {
            if (sorted.length === 0) {
                spotlightEl.innerHTML = `
                    <div class="d-flex align-items-center gap-3 w-100 py-1">
                        <div class="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width: 52px; height: 52px; background: rgba(168, 85, 247, 0.12); border: 1px dashed rgba(168, 85, 247, 0.35);">
                            <i class="fa-solid fa-compact-disc text-primary fs-5"></i>
                        </div>
                        <div class="overflow-hidden flex-grow-1">
                            <div class="fw-bold text-white text-truncate" style="font-size: 0.95rem;">Inicio de ${currentMonthName}</div>
                            <div class="text-secondary small" style="font-size: 0.74rem;">0 streams este mes. Escucha música para posicionar tu tema #1 en rotación.</div>
                        </div>
                    </div>
                `;
            } else {
                const top1 = sorted[0];
                const top1Key = `track::${normalizeKey(top1.name)}::${normalizeKey(top1.artist)}`;
                const top1Cover = artCache[top1Key] || FALLBACK_ART_SVG;

                spotlightEl.innerHTML = `
                    <div class="position-relative flex-shrink-0">
                        <img id="home-spotlight-img" src="${top1Cover}" class="rounded-4 shadow-lg border border-white border-opacity-15" style="width: 84px; height: 84px; object-fit: cover;" alt="Cover" onerror="safeImgError(this)">
                    </div>
                    <div class="overflow-hidden flex-grow-1" style="min-width: 0;">
                        <div class="fw-bold text-white text-truncate" style="font-size: 1.18rem; letter-spacing: -0.02em;" title="${escapeHtml(top1.name)}">${escapeHtml(top1.name)}</div>
                        <div class="text-secondary text-truncate mb-2" style="font-size: 0.85rem;">${escapeHtml(top1.artist)}</div>
                        <div class="d-flex align-items-center flex-wrap gap-2">
                            <span class="badge rounded-pill px-2.5 py-1" style="background: rgba(191,90,242,0.18); color: #e9d5ff; font-size: 0.72rem; border: 1px solid rgba(191,90,242,0.35);">
                                <i class="fa-solid fa-headphones me-1"></i>${formatNumber(top1.plays)} ${top1.plays === 1 ? 'stream' : 'streams'} (${currentMonthName})
                            </span>
                            <button type="button" class="btn btn-sm btn-outline-light rounded-pill px-2.5 py-0.5" style="font-size: 0.70rem; border-color: rgba(255,255,255,0.18);" onclick="showItemStats('track', '${escapeJsStr(top1.name)}', '${escapeJsStr(top1.artist)}')">
                                <i class="fa-solid fa-chart-simple me-1 text-info"></i>Detalles
                            </button>
                            ${isAppOwner() ? `
                            <button type="button" class="btn btn-sm btn-outline-info rounded-pill px-2.5 py-0.5" style="font-size: 0.70rem;" onclick="openStreamAdjustmentModal('track', '${escapeJsStr(top1.name)}', '${escapeJsStr(top1.artist)}')">
                                <i class="fa-solid fa-sliders me-1"></i>Ajustar
                            </button>` : ''}
                        </div>
                    </div>
                `;

                if (!artCache[top1Key]) {
                    resolveSpotifyArtwork(top1.name, top1.artist, 'track', 'home-spotlight-img');
                }
            }
        }

        // 2. Mini Top 5 Artistas en rotación del mes (Bento 4)
        if (miniListEl) {
            if (sortedArtists.length === 0) {
                miniListEl.innerHTML = `
                    <div class="text-center py-3 text-secondary" style="font-size: 0.74rem;">
                        <i class="fa-regular fa-clock me-1 text-muted"></i>Aún sin artistas en rotación para ${currentMonthName}. Se irá llenando a medida que avances en el mes.
                    </div>
                `;
            } else {
                const top5Artists = sortedArtists.slice(0, 5);
                miniListEl.innerHTML = top5Artists.map((a, idx) => {
                    const aKey = `artist::${normalizeKey(a.name)}::`;
                    const aCover = artCache[aKey] || FALLBACK_ART_SVG;
                    const imgElementId = `home-mini-artist-${idx}`;

                    return `
                        <div class="d-flex align-items-center justify-content-between p-2 rounded-2" style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); cursor: pointer;" onclick="showItemStats('artist', '${escapeJsStr(a.name)}', '')">
                            <div class="d-flex align-items-center gap-2.5 overflow-hidden" style="min-width: 0;">
                                <span class="fw-bold text-secondary text-center flex-shrink-0" style="width: 18px; font-size: 0.78rem;">#${idx + 1}</span>
                                <img id="${imgElementId}" src="${aCover}" class="rounded-circle flex-shrink-0" style="width: 36px; height: 36px; object-fit: cover; border: 1px solid rgba(255, 255, 255, 0.1);" alt="${escapeHtml(a.name)}" onerror="safeImgError(this)">
                                <div class="overflow-hidden" style="min-width: 0;">
                                    <div class="fw-semibold text-white text-truncate" style="font-size: 0.82rem;">${escapeHtml(a.name)}</div>
                                    <div class="text-secondary text-truncate" style="font-size: 0.70rem;">Artista en rotación</div>
                                </div>
                            </div>
                            <span class="badge bg-secondary bg-opacity-25 text-white flex-shrink-0 ms-2" style="font-size: 0.68rem;">${formatNumber(a.plays)} ${a.plays === 1 ? 'play' : 'plays'}</span>
                        </div>
                    `;
                }).join('');

                // Resolver fotos de los artistas de forma asíncrona
                top5Artists.forEach((a, idx) => {
                    const aKey = `artist::${normalizeKey(a.name)}::`;
                    const imgElementId = `home-mini-artist-${idx}`;
                    if (!artCache[aKey]) {
                        resolveSpotifyArtwork(a.name, '', 'artist', imgElementId);
                    }
                });
            }
        }

        // 3. Mini Top 5 Canciones en rotación del mes (Bento 4)
        const tracksMiniListEl = document.getElementById('home-top-tracks-mini-list');
        if (tracksMiniListEl) {
            if (sorted.length === 0) {
                tracksMiniListEl.innerHTML = `
                    <div class="text-center py-3 text-secondary" style="font-size: 0.74rem;">
                        <i class="fa-regular fa-clock me-1 text-muted"></i>Aún sin canciones en rotación para ${currentMonthName}. Se irá llenando a medida que avances en el mes.
                    </div>
                `;
            } else {
                const top5Tracks = sorted.slice(0, 5);
                tracksMiniListEl.innerHTML = top5Tracks.map((t, idx) => {
                    const tKey = `track::${normalizeKey(t.name)}::${normalizeKey(t.artist)}`;
                    const tCover = artCache[tKey] || FALLBACK_ART_SVG;
                    const imgElementId = `home-mini-track-${idx}`;

                    return `
                        <div class="d-flex align-items-center justify-content-between p-2 rounded-2" style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); cursor: pointer;" onclick="showItemStats('track', '${escapeJsStr(t.name)}', '${escapeJsStr(t.artist)}')">
                            <div class="d-flex align-items-center gap-2.5 overflow-hidden" style="min-width: 0;">
                                <span class="fw-bold text-secondary text-center flex-shrink-0" style="width: 18px; font-size: 0.78rem;">#${idx + 1}</span>
                                <img id="${imgElementId}" src="${tCover}" class="rounded-2 flex-shrink-0" style="width: 36px; height: 36px; object-fit: cover; border: 1px solid rgba(255, 255, 255, 0.1);" alt="${escapeHtml(t.name)}" onerror="safeImgError(this)">
                                <div class="overflow-hidden" style="min-width: 0;">
                                    <div class="fw-semibold text-white text-truncate" style="font-size: 0.82rem;" title="${escapeHtml(t.name)}">${escapeHtml(t.name)}</div>
                                    <div class="text-secondary text-truncate" style="font-size: 0.70rem;" title="${escapeHtml(t.artist)}">${escapeHtml(t.artist)}</div>
                                </div>
                            </div>
                            <span class="badge bg-secondary bg-opacity-25 text-white flex-shrink-0 ms-2" style="font-size: 0.68rem;">${formatNumber(t.plays)} ${t.plays === 1 ? 'stream' : 'streams'}</span>
                        </div>
                    `;
                }).join('');

                // Resolver fotos de los tracks de forma asíncrona
                top5Tracks.forEach((t, idx) => {
                    const tKey = `track::${normalizeKey(t.name)}::${normalizeKey(t.artist)}`;
                    const imgElementId = `home-mini-track-${idx}`;
                    if (!artCache[tKey]) {
                        resolveSpotifyArtwork(t.name, t.artist, 'track', imgElementId);
                    }
                });
            }
        }
    } catch (err) {
        console.error('Error renderizando highlights del home:', err);
    }
}

async function renderProfileSection() {
    const container = document.getElementById('profile-section-content');
    if (!container) return;
    if (lastEngagementInfo) {
        renderProgressModal(lastEngagementInfo);
        refreshEngagement();
    } else {
        container.innerHTML = '<div class="text-center py-4 text-secondary"><span class="spinner-border spinner-border-sm me-2 text-primary"></span>Cargando perfil y progreso...</div>';
        const db = await getActiveDatabase();
        if (db) await initEngagement(db);
        await refreshEngagement();
    }
}

// Exponer funciones interactivas globalmente
window.openProfileSection = openProfileSection;
window.rerollDailyChallenge = rerollDailyChallenge;
window.selectCapsuleYear = selectCapsuleYear;
window.handleTriviaAnswer = handleTriviaAnswer;
window.advanceTriviaQuestion = advanceTriviaQuestion;
window.toggleErasRacePlay = toggleErasRacePlay;
window.scrubErasRace = scrubErasRace;
window.resetErasRace = resetErasRace;
window.showArtistMilestoneCelebration = showArtistMilestoneCelebration;

// Inicializar estado de Supabase en UI al arrancar
updateCloudUI('active');

window.openGoogleDriveModal = openGoogleDriveModal;
window.saveToCloudDatabase = saveToCloudDatabase;
window.loadFromCloudDatabase = loadFromCloudDatabase;
window.saveToGoogleDrive = saveToCloudDatabase;
window.loadFromGoogleDrive = loadFromCloudDatabase;
window.triggerGoogleDriveAutoSync = triggerGoogleDriveAutoSync;
window.promptAndSaveCuratorToCloud = promptAndSaveCuratorToCloud;



// ====================================================
// MEJORA 5 & 6: COMPARADOR DE PERIODOS Y EXPORTACIÓN
// ====================================================

function getPeriodStatsHelper(db, periodKey) {
    if (!db || !db.yearlyTops) return { plays: 0, hours: 0, artists: [], label: periodKey };
    const deltaCount = (currentSource === 'unified') ? lastFmRecentDelta.length : 0;
    const deltaHours = deltaCount * (3.5 / 60);

    if (periodKey.startsWith('month-')) {
        const parts = periodKey.split('-');
        const y = parts[1];
        const m = parts[2];
        const mData = db.yearlyTops?.[y]?.months?.[m];
        if (!mData) return { plays: 0, hours: 0, artists: [], label: `${MONTH_NAMES[parseInt(m,10)-1]} ${y}` };
        const extra = (y === '2026' && m === '10') ? deltaCount : 0;
        const extraH = (y === '2026' && m === '10') ? deltaHours : 0;
        const plays = (mData.plays || 0) + extra;
        const hours = (parseFloat(mData.hours || 0) || (plays * 3.5 / 60)) + extraH;
        return {
            plays,
            hours,
            artists: mData.artists || [],
            label: `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`
        };
    } else if (periodKey.startsWith('year-')) {
        const y = periodKey.replace('year-', '');
        const yData = db.yearlyTops?.[y];
        if (!yData) return { plays: 0, hours: 0, artists: [], label: `Año ${y}` };
        const extra = (y === '2026') ? deltaCount : 0;
        const extraH = (y === '2026') ? deltaHours : 0;
        const plays = (yData.plays || 0) + extra;
        const hours = (parseFloat(yData.hours || 0) || (plays * 3.5 / 60)) + extraH;
        return {
            plays,
            hours,
            artists: yData.artists || [],
            label: `Año ${y}`
        };
    }
    return { plays: 0, hours: 0, artists: [], label: periodKey };
}

async function openPeriodComparisonModal() {
    const modalEl = document.getElementById('comparePeriodsModal');
    if (!modalEl) return;
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();

    const selectA = document.getElementById('compare-period-a');
    const selectB = document.getElementById('compare-period-b');
    const db = await getActiveDatabase();

    if (db && db.yearlyTops && selectA && selectB && !selectA.dataset.populated) {
        selectA.dataset.populated = 'true';
        const years = Object.keys(db.yearlyTops).filter(y => /^\d{4}$/.test(y)).sort((a, b) => b.localeCompare(a));
        const monthOpts = [];
        const yearOpts = [];

        years.forEach(y => {
            yearOpts.push(`<option value="year-${y}">Año ${y} completo</option>`);
            const mObj = db.yearlyTops[y]?.months || {};
            const mKeys = Object.keys(mObj).map(Number).sort((a, b) => b - a);
            mKeys.forEach(m => {
                if ((mObj[m]?.plays || 0) > 0) {
                    monthOpts.push(`<option value="month-${y}-${m}">${MONTH_NAMES[m - 1]} ${y}</option>`);
                }
            });
        });

        const optionsHtml = `
            <optgroup label="📅 Años Completos">
                ${yearOpts.join('')}
            </optgroup>
            <optgroup label="🗓️ Meses Registrados">
                ${monthOpts.join('')}
            </optgroup>
        `;
        selectA.innerHTML = optionsHtml;
        selectB.innerHTML = optionsHtml;
        if (selectA.options.length > 0) selectA.selectedIndex = 0;
        if (selectB.options.length > 1) selectB.selectedIndex = 1;
    }

    if (selectA && !selectA.dataset.bound) {
        selectA.dataset.bound = 'true';
        selectA.addEventListener('change', runPeriodComparison);
    }
    if (selectB && !selectB.dataset.bound) {
        selectB.dataset.bound = 'true';
        selectB.addEventListener('change', runPeriodComparison);
    }

    await runPeriodComparison();
}
window.openPeriodComparisonModal = openPeriodComparisonModal;

async function runPeriodComparison() {
    const container = document.getElementById('compare-results-container');
    if (!container) return;

    const selectA = document.getElementById('compare-period-a');
    const selectB = document.getElementById('compare-period-b');
    const valA = selectA?.value || 'month-2026-10';
    const valB = selectB?.value || 'month-2026-9';

    const db = await getActiveDatabase();
    if (!db) {
        container.innerHTML = '<div class="text-center py-4 text-danger">No se pudo cargar la base de datos para comparar.</div>';
        return;
    }

    const dataA = getPeriodStatsHelper(db, valA);
    const dataB = getPeriodStatsHelper(db, valB);

    // Cálculos de variación %
    const playsDiff = dataA.plays - dataB.plays;
    const playsPct = dataB.plays > 0 ? ((playsDiff / dataB.plays) * 100).toFixed(1) : (dataA.plays > 0 ? '+100' : '0');
    const playsPctSign = playsDiff >= 0 ? '+' : '';

    const hoursDiff = dataA.hours - dataB.hours;
    const hoursPct = dataB.hours > 0 ? ((hoursDiff / dataB.hours) * 100).toFixed(1) : (dataA.hours > 0 ? '+100' : '0');
    const hoursPctSign = hoursDiff >= 0 ? '+' : '';

    // Mapeo de ranking de artistas
    const mapRankA = new Map();
    dataA.artists.forEach((art, idx) => {
        const name = art.name || art.artist || '';
        if (name) mapRankA.set(name.toLowerCase(), { rank: idx + 1, plays: art.plays || 0, origName: name });
    });

    const mapRankB = new Map();
    dataB.artists.forEach((art, idx) => {
        const name = art.name || art.artist || '';
        if (name) mapRankB.set(name.toLowerCase(), { rank: idx + 1, plays: art.plays || 0, origName: name });
    });

    // Encontrar artistas que subieron, bajaron o son nuevos
    const movers = [];
    mapRankA.forEach((infoA, key) => {
        const infoB = mapRankB.get(key);
        if (infoB) {
            const rankDelta = infoB.rank - infoA.rank; // positivo = subió posiciones
            movers.push({
                name: infoA.origName,
                rankA: infoA.rank,
                rankB: infoB.rank,
                rankDelta,
                playsA: infoA.plays,
                playsB: infoB.plays,
                type: rankDelta > 0 ? 'up' : (rankDelta < 0 ? 'down' : 'same')
            });
        } else {
            movers.push({
                name: infoA.origName,
                rankA: infoA.rank,
                rankB: null,
                rankDelta: 999,
                playsA: infoA.plays,
                playsB: 0,
                type: 'new'
            });
        }
    });

    const artistsUp = movers.filter(m => m.type === 'up' || m.type === 'new').sort((a, b) => b.rankDelta - a.rankDelta).slice(0, 6);
    const artistsDown = movers.filter(m => m.type === 'down').sort((a, b) => a.rankDelta - b.rankDelta).slice(0, 6);

    const playsClass = playsDiff >= 0 ? 'text-success' : 'text-danger';
    const playsBadgeBg = playsDiff >= 0 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)';
    const playsBadgeColor = playsDiff >= 0 ? '#4ade80' : '#f87171';

    const hoursClass = hoursDiff >= 0 ? 'text-success' : 'text-danger';
    const hoursBadgeBg = hoursDiff >= 0 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)';
    const hoursBadgeColor = hoursDiff >= 0 ? '#4ade80' : '#f87171';

    container.innerHTML = `
        <!-- Tarjetas de Variación Global -->
        <div class="row g-2 mb-3">
            <div class="col-6">
                <div class="home-card p-3 text-center">
                    <span class="text-secondary" style="font-size: 0.70rem; text-transform: uppercase; font-weight: 700;">Streams Reproducidos</span>
                    <div class="d-flex align-items-baseline justify-content-center gap-1.5 mt-1">
                        <span class="fw-bold text-white fs-5">${dataA.plays.toLocaleString()}</span>
                        <span class="text-secondary small">vs ${dataB.plays.toLocaleString()}</span>
                    </div>
                    <div class="mt-2">
                        <span class="badge rounded-pill px-2 py-1" style="background: ${playsBadgeBg}; color: ${playsBadgeColor}; font-size: 0.74rem;">
                            <i class="fa-solid ${playsDiff >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'} me-1"></i>
                            ${playsPctSign}${playsPct}% (${playsDiff >= 0 ? '+' : ''}${playsDiff.toLocaleString()})
                        </span>
                    </div>
                </div>
            </div>
            <div class="col-6">
                <div class="home-card p-3 text-center">
                    <span class="text-secondary" style="font-size: 0.70rem; text-transform: uppercase; font-weight: 700;">Horas Escuchadas</span>
                    <div class="d-flex align-items-baseline justify-content-center gap-1.5 mt-1">
                        <span class="fw-bold text-white fs-5">${Math.round(dataA.hours).toLocaleString()} h</span>
                        <span class="text-secondary small">vs ${Math.round(dataB.hours).toLocaleString()} h</span>
                    </div>
                    <div class="mt-2">
                        <span class="badge rounded-pill px-2 py-1" style="background: ${hoursBadgeBg}; color: ${hoursBadgeColor}; font-size: 0.74rem;">
                            <i class="fa-solid ${hoursDiff >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'} me-1"></i>
                            ${hoursPctSign}${hoursPct}% (${hoursDiff >= 0 ? '+' : ''}${hoursDiff.toFixed(1)} h)
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Mapeo de Movimientos de Artistas -->
        <div class="row g-2">
            <!-- Artistas en Alza / Nuevos -->
            <div class="col-12 col-md-6">
                <div class="home-card p-2.5 h-100">
                    <div class="d-flex align-items-center justify-content-between mb-2 pb-1 border-bottom border-secondary border-opacity-10">
                        <span class="fw-bold text-success" style="font-size: 0.78rem;">
                            <i class="fa-solid fa-arrow-trend-up me-1"></i> Subieron o Entraron al Top
                        </span>
                        <span class="badge bg-success bg-opacity-25 text-success" style="font-size: 0.65rem;">Top Alzas</span>
                    </div>
                    <div class="d-flex flex-column gap-1.5">
                        ${artistsUp.length === 0 ? '<div class="text-secondary small text-center py-2">Sin cambios notables</div>' : ''}
                        ${artistsUp.map(art => `
                            <div class="d-flex align-items-center justify-content-between p-1.5 rounded" style="background: rgba(255,255,255,0.02);">
                                <div class="overflow-hidden me-2" style="min-width: 0;">
                                    <div class="fw-semibold text-white text-truncate" style="font-size: 0.80rem;">${escapeHtml(art.name)}</div>
                                    <small class="text-secondary" style="font-size: 0.68rem;">${art.playsA} streams en ${dataA.label}</small>
                                </div>
                                <span class="badge rounded-pill flex-shrink-0" style="background: rgba(34,197,94,0.15); color: #4ade80; font-size: 0.70rem;">
                                    ${art.type === 'new' ? '<i class="fa-solid fa-sparkles me-1"></i>Nuevo' : `+${art.rankDelta} pos (#${art.rankA})`}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Artistas que Bajaron -->
            <div class="col-12 col-md-6">
                <div class="home-card p-2.5 h-100">
                    <div class="d-flex align-items-center justify-content-between mb-2 pb-1 border-bottom border-secondary border-opacity-10">
                        <span class="fw-bold text-danger" style="font-size: 0.78rem;">
                            <i class="fa-solid fa-arrow-trend-down me-1"></i> Bajaron Posiciones
                        </span>
                        <span class="badge bg-danger bg-opacity-25 text-danger" style="font-size: 0.65rem;">Top Descensos</span>
                    </div>
                    <div class="d-flex flex-column gap-1.5">
                        ${artistsDown.length === 0 ? '<div class="text-secondary small text-center py-2">Sin descensos notables</div>' : ''}
                        ${artistsDown.map(art => `
                            <div class="d-flex align-items-center justify-content-between p-1.5 rounded" style="background: rgba(255,255,255,0.02);">
                                <div class="overflow-hidden me-2" style="min-width: 0;">
                                    <div class="fw-semibold text-white text-truncate" style="font-size: 0.80rem;">${escapeHtml(art.name)}</div>
                                    <small class="text-secondary" style="font-size: 0.68rem;">#${art.rankA} (antes #${art.rankB})</small>
                                </div>
                                <span class="badge rounded-pill flex-shrink-0" style="background: rgba(239,68,68,0.15); color: #f87171; font-size: 0.70rem;">
                                    ${art.rankDelta} pos
                                </span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}
window.runPeriodComparison = runPeriodComparison;

// ----------------------------------------------------
// TAREA 6: EXPORTACIÓN DEL TOP ACTUAL A CSV Y JSON
// ----------------------------------------------------
function exportCurrentTop(format = 'csv') {
    if (!currentLoadedItems || currentLoadedItems.length === 0) {
        alert('No hay elementos cargados en el listado para exportar.');
        return;
    }

    const typeLabel = currentType === 'tracks' ? 'canciones' : (currentType === 'artists' ? 'artistas' : (currentType === 'albums' ? 'albumes' : 'recientes'));
    const periodLabel = getRangeLabel(currentRange).replace(/[^a-zA-Z0-9_-]/g, '_');
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `SpotiTracker_${typeLabel}_${periodLabel}_${timestamp}.${format}`;

    if (format === 'json') {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentLoadedItems, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', filename);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        return;
    }

    // CSV format
    let csvRows = [];
    if (currentType === 'tracks') {
        csvRows.push(['Posicion', 'Cancion', 'Artista', 'Album', 'Streams', 'URI']);
        currentLoadedItems.forEach((t, i) => {
            const artist = t.artist ? (t.artist.name || t.artist['#text'] || t.artist) : '';
            const album = t.album ? (t.album['#text'] || t.album.name || t.album) : '';
            csvRows.push([
                i + 1,
                `"${(t.name || '').replace(/"/g, '""')}"`,
                `"${(artist || '').replace(/"/g, '""')}"`,
                `"${(album || '').replace(/"/g, '""')}"`,
                t.playcount || t.plays || 0,
                `"${t.uri || ''}"`
            ]);
        });
    } else if (currentType === 'artists') {
        csvRows.push(['Posicion', 'Artista', 'Streams']);
        currentLoadedItems.forEach((a, i) => {
            csvRows.push([
                i + 1,
                `"${(a.name || '').replace(/"/g, '""')}"`,
                a.playcount || a.plays || 0
            ]);
        });
    } else if (currentType === 'albums') {
        csvRows.push(['Posicion', 'Album', 'Artista', 'Streams']);
        currentLoadedItems.forEach((alb, i) => {
            const artist = alb.artist ? (alb.artist.name || alb.artist['#text'] || alb.artist) : '';
            csvRows.push([
                i + 1,
                `"${(alb.name || '').replace(/"/g, '""')}"`,
                `"${(artist || '').replace(/"/g, '""')}"`,
                alb.playcount || alb.plays || 0
            ]);
        });
    } else {
        csvRows.push(['Posicion', 'Cancion', 'Artista', 'Fecha/Hora']);
        currentLoadedItems.forEach((r, i) => {
            const artist = r.artist ? (r.artist['#text'] || r.artist.name || r.artist) : '';
            const dateStr = r.date ? (r.date['#text'] || new Date(r.date.uts * 1000).toLocaleString()) : '';
            csvRows.push([
                i + 1,
                `"${(r.name || '').replace(/"/g, '""')}"`,
                `"${(artist || '').replace(/"/g, '""')}"`,
                `"${dateStr}"`
            ]);
        });
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.map(e => e.join(',')).join('\n'));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', csvContent);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}
window.exportCurrentTop = exportCurrentTop;

// ----------------------------------------------------
// MINI RETO INTERACTIVO / GANCHO EN PORTADA (HOME HOOK)
// ----------------------------------------------------
let currentHomeHookQuestion = null;

async function generateHomeHookGame(db) {
    const container = document.getElementById('home-hook-body');
    if (!container) return;

    if (!db) {
        try {
            db = await getActiveDatabase();
        } catch (e) {
            console.warn('No se pudo cargar la base para el mini reto:', e);
        }
    }
    if (!db) return;

    const yearlyTops = db.yearlyTops || {};
    const overallTracks = yearlyTops.overall?.tracks || [];
    const overallArtists = yearlyTops.overall?.artists || [];

    if (overallTracks.length < 5) {
        container.innerHTML = '<span class="text-secondary small">Cargando biblioteca musical para tu desafío...</span>';
        return;
    }

    // Modalidades de reto al azar:
    // 0: ¿Cuál de estas 3 canciones has escuchado MÁS veces?
    // 1: ¿A qué artista pertenece esta canción de tu historial?
    // 2: ¿Cuál de estos 3 artistas tiene más reproducciones en tu historia?
    const mode = Math.floor(Math.random() * 3);

    if (mode === 0) {
        // Modo: ¿Cuál canción tiene más streams?
        // Elegir 3 canciones con diferente rango de plays
        const shuffled = [...overallTracks].sort(() => 0.5 - Math.random()).slice(0, 3);
        shuffled.sort((a, b) => (b.plays || 0) - (a.plays || 0));
        const winner = shuffled[0];
        
        // Mezclar las opciones visualmente
        const options = [...shuffled].sort(() => 0.5 - Math.random());
        currentHomeHookQuestion = {
            type: 'plays_track',
            winnerId: winner.name + ':::' + (winner.artist?.name || winner.artist || ''),
            winnerPlays: winner.plays || 0
        };

        container.innerHTML = `
            <div class="mb-2.5">
                <div class="fw-bold text-white mb-1" style="font-size: 0.88rem;">
                    🔥 ¿Cuál de estas canciones has escuchado <span class="text-warning text-decoration-underline">más veces</span>?
                </div>
                <small class="text-secondary" style="font-size: 0.72rem;">Elige una opción para comprobar tus números:</small>
            </div>
            <div class="hook-options-grid" id="hook-options-container">
                ${options.map((opt, i) => {
                    const optId = opt.name + ':::' + (opt.artist?.name || opt.artist || '');
                    const optArtist = opt.artist?.name || opt.artist || '';
                    return `
                        <button type="button" class="btn btn-sm btn-dark text-start p-2 rounded-2 d-flex align-items-center justify-content-between border border-secondary border-opacity-25" style="font-size: 0.78rem; transition: all 0.2s;" onclick="handleHomeHookAnswer('${escapeHtml(optId)}', ${opt.plays || 0})">
                            <span class="text-truncate me-2">
                                <strong class="text-white">${escapeHtml(opt.name)}</strong>
                                <span class="text-secondary ms-1">· ${escapeHtml(optArtist)}</span>
                            </span>
                            <i class="fa-regular fa-circle-question text-secondary flex-shrink-0"></i>
                        </button>
                    `;
                }).join('')}
            </div>
        `;
    } else if (mode === 1) {
        // Modo: Adivina el artista de una canción top
        const candidateTracks = overallTracks.filter(t => (t.artist?.name || t.artist) && t.name).slice(0, 80);
        const randomTrack = candidateTracks[Math.floor(Math.random() * candidateTracks.length)];
        const correctArtist = randomTrack.artist?.name || randomTrack.artist;

        // Escoger 2 artistas falsos
        const otherArtists = overallArtists
            .map(a => a.name || a['#text'] || a)
            .filter(a => a && a !== correctArtist)
            .sort(() => 0.5 - Math.random())
            .slice(0, 2);

        const options = [correctArtist, ...otherArtists].sort(() => 0.5 - Math.random());
        currentHomeHookQuestion = {
            type: 'guess_artist',
            winnerId: correctArtist,
            trackName: randomTrack.name
        };

        container.innerHTML = `
            <div class="mb-2.5">
                <div class="fw-bold text-white mb-1" style="font-size: 0.88rem;">
                    🎵 ¿Quién canta tu tema top <span class="text-info">"${escapeHtml(randomTrack.name)}"</span>?
                </div>
                <small class="text-secondary" style="font-size: 0.72rem;">Selecciona el artista correcto:</small>
            </div>
            <div class="hook-options-grid" id="hook-options-container">
                ${options.map(art => {
                    return `
                        <button type="button" class="btn btn-sm btn-dark text-start p-2 rounded-2 d-flex align-items-center justify-content-between border border-secondary border-opacity-25" style="font-size: 0.78rem; transition: all 0.2s;" onclick="handleHomeHookAnswer('${escapeHtml(art)}', 0)">
                            <span class="text-white fw-semibold text-truncate me-2">${escapeHtml(art)}</span>
                            <i class="fa-regular fa-circle-question text-secondary flex-shrink-0"></i>
                        </button>
                    `;
                }).join('')}
            </div>
        `;
    } else {
        // Modo: ¿Cuál de estos 3 artistas tiene más reproducciones?
        const shuffled = [...overallArtists].filter(a => a.plays || a.playcount).sort(() => 0.5 - Math.random()).slice(0, 3);
        shuffled.sort((a, b) => ((b.plays || b.playcount || 0) - (a.plays || a.playcount || 0)));
        const winner = shuffled[0];
        const winnerName = winner.name || winner['#text'] || winner;
        const winnerPlays = winner.plays || winner.playcount || 0;

        const options = [...shuffled].sort(() => 0.5 - Math.random());
        currentHomeHookQuestion = {
            type: 'plays_artist',
            winnerId: winnerName,
            winnerPlays: winnerPlays
        };

        container.innerHTML = `
            <div class="mb-2.5">
                <div class="fw-bold text-white mb-1" style="font-size: 0.88rem;">
                    👑 ¿Cuál artista tiene <span class="text-primary text-decoration-underline">más reproducciones</span> en tu historial?
                </div>
                <small class="text-secondary" style="font-size: 0.72rem;">Elige a tu rey o reina de streams:</small>
            </div>
            <div class="hook-options-grid" id="hook-options-container">
                ${options.map(opt => {
                    const name = opt.name || opt['#text'] || opt;
                    const plays = opt.plays || opt.playcount || 0;
                    return `
                        <button type="button" class="btn btn-sm btn-dark text-start p-2 rounded-2 d-flex align-items-center justify-content-between border border-secondary border-opacity-25" style="font-size: 0.78rem; transition: all 0.2s;" onclick="handleHomeHookAnswer('${escapeHtml(name)}', ${plays})">
                            <span class="text-white fw-semibold text-truncate me-2">${escapeHtml(name)}</span>
                            <i class="fa-regular fa-circle-question text-secondary flex-shrink-0"></i>
                        </button>
                    `;
                }).join('')}
            </div>
        `;
    }
}

function handleHomeHookAnswer(selectedId, selectedPlays) {
    if (!currentHomeHookQuestion) return;
    const container = document.getElementById('home-hook-body');
    if (!container) return;

    const isCorrect = selectedId === currentHomeHookQuestion.winnerId;

    if (isCorrect) {
        if (typeof confetti === 'function') {
            confetti({ particleCount: 40, spread: 60, origin: { y: 0.3 } });
        }
    }

    let detailMsg = '';
    if (currentHomeHookQuestion.type === 'plays_track') {
        detailMsg = `Tiene <strong>${formatNumber(currentHomeHookQuestion.winnerPlays)}</strong> reproducciones en tu cuenta.`;
    } else if (currentHomeHookQuestion.type === 'guess_artist') {
        detailMsg = `El artista correcto es <strong>${escapeHtml(currentHomeHookQuestion.winnerId)}</strong>.`;
    } else {
        detailMsg = `Tiene un total de <strong>${formatNumber(currentHomeHookQuestion.winnerPlays)}</strong> streams registrados.`;
    }

    container.innerHTML = `
        <div class="p-3 rounded-2 text-center ${isCorrect ? 'bg-success bg-opacity-15 border border-success border-opacity-40' : 'bg-danger bg-opacity-15 border border-danger border-opacity-40'}">
            <div class="fs-4 mb-1">${isCorrect ? '🎉 ¡Acertaste!' : '😅 ¡Casi!'}</div>
            <div class="text-white small mb-2">${detailMsg}</div>
            <button type="button" class="btn btn-sm btn-outline-brand rounded-pill px-3 py-1 fw-semibold text-white" style="font-size: 0.76rem;" onclick="generateHomeHookGame()">
                <i class="fa-solid fa-play me-1"></i> Siguiente desafío
            </button>
        </div>
    `;
}
window.generateHomeHookGame = generateHomeHookGame;
window.handleHomeHookAnswer = handleHomeHookAnswer;

// ----------------------------------------------------
// WRAPPED DE DICIEMBRE: PISTAS QUINCENALES (en Mi Progreso)
// ----------------------------------------------------
const WRAPPED_HINTS_KEY = 'spotitracker_wrapped_hints_v1';
const MESES_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function getWrappedState() {
    try {
        const s = JSON.parse(localStorage.getItem(WRAPPED_HINTS_KEY) || '{}');
        return { used: s.used || {} };
    } catch (e) { return { used: {} }; }
}
function saveWrappedState(st) {
    try { localStorage.setItem(WRAPPED_HINTS_KEY, JSON.stringify(st)); } catch (e) {}
}
function getQuincenaInfo(date = new Date()) {
    const y = date.getFullYear();
    const m = date.getMonth();
    const half = date.getDate() <= 15 ? 1 : 2;
    const next = half === 1 ? new Date(y, m, 16, 0, 0, 0) : new Date(y, m + 1, 1, 0, 0, 0);
    return { key: `${y}-${String(m + 1).padStart(2, '0')}-Q${half}`, ordinal: y * 24 + m * 2 + half, next };
}

function entryName(x) {
    if (!x) return '';
    if (typeof x === 'string') return x;
    return x.name || x['#text'] || '';
}
function entryArtist(x) {
    if (!x || !x.artist) return '';
    return typeof x.artist === 'string' ? x.artist : (x.artist.name || x.artist['#text'] || '');
}

function buildWrappedHints(db) {
    const hints = [];
    const y2026 = db?.yearlyTops?.['2026'] || {};
    const tracks = (y2026.tracks || []).slice();
    const artists = (y2026.artists || []).slice();
    const albums = (y2026.albums || []).slice();

    // Sumar escuchas recientes (delta Last.fm) a las listas del año
    const addDelta = (list, keyFn, nameFn) => {
        const map = new Map(list.map(it => [keyFn(it), { ...it, plays: it.plays || 0 }]));
        (lastFmRecentDelta || []).forEach(t => {
            if (!t?.date?.uts) return;
            const nm = nameFn(t);
            if (!nm) return;
            const k = normalizeKey(nm.name) + ':::' + normalizeKey(nm.artist || '');
            if (map.has(k)) map.get(k).plays += 1;
            else map.set(k, { name: nm.name, artist: nm.artist, plays: 1 });
        });
        return Array.from(map.values()).sort((a, b) => (b.plays || 0) - (a.plays || 0));
    };
    const trackList = addDelta(tracks, it => normalizeKey(entryName(it)) + ':::' + normalizeKey(entryArtist(it)),
        t => ({ name: t.name, artist: t.artist ? (t.artist['#text'] || t.artist.name || '') : '' }));
    const artistMap = new Map();
    artists.forEach(a => artistMap.set(normalizeKey(entryName(a)), { name: entryName(a), plays: a.plays || 0 }));
    (lastFmRecentDelta || []).forEach(t => {
        if (!t?.date?.uts) return;
        const an = t.artist ? (t.artist['#text'] || t.artist.name || '') : '';
        if (!an) return;
        const k = normalizeKey(an);
        if (artistMap.has(k)) artistMap.get(k).plays += 1; else artistMap.set(k, { name: an, plays: 1 });
    });
    const artistList = Array.from(artistMap.values()).sort((a, b) => b.plays - a.plays);

    if (artistList[0]) {
        const n = artistList[0].name;
        hints.push(`Tu artista #1 de 2026 empieza con la letra «${n.charAt(0).toUpperCase()}» y su nombre tiene ${n.length} caracteres.`);
    }
    if (trackList[0]) {
        const floor = Math.max(10, Math.floor((trackList[0].plays || 0) / 10) * 10);
        hints.push(`Tu canción del año ya superó las ${formatNumber(floor)} reproducciones… y sigue sumando.`);
    }
    if (artistList.length >= 5) {
        const pick = artistList[1 + (new Date().getDate() % 4)];
        hints.push(`Uno de tus 5 artistas más escuchados de 2026 es «${pick.name}». ¿En qué lugar quedará?`);
    }
    if (albums.length) {
        const al = albums[0];
        const an = entryArtist(al);
        if (an) hints.push(`Tu álbum más escuchado de 2026 es de «${an}».`);
    }
    const months = y2026.months || {};
    const monthTotals = Object.entries(months).map(([mk, v]) => {
        const sum = (v?.tracks || []).reduce((acc, t) => acc + (t.plays || 0), 0);
        return [parseInt(mk, 10), sum];
    }).filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1]);
    if (monthTotals.length) {
        hints.push(`Tu mes más intenso de 2026 hasta ahora fue ${MESES_ES[monthTotals[0][0] - 1]}.`);
    }
    if (trackList.length) {
        hints.push(`Ya escuchaste al menos ${formatNumber(trackList.length)} canciones distintas en 2026. El Wrapped las pondrá en orden.`);
    }
    hints.push('El Wrapped llegará en diciembre con tu canción del año, tus artistas top, tu mes pico y un final sorpresa.');
    return hints;
}

function renderWrappedTeaser() {
    const box = document.getElementById('wrapped-teaser');
    if (!box) return;

    if (isDemoMode()) {
        box.innerHTML = '';
        return;
    }

    const wrappedStatus = getUserFeatureStatus('wrapped');
    if (wrappedStatus !== 'approved') {
        const isPending = wrappedStatus === 'pending';
        box.innerHTML = `
            <div class="p-3 rounded-3" style="background: linear-gradient(135deg, rgba(168,85,247,0.14), rgba(236,72,153,0.08)); border: 1px solid rgba(168,85,247,0.35);">
                <div class="d-flex align-items-center justify-content-between gap-3 flex-wrap">
                    <div style="min-width: 0;">
                        <div class="fw-bold text-white" style="font-size: 0.95rem;"><i class="fa-solid fa-gift text-warning me-2"></i>Wrapped 2026 & Pistas Musicales</div>
                        <div class="text-secondary mt-1" style="font-size: 0.76rem;">
                            ${isPending
                                ? '⏳ Solicitud enviada. Esperando aprobación del administrador para desbloquear tus pistas.'
                                : '🔒 Función exclusiva bajo aprobación del administrador.'}
                        </div>
                    </div>
                    <button type="button" class="btn btn-sm ${isPending ? 'btn-outline-warning' : 'btn-brand'} rounded-pill px-3 py-1.5 fw-semibold text-nowrap" style="font-size: 0.78rem;" onclick="openFeatureRequestModal('wrapped')">
                        <i class="fa-solid ${isPending ? 'fa-clock' : 'fa-paper-plane'} me-1"></i>${isPending ? 'Ver Estado' : 'Solicitar Acceso'}
                    </button>
                </div>
            </div>
        `;
        return;
    }

    const q = getQuincenaInfo();
    const st = getWrappedState();
    const used = !!st.used[q.key];
    const msLeft = q.next.getTime() - Date.now();
    const daysLeft = Math.max(1, Math.ceil(msLeft / 86400000));
    const nextLabel = `${q.next.getDate()} de ${MESES_ES[q.next.getMonth()]}`;
    const hintCount = Object.keys(st.used).length;
    const status = used
        ? `Ya viste la pista de esta quincena. Próxima: <strong class="text-white">${nextLabel}</strong> (en ${daysLeft} día${daysLeft === 1 ? '' : 's'}).`
        : '¡Tienes una pista disponible esta quincena!';

    box.innerHTML = `
        <div class="p-3 rounded-3" style="background: linear-gradient(135deg, rgba(168,85,247,0.18), rgba(236,72,153,0.10)); border: 1px solid rgba(168,85,247,0.4);">
            <div class="d-flex align-items-center justify-content-between gap-3 flex-wrap">
                <div style="min-width: 0;">
                    <div class="fw-bold text-white" style="font-size: 0.95rem;"><i class="fa-solid fa-gift text-primary me-2"></i>Wrapped 2026 · Se está cocinando 🍳</div>
                    <div class="text-secondary mt-1" style="font-size: 0.76rem;">${status}</div>
                    <div class="text-secondary" style="font-size: 0.70rem;">Pistas descubiertas: ${hintCount} · 2 por mes (1 por quincena)</div>
                </div>
                <button type="button" class="btn btn-sm ${used ? 'btn-outline-light' : 'btn-brand'} rounded-pill px-3 py-1.5 fw-semibold text-nowrap" style="font-size: 0.78rem;" onclick="openWrappedHint()">
                    <i class="fa-solid ${used ? 'fa-eye' : 'fa-magnifying-glass'} me-1"></i>${used ? 'Ver mis pistas' : 'Descubrir pista'}
                </button>
            </div>
        </div>
    `;
}

async function openWrappedHint() {
    if (isDemoMode()) return;
    if (getUserFeatureStatus('wrapped') !== 'approved') {
        openFeatureRequestModal('wrapped');
        return;
    }

    const q = getQuincenaInfo();
    const st = getWrappedState();
    const alreadyUsed = !!st.used[q.key];

    let hint = st.used[q.key]?.text || '';
    if (!alreadyUsed) {
        let db = null;
        try { db = await getActiveDatabase(); } catch (e) {}
        const hints = buildWrappedHints(db);
        hint = hints[q.ordinal % hints.length];
        st.used[q.key] = { text: hint, at: new Date().toISOString() };
        saveWrappedState(st);
    }

    const prev = Object.entries(st.used).filter(([k]) => k !== q.key).sort((a, b) => b[0].localeCompare(a[0]));
    const body = document.getElementById('wrapped-hint-body');
    if (body) {
        body.innerHTML = `
            <div class="p-3 rounded-3 text-center mb-3" style="background: rgba(168,85,247,0.12); border: 1px solid rgba(168,85,247,0.35);">
                <div style="font-size: 2rem;">🔮</div>
                <div class="text-secondary text-uppercase fw-bold mt-1" style="font-size: 0.65rem; letter-spacing: 0.08em;">Pista de esta quincena</div>
                <div class="text-white fw-semibold mt-1" style="font-size: 0.92rem;">${escapeHtml(hint)}</div>
            </div>
            <div class="text-secondary text-center" style="font-size: 0.72rem;">Próxima pista: <strong class="text-white">${q.next.getDate()} de ${MESES_ES[q.next.getMonth()]}</strong></div>
            ${prev.length ? `
                <div class="mt-3 pt-2 border-top border-secondary border-opacity-15">
                    <div class="text-secondary fw-semibold mb-1" style="font-size: 0.72rem;">Pistas anteriores desbloqueadas</div>
                    ${prev.map(([k, v]) => `<div class="text-secondary mb-1" style="font-size: 0.74rem;">• ${escapeHtml(v.text || '')}</div>`).join('')}
                </div>` : ''}
        `;
    }
    const modalEl = document.getElementById('wrappedHintModal');
    if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).show();
    renderWrappedTeaser();
    if (!alreadyUsed && typeof confetti === 'function') {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.5 } });
    }
}
window.openWrappedHint = openWrappedHint;
window.openWrappedHintModal = openWrappedHint;
window.renderWrappedTeaser = renderWrappedTeaser;


// ----------------------------------------------------
// RESOLUCIÓN INTELIGENTE DE PISTAS & FUZZY MATCHING
// ----------------------------------------------------
function resolveCanonicalTrack(inputName, inputArtist, db) {
    const targetName = (inputName || '').trim();
    const targetArtist = (inputArtist || '').trim();
    if (!targetName) return { name: targetName, artist: targetArtist };

    const normN = normalizeKey(targetName);
    const normA = normalizeKey(targetArtist);

    // 1. Coincidencia directa por clave lowercase en tracksLookup
    if (db && db.tracksLookup) {
        const exact = db.tracksLookup[`${targetName.toLowerCase()}:::${targetArtist.toLowerCase()}`];
        if (exact) return { name: exact.name, artist: exact.artist };
    }

    // 2. Coincidencia normalizada
    if (db && db.tracksLookup) {
        const foundNorm = Object.values(db.tracksLookup).find(t => {
            const tN = normalizeKey(t.name);
            const tA = normalizeKey(t.artist || '');
            if (tN === normN) {
                if (!normA || tA === normA || tA.includes(normA) || normA.includes(tA)) return true;
            }
            return false;
        });
        if (foundNorm) return { name: foundNorm.name, artist: foundNorm.artist };
    }

    // 3. Coincidencia en Tidal Estimates
    if (tidalEstimates && tidalEstimates.tracks) {
        const foundTidal = Object.values(tidalEstimates.tracks).find(t => {
            const tN = normalizeKey(t.name);
            const tA = normalizeKey(t.artist || '');
            return (tN === normN || tN.includes(normN) || normN.includes(tN)) && (!normA || tA === normA || tA.includes(normA) || normA.includes(tA));
        });
        if (foundTidal) return { name: foundTidal.name, artist: foundTidal.artist };
    }

    // 4. Fuzzy / Omisión de palabras menores (ej: "bury with my screams" -> "Bury Me With My Screams")
    const words = targetName.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);
    if (words.length >= 2) {
        if (db && db.tracksLookup) {
            const candidate = Object.values(db.tracksLookup).find(t => {
                const tWords = t.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
                const allWords = words.every(w => tWords.includes(w));
                if (allWords) {
                    if (!normA || normalizeKey(t.artist || '').includes(normA) || normA.includes(normalizeKey(t.artist || ''))) {
                        return true;
                    }
                }
                return false;
            });
            if (candidate) return { name: candidate.name, artist: candidate.artist };
        }
        if (tidalEstimates && tidalEstimates.tracks) {
            const candidate = Object.values(tidalEstimates.tracks).find(t => {
                const tWords = t.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
                const allWords = words.every(w => tWords.includes(w));
                if (allWords) {
                    if (!normA || normalizeKey(t.artist || '').includes(normA) || normA.includes(normalizeKey(t.artist || ''))) {
                        return true;
                    }
                }
                return false;
            });
            if (candidate) return { name: candidate.name, artist: candidate.artist };
        }
    }

    return { name: targetName, artist: targetArtist };
}
window.resolveCanonicalTrack = resolveCanonicalTrack;

// ----------------------------------------------------
// MODAL DE AJUSTE MANUAL DE STREAMS (TIDAL / PERSONALIZADO)
// ----------------------------------------------------
let currentAdjustingItem = null;

async function openStreamAdjustmentModal(type, name, artist) {
    const activeDb = await getActiveDatabase();
    await loadTidalEstimates();

    if (type === 'track') {
        const resolved = resolveCanonicalTrack(name, artist, activeDb);
        name = resolved.name;
        if (!artist && resolved.artist) artist = resolved.artist;
    }

    const normN = normalizeKey(name);
    const normA = normalizeKey(artist || '');

    let basePlays = 0;
    let albumName = '';
    if (type === 'track') {
        const lowerKey = `${(name||'').trim().toLowerCase()}:::${(artist||'').trim().toLowerCase()}`;
        const trk = activeDb?.tracksLookup?.[lowerKey] || Object.entries(activeDb?.tracksLookup || {}).find(([k]) => {
            const [kN, kA] = k.split(':::');
            const nK = normalizeKey(kN);
            const aK = normalizeKey(kA);
            if (!nK || !normN) return false;
            const matchArt = !normA || aK === normA || aK.includes(normA) || normA.includes(aK);
            const matchName = nK === normN || nK.startsWith(normN) || normN.startsWith(nK);
            return matchArt && matchName;
        })?.[1];
        if (trk) {
            basePlays = trk.plays || 0;
            albumName = trk.album || '';
        }
    } else if (type === 'artist') {
        const art = activeDb?.artistsLookup?.[normN] || activeDb?.artistsLookup?.[normA];
        if (art) {
            basePlays = art.plays || 0;
        }
    }

    let currentAddedPlays = 0;
    let cur2025 = 0;
    let cur2026 = 0;
    if (type === 'track') {
        const tEntry = tidalEstimates?.tracks?.[normN + ':::' + normA] || tidalEstimates?.tracks?.[normN + ':::'] || Object.entries(tidalEstimates?.tracks || {}).find(([k]) => k.startsWith(normN + ':::'))?.[1];
        if (tEntry) {
            currentAddedPlays = tEntry.plays || 0;
            cur2025 = tEntry.years?.['2025'] || 0;
            cur2026 = tEntry.years?.['2026'] || 0;
            if (!albumName && tEntry.album) albumName = tEntry.album;
        }
    } else if (type === 'artist') {
        const artKey = Object.keys(tidalEstimates?.artists || {}).find(k => normalizeKey(k) === normN || normalizeKey(k).includes(normN) || normN.includes(normalizeKey(k)));
        if (artKey && tidalEstimates?.artists[artKey]) {
            const aEntry = tidalEstimates.artists[artKey];
            currentAddedPlays = aEntry.plays || 0;
            cur2025 = aEntry.years?.['2025'] || 0;
            cur2026 = aEntry.years?.['2026'] || 0;
        }
    }

    if (currentAddedPlays > 0 && cur2025 === 0 && cur2026 === 0) {
        cur2025 = Math.round(currentAddedPlays * 0.35);
        cur2026 = currentAddedPlays - cur2025;
    }

    const isOverridden = hasCustomStreamOverride(type, name, artist);
    const totalPlays = basePlays + currentAddedPlays;

    currentAdjustingItem = {
        type,
        name,
        artist,
        album: albumName,
        basePlays,
        currentAddedPlays,
        totalPlays,
        cur2025,
        cur2026,
        isOverridden
    };

    const titleEl = document.getElementById('adjust-stream-title');
    const subtitleEl = document.getElementById('adjust-stream-subtitle');
    const badgeType = document.getElementById('adjust-stream-badge-type');
    const baseDisplay = document.getElementById('adjust-base-plays-display');
    const addedBadge = document.getElementById('adjust-added-badge-display');
    const totalBadge = document.getElementById('adjust-total-badge-display');
    const addedInput = document.getElementById('adjust-added-input');
    const totalInput = document.getElementById('adjust-total-input');
    const y25Input = document.getElementById('adjust-year-2025-input');
    const y26Input = document.getElementById('adjust-year-2026-input');
    const autoSplitCheck = document.getElementById('adjust-auto-split-check');
    const btnReset = document.getElementById('btn-adjust-reset-default');
    const statusNotice = document.getElementById('adjust-status-notice');

    if (titleEl) titleEl.textContent = name;
    if (subtitleEl) subtitleEl.textContent = artist || (type === 'artist' ? 'Artista' : '');
    if (badgeType) badgeType.textContent = type === 'track' ? 'Canción' : 'Artista';
    if (baseDisplay) baseDisplay.textContent = formatNumber(basePlays);
    if (addedBadge) addedBadge.textContent = '+' + formatNumber(currentAddedPlays);
    if (totalBadge) totalBadge.textContent = formatNumber(totalPlays);
    if (addedInput) addedInput.value = currentAddedPlays;
    if (totalInput) totalInput.value = totalPlays;
    if (y25Input) y25Input.value = cur2025;
    if (y26Input) y26Input.value = cur2026;
    const overrides = getCustomStreamOverrides();
    let isCustomSplit = false;
    if (type === 'track') {
        const key = `${normN}:::${normA}`;
        if (overrides.tracks?.[key]?.years) isCustomSplit = true;
    } else if (type === 'artist') {
        const key = normN;
        if (overrides.artists?.[key]?.years) isCustomSplit = true;
    }
    if (currentAddedPlays > 0 && cur2025 !== Math.round(currentAddedPlays * 0.35)) {
        isCustomSplit = true;
    }

    if (autoSplitCheck) autoSplitCheck.checked = !isCustomSplit;
    if (y25Input) y25Input.disabled = !isCustomSplit;
    if (y26Input) y26Input.disabled = !isCustomSplit;

    if (btnReset) {
        btnReset.style.display = isOverridden ? 'inline-flex' : 'none';
    }

    if (statusNotice) {
        if (isOverridden) {
            statusNotice.className = 'badge bg-warning bg-opacity-20 text-warning border border-warning border-opacity-30 p-1 px-2';
            statusNotice.innerHTML = '<i class="fa-solid fa-pen me-1"></i>Personalizado';
        } else if (currentAddedPlays > 0) {
            statusNotice.className = 'badge bg-info bg-opacity-20 text-info border border-info border-opacity-30 p-1 px-2';
            statusNotice.innerHTML = '<i class="fa-solid fa-water me-1"></i>Estimado Tidal';
        } else {
            statusNotice.className = 'badge bg-secondary bg-opacity-20 text-secondary border border-secondary border-opacity-30 p-1 px-2';
            statusNotice.innerHTML = '<i class="fa-solid fa-circle-info me-1"></i>Sin añadir';
        }
    }

    const modalEl = document.getElementById('streamAdjustmentModal');
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
}
window.openStreamAdjustmentModal = openStreamAdjustmentModal;

function onAdjustAddedInputChanged() {
    if (!currentAdjustingItem) return;
    const addedInput = document.getElementById('adjust-added-input');
    const totalInput = document.getElementById('adjust-total-input');
    const addedBadge = document.getElementById('adjust-added-badge-display');
    const totalBadge = document.getElementById('adjust-total-badge-display');
    const y25Input = document.getElementById('adjust-year-2025-input');
    const y26Input = document.getElementById('adjust-year-2026-input');
    const autoSplitCheck = document.getElementById('adjust-auto-split-check');

    const added = Math.max(0, parseInt(addedInput?.value, 10) || 0);
    const base = currentAdjustingItem.basePlays || 0;
    const total = base + added;
    if (totalInput) totalInput.value = total;
    if (addedBadge) addedBadge.textContent = '+' + formatNumber(added);
    if (totalBadge) totalBadge.textContent = formatNumber(total);

    if (autoSplitCheck && autoSplitCheck.checked) {
        const y25 = Math.round(added * 0.35);
        const y26 = added - y25;
        if (y25Input) y25Input.value = y25;
        if (y26Input) y26Input.value = y26;
    }
}
window.onAdjustAddedInputChanged = onAdjustAddedInputChanged;

function onAdjustTotalInputChanged() {
    if (!currentAdjustingItem) return;
    const addedInput = document.getElementById('adjust-added-input');
    const totalInput = document.getElementById('adjust-total-input');
    const addedBadge = document.getElementById('adjust-added-badge-display');
    const totalBadge = document.getElementById('adjust-total-badge-display');
    const y25Input = document.getElementById('adjust-year-2025-input');
    const y26Input = document.getElementById('adjust-year-2026-input');
    const autoSplitCheck = document.getElementById('adjust-auto-split-check');

    const total = Math.max(0, parseInt(totalInput?.value, 10) || 0);
    const base = currentAdjustingItem.basePlays || 0;
    const added = Math.max(0, total - base);
    if (addedInput) addedInput.value = added;
    if (addedBadge) addedBadge.textContent = '+' + formatNumber(added);
    if (totalBadge) totalBadge.textContent = formatNumber(total);

    if (autoSplitCheck && autoSplitCheck.checked) {
        const y25 = Math.round(added * 0.35);
        const y26 = added - y25;
        if (y25Input) y25Input.value = y25;
        if (y26Input) y26Input.value = y26;
    }
}
window.onAdjustTotalInputChanged = onAdjustTotalInputChanged;

function onAdjustYearsInputChanged() {
    if (!currentAdjustingItem) return;
    const autoSplitCheck = document.getElementById('adjust-auto-split-check');
    if (autoSplitCheck && autoSplitCheck.checked) {
        autoSplitCheck.checked = false;
    }
    const addedInput = document.getElementById('adjust-added-input');
    const totalInput = document.getElementById('adjust-total-input');
    const addedBadge = document.getElementById('adjust-added-badge-display');
    const totalBadge = document.getElementById('adjust-total-badge-display');
    const y25Input = document.getElementById('adjust-year-2025-input');
    const y26Input = document.getElementById('adjust-year-2026-input');

    const y25 = Math.max(0, parseInt(y25Input?.value, 10) || 0);
    const y26 = Math.max(0, parseInt(y26Input?.value, 10) || 0);
    const added = y25 + y26;
    const base = currentAdjustingItem.basePlays || 0;
    const total = base + added;

    if (addedInput) addedInput.value = added;
    if (totalInput) totalInput.value = total;
    if (addedBadge) addedBadge.textContent = '+' + formatNumber(added);
    if (totalBadge) totalBadge.textContent = formatNumber(total);
}
window.onAdjustYearsInputChanged = onAdjustYearsInputChanged;

function toggleAutoSplitDistribution() {
    const autoSplitCheck = document.getElementById('adjust-auto-split-check');
    const y25Input = document.getElementById('adjust-year-2025-input');
    const y26Input = document.getElementById('adjust-year-2026-input');
    const isAuto = autoSplitCheck?.checked ?? true;
    if (y25Input) y25Input.disabled = isAuto;
    if (y26Input) y26Input.disabled = isAuto;
    if (isAuto) onAdjustAddedInputChanged();
}
window.toggleAutoSplitDistribution = toggleAutoSplitDistribution;

async function handleSaveStreamAdjustment() {
    if (!currentAdjustingItem) return;
    const addedInput = document.getElementById('adjust-added-input');
    const y25Input = document.getElementById('adjust-year-2025-input');
    const y26Input = document.getElementById('adjust-year-2026-input');
    const autoSplitCheck = document.getElementById('adjust-auto-split-check');

    let y25 = Math.max(0, parseInt(y25Input?.value, 10) || 0);
    let y26 = Math.max(0, parseInt(y26Input?.value, 10) || 0);
    let added = Math.max(0, parseInt(addedInput?.value, 10) || 0);

    if (autoSplitCheck && autoSplitCheck.checked) {
        y25 = Math.round(added * 0.35);
        y26 = added - y25;
    } else {
        // En modo manual / personalizado, los años definen el total exacto
        added = y25 + y26;
    }

    const { type, name, artist } = currentAdjustingItem;
    setCustomStreamOverride(type, name, artist, added, y25, y26);

    const modalEl = document.getElementById('streamAdjustmentModal');
    bootstrap.Modal.getInstance(modalEl)?.hide();

    const itemModalEl = document.getElementById('itemStatsModal');
    if (itemModalEl && itemModalEl.classList.contains('show')) {
        await showItemStats(type, name, artist, true);
    }
    const mgrModalEl = document.getElementById('streamManagerModal');
    if (mgrModalEl && mgrModalEl.classList.contains('show')) {
        renderStreamManagerList();
    }

    if (typeof updateStatStrip === 'function') updateStatStrip();
    loadStats();
    if (typeof showEngagementToast === 'function') {
        showEngagementToast('<i class="fa-solid fa-sliders text-info"></i>', 'Streams Actualizados', `${name}: ${formatNumber((currentAdjustingItem.basePlays || 0) + added)} streams totales`);
    }
}
window.handleSaveStreamAdjustment = handleSaveStreamAdjustment;

async function handleResetStreamAdjustment() {
    if (!currentAdjustingItem) return;
    const { type, name, artist } = currentAdjustingItem;
    removeCustomStreamOverride(type, name, artist);

    const modalEl = document.getElementById('streamAdjustmentModal');
    bootstrap.Modal.getInstance(modalEl)?.hide();

    const itemModalEl = document.getElementById('itemStatsModal');
    if (itemModalEl && itemModalEl.classList.contains('show')) {
        await showItemStats(type, name, artist, true);
    }
    const mgrModalEl = document.getElementById('streamManagerModal');
    if (mgrModalEl && mgrModalEl.classList.contains('show')) {
        renderStreamManagerList();
    }

    loadStats();
    if (typeof showEngagementToast === 'function') {
        showEngagementToast('<i class="fa-solid fa-rotate-left text-warning"></i>', 'Valor Restablecido', `Se restauró el valor predeterminado para ${name}`);
    }
}
window.handleResetStreamAdjustment = handleResetStreamAdjustment;

// ----------------------------------------------------
// GESTOR CENTRAL DE STREAMS (TIDAL / PERSONALIZADOS)
// ----------------------------------------------------
let currentStreamManagerFilter = 'all';
let currentStreamManagerQuery = '';

async function openStreamManagerModal() {
    await loadTidalEstimates();
    const modalEl = document.getElementById('streamManagerModal');
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
    renderStreamManagerList(currentStreamManagerFilter, currentStreamManagerQuery);
}
window.openStreamManagerModal = openStreamManagerModal;

function setStreamManagerFilter(filter, btn) {
    currentStreamManagerFilter = filter;
    document.querySelectorAll('.stream-mgr-tab-btn').forEach(b => {
        b.classList.remove('active', 'btn-brand');
        b.classList.add('btn-outline-secondary', 'text-white');
    });
    if (btn) {
        btn.classList.add('active', 'btn-brand');
        btn.classList.remove('btn-outline-secondary', 'text-white');
    }
    renderStreamManagerList(currentStreamManagerFilter, currentStreamManagerQuery);
}
window.setStreamManagerFilter = setStreamManagerFilter;

function onStreamManagerSearch(q) {
    currentStreamManagerQuery = (q || '').trim().toLowerCase();
    renderStreamManagerList(currentStreamManagerFilter, currentStreamManagerQuery);
}
window.onStreamManagerSearch = onStreamManagerSearch;

async function renderStreamManagerList(filter = currentStreamManagerFilter, query = currentStreamManagerQuery) {
    const container = document.getElementById('stream-manager-items-list');
    if (!container) return;

    const activeDb = await getActiveDatabase();
    const overrides = getCustomStreamOverrides();
    const items = [];

    // Tracks in tidalEstimates
    if (tidalEstimates && tidalEstimates.tracks) {
        Object.entries(tidalEstimates.tracks).forEach(([k, t]) => {
            const isOvr = !!overrides.tracks?.[k];
            const normN = normalizeKey(t.name);
            const normA = normalizeKey(t.artist || '');
            const lowerKey = `${(t.name||'').trim().toLowerCase()}:::${(t.artist||'').trim().toLowerCase()}`;
            const baseTrack = activeDb?.tracksLookup?.[lowerKey] || Object.entries(activeDb?.tracksLookup || {}).find(([k]) => {
                const [kN, kA] = k.split(':::');
                const nK = normalizeKey(kN);
                const aK = normalizeKey(kA);
                if (!nK || !normN) return false;
                const matchArt = !normA || aK === normA || aK.includes(normA) || normA.includes(aK);
                const matchName = nK === normN || nK.startsWith(normN) || normN.startsWith(nK);
                return matchArt && matchName;
            })?.[1];
            const basePlays = baseTrack ? baseTrack.plays : 0;
            items.push({
                type: 'track',
                key: k,
                name: t.name,
                artist: t.artist || '',
                album: t.album || '',
                addedPlays: t.plays || 0,
                basePlays: basePlays,
                totalPlays: basePlays + (t.plays || 0),
                isOverridden: isOvr
            });
        });
    }

    // Artists in tidalEstimates
    if (tidalEstimates && tidalEstimates.artists) {
        Object.entries(tidalEstimates.artists).forEach(([artName, a]) => {
            const isOvr = !!overrides.artists?.[normalizeKey(artName)];
            const baseArt = activeDb?.artistsLookup?.[normalizeKey(artName)];
            const basePlays = baseArt ? baseArt.plays : 0;
            items.push({
                type: 'artist',
                key: normalizeKey(artName),
                name: artName,
                artist: '',
                album: '',
                addedPlays: a.plays || 0,
                basePlays: basePlays,
                totalPlays: basePlays + (a.plays || 0),
                isOverridden: isOvr
            });
        });
    }

    const countAll = document.getElementById('count-mgr-all');
    const countTracks = document.getElementById('count-mgr-tracks');
    const countArtists = document.getElementById('count-mgr-artists');
    const countCustom = document.getElementById('count-mgr-custom');

    if (countAll) countAll.textContent = items.length;
    if (countTracks) countTracks.textContent = items.filter(i => i.type === 'track').length;
    if (countArtists) countArtists.textContent = items.filter(i => i.type === 'artist').length;
    if (countCustom) countCustom.textContent = items.filter(i => i.isOverridden).length;

    let filtered = items;
    if (filter === 'tracks') filtered = filtered.filter(i => i.type === 'track');
    else if (filter === 'artists') filtered = filtered.filter(i => i.type === 'artist');
    else if (filter === 'custom') filtered = filtered.filter(i => i.isOverridden);

    if (query) {
        filtered = filtered.filter(i => 
            i.name.toLowerCase().includes(query) || 
            (i.artist && i.artist.toLowerCase().includes(query))
        );
    }

    filtered.sort((a, b) => b.totalPlays - a.totalPlays);

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="text-center text-secondary py-4">
                <i class="fa-solid fa-filter-circle-xmark fs-3 mb-2 opacity-50"></i>
                <p class="mb-0 small">No se encontraron pistas o artistas para este filtro.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(item => `
        <div class="d-flex align-items-center justify-content-between p-2 rounded-3 border border-secondary border-opacity-15" style="background: rgba(255, 255, 255, 0.02); transition: background 0.15s ease;" onmouseover="this.style.backgroundColor='rgba(255,255,255,0.05)'" onmouseout="this.style.backgroundColor='rgba(255,255,255,0.02)'">
            <div class="d-flex align-items-center gap-2 overflow-hidden me-2">
                <div class="d-flex align-items-center justify-content-center rounded flex-shrink-0" style="width: 32px; height: 32px; background: rgba(168, 85, 247, 0.12); color: #c084fc;">
                    <i class="fa-solid ${item.type === 'track' ? 'fa-music' : 'fa-user-group'}"></i>
                </div>
                <div class="overflow-hidden">
                    <div class="d-flex align-items-center gap-1.5">
                        <span class="text-white fw-semibold text-truncate" style="font-size: 0.80rem;" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</span>
                        ${item.isOverridden ? '<span class="badge bg-warning bg-opacity-20 text-warning border border-warning border-opacity-40" style="font-size: 0.58rem; padding: 1px 4px;">Editado</span>' : ''}
                    </div>
                    <small class="text-secondary text-truncate d-block" style="font-size: 0.70rem;">${escapeHtml(item.artist || (item.type === 'artist' ? 'Artista' : ''))}</small>
                </div>
            </div>
            <div class="d-flex align-items-center gap-2 flex-shrink-0">
                <div class="text-end" style="font-size: 0.72rem;">
                    <strong class="text-white d-block">${formatNumber(item.totalPlays)} reps</strong>
                    <span class="text-info" style="font-size: 0.65rem;">+${formatNumber(item.addedPlays)} añadidos</span>
                </div>
                <button type="button" class="btn btn-sm btn-outline-info rounded-pill px-2.5 py-1" style="font-size: 0.70rem;" onclick="openStreamAdjustmentModal('${item.type}', '${escapeJsStr(item.name)}', '${escapeJsStr(item.artist || '')}')" title="Modificar">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
            </div>
        </div>
    `).join('');
}
window.renderStreamManagerList = renderStreamManagerList;

function exportStreamOverridesJson() {
    const overrides = getCustomStreamOverrides();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(overrides, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `spotitracker_stream_ajustes_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}
window.exportStreamOverridesJson = exportStreamOverridesJson;

function importStreamOverridesJson(fileInput) {
    const file = fileInput.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const parsed = JSON.parse(e.target.result);
            if (parsed && (parsed.tracks || parsed.artists)) {
                saveCustomStreamOverridesToStorage(parsed);
                applyCustomOverridesToTidal();
                renderStreamManagerList();
                loadStats();
                if (typeof showEngagementToast === 'function') {
                    showEngagementToast('<i class="fa-solid fa-check-circle text-success"></i>', 'Ajustes Importados', 'Tus streams personalizados se han restaurado con éxito.');
                }
            } else {
                alert('El archivo no contiene un formato de ajustes válido.');
            }
        } catch (err) {
            alert('Error al leer el archivo JSON: ' + err.message);
        }
        fileInput.value = '';
    };
    reader.readAsText(file);
}
window.importStreamOverridesJson = importStreamOverridesJson;

function resetAllStreamOverrides() {
    if (!confirm('¿Estás seguro de que deseas restablecer todos tus ajustes personalizados a los valores predeterminados?')) return;
    localStorage.removeItem('spoti_stream_overrides');
    applyCustomOverridesToTidal();
    renderStreamManagerList();
    loadStats();
    if (typeof showEngagementToast === 'function') {
        showEngagementToast('<i class="fa-solid fa-trash-can text-warning"></i>', 'Ajustes Limpiados', 'Se han restablecido todos los streams a los datos predeterminados.');
    }
}
window.resetAllStreamOverrides = resetAllStreamOverrides;

async function populateNewOverrideAutocomplete() {
    const datalist = document.getElementById('new-override-tracks-datalist');
    if (!datalist || datalist.dataset.loaded) return;
    try {
        const db = await getActiveDatabase();
        if (!db) return;
        const frag = document.createDocumentFragment();
        const seen = new Set();

        if (db.tracksLookup) {
            Object.values(db.tracksLookup).forEach(t => {
                const val = `${t.name} - ${t.artist}`;
                if (!seen.has(val.toLowerCase())) {
                    seen.add(val.toLowerCase());
                    const opt = document.createElement('option');
                    opt.value = t.name;
                    opt.label = `${t.artist} (${t.plays} streams)`;
                    frag.appendChild(opt);
                }
            });
        }
        if (tidalEstimates && tidalEstimates.tracks) {
            Object.values(tidalEstimates.tracks).forEach(t => {
                const val = `${t.name} - ${t.artist}`;
                if (!seen.has(val.toLowerCase())) {
                    seen.add(val.toLowerCase());
                    const opt = document.createElement('option');
                    opt.value = t.name;
                    opt.label = `${t.artist} (+${t.plays} Tidal)`;
                    frag.appendChild(opt);
                }
            });
        }
        datalist.appendChild(frag);
        datalist.dataset.loaded = 'true';
    } catch (_) {}
}

function onNewOverrideNameInput(val) {
    const artistInp = document.getElementById('new-override-artist');
    if (!artistInp || (artistInp.value || '').trim() !== '') return;
    const norm = normalizeKey(val);
    if (!norm) return;

    if (unifiedDb && unifiedDb.tracksLookup) {
        const found = Object.values(unifiedDb.tracksLookup).find(t => normalizeKey(t.name) === norm);
        if (found && found.artist) {
            artistInp.value = found.artist;
            return;
        }
    }
    if (tidalEstimates && tidalEstimates.tracks) {
        const found = Object.values(tidalEstimates.tracks).find(t => normalizeKey(t.name) === norm);
        if (found && found.artist) {
            artistInp.value = found.artist;
            return;
        }
    }
}
window.onNewOverrideNameInput = onNewOverrideNameInput;

function openNewStreamOverrideModal() {
    const modalEl = document.getElementById('newStreamOverrideModal');
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    const nameInp = document.getElementById('new-override-name');
    const artistInp = document.getElementById('new-override-artist');
    const playsInp = document.getElementById('new-override-plays');
    const yearSel = document.getElementById('new-override-year');
    if (nameInp) nameInp.value = '';
    if (artistInp) artistInp.value = '';
    if (playsInp) playsInp.value = '';
    if (yearSel) yearSel.value = '2026';
    modal.show();
    populateNewOverrideAutocomplete();
}
window.openNewStreamOverrideModal = openNewStreamOverrideModal;

function onNewOverrideTypeChange(val) {
    const artistGroup = document.getElementById('new-override-artist-group');
    const nameLabel = document.getElementById('new-override-name-label');
    if (artistGroup) {
        artistGroup.style.display = val === 'artist' ? 'none' : 'block';
    }
    if (nameLabel) {
        nameLabel.textContent = val === 'artist' ? 'Nombre del Artista' : 'Nombre de la Canción';
    }
}
window.onNewOverrideTypeChange = onNewOverrideTypeChange;

async function handleCreateNewStreamOverrideSubmit() {
    const type = document.getElementById('new-override-type')?.value || 'track';
    let name = (document.getElementById('new-override-name')?.value || '').trim();
    let artist = (document.getElementById('new-override-artist')?.value || '').trim();
    const plays = parseInt(document.getElementById('new-override-plays')?.value, 10) || 0;
    const yearChoice = document.getElementById('new-override-year')?.value || '2026';

    if (!name) {
        alert('Por favor escribe el nombre de la canción o artista.');
        return;
    }

    const activeDb = await getActiveDatabase();
    if (type === 'track') {
        const resolved = resolveCanonicalTrack(name, artist, activeDb);
        name = resolved.name;
        if (!artist && resolved.artist) artist = resolved.artist;
    } else if (type === 'artist') {
        const normA = normalizeKey(name);
        const foundA = Object.keys(activeDb?.artistsLookup || {}).find(k => k === normA || k.includes(normA) || normA.includes(k));
        if (foundA && activeDb?.artistsLookup?.[foundA]) {
            name = activeDb.artistsLookup[foundA].name;
        }
    }

    const modalEl = document.getElementById('newStreamOverrideModal');
    bootstrap.Modal.getInstance(modalEl)?.hide();

    let y25 = 0;
    let y26 = plays;
    if (yearChoice === '2025') {
        y25 = plays;
        y26 = 0;
    } else if (yearChoice === 'split') {
        y25 = Math.round(plays * 0.35);
        y26 = plays - y25;
    } else {
        // Año 2026 (100% de streams)
        y25 = 0;
        y26 = plays;
    }

    if (plays > 0) {
        setCustomStreamOverride(type, name, artist, plays, y25, y26);
    }
    openStreamAdjustmentModal(type, name, artist);
}
window.handleCreateNewStreamOverrideSubmit = handleCreateNewStreamOverrideSubmit;


// ====================================================
// FASE 3: TORNEO MUNDIAL (BRACKET 16) & HIGHER OR LOWER
// ====================================================
let bracketState = {
    mode: 'tracks-overall',
    roundName: 'Octavos de Final',
    currentRoundItems: [],
    nextRoundItems: [],
    matchIndex: 0
};

async function openBracketModal() {
    const modalEl = document.getElementById('bracketModal');
    if (!modalEl) return;
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
    await initBracketTournament(bracketState.mode || 'tracks-overall');
}
window.openBracketModal = openBracketModal;

async function initBracketTournament(mode = 'tracks-overall', btn = null) {
    bracketState.mode = mode;
    if (btn) {
        document.querySelectorAll('.bracket-mode-btn').forEach(b => {
            b.classList.remove('active', 'btn-brand');
            b.classList.add('btn-outline-secondary', 'text-white');
        });
        btn.classList.add('active', 'btn-brand');
        btn.classList.remove('btn-outline-secondary', 'text-white');
    }

    const db = await getActiveDatabase();
    const tidal = (isAppOwner() && (tidalEstimates || await loadTidalEstimates())) || null;
    let pool = [];

    if (mode === 'tracks-tidal' && tidal?.tracks && isAppOwner()) {
        pool = Object.values(tidal.tracks).map(t => {
            const lowerKey = `${(t.name||'').trim().toLowerCase()}:::${(t.artist||'').trim().toLowerCase()}`;
            const base = db?.tracksLookup?.[lowerKey]?.plays || 0;
            return {
                type: 'track',
                name: t.name,
                subtitle: t.artist || '',
                plays: base + (t.plays || 0)
            };
        });
    } else if (mode === 'artists') {
        const rawA = db?.yearlyTops?.overall?.artists || [];
        const mapA = new Map();
        rawA.forEach(a => mapA.set(normalizeKey(a.name), { type: 'artist', name: a.name, subtitle: 'Artista', plays: a.plays || 0 }));
        if (tidal?.artists && isAppOwner()) {
            Object.entries(tidal.artists).forEach(([name, obj]) => {
                const k = normalizeKey(name);
                if (mapA.has(k)) mapA.get(k).plays += (obj.plays || 0);
                else mapA.set(k, { type: 'artist', name, subtitle: 'Artista', plays: obj.plays || 0 });
            });
        }
        if (lastFmRecentDelta.length > 0) {
            lastFmRecentDelta.forEach(t => {
                const artName = t.artist ? (t.artist['#text'] || t.artist.name || '') : '';
                if (artName) {
                    const k = normalizeKey(artName);
                    if (mapA.has(k)) mapA.get(k).plays += 1;
                    else mapA.set(k, { type: 'artist', name: artName, subtitle: 'Artista', plays: 1 });
                }
            });
        }
        pool = Array.from(mapA.values());
    } else {
        const rawT = db?.yearlyTops?.overall?.tracks || [];
        const mapT = new Map();
        rawT.slice(0, 60).forEach(t => {
            const art = t.artist?.name || t.artist || '';
            const k = `${normalizeKey(t.name)}:::${normalizeKey(art)}`;
            mapT.set(k, { type: 'track', name: t.name, subtitle: art, plays: t.plays || 0 });
        });
        if (tidal?.tracks && isAppOwner()) {
            Object.values(tidal.tracks).forEach(t => {
                const k = `${normalizeKey(t.name)}:::${normalizeKey(t.artist || '')}`;
                if (mapT.has(k)) mapT.get(k).plays += (t.plays || 0);
                else mapT.set(k, { type: 'track', name: t.name, subtitle: t.artist || '', plays: t.plays || 0 });
            });
        }
        if (lastFmRecentDelta.length > 0) {
            lastFmRecentDelta.forEach(t => {
                const artName = t.artist ? (t.artist['#text'] || t.artist.name || '') : '';
                const k = `${normalizeKey(t.name)}:::${normalizeKey(artName)}`;
                if (mapT.has(k)) mapT.get(k).plays += 1;
                else mapT.set(k, { type: 'track', name: t.name, subtitle: artName, plays: 1 });
            });
        }
        pool = Array.from(mapT.values());
    }

    pool.sort((a, b) => b.plays - a.plays);
    const top24 = pool.slice(0, 24).sort(() => 0.5 - Math.random()).slice(0, 16);

    bracketState.currentRoundItems = top24;
    bracketState.nextRoundItems = [];
    bracketState.matchIndex = 0;
    renderBracketMatch();
}
window.initBracketTournament = initBracketTournament;

function renderBracketMatch() {
    const body = document.getElementById('bracket-arena-body');
    const badge = document.getElementById('bracket-round-badge');
    if (!body) return;

    const totalMatches = Math.floor(bracketState.currentRoundItems.length / 2);
    const roundTitle = totalMatches === 8 ? 'Octavos de Final' : (totalMatches === 4 ? 'Cuartos de Final' : (totalMatches === 2 ? 'Semifinal' : 'Gran Final'));

    if (bracketState.currentRoundItems.length === 1) {
        const champ = bracketState.currentRoundItems[0];
        if (badge) badge.textContent = '🏆 ¡Campeón Coronado!';
        const cKey = `${champ.type}::${normalizeKey(champ.name)}::${normalizeKey(champ.type === 'artist' ? '' : champ.subtitle)}`;
        const cImg = artCache[cKey] || FALLBACK_ART_SVG;
        if (typeof confetti === 'function') confetti({ particleCount: 90, spread: 80, origin: { y: 0.4 } });

        body.innerHTML = `
            <div class="text-center py-4 px-3 rounded-4" style="background: radial-gradient(circle at top, rgba(251, 191, 36, 0.22), rgba(20, 20, 24, 0.96) 70%); border: 1px solid rgba(251, 191, 36, 0.4);">
                <div class="mb-2"><i class="fa-solid fa-crown text-warning" style="font-size: 2.4rem;"></i></div>
                <div class="apple-eyebrow text-warning mb-1">CAMPEÓN ABSOLUTO DEL TORNEO</div>
                <div class="my-3">
                    <img id="bracket-champ-img" src="${cImg}" class="rounded-4 shadow-lg border border-2 border-warning" style="width: 120px; height: 120px; object-fit: cover;" onerror="safeImgError(this)">
                </div>
                <h4 class="fw-bold text-white mb-1">${escapeHtml(champ.name)}</h4>
                <div class="text-secondary mb-2">${escapeHtml(champ.subtitle)}</div>
                <span class="badge rounded-pill px-3 py-1.5 mb-3" style="background: rgba(251,191,36,0.2); color: #fbbf24; font-size: 0.80rem;">
                    <i class="fa-solid fa-headphones me-1"></i>${formatNumber(champ.plays)} reproducciones totales
                </span>
                <div class="d-flex justify-content-center gap-2 mt-2">
                    <button type="button" class="btn btn-sm btn-brand rounded-pill px-4 py-1.5 fw-semibold" onclick="initBracketTournament(bracketState.mode)">
                        <i class="fa-solid fa-rotate-right me-1"></i> Nuevo Torneo
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-light rounded-pill px-3 py-1.5" onclick="showItemStats('${champ.type}', '${escapeJsStr(champ.name)}', '${escapeJsStr(champ.type === 'artist' ? '' : champ.subtitle)}')">
                        <i class="fa-solid fa-chart-simple me-1"></i> Ver Estadísticas
                    </button>
                </div>
            </div>
        `;
        if (!artCache[cKey]) resolveSpotifyArtwork(champ.name, champ.type === 'artist' ? '' : champ.subtitle, champ.type, 'bracket-champ-img');
        return;
    }

    if (badge) badge.textContent = `${roundTitle} (${bracketState.matchIndex + 1}/${totalMatches})`;

    const itemA = bracketState.currentRoundItems[bracketState.matchIndex * 2];
    const itemB = bracketState.currentRoundItems[bracketState.matchIndex * 2 + 1];
    if (!itemA || !itemB) return;

    const keyA = `${itemA.type}::${normalizeKey(itemA.name)}::${normalizeKey(itemA.type === 'artist' ? '' : itemA.subtitle)}`;
    const keyB = `${itemB.type}::${normalizeKey(itemB.name)}::${normalizeKey(itemB.type === 'artist' ? '' : itemB.subtitle)}`;
    const imgA = artCache[keyA] || FALLBACK_ART_SVG;
    const imgB = artCache[keyB] || FALLBACK_ART_SVG;

    body.innerHTML = `
        <div class="text-center mb-3">
            <small class="text-secondary">Haz clic en tu preferida para que avance a la siguiente ronda:</small>
        </div>
        <div class="row g-3 align-items-stretch">
            <div class="col-12 col-sm-5">
                <div class="apple-bento-card interactive h-100 text-center d-flex flex-column align-items-center justify-content-between p-4" style="cursor: pointer; border-color: rgba(191, 90, 242, 0.3);" onclick="pickBracketWinner(0)">
                    <img id="bracket-img-a" src="${imgA}" class="rounded-4 shadow mb-3 ${itemA.type === 'artist' ? 'rounded-circle' : ''}" style="width: 104px; height: 104px; object-fit: cover;" onerror="safeImgError(this)">
                    <div>
                        <div class="fw-bold text-white mb-1" style="font-size: 1rem;">${escapeHtml(itemA.name)}</div>
                        <div class="text-secondary small mb-2">${escapeHtml(itemA.subtitle)}</div>
                        <span class="badge-scrobble"><i class="fa-solid fa-headphones"></i>${formatNumber(itemA.plays)} streams</span>
                    </div>
                    <button type="button" class="btn btn-sm btn-brand rounded-pill w-100 mt-3 py-1.5 fw-semibold">Elegir #1</button>
                </div>
            </div>
            <div class="col-12 col-sm-2 d-flex align-items-center justify-content-center">
                <div class="rounded-circle d-flex align-items-center justify-content-center fw-bold" style="width: 44px; height: 44px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.14); color: #fbbf24;">VS</div>
            </div>
            <div class="col-12 col-sm-5">
                <div class="apple-bento-card interactive h-100 text-center d-flex flex-column align-items-center justify-content-between p-4" style="cursor: pointer; border-color: rgba(56, 189, 248, 0.3);" onclick="pickBracketWinner(1)">
                    <img id="bracket-img-b" src="${imgB}" class="rounded-4 shadow mb-3 ${itemB.type === 'artist' ? 'rounded-circle' : ''}" style="width: 104px; height: 104px; object-fit: cover;" onerror="safeImgError(this)">
                    <div>
                        <div class="fw-bold text-white mb-1" style="font-size: 1rem;">${escapeHtml(itemB.name)}</div>
                        <div class="text-secondary small mb-2">${escapeHtml(itemB.subtitle)}</div>
                        <span class="badge-scrobble"><i class="fa-solid fa-headphones"></i>${formatNumber(itemB.plays)} streams</span>
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-info rounded-pill w-100 mt-3 py-1.5 fw-semibold">Elegir #2</button>
                </div>
            </div>
        </div>
    `;

    if (!artCache[keyA]) resolveSpotifyArtwork(itemA.name, itemA.type === 'artist' ? '' : itemA.subtitle, itemA.type, 'bracket-img-a');
    if (!artCache[keyB]) resolveSpotifyArtwork(itemB.name, itemB.type === 'artist' ? '' : itemB.subtitle, itemB.type, 'bracket-img-b');
}

function pickBracketWinner(choiceIdx) {
    const winner = bracketState.currentRoundItems[bracketState.matchIndex * 2 + choiceIdx];
    if (!winner) return;
    bracketState.nextRoundItems.push(winner);
    bracketState.matchIndex++;

    const totalMatches = Math.floor(bracketState.currentRoundItems.length / 2);
    if (bracketState.matchIndex >= totalMatches) {
        bracketState.currentRoundItems = bracketState.nextRoundItems;
        bracketState.nextRoundItems = [];
        bracketState.matchIndex = 0;
    }
    renderBracketMatch();
}
window.pickBracketWinner = pickBracketWinner;

// ---------- Minijuego: Higher or Lower ----------
const HL_BEST_KEY = 'spoti_hl_best_score';
let hlState = {
    pool: [],
    itemA: null,
    itemB: null,
    streak: 0,
    best: parseInt(localStorage.getItem(HL_BEST_KEY) || '0', 10) || 0,
    locked: false
};

async function openHigherLowerModal() {
    const modalEl = document.getElementById('higherLowerModal');
    if (!modalEl) return;
    bootstrap.Modal.getOrCreateInstance(modalEl).show();

    const db = await getActiveDatabase();
    const tidal = (isAppOwner() && (tidalEstimates || await loadTidalEstimates())) || null;
    const mapT = new Map();

    (db?.yearlyTops?.overall?.tracks || []).slice(0, 120).forEach(t => {
        const art = t.artist?.name || t.artist || '';
        const k = `${normalizeKey(t.name)}:::${normalizeKey(art)}`;
        mapT.set(k, { type: 'track', name: t.name, subtitle: art, plays: t.plays || 0 });
    });
    if (tidal?.tracks && isAppOwner()) {
        Object.values(tidal.tracks).forEach(t => {
            const k = `${normalizeKey(t.name)}:::${normalizeKey(t.artist || '')}`;
            if (mapT.has(k)) mapT.get(k).plays += (t.plays || 0);
            else mapT.set(k, { type: 'track', name: t.name, subtitle: t.artist || '', plays: t.plays || 0 });
        });
    }
    if (lastFmRecentDelta.length > 0) {
        lastFmRecentDelta.forEach(t => {
            const artName = t.artist ? (t.artist['#text'] || t.artist.name || '') : '';
            const k = `${normalizeKey(t.name)}:::${normalizeKey(artName)}`;
            if (mapT.has(k)) mapT.get(k).plays += 1;
            else mapT.set(k, { type: 'track', name: t.name, subtitle: artName, plays: 1 });
        });
    }

    hlState.pool = Array.from(mapT.values()).filter(x => x.plays >= 15);
    hlState.streak = 0;
    hlState.locked = false;
    updateHlScoreBadges();

    const shuffled = [...hlState.pool].sort(() => 0.5 - Math.random());
    hlState.itemA = shuffled[0];
    hlState.itemB = shuffled.find(x => x.name !== hlState.itemA.name && x.plays !== hlState.itemA.plays) || shuffled[1];
    renderHigherLowerArena();
}
window.openHigherLowerModal = openHigherLowerModal;

function updateHlScoreBadges() {
    const curEl = document.getElementById('hl-current-streak');
    const bestEl = document.getElementById('hl-best-streak');
    if (curEl) curEl.textContent = hlState.streak;
    if (bestEl) bestEl.textContent = hlState.best;
}

function renderHigherLowerArena(revealedResult = null) {
    const body = document.getElementById('higher-lower-body');
    if (!body || !hlState.itemA || !hlState.itemB) return;

    const a = hlState.itemA;
    const b = hlState.itemB;
    const keyA = `track::${normalizeKey(a.name)}::${normalizeKey(a.subtitle)}`;
    const keyB = `track::${normalizeKey(b.name)}::${normalizeKey(b.subtitle)}`;
    const imgA = artCache[keyA] || FALLBACK_ART_SVG;
    const imgB = artCache[keyB] || FALLBACK_ART_SVG;

    body.innerHTML = `
        <div class="row g-3 align-items-stretch">
            <div class="col-12 col-sm-5">
                <div class="apple-bento-card h-100 text-center d-flex flex-column align-items-center justify-content-center p-4">
                    <img id="hl-img-a" src="${imgA}" class="rounded-4 shadow mb-3" style="width: 96px; height: 96px; object-fit: cover;" onerror="safeImgError(this)">
                    <div class="fw-bold text-white mb-0.5" style="font-size: 0.98rem;">${escapeHtml(a.name)}</div>
                    <div class="text-secondary small mb-3">${escapeHtml(a.subtitle)}</div>
                    <div class="apple-violet-gradient display-6 mb-0" style="font-size: 2rem;">${formatNumber(a.plays)}</div>
                    <small class="text-secondary text-uppercase" style="font-size: 0.65rem; letter-spacing: 0.08em;">streams registrados</small>
                </div>
            </div>
            <div class="col-12 col-sm-2 d-flex align-items-center justify-content-center">
                <div class="rounded-circle d-flex align-items-center justify-content-center fw-bold" style="width: 44px; height: 44px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.14); color: #38bdf8;">VS</div>
            </div>
            <div class="col-12 col-sm-5">
                <div class="apple-bento-card h-100 text-center d-flex flex-column align-items-center justify-content-center p-4" style="border-color: rgba(56, 189, 248, 0.35);">
                    <img id="hl-img-b" src="${imgB}" class="rounded-4 shadow mb-3" style="width: 96px; height: 96px; object-fit: cover;" onerror="safeImgError(this)">
                    <div class="fw-bold text-white mb-0.5" style="font-size: 0.98rem;">${escapeHtml(b.name)}</div>
                    <div class="text-secondary small mb-3">${escapeHtml(b.subtitle)}</div>
                    ${revealedResult === null ? `
                        <div class="d-flex flex-column gap-2 w-100 mt-1">
                            <button type="button" class="btn btn-sm btn-brand rounded-pill py-2 fw-semibold" onclick="guessHigherLower('higher')">
                                <i class="fa-solid fa-arrow-trend-up me-1.5"></i> MÁS streams que ${formatNumber(a.plays)}
                            </button>
                            <button type="button" class="btn btn-sm btn-outline-info rounded-pill py-2 fw-semibold" onclick="guessHigherLower('lower')">
                                <i class="fa-solid fa-arrow-trend-down me-1.5"></i> MENOS streams que ${formatNumber(a.plays)}
                            </button>
                        </div>
                    ` : `
                        <div class="display-6 fw-bold ${revealedResult ? 'text-success' : 'text-danger'} mb-1" style="font-size: 2rem;">${formatNumber(b.plays)}</div>
                        <div class="badge rounded-pill ${revealedResult ? 'bg-success' : 'bg-danger'} px-3 py-1 mb-2">
                            ${revealedResult ? '¡Correcto! 🔥' : '¡Fallaste! 💥'}
                        </div>
                        ${!revealedResult ? `
                            <button type="button" class="btn btn-sm btn-brand rounded-pill px-4 py-1.5 mt-1 fw-semibold" onclick="openHigherLowerModal()">
                                <i class="fa-solid fa-rotate-right me-1"></i> Jugar de nuevo
                            </button>
                        ` : ''}
                    `}
                </div>
            </div>
        </div>
    `;

    if (!artCache[keyA]) resolveSpotifyArtwork(a.name, a.subtitle, 'track', 'hl-img-a');
    if (!artCache[keyB]) resolveSpotifyArtwork(b.name, b.subtitle, 'track', 'hl-img-b');
}

function guessHigherLower(choice) {
    if (hlState.locked || !hlState.itemA || !hlState.itemB) return;
    hlState.locked = true;

    const aPlays = hlState.itemA.plays;
    const bPlays = hlState.itemB.plays;
    const isCorrect = (choice === 'higher' && bPlays >= aPlays) || (choice === 'lower' && bPlays <= aPlays);

    if (isCorrect) {
        hlState.streak++;
        if (hlState.streak > hlState.best) {
            hlState.best = hlState.streak;
            try { localStorage.setItem(HL_BEST_KEY, String(hlState.best)); } catch (e) {}
        }
        updateHlScoreBadges();
        renderHigherLowerArena(true);

        setTimeout(() => {
            hlState.itemA = hlState.itemB;
            const candidates = hlState.pool.filter(x => x.name !== hlState.itemA.name && x.plays !== hlState.itemA.plays);
            hlState.itemB = candidates[Math.floor(Math.random() * candidates.length)];
            hlState.locked = false;
            renderHigherLowerArena(null);
        }, 1150);
    } else {
        renderHigherLowerArena(false);
    }
}
window.guessHigherLower = guessHigherLower;
