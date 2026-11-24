---
name: local-browser-testing
description: >
  Test the local Karabast site in a browser with Playwright, as several players at once (anonymous quick matches
  and lobbies, dev-user test games, action timers), against a local game node from this repo. The full skill lives
  in the forceteki-client repo; this one finds it. TRIGGER when: the user asks to test, try, check or reproduce
  something on the local site or in a local game in a browser, or to verify a server change end to end through
  the client. Also use it whenever a server change affects what players see or how a game flows
  beyond the rules engine: prompt behavior, the action timer, best-of-three and rematches, lobbies and matchmaking,
  conceding and the end of a game, reconnects, spectators, chat, or the game and lobby state the client renders.
---

The browser-testing skill lives with the client, which has Playwright as a dev dependency and the helpers the skill
uses (`scripts/playwright/`). This file says when to use it and how to find it.

## When to use it

Specs check the server; a browser test checks that players can still get through the game with the client as it is.
Run one when a server change affects what a player sees or does beyond the rules engine:
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

Card implementations and rules fixes are what the jasmine specs are for. Run a browser test for one only when it
changes how a prompt looks or behaves.

**Run it yourself when it fits; you need not ask.** Do it once the change works and its specs pass, and pick the
flows that exercise the change, for example "a quick match to the first action, then concede to check the game-over
screen". Budget for it: starting both servers takes about half a minute (the game node's build alone about 20 s), each
standard flow seconds to half a minute, a timer check longer, and a script written for the feature longer again, so
skip it for changes no player could see. Report which flows you played and what they showed. If the change also needs
client work before a browser test can show it, say so instead of running one.

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
    the client's Queue With Test Deck, Create Game With Test Deck and Load Test Deck buttons.
  - `GET /api/test-game-setups` and `POST /api/start-test-game`: test games from `test/gameSetups/`. Starting one
    needs a dev user's session.
- **The dev users** `Order66` and `ThisIsTheWay` (`developmentTestUsers` in `server/utils/user/UserFactory.ts`).
- **The `.env` switches** `ENVIRONMENT`, `USE_LOCAL_DYNAMODB`, `USE_LOCAL_ACTION_TIMER`, `FORCE_BLOCK_BO3_ANON_LOCAL` and
  `FORCE_ENABLE_ANON_CHAT`. They are read in `server/gamenode/GameNodeConfig.ts` and `GameServer.ts`, with defaults in
  `scripts/run-server.js`.
- **The action timer's limits** in `server/game/core/actionTimer/ByoyomiTimer.ts`.
- **How the game node starts:** `npm run dev`, which is `scripts/run-server.js`. It builds, then runs
  `build/server/gamenode`.
