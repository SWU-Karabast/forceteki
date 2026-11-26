// Shared by the notes viewer and the test-list builder: loads the official card data and returns each card's
// ability text with official errata applied. Printed text is in `text`; errata are "(ERRATA)" lines in `rules`.
const fs = require('fs');
const path = require('path');

const CARD_DIR = path.join(__dirname, '..', '..', 'test', 'json', 'Card');

// Errata that rewrites ability text replaces the matching printed segment (same opening words), or the whole field
// when the card has only one field; if nothing matches it is added as its own field. Errata about templating,
// traits or names does not change what a card does and is ignored.
function applyErrata(fields, rules, id) {
    if (!rules) {
        return;
    }
    const lines = rules.split('\n').map((l) => l.trim())
        .filter((l) => (/^\(?ERRATA\)?:?/i).test(l) && !(/Templating update|Trait|Name:/i).test(l));
    for (const line of lines) {
        const e = line.replace(/^\(?ERRATA\)?:?\s*/i, '');
        if (id === 'krrsantan#hit-and-run') {
            fields.forEach((f) => {
                f.text = f.text.replace(/Return this unit to your hand \(from play\)\./, 'Return this unit to its owner\'s hand.'); f.errata = true;
            });
            continue;
        }
        const lead = (t) => {
            const m = t.match(/^[^:]{1,25}:/); return (m ? m[0] : t.slice(0, 12)).toLowerCase();
        };
        const key = lead(e);
        let done = false;
        for (const f of fields) {
            const segs = f.text.split('\n');
            const i = segs.findIndex((s) => lead(s) === key);
            if (i >= 0) {
                segs[i] = e;
                f.text = (id === 'unrefusable-offer' ? segs.slice(0, i + 1) : segs).join('\n');
                f.errata = true;
                done = true;
                break;
            }
        }
        if (!done) {
            if (fields.length === 1) {
                fields[0].text = e;
                fields[0].errata = true;
            } else {
                fields.push({ label: 'Text', text: e, errata: true });
            }
        }
    }
}

let CARDS = null;
function loadCards() {
    if (CARDS) {
        return CARDS;
    }
    if (!fs.existsSync(CARD_DIR)) {
        throw new Error(`Card data not found at ${CARD_DIR}. Run "npm run get-cards" first.`);
    }
    CARDS = {};
    for (const file of fs.readdirSync(CARD_DIR)) {
        if (!file.endsWith('.json')) {
            continue;
        }
        let d;
        try {
            d = JSON.parse(fs.readFileSync(path.join(CARD_DIR, file), 'utf8'));
        } catch (e) {
            continue;
        }
        if (!d.internalName || !d.types || CARDS[d.internalName]) {
            continue;
        }
        const isBase = d.types.includes('base');
        const isLeader = d.types.includes('leader');
        const fields = [];
        if (d.text) {
            fields.push({ label: isLeader ? 'Leader side' : 'Text', text: d.text });
        }
        if (d.deployBox) {
            fields.push({ label: 'Deployed', text: d.deployBox });
        }
        if (d.epicAction && isBase) {
            fields.push({ label: 'Epic Action', text: d.epicAction });
        }
        applyErrata(fields, d.rules, d.internalName);
        CARDS[d.internalName] = {
            id: d.internalName,
            name: d.title,
            subtitle: d.subtitle || '',
            set: d.setId && d.setId.set,
            num: d.setId && d.setId.number != null ? String(d.setId.number).padStart(3, '0') : '',
            type: d.types.join(' '),
            types: d.types,
            aspects: d.aspects || [],
            arena: d.arena || '',
            cost: d.cost == null ? null : Number(d.cost),
            token: d.types.includes('token'),
            fields: fields.map((f) => ({ label: f.label + (f.errata ? ' (errata)' : ''), text: f.text.replace(/<[^>]+>/g, '') }))
        };
    }
    return CARDS;
}

const SET_ORDER = ['SOR', 'SHD', 'TWI', 'JTL', 'LOF', 'IBH', 'SEC', 'LAW', 'TS26', 'ASH', 'HMW', 'IC27'];

// Every non-token card with its tests (from card-notes.json's shape: { id: { ts: [], a2: [] } }), in set order.
// Used by the local viewer's API and by the static viewer build, so both show the same data.
function buildCardList(notes) {
    const rank = (s) => {
        const i = SET_ORDER.indexOf(s); return i < 0 ? 100 : i;
    };
    return Object.values(loadCards())
        // TST is only the placeholder "Mock Unreleased Unit" from scripts/mockdata.js, not a real set.
        .filter((c) => !c.token && c.set && c.set !== 'TST')
        .map((c) => Object.assign({}, c, { ts: (notes[c.id] || {}).ts || [], a2: (notes[c.id] || {}).a2 || [], reviewed: !!notes[c.id] }))
        .sort((a, b) => rank(a.set) - rank(b.set) || a.set.localeCompare(b.set) || a.num.localeCompare(b.num) || a.id.localeCompare(b.id));
}

module.exports = { loadCards, buildCardList, SET_ORDER, CARD_DIR };
