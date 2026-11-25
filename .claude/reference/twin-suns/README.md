# Twin Suns and Always Two: multiplayer test research

Research for server-side multiplayer support: Twin Suns (3-4 player FFA) and Always Two / Doubles (2v2). Docs and data only; no engine or card code.

- `card-test-needs/` is the main output: per set, the Twin Suns and Always Two tests each card still needs (generated from `card-notes.json`).
- `engine-test-notes.md` lists the behaviours that are tested once at the engine level, so the per-card lists do not repeat them.
- `rulings.md` holds the judge rulings and deductions the notes rest on; anything the official rules already say is left out.
- `open-questions.md` lists what is still unknown.

Tooling (both need the card data from `npm run get-cards`):
- `node card-notes-viewer.js` opens a small local viewer (http://localhost:8123/; `LAN=1` to use it from a phone) to browse the cards and their tests, and to edit them. It saves to `card-notes.json`.
  - Nothing is shown until you pick a filter: type (Base, Leader, Unit, Event, Upgrade), Space or Ground for units, cost for units, upgrades and events, one or more aspects (a card must have all selected), a set, or a search.
  - The top drop-down chooses cards with tests, without tests needed, reviewed or all; with "With tests", a Tests row narrows it to Twin Suns, Always Two, either or both. Cost buttons with no matching cards are grayed out.
  - A toggle in the top right switches between a grid of card images (a badge on each shows its test count for the chosen format) and a plain list of title, subtitle and test counts. Click a card or row to expand it, and click the image or Close to fold it back.
  - Cards are read-only until you press Edit; Save writes the change to `card-notes.json`.
- `node build-test-lists.js` regenerates `card-test-needs/` from `card-notes.json`. `card-text.js` is shared by both and applies official errata to the card text.
