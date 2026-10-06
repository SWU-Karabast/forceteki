# Twin Suns 3-4 player: working plan (draft v0)

Status: loose planning + research. No engine code changed yet.

## Scope / constraints (from kickoff)
- Twin Suns only (rules sections 11 + 12). 3 or 4 players now; **design for N players** so larger lobbies are a config change later.
- Build on `main` (1v1 Twin Suns/`FauxSuns` format, two-leader decks, Plan/Blast/Initiative counters already merged).
- No UI work, no matchmaking, not surfaced to users. Must stay backwards compatible: existing 2-player behavior and client payloads unchanged; a later FE compatibility patch will adapt.
- Gate everything behind the new `TwinSuns` format key (3-4p; `FauxSuns` 1v1 stays as is) so nothing changes for live formats.

## Engine research: where 2-player is baked in

Core model
- `Player.opponent` is a single field assigned in `Player.ts:815` from `Game.getOtherPlayer()` (`Game.ts:709`, returns the first other player). ~380 refs repo-wide: ~85 in engine/gameSystems/effects, ~300 in 230 card files. `RelativePlayer` is only `Self | Opponent` (`Constants.ts:177`), used ~350 times; semantics must become "any/each opponent".
- `Game` constructor asserts exactly 2 players (`Game.ts:489`, marked `TODO TWIN SUNS`); `Game.join` refuses at 2 (`Game.ts:1526`).
- `checkWinCondition` (`Game.ts:894`) handles 1 or 2 losers only and ends the game immediately; Twin Suns needs elimination (rule 11.3) and end-of-phase game end with highest base HP winning (12.7).
- `concede` picks "the other player" as winner (`Game.ts:1005`); needs "last player standing / elimination" semantics.
- `getState()` serializer emits fixed `player1`/`player2` (`Game.ts:~2104-2133`); `DiscordDispatcher` also takes `player1Id/player2Id`. Client-visible shape: must keep 2p payload identical, add an N-player shape behind the format.

Turn flow
- `Game.rotateActivePlayer()` (`Game.ts:719`) alternates via `.opponent`; `ActionPhase.rotateActiveQueueNextAction` ends the phase when "both have passed". Needs clockwise seating order and "all remaining players passed in a row".
- Initiative: single `initiativePlayer` (`Game.ts:140`); `SetupPhase` offers `['Yourself','Opponent']` and uses `firstPlayer.opponent` (`SetupPhase.ts:83`). Needs "choose who goes first among N" and clockwise order for mulligans (rule 11.2).
- Claim counters (`ClaimCounterSystem`, `ActionWindow`, `Game.hasUnclaimedClaimableCounter`): already `min(3, players)` aware. Verify the Pass rules (12.6): can't pass while counters available; last player in 4p may pass after all 3 are taken; blast counter must hit **each** opponent base (12.5a). Counters must return to center at regroup start (12.5).
- Elimination effects: removed cards are not "defeated"; captured units return to owners; lasting effects persist; if the eliminated player held initiative it returns to center (11.3).

Arenas / combat (rule 11.2, 11.4)
- Each player has their own ground/space arena section. Attack target selection (`attack/`, `AttackFlow`, `SelectCardPrompt`, `BaseCardSelector.ts`) must be per-opponent; Sentinel only restricts attacks against that same player's units/base. Defending-controller-change mid-attack continues with the new controller unless it's the attacker.
- `BaseZone` (two leaders per base already handled on main) and `ResourceZone`/`HandZone` use `opponent` in a few places; check `TakeControlOfResourceSystem`, `ResourceCardSystem`, `DiscloseAspectsSystem`, `LookAtSystem`, `RevealSystem`.

Targeting & effects layer (highest-leverage seam)
- `RelativePlayer.Opponent` resolution in `BaseCardSelector`, `PlayerTargetResolver`, `CardTargetResolver`, `TargetResolver`, `AbilityResolver`, `OngoingEffectEngine`/`OngoingPlayerEffect`, `RestrictionDsl.ts` (18 refs), `OngoingEffectLibrary.ts`, `TriggerWindowBase`, `EnumHelpers`. Fixing these so "opponent" = any opponent for card/zone scoping handles the majority of cards for free.
- Player-targeted systems with "the opponent" (discard, draw, lose resources, indirect damage, deal damage to base) need a policy: **"an opponent" -> controller chooses one; "each opponent" -> apply to all**. Introduce an explicit prompt and an `each` mode on `PlayerTargetSystem` rather than letting `.opponent` silently pick the first.
- "Enemy" unit/base wording is mostly fine once selectors cover all opponents, but "the enemy base"/"their base" (singular) needs a which-base choice.

Game/lobby plumbing (server only, no matchmaking)
- `Lobby.ts` hard-codes 2 users in ~10 places: lines ~613, 649 (ready/start), 1083, 1120 (`isFilled`), 1150, 1158, 1198 (owner reassign / "other player"), 1430, 1454 (loser lookup), 2457, 2465. Generalize to `maxPlayers` from format config (4 for Twin Suns, 2 otherwise).
- Deck validation: `TwinSunsValidator` exists; check per-user validation in the lobby path and win/loss stats (`SwuStatsHandler`, win history `winnerIdsInOrder`) for N players.
- Snapshot/undo: `SnapshotManager`, `snapshot/` assume a rollback keyed per player; confirm N players work (state is object-id based, should be OK; quick-start snapshots are per player id).

Test harness
- `GameFlowWrapper`, `GameStateBuilder`, `PlayerInteractionWrapper`, `IntegrationHelper` are `player1`/`player2`-shaped. Need `player3`/`player4` (and `contextRef` plumbing + setup JSON schema for extra players) without breaking existing specs. Consider a helper like `setupTestAsync({ playerCount: 3, ... })` plus `context.player3`.
- Add a multi-player scenarios folder under `test/scenarios/` (turn order, counters, elimination, game end, attack targeting, Sentinel scope, control change mid-attack).
- Undo run (`npm run test-undo`) should also cover the new scenarios.

## Proposed phasing (rough)
1. **Seam first (no behavior change at 2p):** replace the single `opponent` with `opponents` + a deprecated asserting `opponent`; add `Game.getOpponentsOf(player)`, seating order, `playerCount`/`maxPlayers`. Keep all existing tests green. This is where the tree-wide compile errors point at the rework list.
2. **Harness:** N-player test setup so everything after is testable.
3. **Flow:** setup/mulligan order, clockwise rotation, pass rules, counter rules, blast-to-each-opponent.
4. **Combat targeting + Sentinel scope + defender change.**
5. **Elimination + game end (12.7) + concede.**
6. **Card sweep, set by set**, adding tests as each is confirmed (review process TBD).
7. **Lobby plumbing + N-player serializer** behind the format (no UI).

## Card research approach
- **Every card ever printed gets reviewed**, set by set.
- **Source of truth is official card text**: the FFG API data pulled by `npm run get-cards` (`admin.starwarsunlimited.com/api/cards`, cached in `test/json/Card/`, plus `scripts/mockdata.js` for not-yet-published cards). Do **not** infer card behavior from our implementations in `server/game/cards/`; those are non-authoritative and may themselves be wrong or 2p-shaped. Read the impl only to find what code must change after deciding from the printed text what the card should do with 3-4 players.

## Decisions (2026-10-05)
1. **Rules/interaction questions are deferred.** Includes "an opponent" = controller's choice, Sentinel scope, control change mid-attack, elimination details. Logged as a next step; engine work assumes the most literal reading of rules 11-12 until confirmed.
2. **Seating order is randomized at game start**, stored as an explicit ordered list so a future option (join order, host-chosen, etc.) is just a different producer of that list.
3. **New format key `TwinSuns`** for 3-4p (separate from the existing `FauxSuns` 1v1 format, which stays unchanged).
4. **Full card review**, using official card text only (see above).

## Next steps
1. Rules & interactions pass with `swu-rules-expert`: resolve "an opponent" targeting policy, "each opponent" vs "the opponent", Sentinel per-player scope, mid-attack control change, elimination (what is "removed", captured units, lasting effects, initiative return), end-of-phase game end and tiebreaks, counter/pass rules in 3p vs 4p. Record rulings here.
2. Card review, set by set, from official text. Process to be defined by Anthony.
3. Engine seam: `opponents` list + seating order + `TwinSuns` format key, no 2p behavior change.

## Open questions
1. ~~Does the single `Player.opponent` value appear in any client payload?~~ Likely yes, but UI is out of scope for now. The N-player payload shape and client changes will be handled in a separate coordination PR with the UI; until then the 2p payload stays unchanged.
