// Builds card-notes-viewer-static.html: the same viewer as card-notes-viewer.html, with the card data and notes
// embedded so it opens straight from the file (no server) and is read-only. Rebuild it after changing card-notes.json.
// Run: node build-static-viewer.js   (needs test/json from `npm run get-cards`).
const fs = require('fs');
const path = require('path');
const { buildCardList } = require('./card-text');

const notes = JSON.parse(fs.readFileSync(path.join(__dirname, 'card-notes.json'), 'utf8'));
const cards = buildCardList(notes);
const page = fs.readFileSync(path.join(__dirname, 'card-notes-viewer.html'), 'utf8');

// "<" is escaped so no card text can end the script block early.
const json = JSON.stringify(cards).replace(/</g, '\\u003c');
const built = new Date().toISOString().slice(0, 10);
const marker = '<script>\nlet CARDS = [];';
if (!page.includes(marker)) { throw new Error('Could not find the viewer script in card-notes-viewer.html'); }
const html = page.replace(marker, () => `<script>window.NOTES_BUILT = ${JSON.stringify(built)}; window.NOTES_STATIC = ${json};</script>\n${marker}`);

const out = path.join(__dirname, 'card-notes-viewer-static.html');
fs.writeFileSync(out, html);
console.log(`wrote ${out}: ${cards.length} cards, ${(html.length / 1024 / 1024).toFixed(2)} MB`);
