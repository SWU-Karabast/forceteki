# swupgn

Engine-independent reference reader for the SWU-PGN/1.1 game format.

- `parse(text)` -> structured document (header, decks, events, annotations)
- `fold(events)` / `stateAt(events, seq)` -> reconstructed board state (no rules engine)
- `render(doc)` -> the normative human-readable game story
- `validate(text)` -> conformance report

This module MUST NOT import from `server/game/` (the SWU rules engine). It is the
executable reference for `docs/SWU-PGN-1.1-SPEC.md`.
