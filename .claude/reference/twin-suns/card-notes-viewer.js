// A small local viewer for the per-card multiplayer test notes: browse cards, read the card text, edit the
// Twin Suns and Always Two tests (one per line), and save to card-notes.json.
//   node card-notes-viewer.js          (http://localhost:8123/, this computer only)
//   LAN=1 node card-notes-viewer.js    (also reachable from a phone on the same Wi-Fi)
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { loadCards, buildCardList } = require('./card-text');

const PORT = Number(process.env.PORT) || 8123;
const LAN = process.env.LAN === '1';
const NOTES = path.join(__dirname, 'card-notes.json');
const PAGE = path.join(__dirname, 'card-notes-viewer.html');
const lanIps = LAN ? Object.values(os.networkInterfaces()).flat().filter((i) => i && i.family === 'IPv4' && !i.internal).map((i) => i.address) : [];
const allowedHosts = ['localhost', '127.0.0.1', ...lanIps].map((h) => `${h}:${PORT}`);

const readNotes = () => JSON.parse(fs.readFileSync(NOTES, 'utf8'));
function writeNotes(notes) {
    const body = Object.keys(notes).map((id) => `  ${JSON.stringify(id)}: ${JSON.stringify(notes[id])}`).join(',\n');
    fs.writeFileSync(NOTES + '.tmp', `{\n${body}\n}\n`);
    fs.renameSync(NOTES + '.tmp', NOTES);
}
const lines = (a) => (Array.isArray(a) ? a : []).map((l) => String(l).trim()).filter(Boolean);

const cardList = () => buildCardList(readNotes());

http.createServer((req, res) => {
    if (!allowedHosts.includes(req.headers.host)) { res.writeHead(403); res.end('forbidden host'); return; }
    if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
        res.end(fs.readFileSync(PAGE));
    } else if (req.method === 'GET' && req.url === '/api/cards') {
        res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
        res.end(JSON.stringify(cardList()));
    } else if (req.method === 'POST' && req.url === '/api/save' && req.headers['x-notes-viewer'] === '1') {
        let body = '';
        req.on('data', (d) => { body += d; if (body.length > 200000) { req.destroy(); } });
        req.on('end', () => {
            try {
                const { id, ts, a2 } = JSON.parse(body);
                if (!loadCards()[id]) { throw new Error('unknown card'); }
                const notes = readNotes();
                notes[id] = { ts: lines(ts), a2: lines(a2) };
                writeNotes(notes);
                res.writeHead(200, { 'content-type': 'application/json' });
                res.end('{"saved":true}');
            } catch (e) {
                res.writeHead(400, { 'content-type': 'application/json' });
                res.end(JSON.stringify({ error: String(e.message) }));
            }
        });
    } else {
        res.writeHead(404); res.end('not found');
    }
}).listen(PORT, LAN ? '0.0.0.0' : '127.0.0.1', () => {
    console.log(`Card notes viewer: http://localhost:${PORT}/`);
    lanIps.forEach((ip) => console.log(`On your phone:     http://${ip}:${PORT}/`));
});
