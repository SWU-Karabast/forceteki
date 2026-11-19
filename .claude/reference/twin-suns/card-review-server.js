// Local server for the multiplayer (Twin Suns + Always Two) card review tool.
//   node card-review-server.js            (then open http://localhost:8123/)
// Card text comes from the official card data (test/json/Card, from `npm run get-cards`), never from our card
// implementations. Review results are stored in reviews.json beside this file. No dependencies; loopback only.
const http = require('http');
const fs = require('fs');
const path = require('path');

const os = require('os');

const PORT = Number(process.env.PORT) || 8123;
// Loopback only by default. LAN=1 also listens on the local network (for a phone on the same Wi-Fi). There is no
// login: anyone on that network can open the tool and change the review data, so only use it on a network you trust.
const LAN = process.env.LAN === '1';
const HOST = LAN ? '0.0.0.0' : '127.0.0.1';
const LAN_IPS = LAN ? Object.values(os.networkInterfaces()).flat().filter((i) => i && i.family === 'IPv4' && !i.internal).map((i) => i.address) : [];
const ALLOWED_HOSTS = ['localhost', '127.0.0.1', ...LAN_IPS].map((h) => `${h}:${PORT}`);
const CARD_DIR = path.join(__dirname, '..', '..', '..', 'test', 'json', 'Card');
const GROUPS_FILE = path.join(__dirname, 'review-groups.json');
const REVIEWS_FILE = path.join(__dirname, 'reviews.json');
const PAGE = path.join(__dirname, 'card-review-tool.html');
const MAX_BODY = 4 * 1024 * 1024;
const SET_ORDER = ['SOR', 'SHD', 'TWI', 'JTL', 'LOF', 'IBH', 'SEC', 'LAW', 'TS26', 'ASH', 'HMW', 'IC27'];

// Text in parentheses is reminder text, not rules text, so it is ignored when matching phrases.
function stripParenthetical(text) {
    let prev;
    let out = text;
    do {
        prev = out;
        out = out.replace(/\([^()]*\)/g, ' ');
    } while (out !== prev);
    return out.replace(/\s+/g, ' ').trim();
}

// Cards whose whole text is keywords have nothing opponent-dependent to review. Plot is deliberately not
// listed (it interacts with leader deployment); Overwhelm is covered by engine scenarios.
const KEYWORDS = String.raw`Ambush|Grit|Hidden|Overwhelm|Saboteur|Sentinel|Shielded|Support|Raid \d+|Restore \d+|Exploit \d+|Piloting \[[^\]]*\]|Smuggle \[[^\]]*\]`;
const KEYWORDS_ONLY = new RegExp(String.raw`^(?:(?:${KEYWORDS})[\s,.:]*)+$`, 'i');

function loadGroups() {
    const raw = JSON.parse(fs.readFileSync(GROUPS_FILE, 'utf8'));
    const groups = raw.groups.map((g) => ({ id: g.id, label: g.label, kind: g.kind, desc: g.desc, re: g.re }));
    groups.push({ id: raw.passfail.id, label: raw.passfail.label, kind: 'passfail', desc: raw.passfail.desc, re: null });
    return groups;
}

function setRank(set) {
    const i = SET_ORDER.indexOf(set);
    return i < 0 ? 100 : i;
}

let CARDS = null;
function loadCards() {
    if (CARDS) {
        return CARDS;
    }
    if (!fs.existsSync(CARD_DIR)) {
        throw new Error(`Card data not found at ${CARD_DIR}. Run "npm run get-cards" first.`);
    }
    const cards = [];
    for (const file of fs.readdirSync(CARD_DIR)) {
        if (!file.endsWith('.json')) {
            continue;
        }
        const d = JSON.parse(fs.readFileSync(path.join(CARD_DIR, file), 'utf8'));
        const isBase = d.types.includes('base');
        const isLeader = d.types.includes('leader');
        const fields = [];
        if (d.text) {
            fields.push({ label: isLeader ? 'Leader side' : 'Text', text: d.text });
        }
        if (d.deployBox) {
            fields.push({ label: 'Deployed', text: d.deployBox });
        }
        // Epic actions are only relevant on bases (leaders' epic action is just "deploy this leader").
        if (d.epicAction && isBase) {
            fields.push({ label: 'Epic Action', text: d.epicAction });
        }
        const stripped = fields.map((f) => stripParenthetical(f.text)).filter(Boolean);
        let auto = null;
        if (stripped.length === 0) {
            auto = 'No ability text';
        } else if (stripped.every((t) => /^mock ability text$/i.test(t))) {
            auto = 'Placeholder text (no real ability text)';
        } else if (stripped.every((t) => KEYWORDS_ONLY.test(t))) {
            auto = 'Keywords only';
        }
        cards.push({
            id: d.internalName,
            name: d.title,
            subtitle: d.subtitle || '',
            set: d.setId && d.setId.set,
            num: d.setId && d.setId.number != null ? String(d.setId.number).padStart(3, '0') : '',
            type: d.types.map((t) => t[0].toUpperCase() + t.slice(1)).join(' '),
            token: d.types.includes('token'),
            leader: isLeader,
            fields,
            rules: d.rules || '',
            auto,
            scan: stripped.join(' | ')
        });
    }
    cards.sort((a, b) => setRank(a.set) - setRank(b.set) || String(a.set).localeCompare(String(b.set)) || a.num.localeCompare(b.num) || a.id.localeCompare(b.id));
    CARDS = cards;
    return cards;
}

function buildData() {
    const groups = loadGroups();
    const compiled = groups.filter((g) => g.re).map((g) => ({ id: g.id, re: new RegExp(g.re, 'i') }));
    const cards = loadCards().map((c) => {
        let hits = [];
        if (!c.auto) {
            hits = compiled.filter((g) => g.re.test(c.scan)).map((g) => g.id);
            if (!hits.length) {
                hits = ['nohit'];
            }
        }
        const { scan, ...rest } = c;
        return { ...rest, hits };
    });
    return { groups, sets: [...new Set(cards.map((c) => c.set))], cards, reviews: readReviews(), suggestions: readSuggestions() };
}

// Drafted notes ({ id: { ts, a2 } }) shown pre-filled until the reviewer approves or edits them. Optional file.
const SUGGESTIONS_FILE = path.join(__dirname, 'note-suggestions.json');
function readSuggestions() {
    try {
        return JSON.parse(fs.readFileSync(SUGGESTIONS_FILE, 'utf8'));
    } catch (e) {
        if (e.code === 'ENOENT') {
            return {};
        }
        throw e;
    }
}

function readReviews() {
    try {
        return JSON.parse(fs.readFileSync(REVIEWS_FILE, 'utf8'));
    } catch (e) {
        if (e.code === 'ENOENT') {
            return {};
        }
        throw e;
    }
}

// One record per line, in set order, so the file diffs cleanly in git.
function writeReviews(reviews) {
    const order = new Map(loadCards().map((c, i) => [c.id, i]));
    const ids = Object.keys(reviews).sort((a, b) => (order.has(a) ? order.get(a) : 1e9) - (order.has(b) ? order.get(b) : 1e9) || a.localeCompare(b));
    const body = ids.map((id) => `  ${JSON.stringify(id)}: ${JSON.stringify(reviews[id])}`).join(',\n');
    const tmp = `${REVIEWS_FILE}.tmp`;
    fs.writeFileSync(tmp, `{\n${body}\n}\n`);
    fs.renameSync(tmp, REVIEWS_FILE);
}

const RES = new Set(['tag', 'ok', 'followup']);
function validRecord(r) {
    return r && typeof r === 'object' && !Array.isArray(r)
        && (r.tags === undefined || (Array.isArray(r.tags) && r.tags.every((t) => typeof t === 'string')))
        && (r.r === undefined || (typeof r.r === 'object' && Object.values(r.r).every((v) => RES.has(v))))
        && ['note', 'noteTS', 'noteA2', 'qAnswer'].every((k) => r[k] === undefined || (typeof r[k] === 'string' && r[k].length <= 2000))
        && (r.reviewed === undefined || typeof r.reviewed === 'boolean');
}

// updates: [{ id, record }] where record === null deletes the card's review.
function applyUpdates(updates) {
    const known = new Set(loadCards().map((c) => c.id));
    const reviews = readReviews();
    const errors = [];
    let saved = 0;
    for (const u of updates) {
        if (!u || typeof u.id !== 'string' || !known.has(u.id)) {
            errors.push(`unknown card: ${u && u.id}`);
        } else if (u.record === null) {
            delete reviews[u.id];
            saved++;
        } else if (!validRecord(u.record)) {
            errors.push(`${u.id}: bad record`);
        } else {
            reviews[u.id] = u.record;
            saved++;
        }
    }
    if (saved) {
        writeReviews(reviews);
    }
    return { saved, errors };
}

// Adds a review tag to review-groups.json. The phrase is optional: without one the tag matches no cards
// automatically and is only applied by hand in Single mode.
function addTag(body) {
    const label = typeof body.label === 'string' ? body.label.trim() : '';
    const desc = typeof body.desc === 'string' ? body.desc.trim() : '';
    const re = typeof body.re === 'string' ? body.re.trim() : '';
    if (!label || label.length > 60) {
        return { error: 'A label of 1-60 characters is required.' };
    }
    if (desc.length > 300 || re.length > 300) {
        return { error: 'Description and phrase must be 300 characters or fewer.' };
    }
    let compiled = null;
    if (re) {
        try {
            compiled = new RegExp(re, 'i');
        } catch (e) {
            return { error: `Invalid phrase / regular expression: ${e.message}` };
        }
    }
    const raw = JSON.parse(fs.readFileSync(GROUPS_FILE, 'utf8'));
    const base = `tag-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'new'}`;
    const taken = new Set([...raw.groups.map((g) => g.id), raw.passfail.id]);
    let id = base;
    for (let n = 2; taken.has(id); n++) {
        id = `${base}-${n}`;
    }
    raw.groups.push({ id, label, kind: 'tag', desc: desc || label, re: re || null });
    // Keep the file readable: the help text and each group on its own line(s).
    const text = `{\n  "_help": ${JSON.stringify(raw._help, null, 4).replace(/\n/g, '\n  ')},\n  "groups": [\n${raw.groups.map((g) => `    ${JSON.stringify(g)}`).join(',\n')}\n  ],\n  "passfail": ${JSON.stringify(raw.passfail)}\n}\n`;
    const tmp = `${GROUPS_FILE}.tmp`;
    fs.writeFileSync(tmp, text);
    fs.renameSync(tmp, GROUPS_FILE);
    const matches = compiled ? loadCards().filter((c) => !c.auto && compiled.test(c.scan)).length : 0;
    return { id, matches };
}

function hostAllowed(req) {
    return ALLOWED_HOSTS.includes(req.headers.host);
}

function send(res, code, body, type = 'application/json') {
    res.writeHead(code, { 'content-type': `${type}; charset=utf-8`, 'cache-control': 'no-store' });
    res.end(typeof body === 'string' ? body : JSON.stringify(body));
}

const server = http.createServer((req, res) => {
    try {
        if (!hostAllowed(req)) {
            return send(res, 403, { error: 'bad host' });
        }
        if (req.method === 'GET' && req.url === '/') {
            return send(res, 200, fs.readFileSync(PAGE, 'utf8'), 'text/html');
        }
        if (req.method === 'GET' && req.url === '/api/data') {
            return send(res, 200, buildData());
        }
        if (req.method === 'POST' && (req.url === '/api/save' || req.url === '/api/groups')) {
            const origin = req.headers.origin;
            if (req.headers['x-review-tool'] !== '1' || (origin && !ALLOWED_HOSTS.map((h) => `http://${h}`).includes(origin))) {
                return send(res, 403, { error: 'forbidden' });
            }
            let size = 0;
            const chunks = [];
            req.on('data', (c) => {
                size += c.length;
                if (size > MAX_BODY) {
                    req.destroy();
                } else {
                    chunks.push(c);
                }
            });
            req.on('end', () => {
                try {
                    const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
                    send(res, 200, req.url === '/api/groups' ? addTag(body) : applyUpdates(Array.isArray(body.updates) ? body.updates : []));
                } catch (e) {
                    send(res, 400, { error: String(e.message || e) });
                }
            });
            return undefined;
        }
        return send(res, 404, { error: 'not found' });
    } catch (e) {
        return send(res, 500, { error: String(e.message || e) });
    }
});

const data = buildData();
const auto = data.cards.filter((c) => c.auto).length;
console.log(`Loaded ${data.cards.length} cards: ${auto} auto-cleared, ${data.cards.length - auto} to review.`);
server.listen(PORT, HOST, () => {
    if (LAN) {
        console.log(`Card review server (LAN mode, reviews: ${REVIEWS_FILE})`);
        for (const ip of LAN_IPS) {
            console.log(`  Open on your phone: http://${ip}:${PORT}/`);
        }
        console.log(`  On this computer:   http://localhost:${PORT}/`);
    } else {
        console.log(`Card review server: http://localhost:${PORT}/  (reviews: ${REVIEWS_FILE})`);
    }
});
