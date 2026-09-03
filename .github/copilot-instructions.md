# Project Guidelines

## Architecture
- Core backend and game logic live under `server\`. The game engine is centered in `server\game\core\`, with reusable rules/effects in `server\game\gameSystems\`, triggered behavior in `server\game\abilities\`, and event tracking in `server\game\stateWatchers\`.
- Card implementations are organized by set under `server\game\cards\<set>\...`. Follow nearby cards in the same set and card type folder before introducing new patterns.
- Tests mirror production structure under `test\server\cards\...`. Shared test setup and matchers live in `test\helpers\`.
- Treat `build\` as generated output. Edit source files in `server\`, `test\`, `scripts\`, and docs instead of changing generated files.

## Build and Test
- Use Node.js `v22.x`.
- Install dependencies with `npm install`.
- Run `npm run get-cards` when card definitions or generated test card data need to be refreshed.
- Use `npm run dev` for local development; it creates a default `.env` when one is missing.
- Use `npm run build` for a full production build and after files are added, deleted, or renamed.
- Use `npm test` as the default verification command. It rebuilds the test output and runs Jasmine sequentially with stable output.
- Use `npm run test-fast` only when iterating on a specific test after an initial build; it skips the full server rebuild. Use `npm run test-parallel` only for speed checks; if it fails, rerun with `npm test` because parallel mode can hide the exact failing spec.
- Use `npm run lint` to check style and `npm run lint-fix` for safe autofixes.

## Conventions
- Follow the existing ESLint configuration in `eslint.config.mjs`: 4-space indentation, single quotes, explicit member accessibility, and the repo's current TypeScript and Jasmine style.
- Card classes should extend the appropriate base class, implement `getImplementationId()`, and compose abilities through `AbilityHelper` and existing helpers before adding new abstractions.
- Prefer existing `gameSystems`, `ongoingEffects`, and `stateWatchers` over bespoke card logic. `AbilityHelper` is the main facade for costs, immediate effects, limits, and watchers.
- Respect the custom ESLint rules under `eslint-rules\`, especially the rule against raw aspect/token text and the state array decorator rule.
- Card tests should use the existing `integration()` flow and `setupTestAsync()` helpers from `test\helpers\IntegrationHelper.js` and related builders/matchers in `test\helpers\`.
- In tests, use internal card names such as `luke-skywalker#faithful-friend`, and keep new specs in the mirrored path for the card being changed.

## Pitfalls
- If you hit `Importing card class with repeated id!`, delete `build\` and rebuild. This often happens after adding, deleting, or renaming card files.
- If a needed card is missing from generated test data, run `npm run get-cards` before changing test fixtures by hand.
- Prefer existing source and test patterns over older docs under `docs\`; the local docs are useful quick references, but the wiki is the primary long-form guide.

## Docs
- Start with `README.md` for setup, common commands, debugging entry points, and FAQ.
- Use the project wiki for deeper card implementation, testing, and debugging guidance: `https://github.com/SWU-Karabast/forceteki/wiki`
- Use `docs\test-cheat-sheet.md` for matcher and test harness reminders, and `docs\debugging-guide.md` for debugging workflows.
- Use `docs\implementing-cards.md` and `docs\testing-cards.md` only as secondary references when the wiki is not enough.
- Use `.vscode\launch.json` when you need the repo's preconfigured VS Code debug profiles.
