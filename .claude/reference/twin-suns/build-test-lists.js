// Builds the per-set lists of multiplayer test needs (card-test-needs/<NN>_<SET>.md) from card-notes.json.
// Run: node build-test-lists.js   (needs test/json from `npm run get-cards`).
const fs = require('fs');
const path = require('path');
const { loadCards, SET_ORDER } = require('./card-text');

const OUT_DIR = path.join(__dirname, 'card-test-needs');
const notes = JSON.parse(fs.readFileSync(path.join(__dirname, 'card-notes.json'), 'utf8'));
const cards = loadCards();

const bySet = {};
for (const [id, n] of Object.entries(notes)) {
    const c = cards[id];
    if (!c) { console.warn('no card data for', id); continue; }
    (bySet[c.set || 'OTHER'] = bySet[c.set || 'OTHER'] || []).push({ id, c, n });
}

const clean = (s) => String(s || '').replace(/\s*\n\s*/g, ' / ').replace(/(\s*\/)+\s*$/, '').trim();
const lines = (a) => (Array.isArray(a) ? a : []).map((l) => String(l).trim()).filter(Boolean);
const rank = (s) => { const i = SET_ORDER.indexOf(s); return i < 0 ? 100 : i; };

fs.mkdirSync(OUT_DIR, { recursive: true });
for (const f of fs.readdirSync(OUT_DIR)) { fs.unlinkSync(path.join(OUT_DIR, f)); }

const index = [];
Object.keys(bySet).sort((a, b) => rank(a) - rank(b) || a.localeCompare(b)).forEach((set, i) => {
    const entries = bySet[set].sort((x, y) => x.c.num.localeCompare(y.c.num) || x.id.localeCompare(y.id));
    let withTests = 0;
    const body = [];
    for (const { c, n } of entries) {
        const ts = lines(n.ts), a2 = lines(n.a2);
        if (!ts.length && !a2.length) { continue; }
        withTests++;
        body.push(`### ${c.name}${c.subtitle ? ' — ' + c.subtitle : ''}${c.num ? ' #' + c.num : ''}`, '');
        body.push(`> ${clean(c.fields.map((f) => f.text).join(' // '))}`, '');
        if (ts.length) { body.push('**Twin Suns**', ...ts.map((l) => '- ' + l), ''); }
        if (a2.length) { body.push('**Always Two**', ...a2.map((l) => '- ' + l), ''); }
    }
    const file = String(i + 1).padStart(2, '0') + '_' + set + '.md';
    const head = [`# ${set}: multiplayer test needs`, '', `${withTests} of the ${entries.length} reviewed ${set} cards need Twin Suns or Always Two tests beyond the engine-level ones (see ../engine-test-notes.md). Cards not listed need none.`, ''];
    fs.writeFileSync(path.join(OUT_DIR, file), head.concat(body).join('\n'));
    index.push({ file, set, withTests, reviewed: entries.length });
});

const readme = ['# Card test needs, by set', '',
    'Per-card multiplayer tests still needed for Twin Suns (3-4 player FFA) and Always Two (2v2), one file per set. Tests that apply to the engine as a whole are in `../engine-test-notes.md` and are not repeated here. Edit `../card-notes.json` (or use `node ../card-notes-viewer.js`) and re-run `node build-test-lists.js` to regenerate these files.', '',
    '| Set | Cards listed | Reviewed |', '|---|---|---|'].concat(index.map((x) => `| [${x.set}](${x.file}) | ${x.withTests} | ${x.reviewed} |`));
fs.writeFileSync(path.join(OUT_DIR, 'README.md'), readme.join('\n') + '\n');
console.log(index.map((x) => `${x.file}: ${x.withTests}/${x.reviewed}`).join('\n'));
