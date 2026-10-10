# Twin Suns: Generic Player Handling

Status: **pre-pass order approved** - discussing workstream 1; concrete designs and implementation
remain open.

Initial investigation: 2026-10-10.

## Why this exists

Forceteki currently supports 1v1 play. Preparing the engine and backend for the four-player Twin Suns
format requires making player handling more generic without enabling four-player games yet.

This living document tracks the major architecture areas identified during the initial repository
investigation and the agreed preparatory work. The architecture inventory remains a discovery
baseline; the pre-pass order is approved, but concrete designs and implementation remain open.

## Current scope

- Identify and track hardcoded two-player assumptions.
- Record the design decisions needed to generalize player handling.
- Preserve existing 1v1 behavior during eventual preparatory changes.
- Keep enabling four-player games and implementing Twin Suns-specific rules outside this step.

The initial textual scan found **386 direct `.opponent` references across 265 server TypeScript
files**, including **299 references across 230 card implementation files**. These counts include
comments and exclude indirect assumptions in defaults, enums, and pair-oriented interfaces.

## Approved pre-pass

Approved: 2026-10-10. This pass addresses existing inconsistencies without changing player counts,
the scalar opponent model, turn scheduling, or external payload shapes. Behavior-preserving cleanup
and existing correctness fixes must be distinguished; any intentional behavior correction needs
focused regression coverage.

### Pre-pass 1. Existing target/system contract inconsistencies

Status: **design discussion**.

- Investigate and resolve inconsistencies in currently supported target handling, normalization,
  and effect execution.
- Keep fixes grounded in existing 1v1 behavior.
- Defer auditing which systems should support one recipient versus multiple recipients until the
  main Twin Suns work introduces multiple-opponent semantics.
- Defer any individual fix that requires those future recipient-cardinality decisions.

This provides a more reliable underlying effect contract for the resolver work that follows.

### Pre-pass 2. Player-target resolver correctness

Status: **pending**.

- Address the chooser-query argument-shadowing inconsistency.
- Replace placeholder legality detection and membership-only validation with checks consistent
  with existing effect contracts.
- Preserve intentional no-effect, optional-choice, and targeting-timing behavior.

Continue using the existing two-player model. New opponent filters and automatic opponent
selection are outside this pass.

### Pre-pass 3. Visibility and prompt cleanup

Status: **pending**.

- Establish existing visibility behavior for self versus others, including spectators and
  temporary viewing or reveal behavior.
- Consolidate duplicated visibility logic and clarify its perspective.
- Consolidate selection-highlight cleanup while preserving existing prompt lifecycle behavior.

No individually configurable opponent visibility is needed. Preserve any deliberate existing
visibility exceptions.

### Pre-pass 4. Game-finalization correctness

Status: **pending**.

- Address the end-reason overwrite that occurs before the already-ended guard.
- Add focused coverage confirming that repeated calls while already ended preserve the original
  result and do not repeat finalization side effects.

This is an existing correctness fix, not a Twin Suns prerequisite. Broader participant-lifecycle,
outcome-determination, and finalization restructuring is deferred to the main Twin Suns work.

### Working process

For each workstream:

1. Discuss its concrete design and agree on a bounded scope.
2. Establish focused regression coverage.
3. Implement and validate the agreed changes.
4. Update this document with decisions, progress, and deferred work.

Visibility and finalization are independent of targeting; their position is an execution order,
not a technical dependency.

### Explicitly deferred from the pre-pass

- Consolidating opponent filters before defining "an opponent" versus "all opponents" and their
  card-filter equivalents.
- Recipient-cardinality audits and multiple-opponent support decisions.
- Broad serialization or test-type restructuring; multi-player fixtures, ownership references,
  and diagnostic captures remain part of the main player-generalization work.
- Player elimination, format-specific match termination, group matchmaking, and multiplayer
  result semantics.

## Architecture categories and open design decisions

### 1. Player roster, relationships, and player-count invariants

**Current assumptions:** Each player has a scalar opponent. Looking up another player returns the
first other player, and game construction explicitly requires exactly two players.

**Open design decisions:**

- Permanent game roster versus currently participating players.
- Stored versus derived opponent relationships, including behavior after elimination.
- Stable player identity and explicit seat order versus an unordered player collection.
- Where the currently enforced two-player limit belongs.

**Relevant code:** [Player](../server/game/core/Player.ts),
[Game](../server/game/core/Game.ts), and
[GameConfiguration](../server/game/core/GameInterfaces.ts).

### 2. Consistent "enemy," "friendly," and player-filter semantics

**Current assumptions:** Relative-player filters distinguish self, opponent, and any, but their
implementations do not all mean the same thing. Card selectors enumerate one specific opponent;
ongoing card effects can match anything not controlled by self; ongoing player effects match one
specific opponent. These interpretations agree in 1v1 but diverge with more players.

**Open design decisions:**

- Relationship filters versus concrete player identities.
- Filters covering one player or a set of players.
- Owner versus controller semantics.
- Consistency across card targeting, costs, ongoing effects, damage restrictions, and state-watcher
  queries.

**Relevant code:** [RelativePlayer](../server/game/core/Constants.ts),
[BaseCardSelector](../server/game/core/cardSelector/BaseCardSelector.ts),
[OngoingCardEffect](../server/game/core/ongoingEffect/OngoingCardEffect.ts), and
[OngoingPlayerEffect](../server/game/core/ongoingEffect/OngoingPlayerEffect.ts).

### 3. Player selection, legality, and automatic resolution

**Current assumptions:** The player target resolver constructs two-player choices. Its legal-target
detection is explicitly a placeholder, and its interface lacks filtering facilities comparable to
card selectors.

**Open design decisions:**

- Expressing eligible players and filtering candidates by effect legality.
- Zero, one, or multiple eligible-player behavior.
- Single-player versus multiple-player selections.
- Stable selection identifiers and labels that distinguish multiple opponents.
- Automatically resolving a forced opponent choice in 1v1 while prompting when multiple opponents
  are eligible, without removing meaningful self-versus-opponent choices.

**Relevant code:**
[PlayerTargetResolver](../server/game/core/ability/abilityTargets/PlayerTargetResolver.ts),
[target interfaces](../server/game/TargetInterfaces.ts), and
[SelectPlayerSystem](../server/game/gameSystems/SelectPlayerSystem.ts).

### 4. Separating the actor, chooser, recipient, and ability beneficiary

**Current assumptions:** Target choosers, optional-ability decision makers, and ability controllers
can be inferred through self/opponent. Bounty abilities are a notable example where the ability's
beneficiary can differ from the card's controller.

**Open design decisions:**

- Eligible ability resolvers versus the actual resolver for a particular event.
- Carrying event-derived beneficiaries and choosing players through ability contexts.
- Distinguishing "choose an opponent" from "the affected card's controller makes this choice."
- Preserving pre-targeting, cost-payment, and optional-choice timing when another player chooses.

**Relevant code:** [TargetResolver](../server/game/core/ability/abilityTargets/TargetResolver.ts),
[AbilityResolver](../server/game/core/gameSteps/AbilityResolver.ts),
[PlayerOrCardAbility](../server/game/core/ability/PlayerOrCardAbility.ts),
[AbilityContext](../server/game/core/ability/AbilityContext.ts), and
[BountyAbility](../server/game/abilities/keyword/BountyAbility.ts).

### 5. Semantic migration of card implementations

**Current assumptions:** Card implementations directly access an opponent's hand, deck, discard,
base, and historical events. Other uses filter enemy cards or compare statistics between players.
These usages are not interchangeable.

**Open design decisions:**

- Classifying each usage as one selected opponent, every opponent, any enemy card, a particular
  event/card-associated player, or a comparison or aggregate over opponents.
- Preserving the intended player scope across conditions, follow-on effects, and historical queries.
- Identifying shared authoring patterns so individual cards do not duplicate selection logic.

Existing TODOs illustrate distinct cases: Aggrieved Parliamentarian accesses an opponent's discard,
while Single Reactor Ignition couples base damage to defeated units controlled by that opponent.

**Relevant code:** [card implementations](../server/game/cards/),
[AggrievedParliamentarian](../server/game/cards/03_TWI/units/AggrievedParliamentarian.ts), and
[SingleReactorIgnition](../server/game/cards/07_LAW/events/SingleReactorIgnition.ts).

### 6. Zone queries, ownership, and control transfers

**Current assumptions:** Arenas are already shared, game-owned collections, and player-specific zones
are instantiated per player. Stronger constraints exist in querying those zones and identifying
transfer participants. Some systems infer the recipient or donor through an opponent relationship.

**Open design decisions:**

- Queries across selected players or all enemies.
- Explicit donor and recipient identities for cross-player transfers.
- Ownership versus control for captured cards and upgrades.
- Cross-player zone behavior when a participant leaves play.

The shared arena structure does not appear to require a wholesale rewrite.

**Relevant code:** [AllArenasZone](../server/game/core/zone/AllArenasZone.ts),
[PlayerZone](../server/game/core/zone/PlayerZone.ts),
[BaseCardSelector](../server/game/core/cardSelector/BaseCardSelector.ts),
[ResourceCardSystem](../server/game/gameSystems/ResourceCardSystem.ts), and
[TakeControlOfResourceSystem](../server/game/gameSystems/TakeControlOfResourceSystem.ts).

### 7. Turn order, passing, initiative, and claim counters

**Current assumptions:** Active-player rotation alternates through the opponent property. Passing
uses a previous-pass boolean and can permanently pass both players. Initial initiative selection is
binary, and the existing Blast counter effect damages one opponent's base.

**Open design decisions:**

- Explicit cyclic seat order and eligibility for the next action.
- Consecutive passes versus permanent round passes and phase termination.
- Additional-action behavior within generalized turn progression.
- Which initiative and claim-counter behavior belongs to format policy rather than generic
  scheduling.

**Relevant code:** [Game](../server/game/core/Game.ts),
[ActionWindow](../server/game/core/gameSteps/ActionWindow.ts),
[ActionPhase](../server/game/core/gameSteps/phases/ActionPhase.ts),
[SetupPhase](../server/game/core/gameSteps/phases/SetupPhase.ts), and
[ClaimCounterSystem](../server/game/gameSystems/ClaimCounterSystem.ts).

### 8. Trigger ordering and multi-recipient effect resolution

**Current assumptions:** Trigger windows store unresolved abilities by player, but the
resolution-order prompt constructs only the two possible pair orderings. Player-target systems
accept arrays but default to one opponent. Array acceptance does not guarantee multi-recipient
behavior: indirect damage uses the first target when constructing damage distribution.

**Open design decisions:**

- Encoding format-required trigger order.
- Per-recipient versus aggregate events.
- Sequential versus simultaneous application to multiple players.
- Modifier accounting for multi-recipient effects.
- Trigger timing relative to affected players completing their choices.

**Relevant code:**
[TriggerWindowBase](../server/game/core/gameSteps/abilityWindow/TriggerWindowBase.ts),
[PlayerTargetSystem](../server/game/core/gameSystem/PlayerTargetSystem.ts), and
[IndirectDamageToPlayerSystem](../server/game/gameSystems/IndirectDamageToPlayerSystem.ts).

### 9. Combat participants and damage routing

**Current assumptions:** An attack stores one defending player from the first target. Combat damage
resolution explicitly notes this assumption when routing Overwhelm damage to one base. Some attack
targeting is already more general, including Sentinel checks against the selected target's
controller.

**Open design decisions:**

- Defending participants for multi-unit attacks.
- Per-target Overwhelm destinations.
- Combat-related ability roles.
- Preserving controller and last-known-information associations when targets leave play or change
  control.

**Relevant code:** [Attack](../server/game/core/attack/Attack.ts),
[AttackFlow](../server/game/core/attack/AttackFlow.ts), and
[AttackStepsSystem](../server/game/gameSystems/AttackStepsSystem.ts).

### 10. Player elimination versus game termination

**Current assumptions:** One defeated base ends the game; two defeated bases produce a draw.
Concession, timeouts, and lobby departures similarly award the game to another player.

**Open design decisions:**

- Player elimination state versus match termination.
- Format-defined result-finalization timing.
- Pending effects and prompts involving eliminated players.
- Cross-owned cards and counters after elimination.
- Distinct policies for concession, timeout, departure, and disconnection.

This is a future-format behavior seam even if elimination is not implemented during the preparatory
refactor.

**Relevant code:** [Game](../server/game/core/Game.ts),
[LoseGameSystem](../server/game/gameSystems/LoseGameSystem.ts), and
[Lobby](../server/gamenode/Lobby.ts).

### 11. Information visibility and prompt presentation

**Current assumptions:** Card visibility helpers recognize the controller and one opponent.
Ongoing-effect summaries also use that opponent relationship. Some prompts clear selection
highlights for one opponent, although the underlying prompt infrastructure already iterates over
all players.

**Open design decisions:**

- Visibility per viewer, including spectators and eliminated players.
- Private viewing versus public reveals.
- Identifying the actual waiting or choosing player.
- Resetting prompt and highlight state for every non-choosing participant.

**Relevant code:** [Card](../server/game/core/card/Card.ts),
[OngoingEffectEngine](../server/game/core/ongoingEffect/OngoingEffectEngine.ts),
[SelectCardPrompt](../server/game/core/gameSteps/prompts/SelectCardPrompt.ts), and
[UiPrompt](../server/game/core/gameSteps/prompts/UiPrompt.ts).

### 12. Undo consent, information exposure, and snapshots

**Current assumptions:** Rollback requests ask one opponent for confirmation, and confirmation checks
examine that opponent's activity. Snapshot management also contains timepoint-distance heuristics
whose correctness needs revisiting with arbitrary player order.

**Open design decisions:**

- Whose consent is required for a rollback.
- Detecting actions or information revealed by any other participant.
- Correctly snapshotting future seat-order, passing, and participation state.

Existing per-player snapshot collections are useful foundations.

**Relevant code:** [Game](../server/game/core/Game.ts),
[SnapshotManager](../server/game/core/snapshot/SnapshotManager.ts), and
[snapshot interfaces](../server/game/core/snapshot/SnapshotInterfaces.ts).

### 13. Lobby capacity, readiness, matchmaking, and rematches

**Current assumptions:** Lobby capacity is hardcoded to two seats. Connection/readiness and Bo3
transitions contain pair assumptions. Matchmaking finds pairs and returns a two-player tuple; rules
evaluate pairs and retain one previous opponent.

**Open design decisions:**

- A shared capacity or format-capability source.
- Ordered lobby participants.
- Group readiness and cancellation.
- Pairwise versus group matchmaking restrictions.
- Which rematch and Bo3 features remain explicitly duel-only.

**Relevant code:** [Lobby](../server/gamenode/Lobby.ts),
[QueueHandler](../server/gamenode/QueueHandler.ts),
[MatchmakingRules](../server/gamenode/MatchmakingRules.ts), and
[GameServer](../server/gamenode/GameServer.ts).

### 14. Client-facing contracts, bug captures, and player reports

**Current assumptions:** Normal live game state already uses a player-ID-keyed collection. Other
contracts are pair-oriented: game previews expose player-one/player-two fields, bug-state capture
rejects non-two-player games, and report schemas contain one opponent. Reporting infers the first
other participant.

**Open design decisions:**

- Stable participant IDs and seat/status metadata.
- Payload compatibility.
- Multi-player diagnostic captures.
- Explicit report-subject selection rather than assuming the opponent is the subject.

Client implementation consequences are outside this repository.

**Relevant code:** [Game](../server/game/core/Game.ts),
[Lobby](../server/gamenode/Lobby.ts), and
[serialization and report interfaces](../server/game/Interfaces.ts).

### 15. Results, deck statistics, and external integrations

**Current assumptions:** Lobby statistics processing explicitly requires two players and derives
one winner/loser pair. Matchup statistics describe one opposing deck. SWUStats payloads are
pair-shaped, while SWUBase submission also takes two players despite using an array in its payload.
Both submissions are currently gated to Premier.

**Open design decisions:**

- Per-player outcomes and matchup meaning in multiplayer.
- Result persistence.
- Which integrations remain deliberately unsupported rather than receiving an incorrectly adapted
  duel result.

**Relevant code:** [Lobby](../server/gamenode/Lobby.ts),
[DynamoDBInterfaces](../server/services/DynamoDBInterfaces.ts),
[SwuStatsHandler](../server/utils/statHandlers/SwuStatsHandler.ts), and
[SwuBaseHandler](../server/utils/statHandlers/SwuBaseHandler.ts).

### 16. Test harness and reproducible game setups

**Current assumptions:** The integration harness constructs two players and exposes two fixed
wrappers. Setup helpers handle ownership, decks, zones, and control-swapped cards as a pair.

**Open design decisions:**

- Collection-based fixtures while preserving existing test ergonomics.
- Unambiguous ownership and control references.
- Generalized prompt and phase-driving helpers.
- Testing preparatory abstractions without implicitly enabling unsupported four-player games.

**Relevant code:** [GameFlowWrapper](../test/helpers/GameFlowWrapper.js),
[GameStateBuilder](../test/helpers/GameStateBuilder.js), and
[IntegrationHelper types](../test/helpers/IntegrationHelper.d.ts).

## Cross-cutting distinction

The central distinction is between:

1. A relationship covering multiple players.
2. One concretely resolved player.
3. An ordered set of participating players.

These concepts currently collapse into "the opponent." Separating their meanings is the architecture
question; enabling four-player rules, lobbies, and outcomes is a separate step.
