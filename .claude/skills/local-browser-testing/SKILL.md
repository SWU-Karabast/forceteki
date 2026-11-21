---
name: local-browser-testing
description: >
  Test the local Karabast site in a browser with Playwright, as several players at once (anonymous quick matches
  and lobbies, dev-user test games, action timers), against a local game node from this repo. The full skill lives
  in the forceteki-client repo; this one finds it. TRIGGER when: the user asks to test, try, check or reproduce
  something on the local site or in a local game in a browser, or to verify a server change end to end through
  the client. Also consider offering it whenever a server change affects what players see or how a game flows
  beyond the rules engine: prompt behavior, the action timer, best-of-three and rematches, lobbies and matchmaking,
  conceding and the end of a game, reconnects, spectators, chat, or the game and lobby state the client renders.
  Always ask the user first and wait for a yes; a run is slow.
---

The browser-testing skill lives with the client, which has Playwright as a dev dependency and the helpers the skill
uses (`scripts/playwright/`). This file says when to offer it and how to find it.

## When to offer it, and asking first

Specs check the server; a browser test checks that players can still get through the game with the client as it is.
Consider offering one when a server change affects what a player sees or does beyond the rules engine:
- **Prompts:** a new kind of prompt (`server/game/core/gameSteps/prompts/`), or changes to a prompt's buttons,
  wording, order, or how it is answered. That includes anything that changes the captured states in
  `test/stateCaptures/`.
- **The action timer:** turn and main time, warnings, pauses, running out (`server/game/core/actionTimer/`, and
  `actionTimersEnabled` in `server/gamenode/GameNodeConfig.ts`).
- **Match flow:** best-of-three sets, rematches, converting a game to best-of-three, conceding, leaving, and the
  game-over screen (largely `server/gamenode/Lobby.ts`).
- **Lobbies and matchmaking:**
  - creating, joining, readying and starting a game;
  - lobby settings;
  - how deck import and deck validation errors reach the player;
  - the queue and the quick-lobby countdown (`QueueHandler.ts`, `MatchmakingRules.ts`).
- **Connections and limits:**
  - reconnecting, spectators, chat and undo requests;
  - the socket commands a client sends;
  - what anonymous players may do compared with signed-in ones.
- **Anything else** in the game state or lobby state the client reads.

Card implementations and rules fixes are what the jasmine specs are for. Offer a browser test for one only when it
changes how a prompt looks or behaves.

**Always ask first, and never start a browser test on your own.** It is slow:
- Starting both servers takes about half a minute; the game node's build alone takes about 20 s.
- Each standard flow takes from a few seconds to half a minute, and a timer check longer.
- A script written for the feature takes longer again.

Offer it once the change works and its specs pass. Say which flows you would play, for example "a quick match to
the first action, then concede to check the game-over screen", and roughly how long that would take. Wait for a
yes. A request from the user to test in the browser counts as the yes, and one yes covers re-runs within the same
piece of work. If the change also needs client work before a browser test can show it, say so instead of offering.

## Finding the client skill

1. Look for the client checkout beside this repo, at `../forceteki-client`. If
   `../forceteki-client/.claude/skills/local-browser-testing/SKILL.md` exists, read it and follow it. It starts this
   repo's game node as well as the client. Paths in it are relative to the client repo.
2. If either is missing (no checkout there, or a client older than the skill), ask the user where forceteki-client is
   checked out. Alternatively, offer to clone it beside this repo
   (`git clone https://github.com/SWU-Karabast/forceteki-client.git ../forceteki-client`, then `npm install` there),
   but only with their go-ahead.

## What the client skill relies on from this repo

Keep these and the client skill in step. When a change here touches one of them, update
`forceteki-client/.claude/skills/local-browser-testing/` and its helpers in `scripts/playwright/` to match, or tell
the user that the client needs that change.

- **Development-only routes** in `GameServer.setupDevAppRoutes`:
  - `GET /api/test-deck?format=&cardPool=`: a legal deck built by `server/utils/deck/TestDecklistBuilder.ts`, behind
    the client's Use test deck button.
  - `GET /api/test-game-setups` and `POST /api/start-test-game`: test games from `test/gameSetups/`. Starting one
    needs a dev user's session.
- **The dev users** `Order66` and `ThisIsTheWay` (`developmentTestUsers` in `server/utils/user/UserFactory.ts`).
- **The `.env` switches** `ENVIRONMENT`, `USE_LOCAL_DYNAMODB`, `USE_LOCAL_ACTION_TIMER`, `FORCE_BLOCK_BO3_ANON_LOCAL` and
  `FORCE_ENABLE_ANON_CHAT`. They are read in `server/gamenode/GameNodeConfig.ts` and `GameServer.ts`, with defaults in
  `scripts/run-server.js`.
- **The action timer's limits** in `server/game/core/actionTimer/ByoyomiTimer.ts`.
- **How the game node starts:** `npm run dev`, which is `scripts/run-server.js`. It builds, then runs
  `build/server/gamenode`.
