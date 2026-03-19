# Forceteki Guidelines

## Architecture
- Edit source files under `server/**`, `test/**`, and `scripts/**`. `build/**` is generated output and should not be edited by hand.
- `server/game/**` contains the deterministic game engine, card implementations, abilities, and snapshot/state systems.
- `server/gamenode/**`, `server/services/**`, and `server/socket.js` handle lobby, networking, and persistence concerns. Keep card and rules logic in the game engine layer.
- `legacy_jigoku/**` is legacy reference code from Ringteki/Jigoku. Use it for ideas only; do not make new changes there unless the task explicitly targets it.

## Build And Test
- Use Node.js 22.x.
- First-time setup: `npm install`, then `npm run get-cards` to populate card data.
- Main validation commands: `npm run lint` and `npm test`.
- Fast test iteration: `npm run test-fast -- <spec path or glob>` when the build output is already up to date.
- `npm run test-parallel` is for speed only. If it fails, rerun with `npm test` because parallel mode can hide the exact failing spec.
- If specs stop reappearing after deleting `build/test`, also delete `build/tsconfig.tsbuildinfo` before rebuilding.

## Conventions
- Follow the existing ESLint-enforced style in `eslint.config.mjs`; avoid repo-wide reformatting in unrelated files.
- New card implementations belong in `server/game/cards/**` and should usually include at least one unit test.
- For test setup and custom matchers, prefer the existing helpers in `test/helpers/**` over ad hoc test scaffolding.
- In `server/game/**`, do not use raw aspect/token text where the custom ESLint rule forbids it.

## State Serialization
- Concrete `GameObjectBase` state classes must use `@registerState()`.
- Shared or abstract bases that only contribute inherited state fields must use `@registerStateBase()` and must not be emitted as standalone serializers.
- State fields need the correct state decorators so generated serializers and snapshots stay consistent.
- Never hand-edit generated serializers. Update `scripts/generate-state-serializers.ts` or the relevant decorator metadata instead.
- If a concrete serializer is missing inherited fields, fix the generator's static mixin/inheritance resolution or add explicit generator metadata. Do not broaden serializer emission to all `@registerStateBase()` classes.

## Docs
- See `README.md` for setup, dev server, lint/test commands, and VS Code debugging profiles.
- See `docs/implementing-cards.md` for card implementation workflow and file placement.
- See `docs/testing-cards.md` and `docs/test-cheat-sheet.md` for test patterns, naming rules, and helpers.
- See `docs/debugging-guide.md` for breakpoint strategy, GamePipeline debugging, and GameSystem troubleshooting.
- See `docs/plans/generated-state-serializers.md` for serializer generation and state-system design details.