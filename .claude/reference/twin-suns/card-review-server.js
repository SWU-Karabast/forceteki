// Local server for the Twin Suns card review page.
//   node card-review-server.js            (then open http://localhost:8123/)
// Reads card-reviews/*.md as the master data and writes review results back into them.
// No dependencies. Binds to loopback only.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 8123;
const HOST = '127.0.0.1';
const REVIEW_DIR = path.join(__dirname, 'card-reviews');
const PAGE = path.join(__dirname, 'card-review-tool.html');
const STATUSES = ['Unreviewed', 'Reviewed', 'Finished'];
const MAX_BODY = 2 * 1024 * 1024;

const TAGS = [
    ['EACH-PLAYER', '"each player" / "all players" / "each other player": applies to every non-eliminated player, including the controller.'],
    ['ANY', 'Choose any ONE player or base, including your own ("a player", "any player", "a base"): not limited to opponents.'],
    ['OPP-CHOOSE', 'Card says "an opponent" / "target opponent": controller chooses one.'],
    ['OPP-EACH', '"each opponent" / "opponents": affects every non-eliminated opponent.'],
    ['OPP-BASE', 'Targets or counts an enemy/opponent base: which base?'],
    ['CHOOSE-N', 'Choose an exact number of players/opponents/bases ("Choose 2 players").'],
    ['MULTI-CHOOSE', 'Choose any number / up to N of players, opponents, bases or zones.'],
    ['OPP-ZONE', "Touches an opponent's hand / deck / resources / discard."],
    ['ENEMY-UNIT', '"enemy unit" / "each enemy": units of every opponent are targets.'],
    ['COMPARE', '"most / fewest / fewer than an opponent / each player" comparisons (per-card ruling).'],
    ['CONTROL', 'Take / give control; owner vs controller.'],
    ['INITIATIVE', 'Initiative / Blast / Plan counters.'],
    ['ELIM', 'Interacts with player elimination (removal, no defeat triggers).'],
    ['TRIGGER-ORDER', 'Simultaneous triggers across 3+ players.'],
    ['TWO-LEADER', 'Leader / two-leader deck interaction.'],
    ['OTHER', 'Does not fit the other tags; see the note for what the test must cover.'],
    ['NONE', 'No opponent-dependent behavior; no 3-4p test needed.']
].map(([id, desc]) => ({ id, desc }));
const TAG_IDS = new Set(TAGS.map((t) => t.id));

// Heuristic suggestions only: a keyword scan of the official text. The reviewer adds/removes.
const RULES = [
    ['CHOOSE-N', /choose (?:\d+|two|three|four) (?:other )?(?:players?|opponents?|bases?)/i],
    ['MULTI-CHOOSE', /(?:any number of|up to \w+) (?:other )?(?:players?|opponents?|bases?)/i],
    ['EACH-PLAYER', /each (?:other )?player|all players|every player/i],
    ['ANY', /\b(?:a|any|target|chosen) (?:other )?(?:player|base)\b(?!s)/i],
    ['OPP-EACH', /each opponent|\bopponents\b(?!')/i],
    ['OPP-CHOOSE', /\b(?:an|target|chosen|that) opponent\b(?!'s? (?:hand|deck|resource))/i],
    ['OPP-BASE', /(?:enemy|opponent'?s?|their|each|a|any|that|the) bases?\b|each of any number of bases/i],
    ['OPP-ZONE', /(?:opponent|enemy|their)'?s?[^.|]{0,25}(?:hand|deck|resources?|discard pile)/i],
    ['ENEMY-UNIT', /\benemy (?:non-leader |ground |space |token )?units?\b|\beach enemy\b/i],
    ['COMPARE', /\b(?:more|fewer|less) [^.|]{0,40}than\b|\bthe most\b|\bfewest\b|\bhas the most\b|\bmost power\b/i],
    ['CONTROL', /take control|gain control|takes control|give control/i],
    ['INITIATIVE', /initiative|blast counter|plan counter/i]
    // TWO-LEADER is intentionally never suggested: a keyword hit on "leader" is almost always wrong,
    // so the reviewer must select it by hand.
];

// Text in parentheses is reminder/helper text, not rules text, so it is ignored when suggesting tags
// (it is still shown on the card). Nested parentheses are removed from the inside out.
function stripParenthetical(text) {
    let prev;
    let out = text;
    do {
        prev = out;
        out = out.replace(/\([^()]*\)/g, ' ');
    } while (out !== prev);
    return out.replace(/\s+/g, ' ').trim();
}

function suggest(texts) {
    const t = texts.map(stripParenthetical).join(' | ');
    const out = RULES.filter(([, re]) => re.test(t)).map(([id]) => id);
    return out.length ? out : ['NONE'];
}

// Cards whose entire text is keyword abilities (reminder text in parentheses is ignored) have nothing
// opponent-dependent to test per card, so they are marked NONE / Finished automatically.
const KEYWORDS = String.raw`Ambush|Grit|Hidden|Overwhelm|Saboteur|Sentinel|Shielded|Raid \d+|Restore \d+|Exploit \d+|Piloting \[[^\]]*\]|Smuggle \[[^\]]*\]`;
const KEYWORDS_ONLY = new RegExp(String.raw`^(?:(?:${KEYWORDS})[\s,]*)+$`, 'i');
function isKeywordOnly(fields) {
    const texts = fields.filter(([l]) => l !== 'Rules').map(([, v]) => v);
    return texts.length > 0 && texts.every((t) => {
        const stripped = stripParenthetical(t);
        return stripped && KEYWORDS_ONLY.test(stripped);
    });
}

function autoMarkKeywordOnly() {
    const updates = loadCards().cards
        .filter((c) => c.status === 'Unreviewed' && !c.saved.tags && !c.saved.note && isKeywordOnly(c.fields))
        .map((c) => ({ dir: c.dir, internalName: c.internalName, tags: ['NONE'], note: 'Keywords only (auto-marked)', status: 'Finished' }));
    return updates.length ? applyUpdates(updates) : { saved: 0, files: [], errors: [] };
}

function reviewFiles() {
    return fs.readdirSync(REVIEW_DIR).filter((f) => /^\d\d_[A-Z0-9]+\.md$/.test(f)).sort();
}

function parseTagsLine(value) {
    if (!value || /^TBD\b/i.test(value)) {
        return null;
    }
    if (/^none\b/i.test(value)) {
        return ['NONE'];
    }
    const tags = value.split(',').map((t) => t.trim().toUpperCase()).filter((t) => TAG_IDS.has(t));
    return tags.length ? tags : null;
}

function loadCards() {
    const cards = [];
    for (const file of reviewFiles()) {
        const dir = file.replace('.md', '');
        const set = dir.split('_')[1];
        const md = fs.readFileSync(path.join(REVIEW_DIR, file), 'utf8').replace(/\r/g, '');
        for (const block of md.split(/^### /m).slice(1)) {
            const lines = block.split('\n');
            const m = lines[0].match(/^(\d{3}|Token) - (.*)$/);
            const get = (label) => {
                const l = lines.find((x) => x.startsWith(`- ${label}: `));
                return l ? l.slice(label.length + 4) : null;
            };
            const internalName = (get('Internal name') || '').replace(/`/g, '');
            const type = get('Type') || '';
            const fields = [];
            for (const label of ['Text', 'Deployed', 'Epic Action', 'Rules']) {
                const v = get(label);
                if (v && v !== '(none)') {
                    fields.push([label, v]);
                }
            }
            const status = get('Status') || 'Unreviewed';
            const noText = !fields.some(([l]) => l !== 'Rules');
            cards.push({
                dir, set, num: m ? m[1] : '', name: m ? m[2] : lines[0], internalName, type, fields, status,
                saved: { tags: parseTagsLine(get('Multiplayer tests')), note: get('Test notes') || '' },
                suggested: noText ? ['NONE'] : suggest(fields.filter(([l]) => l !== 'Rules').map(([, v]) => v)),
                suggestedSource: noText ? 'no card text' : 'keyword scan'
            });
        }
    }
    return { tags: TAGS, sets: reviewFiles().map((f) => f.replace('.md', '')), cards };
}

// Applies updates to the master markdown files. Fields left undefined are not touched.
function applyUpdates(updates) {
    const errors = [];
    const byDir = new Map();
    for (const u of updates) {
        if (!u || typeof u.dir !== 'string' || typeof u.internalName !== 'string') {
            errors.push('malformed update');
            continue;
        }
        if (!reviewFiles().includes(`${u.dir}.md`)) {
            errors.push(`unknown set file: ${u.dir}`);
            continue;
        }
        if (u.status !== undefined && !STATUSES.includes(u.status)) {
            errors.push(`${u.internalName}: bad status`);
            continue;
        }
        if (u.tags !== undefined && (!Array.isArray(u.tags) || u.tags.some((t) => !TAG_IDS.has(t)))) {
            errors.push(`${u.internalName}: bad tags`);
            continue;
        }
        if (u.note !== undefined && (typeof u.note !== 'string' || u.note.length > 2000)) {
            errors.push(`${u.internalName}: bad note`);
            continue;
        }
        if (!byDir.has(u.dir)) {
            byDir.set(u.dir, []);
        }
        byDir.get(u.dir).push(u);
    }

    let saved = 0;
    const files = [];
    for (const [dir, list] of byDir) {
        const file = path.join(REVIEW_DIR, `${dir}.md`);
        const raw = fs.readFileSync(file, 'utf8');
        const eol = raw.includes('\r\n') ? '\r\n' : '\n';
        const lines = raw.split(/\r?\n/);
        let changed = false;
        for (const u of list) {
            const marker = `- Internal name: \`${u.internalName}\``;
            const at = lines.indexOf(marker);
            if (at < 0) {
                errors.push(`${u.internalName}: not found in ${dir}.md`);
                continue;
            }
            let start = at;
            while (start > 0 && !lines[start].startsWith('### ')) {
                start--;
            }
            let end = at + 1;
            while (end < lines.length && !/^#{2,3} /.test(lines[end])) {
                end++;
            }
            const find = (label) => {
                for (let i = start; i < end; i++) {
                    if (lines[i].startsWith(`- ${label}:`)) {
                        return i;
                    }
                }
                return -1;
            };
            const statusAt = find('Status');
            if (statusAt < 0) {
                errors.push(`${u.internalName}: no Status line`);
                continue;
            }
            if (u.tags !== undefined) {
                const text = `- Multiplayer tests: ${u.tags.length ? u.tags.join(', ') : 'TBD'}`;
                const i = find('Multiplayer tests');
                if (i >= 0) {
                    lines[i] = text;
                } else {
                    lines.splice(find('Status'), 0, text);
                    end++;
                }
            }
            if (u.note !== undefined) {
                const note = u.note.replace(/\s+/g, ' ').trim();
                const i = find('Test notes');
                if (!note && i >= 0) {
                    lines.splice(i, 1);
                    end--;
                } else if (note) {
                    const text = `- Test notes: ${note}`;
                    if (i >= 0) {
                        lines[i] = text;
                    } else {
                        const t = find('Multiplayer tests');
                        lines.splice(t >= 0 ? t + 1 : find('Status'), 0, text);
                        end++;
                    }
                }
            }
            if (u.status !== undefined) {
                lines[find('Status')] = `- Status: ${u.status}`;
            }
            changed = true;
            saved++;
        }
        if (changed) {
            const tmp = `${file}.tmp`;
            fs.writeFileSync(tmp, lines.join(eol));
            fs.renameSync(tmp, file);
            files.push(`${dir}.md`);
        }
    }
    return { saved, files, errors };
}

function hostAllowed(req) {
    return [`localhost:${PORT}`, `127.0.0.1:${PORT}`].includes(req.headers.host);
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
            return send(res, 200, loadCards());
        }
        if (req.method === 'POST' && req.url === '/api/save') {
            const origin = req.headers.origin;
            if (req.headers['x-review-tool'] !== '1' || (origin && ![`http://localhost:${PORT}`, `http://127.0.0.1:${PORT}`].includes(origin))) {
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
                    send(res, 200, applyUpdates(Array.isArray(body.updates) ? body.updates : []));
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

const auto = autoMarkKeywordOnly();
if (auto.saved) {
    console.log(`Auto-marked ${auto.saved} keyword-only card(s) as NONE / Finished in: ${auto.files.join(', ')}`);
}
if (auto.errors.length) {
    console.log(`Auto-mark problems: ${auto.errors.join('; ')}`);
}

server.listen(PORT, HOST, () => console.log(`Card review server: http://localhost:${PORT}/  (writes to ${REVIEW_DIR})`));
