# Twin Suns and Always Two: multiplayer test research

Research for server-side multiplayer support: Twin Suns (3-4 player FFA) and Always Two / Doubles (2v2). Docs and data only; no engine or card code.

- `card-test-needs/` is the main output: per set, the Twin Suns and Always Two tests each card still needs (generated from `card-notes.json`).
- `engine-test-notes.md` lists the behaviours that are tested once at the engine level, so the per-card lists do not repeat them.
- `rulings.md` holds the judge rulings and deductions the notes rest on; anything the official rules already say is left out.
- `open-questions.md` lists what is still unknown.

Tooling (both need the card data from `npm run get-cards`):
- `node card-notes-viewer.js` opens a small local viewer to browse cards and edit their notes (`LAN=1` to use it from a phone). It saves to `card-notes.json`.
- `node build-test-lists.js` regenerates `card-test-needs/` from `card-notes.json`. `card-text.js` is shared by both and applies official errata to the card text.
