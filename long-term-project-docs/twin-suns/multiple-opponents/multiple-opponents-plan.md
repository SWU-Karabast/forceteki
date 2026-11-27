# Multiple opponents: plan

**Status:** draft for kickoff, 2026-11-25. Revised the same day after an independent review, and its findings are applied.
Nothing in it is built yet. Progress is tracked in [multiple-opponents-progress.md](multiple-opponents-progress.md), and
each workstream gets its own document in this folder when it starts.

This project moves the engine from "the opponent" to "opponents". Every place that assumes a player has exactly one
opponent should either work with several opponents or fail loudly.

The project is one part of the Twin Suns work. Twin Suns is the multiplayer format for 3–4 players, in which each player
plays against all the others. The other parts are [held for other projects](#held-for-other-projects), and a
higher-level Twin Suns plan may later sit above this one in `long-term-project-docs/twin-suns/`.

This document splits the project into workstreams, orders them so that the engine changes which reach furthest land
first, and says how each workstream is run and tracked. It is written so that a developer can pick up a workstream
without having been part of the planning.

**Reading order:**

1. [Scope](#scope).
2. [Rules this project relies on](#rules-this-project-relies-on).
3. [Phases](#phases).
4. The [workstream](#workstreams) you are picking up.
5. That workstream's row in the [tracker](multiple-opponents-progress.md#workstreams).

## Scope

**Goal.** Card abilities and the engine work with any number of opponents:

- "An opponent" can be picked from several.
- "Each opponent" and "enemy" cover all of them.
- Every rule that depends on how two players relate picks the right player.

Production stays 1v1 throughout, and every existing format plays exactly as it does today.

**In this project:**

- Who a player's opponents are: seat order and `opponents`.
- Games with more than two players that can be set up in tests, with enough of setup and the action phase for their
  players to take turns.
- One vocabulary for how players relate, and the engine code that resolves it, including card selection across every
  opponent.
- Choosing an opponent, and effects aimed at one player or at each opponent.
- Hidden information when there are several opponents.
- Triggers from several players, and abilities an opponent can trigger.
- Players taken from events: who collects a Bounty, who the defending player is, and giving control to an opponent.
- Every card implementation that assumes a single opponent.
- The test support all of this needs.

**Held for other projects.** Each is described under [Held for other projects](#held-for-other-projects), with what it
needs from this one.

- Turn structure, beyond the minimum that tests need:
  - setup with 3 or more players;
  - regroup;
  - the prompts in which the player with the initiative chooses first.
- Elimination, and the end of the game.
- The undo request flow.
- The Twin Suns format itself:
  - a format for 3–4 players, and offering it to players;
  - moving the `fauxSuns` counter code over to that format;
  - Blast's damage to each opponent's base.

  The counter and passing rules themselves are already built for `fauxSuns`.
- The client.
- The server: lobbies, matchmaking and stats.

**Already in place.**

- Parts of the engine already work with more players:
  - Arenas are shared zones, filtered by controller.
  - Sentinel is checked per controller.
  - Spectator seats are numbered by index.
  - `getState` keys players by id.
  - Defeat sources record the player responsible.
- The earlier Twin Suns work, the 1v1 `fauxSuns` format, comes from #2390 and its follow-ups. It built the following.
  Treat its patterns as precedents to weigh, not as settled design; see [Working agreements](#working-agreements).
  - **Two leaders per player.**
    - `Player.getAllDeckLeaders()` and an asserting `getSingleLeader()` replaced the single `deckLeader`, and the base
      zone holds a list of leaders.
    - Leaders deploy and ready independently, and both provide aspects.
    - The state sends each player's `leaders` as a list.
    - MODEL-3 weighs it as a precedent.
  - **The counters and their rules (12.4–12.6):** Blast, Plan, and the rules for claiming counters and passing.
    - Their logic already counts players. Pass stays disabled until `min(3, number of players)` counters are claimed,
      which matches 12.6's 4-player rule.
    - The parts that assume a single opponent are Blast's damage, and how `ActionWindow` passes once a player has
      claimed.
    - The state sends who claimed each counter (#2918).
  - **The format.**
    - `Game` receives its format in the game details.
    - The deck-side `IFormatRules` table carries a `leaderCount` for each format.
    - The Twin Suns deck rules are enforced: 80 cards, one copy of each, two leaders, and the pairing rules.
    - The TS26 set is legal in `fauxSuns`, and so is the Unlimited card pool (#2922).
  - **The server.**
    - The second leader is handled in deck import, saved decks, lobby summaries and the ongoing-games list
      (#2919–#2921).
    - `fauxSuns` lobbies are behind the `fauxSunsAccess` feature flag (#3210).
    - The dev test-deck route builds two-leader decks (#3211).
    - SWUStats and SWUBase receive Premier games only. Karabast's own stats are updated for every format.
  - **Tests.**
    - `setupTestAsync` takes a `format` option and a `secondLeader` for each player, with `p1SecondLeader` and
      `p2SecondLeader` on the context.
    - A helper in `GameFlowWrapper` claims the counters to end a `fauxSuns` action phase.
    - The scenario specs are in [test/scenarios/TwinSuns/](../../../test/scenarios/TwinSuns/).
  - **Nothing for multiple opponents.** None of this work covers VOCAB, CHOICE, VISIBILITY, TRIGGER or DERIVED. The
    TS26 cards were implemented for 1v1: 14 of their 78 files read `.opponent`.

**How much code assumes a single opponent**, measured at `4f5ac59b9`:

- `.opponent` in engine code: 67 lines in 35 files. 11 of them are in areas held for other projects.
- `.opponent` in card code: 300 lines in 232 files.
- `.opponent` in the test helpers: 3 lines.
- `RelativePlayer.Opponent` in card code: 333 lines in 287 files.
- Calls that convert between real players and `RelativePlayer` (`asRelativePlayer`, `asConcretePlayer`): 12 in the
  engine, 14 in cards.
- Ten systems that target a player, which fall back to the opponent when no target is given.
- Shapes that no search finds. Examples are a single "previous player passed" flag, or an attack's single defending
  player. The workstreams list the ones found so far.

The [tracker](multiple-opponents-progress.md#burn-down) measures these numbers again as work lands.

## Rules this project relies on

These come from the repo's copy of the rules, CR **v7.0**:

- §11 in [09-special-rules.md](../../../.claude/reference/swu-rules/09-special-rules.md);
- 1.18 in [01-overview.md](../../../.claude/reference/swu-rules/01-overview.md);
- Bounty in [05-keywords.md](../../../.claude/reference/swu-rules/05-keywords.md);
- the [clarifications](../../../.claude/reference/swu-rules/clarifications/).

The live CR is v9.0, and RULES checks every row against it before a decision relies on it.
[Appendix C](#appendix-c-rules-for-the-held-projects) keeps the rules notes for the held projects.

**Settled by the rules:**

| Topic | Rule | What the engine must do |
|---|---|---|
| "An opponent", "opponents" | 11.4 | "An opponent" is any one other player, so one has to be picked. "Opponents" and "each opponent" mean all the other players. |
| Turn order | 11.2 | Players take turns clockwise from the first active player. This project needs only the rotation. Each player has their own part of each arena; that is a layout question, so the shared arena zones stay. |
| End of the action phase | 11.2 | The phase ends when every player has passed consecutively. |
| Sentinel | 11.4 | Sentinel protects only its controller's units and base, and only from attackers in the same arena. The engine already does this. |
| Defender changes control | 11.4 | If the defending unit goes to a player other than the attacker, the attack continues, with the new controller as the defending player. Today the engine drops a defender whenever it changes control, which is right only with two players. |
| Who defeated a unit | 1.18 | In this order: the controller of the unit whose damage defeated it; the controller of the ability that defeated it; nobody, if it happened in the regroup phase or when a lasting effect expired; the last player whose ability or effect changed its remaining HP; otherwise the active player. Bounty depends on this. |
| Bounty | 7.5.13 e–f | The opponent who defeated or captured the unit collects. A player who defeats or captures their own unit chooses an opponent to collect. By a ruling, the player whose unit dealt the lethal damage comes before the player whose ability did (1.18a). |
| Effects on several players | 7.1.4 | If an ability affects several players and they can be affected at the same time, they are. Otherwise the controlling player chooses the order. It is worded for two players, but probably extends to more. |

**Not settled in v7.0.** RULES checks v9.0, or asks for a ruling.

- **Trigger order with 3 or more players.** 7.6.10 is worded for two. 7.6.9 (one player's order) and 7.6.11 (nested
  abilities) are its neighbours.
- **Attack targets.** The attack rule (6.3.1) says "an enemy unit in the same arena or the opponent's base". 11.4 implies
  that any opponent's units and base can be attacked. Can one attack target units belonging to different opponents?
- **Control.** A player keeps control "until the card leaves play or the opponent takes control" (1.5.2). Presumably that
  means any opponent.
- **Hidden information.** Cards in hand (4.7.4) and the identity of resources (1.7) are hidden "from the opponent".
  Presumably that means from every opponent.
- **Older card text.** "Your opponent" (11 cards) presumably means "an opponent".

## Working agreements

- **1v1 does not change.**
  - Every PR keeps the full normal and undo suites green, and `npm run capture-states -- --check` too, as CI already
    requires.
  - A capture that changes on purpose is regenerated in the same PR, and agreed with the client.
- **Fail loudly.**
  - Code that still assumes a single opponent fails with a `Contract` error in a game with 3 or more players. It never
    quietly picks one of the players.
  - Where no search can find such an assumption, the workstream that owns it adds an assert or a pending smoke spec.
- **Right by default for card authors.**
  - "An opponent" resolves by itself in 1v1, and prompts when there are several opponents, without the card doing
    anything special.
  - A mistake shows up at the call site, or fails the type check or lint.
- **One vocabulary.** Every workstream uses VOCAB's terms and helpers. None adds its own way of resolving players.
- **Players are identified by id or by object identity, never by name.** Two players may share a display name.
- **Derive relationships, track what changes.**
  - Opponents and turn order are worked out from a fixed seat order and from each player's tracked state.
  - Anything that changes during a game is tracked state, so undo works.
- **The rules are the spec.** A decision cites a CR section with its version, or a ruling. An open rules question is
  recorded and asked, not guessed.
- **Faux Suns precedents are held loosely.**
  - The Faux Suns work was built for 1v1, before this design existed.
  - Where this plan leans on one of its patterns, that pattern is a starting point, not a constraint. Examples are
    `getSingleLeader()` for MODEL-3, `IFormatRules.leaderCount` for MODEL-2, and the `secondLeader` setup key for
    HARNESS.
  - Re-evaluate each one as the broader design takes shape. If the design points elsewhere, follow the design. The Faux
    Suns code can change to match it.
- **Stay in scope.**
  - Work that belongs to a held project goes to that project.
  - When this project meets single-opponent code in a held project's area, it doesn't generalize it. It makes the
    assumption explicit (MODEL-3) and moves on.
- **Plan around the LKI migration.** See [Coordination with the LKI migration](#coordination-with-the-lki-migration).
- **Games with more players stay in tests.** Nothing in this project makes them reachable from a lobby. That is the
  Twin Suns format and server projects' work.
- **Security.**
  - Anything exploitable found along the way goes to the maintainers privately, as `CLAUDE.md` says. Examples are hidden
    information reaching the wrong player, or a player acting out of turn.
  - It never goes in these documents, which cite such items only by their ID.
- **The owner reviews and commits.** An assistant working on this does not run `git commit`.

## How a workstream runs

Each workstream goes through four stages, which the tracker records:

- **a. Investigate.**
  - Create the workstream's document from the [template](#appendix-b-workstream-document-template).
  - Map the current code and the rules that apply, starting from the pointers below and from
    [Appendix A](#appendix-a-who-owns-which-engine-file).
  - List the open decisions, each with its options and a recommendation.
- **b. Decide.**
  - The maintainers settle each decision, and the document records who decided and when.
  - A decision that constrains other workstreams or projects also goes in the tracker's decision register.
- **c. Implement.**
  - Work in small PRs.
  - Each behavior gets a spec in a game with 3 or more players: switch on the smoke suite's pending spec, or add one.
  - 1v1 stays unchanged.
  - The one exception is MODEL's first PR. It lands before tests can build such games, so the 1v1 suites cover it, and
    its specs with more players arrive with HARNESS's first PR.
- **d. Close.**
  - An independent review of the decisions and the changes.
  - Then update the tracker, the metrics and the list of merged PRs.

Stage a can start for any workstream at kickoff. Only stage c waits on other workstreams. Usually it waits only on the
API it builds on, not on the whole workstream; the [dependency table](#dependencies-and-parallel-work) says which.

**Naming.**

- Workstream documents live in this folder, named after the workstream ID in lowercase: `model.md`, `vocab.md`, and so
  on.
- Decision IDs are prefixed with the workstream: `MODEL-1`, `CHOICE-3`.
- Workstream IDs stay unique across the Twin Suns projects, so a decision ID means the same thing anywhere.

## Workstreams

The three Phase 1 workstreams are the foundation and the critical path. They reach furthest into the engine. Between
them, they make every `.opponent` read fail loudly in tests, which turns most of the remaining work into failing specs.
The Phase 2 workstreams then work through those specs.

[Appendix A](#appendix-a-who-owns-which-engine-file) assigns each engine site found so far to a workstream or a held
project. That covers the files matched by the searches, plus the sites the review found by reading.

### Phase 0: kickoff

**RULES: the rules baseline.** Size S, mostly reading.

- Check CR v9.0 (swudb.com/rules, which needs a browser to read) against the tables in this document. Check these rules:
  - §11–12;
  - the rules worded for two players:
    - §5 (setup, the phases, the end of the game);
    - 1.5.2 (control);
    - 1.7 and 4.7.4 (hidden information);
    - 1.18 (responsibility for defeats);
    - 6.3.1 (attack targets);
    - 7.1.4, and 7.6.9–7.6.11;
    - Bounty (7.5.13).
- It is one reading for all the Twin Suns projects. Answers that belong to held projects go in
  [Appendix C](#appendix-c-rules-for-the-held-projects) until those projects start.
- Update `.claude/reference/swu-rules/`.
- Ask for rulings on the open questions, and hand each answer to the workstream that needs it.

### Phase 1: foundation (critical path)

**MODEL: the player model, seat order, and games with more players.** Size M, in two PRs. Code: `Game`, `Player`,
`ActionWindow`, `ActionPhase`.

**First PR:** seat order, opponents, and allowing more players.

- **Seat order.**
  - The seat order is an explicit array, fixed when the game is created, in the order the players are given to `Game`.
    How a lobby assigns seats belongs to the server project.
  - Today `getPlayers()` returns players in the key order of `playersById`. That order follows the ids only by accident,
    because JavaScript orders integer-like keys numerically.
- **Turn order.**
  - Turn order is derived from the seat order.
  - `getPlayersInInitiativeOrder` sorts with a comparator that ignores its second argument, so it can only order two
    players. It becomes the real turn order, which changes nothing for two players.
  - Its callers in setup and regroup belong to the game-flow project. With more players they then run clockwise, which
    provisionally answers Appendix C's question about the order of setup and regroup.
- **Opponents.**
  - `player.opponents` is derived from the seat array by identity.
  - It replaces the player's own call to `getOtherPlayer`. `getOtherPlayer` matches players by name. The game-flow
    project owns conceding, which also calls it, and CARDS owns the one card that calls it.
  - There is no `eliminated` flag. Elimination belongs to the game-flow project, and MODEL-1 settles what `opponents`
    will mean once it exists.
- **Retiring `.opponent`.**
  - `.opponent` becomes a deprecated getter that asserts there is exactly one opponent.
  - Reads in held projects' areas become an explicit single-opponent call, which also fails when there are more players.
    At kickoff that is 11 reads: setup's initiative choice, the win check, timeouts, losing the game, and the undo
    request flow.
  - What remains on `.opponent` is then this project's work.
- **Games with more than two players.**
  - Today `Game` asserts exactly two players, at "TODO TWIN SUNS". It should accept more when MODEL-2's switch allows it.
  - Such games are reachable only from tests.

**Second PR**, after HARNESS's first PR and the maintainer-held item V-39: enough of the action phase, and of prompts, for
these games to run in tests.

- **Passing.**
  - The turn passes to the next player who hasn't passed.
  - The phase ends when every player has passed consecutively. Today a single boolean records whether the previous
    player passed (`prevActionPhasePlayerPassed` on `Game`, set from `ActionPhase`, kept in snapshots). Once
    `ActionWindow` stops reading `.opponent`, that boolean would end the phase after any two passes in a row.
  - The `fauxSuns` rule that a player who claims a counter has passed for the rest of the phase (`passedActionPhase`,
    set in `ClaimCounterSystem`) has to keep working. `ActionWindow.pass` handles it today by checking
    `opponent.passedActionPhase`. With that rule kept, the counter and passing rules work with more players.
- **The action window.**
  - It offers every opponent's discard pile, not just `.opponent`'s.
  - It clears every other player's highlights, and so do the card-selection prompts.
- **Menu prompts.** Every menu prompt sends a summary of the cards it involves. Each card goes through
  `Card.isHiddenForPlayer`, which today fails for any third player. It should treat every player who isn't the card's
  controller alike.
  - CHOICE, TRIGGER and DERIVED all need this, which is why it is in Phase 1.
  - It doesn't settle VISIBILITY-1: VISIBILITY can still refine who knows what.

**Start from:**

- [Game.ts](../../../server/game/core/Game.ts): `getPlayers`, `getOtherPlayer`, `getPlayersInInitiativeOrder`,
  `rotateActivePlayer`, `prevActionPhasePlayerPassed`, and the constructor's assert on the number of players.
- [Player.ts](../../../server/game/core/Player.ts): `opponent`.
- [ActionWindow.ts](../../../server/game/core/gameSteps/ActionWindow.ts).
- [ActionPhase.ts](../../../server/game/core/gameSteps/phases/ActionPhase.ts).
- [Card.ts](../../../server/game/core/card/Card.ts): `isHiddenForPlayer`.
- [SwuSetData.ts](../../../server/utils/deck/SwuSetData.ts): `IFormatRules`.

**Decisions:**

- **MODEL-1:** Once elimination exists, do eliminated players stay in `getPlayers()`, and are they left out of `opponents`
  and turn order? This project settles what the API means; the game-flow project builds it. Recommended: they stay in
  `getPlayers()`, and `opponents` and turn order skip them.
- **MODEL-2:** What switch allows a game with more players, and where does the player count live? The options:
  - a stub format entry for 3–4 players with no capabilities (no counters, no rules of its own), which the Twin Suns
    format project later fills in;
  - a setting on the game that allows more players in any format.

  Either way, this project does no format work. Either could build on what the Faux Suns work left, although, like every
  Faux Suns precedent, that is to be re-evaluated against the broader design:
  - `Game` already receives its format;
  - the deck-side `IFormatRules` table already holds a `leaderCount` for each format, which the deck validator and the
    dev test-deck builder read. A player count would sit beside it.
- **MODEL-3:** How is `.opponent` retired? Recommended:
  - the asserting getter;
  - the explicit single-opponent call in held projects' areas;
  - deleting the getter when CARDS finishes.

  The Faux Suns work did something similar for leaders. It replaced `deckLeader` with a list and an asserting
  `getSingleLeader()`, and the remaining single-leader callers say why they're safe (the stat handlers: "only ever
  invoked for Premier-format games").

  One option is for the explicit call to follow that pattern and be named `getSingleOpponent()`. Treat that as a
  starting point, to be re-evaluated with VOCAB's design rather than adopted because Faux Suns did it.

  Faux Suns could delete `deckLeader` outright, because card code never read it. `.opponent` needs a temporary getter
  instead: 232 card files read it, and the LKI codemod is about to rewrite those files.

**VOCAB: the vocabulary for how players relate.** Size L: design first, then the engine changes. Code: the ability
machinery. This workstream reaches furthest of all.

- **What `RelativePlayer.Opponent` means.** In 1v1 every meaning lands on the same player. Classify each use by what it
  means, not by the name of the property it is in. There are four cases:
  - **A filter**: any or each opponent, which resolves to a set. Examples:
    - `controller` and `targetController` in most uses;
    - `onlyFromPlayer` (damage from any enemy card, for example Lurking TIE Phantom). `DamageModificationAbility`
      resolves it to `controller.opponent`, and `Interfaces.ts` carries a TSTODO to accept an array;
    - `canBeTriggeredBy`, checked once per player. TRIGGER-2 decides which of those players owns the ability.
  - **Exactly one player.** It can be the only opponent, a chosen one, or one taken from context: a target's controller,
    the defending player, the player who defeated the unit. Examples:
    - an opponent who makes a choice;
    - the player an effect is aimed at;
    - the player granted a permission ("choose an opponent… they may play it": Stolen AT-Hauler).
  - **Each opponent in turn.** The step repeats for each opponent, and filters inside it are relative to the player
    acting. Examples are Admiral Ozzel's "each opponent may ready a unit" and Guerilla Insurgency's "each player defeats
    a resource they control".
  - **The player themself** (`Self`), which is unchanged.
- **The tracker's split by job** (filter 225, actor 93, affected player 11) goes by property name, so it is only an
  approximation.
- **Two central helpers.** One resolves to a set. The other resolves to exactly one player, and fails when there is more
  than one candidate.
- **Engine code that resolves players goes through the helpers:**
  - the target resolvers and `AbilityResolver`;
  - `controllerMeetsRequirements` in `CardAbility` and `TriggeredAbility`, and the sub-step player in `CardAbilityStep`.
    TRIGGER-2 decides what these mean for abilities that opponents can trigger;
  - `BaseCardSelector`, both gathering candidates and filtering by controller. It gathers only `context.player`'s and
    `.opponent`'s cards, so a third player's cards are never offered, not even their base as an attack target;
  - player matching in `OngoingPlayerEffect` and `OngoingCardEffect`;
  - `PlayPermission`, and the cost library;
  - `DamageModificationAbility`'s `onlyFromPlayer`.
- **Round trips through `RelativePlayer`.** Several places turn a real player into a relation and back. Once "opponent"
  means more than one player, the answer changes without any error:
  - `OngoingAllCardsForPlayerEffect`, fed by `AllCardsForPlayerLastingEffectSystem`: an effect aimed at player 3 lands on
    whichever player `.opponent` names;
  - `hasTargetsChosenByPlayer` in `SelectCardSystem`, `ChooseNumberSystem` and `SelectChoiceSystem`, which compares
    relations, so every opponent matches;
  - `PutIntoPlaySystem`'s `controller`, typed as a `Player` or a `RelativePlayer`. This one is low priority;
  - `EnumHelpers.asConcretePlayer` and `asRelativePlayer`, which all of these use (12 calls in the engine, 14 in cards).
- **Types.** Properties typed as `RelativePlayer` in `Interfaces.ts`, `TargetInterfaces.ts` and `OngoingCardEffect.ts`,
  with their implicit defaults. An enum is required there, which forces the round trips above. This is part of VOCAB-1.
- **Helpers for card code**, on `Player` and `Game`:
  - opponents;
  - "is an opponent of";
  - enemy units and bases across all opponents;
  - comparisons for "any opponent" and for "each opponent".
- **Start from:**
  - [Constants.ts](../../../server/game/core/Constants.ts) (`RelativePlayer`);
  - [EnumHelpers.ts](../../../server/game/core/utils/EnumHelpers.ts);
  - [TargetResolver.ts](../../../server/game/core/ability/abilityTargets/TargetResolver.ts) (`getChoosingPlayer`);
  - [BaseCardSelector.ts](../../../server/game/core/cardSelector/BaseCardSelector.ts) (`findPossibleCards`, `canTarget`);
  - [Interfaces.ts](../../../server/game/Interfaces.ts) and [TargetInterfaces.ts](../../../server/game/TargetInterfaces.ts).
- **Decisions:**
  - **VOCAB-1:** What is the vocabulary, covering the four cases and the types? Does it extend `RelativePlayer` or replace
    it?
  - **VOCAB-2:** Where is a chosen opponent carried? Recommended: in `context` (for example `context.targets`), never as
    a new argument to selector callbacks. See the LKI section.
  - **VOCAB-3:** Where do the helpers live? Recommended: on `Player` and `Game`, not on `Card`.
  - **VOCAB-4:** Until CHOICE lands, what happens when a resolution that needs exactly one player has more than one
    candidate? Recommended: a `Contract` failure. Filters and the "each opponent in turn" case never fail this way.

**HARNESS: tests with more players, a smoke suite, an audit.** Size M. Code: `test/helpers/`, `test/stateCaptures/`.

- **First PR: games with more players, through setup.**
  - `setupTestAsync` accepts `player3` and `player4`, with `p3Base`, `p3Leader` and so on. The specs that use `player2`
    (`git grep -lE 'player2' -- 'test/**/*.spec.ts'` finds 2,172 files) stay untouched.
  - Card props must stay usable when four boards hold the same cards.
  - Every spec, including those that start in the action phase, plays the real setup phase. The harness chooses the
    initiative there by clicking "Yourself" or "Opponent", and the "Opponent" path is held for the game-flow project.
  - So HARNESS adds a test-only path through setup. It sets the game's existing `preselectedFirstPlayerId` to the player
    meant to start with the initiative, and always clicks "Yourself". The mulligan and resource prompts already wait on
    every player. The game-flow project later replaces this path with the real multiplayer setup.
- **What the Faux Suns work already provides:**
  - **The `format` option.** Specs set it to `'fauxSuns'`.
  - **The `secondLeader` key for each player.** It shows the pattern for new setup keys: `GameStateBuilder` and
    `DeckBuilder` read it, and the context gets `p1SecondLeader` and `p2SecondLeader`.
  - **The counter-claiming helper.** `GameFlowWrapper`'s helper claims the counters to end a `fauxSuns` action phase.
    - It picks the active player from `[player1, player2]`, so it needs extending to more players.
    - Its comment says the second player claims both remaining counters. The code, like 12.5, gives each player one
      counter per round, so in 1v1 the phase ends at the second claim. The "Pass becomes enabled once all three tokens
      are claimed" spec in `TwinSuns.spec.ts` has a similar stale comment.
- **Helpers that hard-code two players:**
  - `IntegrationHelper`'s player list, and its check for unresolved prompts, which looks only at `player1` and `player2`;
  - `GameFlowWrapper`'s player pairs and its one-argument sort comparators;
  - `Util.formatBothPlayerPrompts`;
  - `DeckBuilder`'s `opponentAttachedUpgrades` and `unitsCapturedByOpponent`;
  - `PlayerInteractionWrapper`'s `opponent` lookups and `get opponent()`;
  - `GameStateBuilder`.

  The 3 `.opponent` reads among them must be gone before M3 deletes the getter.
- **The dev schema.** The setup schema is shared with the dev test-game setups and the bug-report export. Those two
  accept more players in the server project.
- **Undo mode.** `npm run test-undo` replays every spec, so specs with more players exercise snapshots and rollback, and
  those must work. Each rollback also calls the bug-report export. It returns an error object, not an exception, for
  more than two players, so it is harmless here. The undo request flow belongs to the undo project.
- **Captures.** Capture participants are fixed to `player1`, `player2` and a spectator (`test/stateCaptures/StateCapture.ts`),
  and `CLAUDE.md`'s captured-states section assumes two players. Changing either depends on HARNESS-3.
- **Smoke suite.**
  - A multiplayer smoke suite goes under `test/scenarios/`, with one pending spec per known gap, so progress can be
    counted.
  - A pending spec in a held project's area carries that project's name, and stays pending.
  - Scenarios must not reduce a base to 0 HP, because the win check is held.
- **Audit script.** A script that prints the tracker's burn-down metrics, including the `RelativePlayer` round trips and
  the test helpers' reads.
- **Start from:**
  - [IntegrationHelper.js](../../../test/helpers/IntegrationHelper.js) and
    [IntegrationHelper.d.ts](../../../test/helpers/IntegrationHelper.d.ts);
  - [GameStateBuilder.js](../../../test/helpers/GameStateBuilder.js);
  - [GameFlowWrapper.js](../../../test/helpers/GameFlowWrapper.js) (`skipSetupPhase`, `selectInitiativePlayer`).
- **Decisions:**
  - **HARNESS-1:** What are the setup schema and the context names for players 3 and 4?
  - **HARNESS-2:** Which smoke scenarios make up M2's exit list?
  - **HARNESS-3:** `CLAUDE.md` asks for a control-chain capture in the PR that introduces a new kind of prompt. Does that
    apply now to prompts that only games with 3 or more players can reach? Recommended: yes, so that the contract is on
    record. Capture specs must then be able to name players 3 and 4, and `CLAUDE.md`'s section changes with them.

### Phase 2: parallel workstreams

Any of these can be in stage a from kickoff. Their stage c needs Phase 1's APIs; see the
[dependency table](#dependencies-and-parallel-work).

**CHOICE: choosing a player, and effects aimed at players.** Size L. It is on the critical path, because DERIVED and CARDS
need it.

- **`PlayerTargetResolver` for more players.**
  - Choices are named by player, not "You" and "Opponent".
  - Each player's button carries its own `arg`. Today a multiple-player choice maps a click back by its button text,
    which two players with the same name would break.
  - The resolver gets a real legality check: today `hasLegalTarget` always returns true.
- **A "choose an opponent" step.**
  - It chooses automatically when only one opponent is legal, which is always so in 1v1.
  - Later steps and dependent targets can refer to the opponent it picked.
  - Its timing relative to costs is decided here. The engine already holds back a target that an opponent chooses until
    the costs are paid.
- **"Each opponent" across several players**, for effects aimed at players.
- **The systems that act on one player:** discarding, milling, looking at a hand, exhausting or taking resources,
  revealing, disclosing, indirect damage, distributing among targets, giving a token, and choosing a modal effect.
  - `DiscardCardsFromHandSystem` builds its card filter from a relation, so the chooser could pick from another
    opponent's hand.
  - `IndirectDamageToPlayerSystem` reads only the first target, `target[0]`.
- **The implicit default.**
  - Nine `PlayerTargetSystem` subclasses, and `IndirectDamageToPlayerSystem`, target the opponent when no target is
    given. They are listed in Appendix A.
  - In card code, 37 calls to them pass no `target`. About half of those sit inside a player target resolver, which
    supplies one, so roughly 18 really rely on the default. That is a heuristic count.
- **`isOpponentEffect`** in card-selection prompts, which compares the choosing player with `.opponent`.
- **Start from:**
  - [PlayerTargetResolver.ts](../../../server/game/core/ability/abilityTargets/PlayerTargetResolver.ts);
  - [PlayerTargetSystem.ts](../../../server/game/core/gameSystem/PlayerTargetSystem.ts) (`defaultTargets`);
  - [CardTargetResolver.ts](../../../server/game/core/ability/abilityTargets/CardTargetResolver.ts).
- **Decisions:**
  - **CHOICE-1:** How is a player picked? Recommended: within today's prompt shapes, with a button per player, each with
    its own `arg`. Today's client then works unchanged, and 1v1 prompts stay identical. A richer UI is the client
    project's.
  - **CHOICE-2:** When is the choice made, relative to costs and to other targets?
  - **CHOICE-3:** What makes an opponent a legal choice, and when is the choice automatic?
  - **CHOICE-4:** Does the implicit default survive?

**VISIBILITY: hidden information.** Size M. It builds on MODEL's second PR, which already makes menu prompts stop failing
for a third player.

- **The model has only two sides.** Zones are hidden "from the opponent", and cards track `hiddenForController` and
  `hiddenForOpponent`. This workstream decides the model with more players (VISIBILITY-1).
- **The ongoing-effect summaries** decide what each player sees through `.opponent`.
- **`Player.isTopCardShown`** uses `RelativePlayer.Opponent` values. No card uses its opponent branch today, so it may be
  deleted rather than generalized.
- **What `getState` shows a third player.**
- **The game log.** Every player sees the log, and some lines name cards from hidden zones. For example, `LookAtSystem`'s
  messages name the cards a player saw in a hand. With 3 or more players, a third player would read them.
- **Start from:**
  - [Card.ts](../../../server/game/core/card/Card.ts) (`getSummary`);
  - [OngoingEffectEngine.ts](../../../server/game/core/ongoingEffect/OngoingEffectEngine.ts)
    (`summarizeOngoingEffectsForState`);
  - [LookAtSystem.ts](../../../server/game/gameSystems/LookAtSystem.ts).
- **Decision:**
  - **VISIBILITY-1:** Is hidden information hidden from everyone but the controller, or does each player know different
    things (for example, after looking at another player's hand)? That includes what the log may name, and to whom.

**TRIGGER: the order of triggers, and abilities opponents can trigger.** Size M.

- **Trigger order.**
  - `TriggerWindowBase.promptForResolvePlayerOrder` asks "You / Opponent" and orders exactly two players. When triggers
    from two players resolve together, it reads `activePlayer.opponent`, which fails in any game with 3 or more
    players. That is why it is in this project.
  - The ordering rules for one player's triggers and for nested triggers (7.6.9, 7.6.11) stay as they are.
- **Abilities opponents can trigger.** This workstream owns the mechanism, and DERIVED uses it for Bounty.
  - `TriggeredAbility` builds one context per player and keeps those that pass `controllerMeetsRequirements`. Under "any
    opponent", every opponent would get a context.
  - `PlayerOrCardAbility.controller` and `CardAbilityStep`'s sub-step player both map "opponent" to `.opponent` too.
- **The order of an effect that affects several players** (7.1.4).
- **LKI.** `controllerMeetsRequirements` also reads the event's last-known controller, which LKI changes. See the LKI
  section.
- **Start from:**
  - [TriggerWindowBase.ts](../../../server/game/core/gameSteps/abilityWindow/TriggerWindowBase.ts);
  - [TriggeredAbility.ts](../../../server/game/core/ability/TriggeredAbility.ts);
  - [PlayerOrCardAbility.ts](../../../server/game/core/ability/PlayerOrCardAbility.ts) (`controller`);
  - [CardAbilityStep.ts](../../../server/game/core/ability/CardAbilityStep.ts).
- **Decisions:**
  - **TRIGGER-1:** How does the active player order the triggers of 3 or more players? This one waits on RULES.
  - **TRIGGER-2:** When an opponent can trigger an ability, which opponent does it belong to: the player an event points
    to, a chosen one, or each in turn? This is the single owner of that question. Cards and DERIVED use the answer.

**DERIVED: players taken from events (Bounty, attacks, control).** Size M.

- **Bounty.**
  - The player responsible for the defeat or capture collects (1.18, 7.5.13), through TRIGGER-2's mechanism.
  - The engine records responsibility in two places:
    - `FrameworkDefeatCardSystem` implements 1.18's later steps;
    - `UnitProperties` records the last player to change a unit's HP, through `ability.controller`, which itself reads
      `.opponent` for opponents' abilities.
  - A player who defeats their own unit chooses an opponent, through CHOICE.
  - DERIVED also cites the Clone Deserter and Snoke ruling, in which a third player collects a bounty
    ([dev-team-sets-123.md](../../../.claude/reference/swu-rules/clarifications/dev-team-sets-123.md)).
- **The defending player.**
  - `Attack` stores one defending player, `targets[0].controller`, and Overwhelm damage goes to that player's base (a
    TSTODO in `AttackFlow` marks this). That depends on DERIVED-1.
  - Under rule 11.4, a defending unit that changes control mid-attack stays in the attack. Today any change of control
    removes it (`takeControl` → `Attack.unitChangedController`).
- **Control.** Effects that give a card to "an opponent": about 11 call sites in card code, plus
  `AttachUpgradeSystem`'s final controller. The recipient is chosen through CHOICE's step.
- **Checks on the "previous action".**
- **Start from:**
  - [BountyAbility.ts](../../../server/game/abilities/keyword/BountyAbility.ts);
  - [IDamageOrDefeatSource.ts](../../../server/game/IDamageOrDefeatSource.ts);
  - [FrameworkDefeatCardSystem.ts](../../../server/game/gameSystems/FrameworkDefeatCardSystem.ts);
  - [Attack.ts](../../../server/game/core/attack/Attack.ts) and [AttackFlow.ts](../../../server/game/core/attack/AttackFlow.ts);
  - [AttachUpgradeSystem.ts](../../../server/game/gameSystems/AttachUpgradeSystem.ts).
- **Decisions:**
  - **DERIVED-1:** Can one attack target units of different opponents? This waits on RULES.
  - **DERIVED-2:** How are these players expressed in VOCAB's terms?

### Phase 3: card sweep

**CARDS: card implementations.** Size XL, split by set across as many developers as are available. Its stage a, the
catalogue of patterns and the design of the codemod, can run during Phase 2. The codemod itself is written in stage c,
against what LKI step 3.2's codemod produced.

- **Scope.** 300 `.opponent` lines in 232 files, and 333 `RelativePlayer.Opponent` lines in 287 files.
- **What each card means comes from its text.**
  - About 220 cards mention an opponent: "an opponent" 110 times, "each opponent" 21, "your opponent" 11.
  - 31 refer back to "that player" (21) or "that opponent" (10).
  - About 460 cards say "enemy".
- **Patterns:**
  - "Each enemy X", written as `context.player.opponent.getArenaUnits()`, is a mechanical change.
  - Comparisons such as "if an opponent controls more units than you" are decided card by card.
  - "An opponent's hand, base or deck" uses CHOICE's step.
  - "Each opponent may…" uses VOCAB's "each opponent in turn" case.
  - A reference back to "that player" uses the target's controller.
  - `=== context.player.opponent` gives a wrong answer with more players, and no error.
  - State-watcher arguments.
  - Giving control, which uses DERIVED's mechanism.
  - Abilities opponents can trigger, which use TRIGGER-2's answer.
  - The TSTODO markers in card code.
  - The TS26 set. It was designed for multiplayer, but was implemented for 1v1: 14 of its 78 files read `.opponent`, and
    11 of its cards mention an opponent (2 of them "each opponent").
- **The finish.**
  - During the sweep, a lint rule against `.opponent` in `server/game/cards/**` is switched on set by set, so new card PRs
    don't add any.
  - At the end the getter is deleted, and the compiler enforces it from then on.
  - The authoring guidance is written once VOCAB's API is final; see the LKI section.
- **Decisions:**
  - **CARDS-1:** What does the codemod rewrite, and what is reviewed card by card?
  - **CARDS-2:** Which cards need a spec with 3 or more players?
  - **CARDS-3:** How is the work batched, and how is it coordinated with card PRs in flight?

## Phases

| Phase | Workstreams | Exit (milestone) |
|---|---|---|
| 0. Kickoff | RULES | **M0:** scope and plan agreed, owners named, rules checked against the current CR. |
| 1. Foundation | MODEL, VOCAB, HARNESS | **M1:** a game with 3 or 4 players can be set up in tests, and its players can take turns. The vocabulary is merged. Every `.opponent` read fails loudly in such a game. The shapes the getter can't catch each have an assert or a pending smoke spec. 1v1 is unchanged. |
| 2. Parallel | CHOICE, VISIBILITY, TRIGGER, DERIVED | **M2:** the smoke suite passes in this project's areas. The engine reads `.opponent` nowhere except the asserting getter. |
| 3. Card sweep | CARDS | **M3, the project done:** `.opponent` is gone from the codebase, test helpers included. Every card that behaves differently with more players has a spec with 3 or more players. |

The phases overlap: Phase 2 workstreams investigate during Phase 1, and the CARDS pattern work runs during Phase 2.

**Why this order.**

- **MODEL and VOCAB come first because they reach furthest.**
  - Every `.opponent` read goes through MODEL's getter: 67 lines in the engine and 300 in cards.
  - The 333 card uses of `RelativePlayer.Opponent` are resolved in a few dozen engine places, most of which VOCAB changes.
  - Done later, each Phase 2 workstream would invent its own way of resolving players.
- **HARNESS comes first** because nothing can be verified without games with 3 or more players in tests.
- **Together they make most of the work visible.**
  - The asserting getter turns every remaining `.opponent` read into a failing spec.
  - Each shape it can't catch is listed in its workstream, with an assert or a pending smoke spec.

## Dependencies and parallel work

**Phase 1 runs in this order:**

1. MODEL's first PR.
2. HARNESS's first PR.
3. MODEL's second PR. It also waits on V-39, an item held by the maintainers.

VOCAB's design runs alongside all three, and its implementation starts once HARNESS's first PR has landed.

| Workstream | Stage c needs | Coordinate with |
|---|---|---|
| RULES | — | — |
| MODEL, first PR | MODEL-2 decided | HARNESS |
| HARNESS | MODEL's first PR | The server project (HARNESS-1), the client project (HARNESS-3) |
| MODEL, second PR | HARNESS's first PR; held (V-39) | LKI phase 2 (a flush in `ActionPhase`) |
| VOCAB | MODEL's first PR, HARNESS's first PR | LKI: D-38 and step 3.2 (`BaseCardSelector`, `CardTargetResolver`, `matchTarget`, cost adjusters), and `controllerMeetsRequirements`; VISIBILITY |
| CHOICE | VOCAB's API, HARNESS, MODEL's second PR | VISIBILITY (looking at, revealing, disclosing); LKI step 3.2 |
| VISIBILITY | MODEL's second PR, HARNESS, VOCAB's API | CHOICE |
| TRIGGER | VOCAB's API, HARNESS, MODEL's second PR, RULES (7.6.10) | DERIVED; LKI (`controllerMeetsRequirements`) |
| DERIVED | VOCAB's API, CHOICE's "choose an opponent" step, TRIGGER-2 decided, RULES (DERIVED-1) | TRIGGER; LKI phase 2, which comes later |
| CARDS | VOCAB, CHOICE, DERIVED, TRIGGER-2 decided, HARNESS, RULES ("your opponent"), and **LKI step 3.2 merged** | LKI step 3.4 and phase 4 |

**How many developers can work at once.**

- **Phases 0–1.** Four people can start: MODEL, VOCAB's design, HARNESS and RULES. At first only MODEL is implementing.
- **Phase 2.** About three can implement at once: CHOICE, VISIBILITY and TRIGGER. DERIVED follows once CHOICE's step and
  TRIGGER-2 are ready. CARDS' stage a is analysis, which anyone can take.
- **Phase 3.** CARDS splits by set directory, so it can take every developer who is available.
- **Developers not on this project** can start investigating the held projects. [Held for other
  projects](#held-for-other-projects) says what each one needs from this one.

A workstream tests its own area with scenarios that steer clear of other workstreams' unfinished areas, and of the held
projects' areas. The smoke suite shows the overall picture.

**Hot files.** The workstreams change each of these one at a time, in the order shown. Check the tracker before touching
a file that another workstream holds.

| File (under `server/game/`) | Changed by, in order |
|---|---|
| `core/Game.ts` | MODEL, then VOCAB (helpers on `Game`). Its win check, timeouts, conceding and rollback belong to held projects. |
| `core/Player.ts` | MODEL, then VOCAB, CHOICE, VISIBILITY |
| `core/Constants.ts` (`RelativePlayer`), `Interfaces.ts`, `TargetInterfaces.ts` | VOCAB |
| `core/utils/EnumHelpers.ts` | VOCAB, then VISIBILITY |
| `core/gameSteps/ActionWindow.ts`, `core/gameSteps/phases/ActionPhase.ts` | MODEL; LKI phase 2 |
| `core/card/Card.ts` | MODEL's second PR, then VISIBILITY |
| `core/cardSelector/BaseCardSelector.ts` | VOCAB; LKI D-38 and step 3.2 |
| `core/ability/abilityTargets/*`, `core/ongoingEffect/OngoingCardEffect.ts` | VOCAB, then CHOICE; LKI step 3.2 |
| `core/ability/TriggeredAbility.ts` | VOCAB, then TRIGGER, then DERIVED; LKI |
| `core/ability/CardAbilityStep.ts` | VOCAB, then TRIGGER |
| `core/ability/PlayerOrCardAbility.ts` | TRIGGER |

## Coordination with the LKI migration

The LKI plan, in [decisions and insights](../../lki-redesign-decisions-and-insights.md), changes how card code reads
cards. Its latest version is on `ammayberry1/lki-refactor-3`. On `main` that document's decision log stops at D-35, and
it has no step 3.1–3.4 headings. Read the branch copy with
`git show ammayberry1/lki-refactor-3:long-term-project-docs/lki-redesign-decisions-and-insights.md`.

- **Step 3.2 is where the two collide.**
  - It is a re-runnable codemod over about 800 card files: selector callbacks, and reads off `context` and `event`. It
    comes with a freeze window for card PRs in flight.
  - CARDS touches largely the same files, often the same lines. So CARDS' stage c starts once 3.2 has merged, and its
    codemod rewrites what 3.2's produced.
- **D-38 reaches well beyond `BaseCardSelector`.**
  - D-38 decides how a selector callback receives its candidate, and it is still open. Its recommended option (a)
    changes the signatures of all eight kinds of selector callback, and ships with the codemod.
  - Its engine call sites include `BaseCardSelector`, `CardTargetResolver` and the `matchTarget` of `OngoingCardEffect`
    and `OngoingAllCardsForPlayerEffect`. They also include the cost adjusters, `DamageModificationAbility`,
    `AttackStepsSystem` and `InitiateAttackSystem`.
  - VOCAB and CHOICE change several of those files. Design the two together, or have whichever lands second rebase onto
    the other.
  - **No new arguments to selector callbacks before 3.2** (VOCAB-2). A chosen opponent travels in `context`.
- **`controllerMeetsRequirements` is shared.**
  - `TriggeredAbility.controllerMeetsRequirements` reads the event's last-known controller.
  - The LKI plan names this exact function as its example of an engine refactor to `getLastKnownProperties`, and its
    phase 4 removes `event.lastKnownInformation`.
  - VOCAB, TRIGGER and DERIVED all change this function.
- **How players relate belongs on `Player` and `Game`.**
  - The LKI views keep `controller` and `owner` as live `Player` objects, so these helpers need nothing from LKI.
  - A helper on `Card` would have to be added by hand to both view interfaces (D-36), and recorded for cards that have
    left play.
- **LKI phase 2 runs after its phase 3.** The LKI phases go 0, 1, 3, 2, 4.
  - So LKI phase 2 probably comes after CHOICE and DERIVED, and rebases onto them.
  - Its item 4 adds a flush at the end of the action phase, in `ActionPhase`, where MODEL changes passing.
- **The authoring guidance.**
  - LKI step 3.4 updates the guidance in the codemod's own PR: `CLAUDE.md`, the dev guide, the card-implementer agent and
    `docs/implementing-cards.md`. That lands before CARDS starts.
  - So this project's card guidance is a second, smaller pass, written when VOCAB's API is final and CARDS begins. The
    alternative, holding the LKI sweep until VOCAB is final, would delay a PR that grows more expensive every week.
- **LKI phase 4 runs alongside CARDS on the same files.**
  - It migrates card by card, starting with the 49 card files that read `lastKnownInformation`.
  - It ends with D-28's lint rules on card code, next to CARDS' `.opponent` rule.

The engine-only workstreams don't touch card files, so LKI doesn't block them. It does edit engine files that MODEL,
VOCAB, CHOICE, TRIGGER and DERIVED also edit, as listed above.

## Held for other projects

Twin Suns needs more than support for multiple opponents. The rest of the work is grouped below as proposed projects.
Once a higher-level Twin Suns plan is written, it decides their final grouping and order. Their rules notes are in
[Appendix C](#appendix-c-rules-for-the-held-projects).

When this project ends, the single-opponent code in these projects' areas is still there, but explicit (MODEL-3). It
fails loudly in a game with 3 or more players, and each project removes its own.

**Multiplayer game flow.**

- **Turn structure beyond this project's rotation.**
  - Setup with 3 or more players: who picks the player who starts with the initiative, and the mulligan order.
  - Regroup ordering.
  - Generalizing the prompts in which the player with the initiative chooses first (`InitiativePlayerFirstPrompt`).
  - It replaces HARNESS's test-only path through setup.
  - MODEL's turn order already makes setup and regroup run clockwise. Game flow confirms or changes that.
- **Per-player prompt state keyed by name**, in `InitiativePlayerFirstPrompt`, `MulliganPrompt`, `ResourcePrompt` and
  `GameOverPrompt`.
- **Elimination** (§11.3).
- **The end of the game.**
  - The win check, conceding, timeouts, leaving and `LoseGameSystem` all hand the win to `.opponent` today.
  - The timeout draw check reads one opponent's timer.
  - The game-over prompt.
  - A result model keyed by player id. Winners are stored by name today (#3219).
  - Twin Suns' end-of-game rule (12.7). Nothing here is built yet: `fauxSuns` uses the 1v1 win check, so Appendix C's
    question on whether `fauxSuns` should follow 12.7 is still open.
- **LKI.** Removing an eliminated player's cards is a departure, so it must write LKI records (D-22).
- **What it needs from this project:**
  - seat order and turn order;
  - what `opponents` means (MODEL-1);
  - the explicit single-opponent calls it inherits: 6 reads, plus conceding's `getOtherPlayer`.

**Undo with more players.**

- **The request and approval flow:**
  - who approves (today `player.opponent`);
  - the checks on what an opponent has seen (`hasShownChoiceToOpponent`, `hasResolvedAbilityThisTimepoint`);
  - quick undo's assumption that players alternate (`opponentActedSinceLastSnapshot`);
  - the counts of rejected requests.
- **What it needs from this project:**
  - MODEL;
  - snapshots and rollback working with more players, which HARNESS checks;
  - the 5 explicit single-opponent calls it inherits.

**The Twin Suns format.**

- **The format.** A format for 3–4 players, offered behind a feature flag as `fauxSuns` is.
  - It can reuse what `fauxSuns` already has: the deck rules (80 cards, one copy of each, two leaders, the pairing
    rules), TS26 legality, the Unlimited card pool, and the feature-flag check on lobby creation.
  - What it adds is the player count and the format capabilities.
- **Counters.** The `fauxSuns` work has already built the rules for claiming counters and for passing (12.5–12.6), and
  their logic already counts players. What remains:
  - Blast's damage to each opponent's base, a TSTODO in `ClaimCounterSystem` and `Game.claimCounter`. It can only be
    tested once a format with counters allows more players;
  - specs with 3 and 4 players for the existing rules, for example the 4-player rule that the last player may pass once
    all three counters are taken.
- **Format capabilities** in place of the `format === FauxSuns` checks, so that the new format gets the counters. These
  checks are scattered through `ActionWindow`'s claim buttons, `ActionPhase`'s counter reset, `Game`'s counter state and
  `hasUnclaimedClaimableCounter`, `Player`'s claimed-counter checks and `ClaimPlanCounterPutOnBottomSystem`.
- **What it needs from this project:**
  - MODEL-2;
  - MODEL's generic passing, which keeps a counter claim as a pass for the rest of the phase.

**The client.**

- forceteki-client's UI for more players. The state it builds on already sends each player's `leaders` as a list, and
  who claimed each counter, which `fauxSuns` games use today.
- How prompts and state identify players, beyond a button per player.
- What an eliminated player sees.
- **What it needs from this project:** CHOICE-1, and the captures this project adds (HARNESS-3).

**The server and launch.**

- **Lobbies for more players:** capacity, assigning seats, the conditions for starting, chat permissions, spectators,
  leaving in the middle of a game, and action timers.
  - The second leader is already handled everywhere a deck travels: deck import, saved decks, lobby summaries and the
    ongoing-games list.
  - The summary fields are shaped for two players, though: `player1Leader`, `player1SecondLeader`, `player2Leader`, and
    so on.
- **Dev test games and the bug-report export** with more players.
  - The dev test-deck route already builds two-leader decks.
  - The export (`Game.captureGameState`) returns an error for more than two players, and the report state has
    `player1`, `player2` and `opponent` fields.
- **Matchmaking.**
- **Stats.**
  - SWUStats and SWUBase already receive Premier games only, so multiplayer games are left out unless that changes.
  - Karabast's own stats and deck matchups are updated for every format, so they need a shape for more players.
- **Reports, and the production rollout.**
- **What it needs:** the game-flow project's result model, and the Twin Suns format.

## Risks

- **The rules copy is v7.0; the live CR is v9.0.** RULES goes first, and decisions cite the version they rely on.
- **CARDS waits on LKI step 3.2.** If 3.2 slips, the engine work carries on, and CARDS gets its catalogue and codemod
  design ready.
- **Merge conflicts in the hot files.** One owner at a time, in a set order, and small PRs.
- **Scope creep into the held projects.** The stay-in-scope agreement, and MODEL-3's explicit calls, give each
  workstream a way to leave those areas alone.
- **Assumptions no search finds.** Some code is silently wrong, and the getter can't catch it. The review found several
  such places by reading. The workstreams list them, and the smoke suite should cover the rest.
- **Suite run time.** Specs with 3 or more players go only where the behavior differs.
- **Hidden information reaching a third player.** VISIBILITY tests for it, and anything exploitable is reported
  privately.

## Glossary

- **Seat order:** the fixed order of the players around the table, kept as an array.
- **Turn order:** seat order going clockwise from a given player, skipping players who have passed.
- **Opponents:** every other player. MODEL-1 settles how eliminated players are treated, once elimination exists.
- **The four cases:** filter, exactly one player, each opponent in turn, and the player themself. These are the meanings
  "opponent" can have in card definitions (VOCAB).
- **Chosen opponent:** "an opponent" picked during resolution. It is picked automatically when only one is legal.
- **Derived player:** a player taken from an event: the defending player, the player who defeated a unit, a captor.
- **Explicit single-opponent call:** what MODEL-3 turns a read in a held project's area into. It returns the only
  opponent, and fails when there are more. MODEL-3 suggests the name `getSingleOpponent()`, after Faux Suns'
  `getSingleLeader()`, to be re-evaluated with the broader design.
- **Held project:** a part of the Twin Suns work outside this project. See
  [Held for other projects](#held-for-other-projects).

## Appendix A: who owns which engine file

This appendix lists every engine site found so far that assumes a single opponent, with the workstream or held project
that changes it. It covers two kinds of site:

- every file with a reference at `4f5ac59b9`. A reference here means `.opponent`, `RelativePlayer.Opponent`,
  `getOtherPlayer` or `getPlayersInInitiativeOrder`;
- the further sites the review found by reading.

A file listed under more than one owner is split by the symbols named. Paths are under `server/game/`.

**This project:**

| Workstream | Files |
|---|---|
| MODEL | `core/Player.ts`; `core/Game.ts` (seat order and `getPlayers`, rotation, `getOtherPlayer`, `getPlayersInInitiativeOrder`, `prevActionPhasePlayerPassed`); `core/gameSteps/phases/ActionPhase.ts`; `core/snapshot/SnapshotInterfaces.ts` (the pass flag); `core/gameSteps/ActionWindow.ts`; `core/gameSteps/prompts/SelectCardPrompt.ts`, `DistributeAmongTargetsPrompt.ts` (clearing highlights); `core/card/Card.ts` (`isHiddenForPlayer`), which every menu prompt reaches through `core/gameSteps/prompts/HandlerMenuPrompt.js` |
| VOCAB | `core/ability/CardAbility.ts`, `CardAbilityStep.ts`, `TriggeredAbility.ts` (`controllerMeetsRequirements`), `abilityTargets/TargetResolver.ts`; `core/gameSteps/AbilityResolver.ts`; `core/cardSelector/BaseCardSelector.ts`; `core/ongoingEffect/OngoingCardEffect.ts`, `OngoingPlayerEffect.ts`, `OngoingAllCardsForPlayerEffect.ts`, `effectImpl/PlayPermission.ts`; `core/ability/DamageModificationAbility.ts` (`onlyFromPlayer`); `core/utils/EnumHelpers.ts` (`asConcretePlayer`, `asRelativePlayer`); `Interfaces.ts`, `TargetInterfaces.ts` (types and defaults); `costs/CostLibrary.ts`; `actions/PlayEventAction.ts`; in `gameSystems/`: `GameSystemLibrary`, `AllCardsForPlayerLastingEffectSystem`, `SelectCardSystem`, `ChooseNumberSystem`, `SelectChoiceSystem` (`hasTargetsChosenByPlayer`), `PutIntoPlaySystem` |
| CHOICE | `core/ability/abilityTargets/PlayerTargetResolver.ts`, `CardTargetResolver.ts` (`isOpponentEffect`); `core/gameSystem/PlayerTargetSystem.ts`; in `gameSystems/`: `CardEffectResourcePaymentSystem`, `ChooseModalEffectsSystem`, `DiscardCardsFromHandSystem`, `DiscardEntireHandSystem`, `DiscardFromDeckSystem`, `DiscloseAspectsSystem`, `DistributeAmongTargetsSystem`, `DistributeIndirectDamageToCardsSystem`, `ExhaustResourcesSystem`, `GiveTokenUpgradeSystem`, `IndirectDamageToPlayerSystem`, `LookAtSystem` (whom it acts on), `ResourceCardSystem`, `RevealSystem`, `SelectPlayerSystem`, `TakeControlOfCreditTokenSystem`, `TakeControlOfResourceSystem` |
| VISIBILITY | `core/card/Card.ts` (`getSummary`, the hidden-for flags); `core/ongoingEffect/OngoingEffectEngine.ts`; `core/utils/EnumHelpers.ts` (`isHiddenFromOpponent`); `core/zone/HandZone.ts`, `ResourceZone.ts`; `core/Player.ts` (`isTopCardShown`); `gameSystems/LookAtSystem.ts` (its log messages) |
| TRIGGER | `core/gameSteps/abilityWindow/TriggerWindowBase.ts`; `core/ability/TriggeredAbility.ts` (contexts per player); `core/ability/PlayerOrCardAbility.ts` (`controller`); `core/ability/CardAbilityStep.ts` (the sub-step player) |
| DERIVED | `abilities/keyword/BountyAbility.ts`; `gameSystems/FrameworkDefeatCardSystem.ts`; `core/card/propertyMixins/UnitProperties.ts` (the last player to change HP; `takeControl` during an attack); `core/attack/Attack.ts`, `AttackFlow.ts`; `gameSystems/AttachUpgradeSystem.ts` (its final controller) |

Each workstream also owns the text of the prompts it changes. In 1v1 that text stays as it is. HARNESS owns the test
helpers listed in its section, and `test/stateCaptures/StateCapture.ts`.

**Held projects.** MODEL turns the `.opponent` reads in these areas into explicit single-opponent calls.

| Held project | Files |
|---|---|
| Multiplayer game flow | `core/Game.ts` (win check, timeouts, conceding); `core/gameSteps/phases/SetupPhase.ts`, `RegroupPhase.ts`; `core/gameSteps/prompts/MulliganPrompt.ts`, `ResourcePrompt.ts`, `InitiativePlayerFirstPrompt.ts` (the prompt), `GameOverPrompt.js`; `gameSystems/LoseGameSystem.ts` |
| Undo with more players | `core/Game.ts` (rollback); `core/gameSteps/prompts/UndoConfirmationPrompt.js`, `InitiativePlayerFirstPrompt.ts` (`hasShownChoiceToOpponent`); `core/snapshot/SnapshotManager.ts` |
| The Twin Suns format | `gameSystems/ClaimCounterSystem.ts` and `core/Game.ts` (`claimCounter`): Blast |
| The server and launch | `core/Game.ts` (`captureGameState`); `Interfaces.ts` (the report state's player fields) |

Server code outside the engine (`server/gamenode/`, `server/utils/statHandlers/`, `server/utils/deck/DeckService.ts`)
belongs to the server and launch project. Card code belongs to CARDS.

## Appendix B: workstream document template

Copy this into `<id in lowercase>.md` in this folder at the start of stage a.

```markdown
# Multiple opponents: <workstream name> (<ID>)

Stage: a · Owner: <name> · Started: <date> · [Tracker](multiple-opponents-progress.md#workstreams) · [Plan](multiple-opponents-plan.md#workstreams)

## Scope
What this workstream covers, and what it leaves to others.

## Current behavior
What the code does today, with file links and the symbols involved.

## Rules
The CR sections (with their version) and rulings that apply, and what they leave open.

## Decisions
| ID | Question | Options | Recommendation | Decided (who, when) |
|---|---|---|---|---|

## Implementation
PR-sized steps, each with the specs that back it.

## Verification
Which specs with 3 or more players prove each behavior, and which pending smoke-suite specs this switches on.

## Log
Dated entries: what changed, and what was learned.
```

## Appendix C: rules for the held projects

These notes come from the same reading of CR v7.0, and are kept here until each held project starts. RULES checks them
against v9.0 too.

**Settled by the rules:**

| Topic | Rule | Held project | What the rules say |
|---|---|---|---|
| Setup | 5.2.c, 5.2.e, 11.2 | Game flow | A first player is chosen at random, and decides who starts with the initiative, which can be any player. Mulligans go clockwise. |
| Elimination | 11.3 | Game flow | A player whose base has no HP left is eliminated and takes no more actions. All cards they own are removed from play; they are not defeated, and nothing triggers. Units held captive by their units go back to their owners. Their lasting and delayed effects stay active, and the remaining players resolve them. If they held the initiative, it goes back to the centre, available. |
| Twin Suns end of game | 12.7 | Game flow | Once a player is eliminated, the game ends at the end of the current phase; phase-ending effects still resolve. The player with the most HP on their base wins, and tied players share the win. A player who eliminates another heals 5 damage from their own base, after the eliminated player's cards are removed (ruling). Eliminating yourself earns nothing. |
| Twin Suns setup | 12.4 | Twin Suns format | Both leaders start below the base. The Blast and Plan counters go in the centre once the initiative has been given. **Built for `fauxSuns`.** |
| Twin Suns counters | 12.5 | Twin Suns format | "Take an available counter" replaces "take the initiative", once per round. Blast deals 1 damage to each opponent's base. Plan draws 1 card, then puts 1 card from hand on the bottom of the deck. A player may hold several counters. Blast and Plan return at the start of the regroup phase. **Built for `fauxSuns`.** Blast still damages only the opponent's base (TSTODO), and the counters are reset at the end of the action phase, which has the same effect. |
| Twin Suns passing | 12.6 | Twin Suns format | A player can't pass while a counter is available, and must pass after taking one. In a 4-player game, once all three counters are taken, the last player may pass to end the phase. **Built for `fauxSuns`.** Pass stays disabled until `min(3, number of players)` counters are claimed, which covers the 4-player rule, and claiming sets the claimer's `passedActionPhase`. |

**Not settled in v7.0, for the game-flow project:**

- **Setup and regroup order.**
  - Who starts the mulligans? MODEL's turn order makes it clockwise from the player with the initiative, provisionally.
  - The regroup resource step starts "with the active player". Does it then go clockwise?
- **An eliminated player's remaining effects.** Who makes the choices in them?
- **Cards an eliminated player controls but doesn't own,** and upgrades on the units removed. What happens to them?
- **Eliminating a player.**
  - Who eliminates a player when the damage has several sources?
  - How does the healing work when several players are eliminated at once?
- **The initiative counter.** Can it be taken again in the same round, once it is back in the centre?
- **`fauxSuns`.** Does the 1v1 format use 12.7's end-of-phase rule?
