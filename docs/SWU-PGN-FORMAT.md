# SWU-PGN: Portable Game Notation for Star Wars Unlimited

**Version 1.1**

## What Is SWU-PGN?

SWU-PGN is a file format for recording complete Star Wars Unlimited games. Think of it like chess PGN notation, but designed for SWU. A game produces two files, packaged together as a zip download:

- **`.swupgn`** -- The **human-readable** file. Read through a game like a story, following every play, attack, and ability trigger.
- **`.swureplay`** -- The **machine-replay** file. Contains structured JSON data with full game state snapshots for computer-driven replay.

Both files are self-contained (each includes the header and card index), so either can be shared or opened independently.

### What You Can Do

- **Read through a game** -- the `.swupgn` file tells the story of every round
- **Replay a game on a computer** -- the `.swureplay` file contains full board state snapshots after every action
- **Analyze decisions** -- all hidden information (resourced cards, hand reveals, search results) is recorded
- **Share games** -- compact, portable text files

### Zip Package

When downloaded, both files are bundled together:

```
game-2026-04-04-abc123.zip
  game.swupgn       # Human-readable
  game.swureplay    # Machine replay
```

---

## Shared Sections

Both `.swupgn` and `.swureplay` files start with the same two sections: the **Header** and the **Card Index**.

### Header

The file starts with metadata about the game, using chess-PGN-style tags:

```
[Game "SWU-PGN v1.0"]
[Date "2026.04.04"]
[Player1 "Player 1"]
[Player2 "Player 2"]
[P1Leader "Darth Vader, Commanding the First Legion"]
[P1Base "Command Center"]
[P2Leader "Luke Skywalker, Faithful Friend"]
[P2Base "Echo Base"]
[Result "P1 Win"]
[Reason "Base Destroyed"]
[Format "Premier"]
[Rounds "4"]
```

Each line is `[TagName "Value"]`. The header tells you who played, what they played, and how the game ended -- all at a glance.

**Required tags:** Game, Date, Player1, Player2, P1Leader, P1Base, P2Leader, P2Base, Result, Reason

**Optional tags:** Format, Rounds

**Player anonymization:** Players are always labeled "Player 1" and "Player 2" -- real usernames are never stored.

### Card Index (Decklists)

Both files include the Card Index, which lists both players' complete decklists. Every card name used in the notation is mapped to its unique set ID (`SET#NUM`).

```
═══ CARD INDEX ═══

── P1 Decklist ──
Leader: Darth Vader, Commanding the First Legion = SOR#010
Base: Command Center = SOR#028
Deck:
  2x Admiral Ozzel, Overconfident = SOR#087
  3x Cell Block Guard = SOR#095
  1x Force Choke = SOR#138
  3x Vanquish = SOR#142
  2x Viper Probe Droid = SOR#108

── P2 Decklist ──
Leader: Luke Skywalker, Faithful Friend = SOR#005
Base: Echo Base = SOR#020
Deck:
  2x Rebel Pathfinder = SOR#045
  3x Wing Leader = SOR#042
  ...
```

**Format rules:**
- Leader and Base listed first
- Deck cards listed alphabetically under `Deck:`
- Each entry: `Nx Card Name = SET#NUM` (e.g., `3x Vanquish = SOR#142`)
- Set codes: `SOR` (Spark of Rebellion), `SHD` (Shadows of the Galaxy), `JTL` (Jump to Lightspeed), `LOF` (Lure of the Dark Side), `TWI` (Twilight of the Republic), etc.
- Card numbers are zero-padded to 3 digits: `#005`, `#042`, `#176`

---

## The `.swupgn` File (Human-Readable)

### File Layout

```
[Header]                    Game metadata
═══ CARD INDEX ═══          Full decklists
=== FREEFORM ===        <-- Start of the human-readable game log
[Game Notation]             Round-by-round account of every action
```

### The Freeform Game Log

After the `=== FREEFORM ===` marker, the game log records every round, organized by phase.

#### Rounds and Phases

Each round is marked with a bold separator. Within each round, the three phases of SWU are labeled:

```
═══ ROUND 1 ═══

─── Setup Phase ───
(mulligan decisions, initial resource choices)

─── Action Phase ───
(numbered player actions -- plays, attacks, passes)

─── Regroup Phase ───
(draw cards, resource a card, ready all)
```

The Setup Phase only appears in Round 1. Subsequent rounds go straight to the Action Phase.

#### How Actions Are Written

**Player actions** in the Action Phase are numbered. The number resets each round:

```
1. Player 1 plays Viper Probe Droid to Ground Arena (cost 2)
2. Player 2 plays Rebel Pathfinder to Ground Arena (cost 2)
3. Player 1 attacks with Cell Block Guard against Player 2's Rebel Pathfinder
4. Player 2 passes
5. Player 1 claims initiative and passes
```

**Sub-events** -- triggered abilities, damage, defeats -- are indented and lettered under the action that caused them:

```
1. Player 1 plays Viper Probe Droid to Ground Arena (cost 2)
  1a. Player 1's Viper Probe Droid triggers When Played: looks at Player 2's hand
  1b. Player 2's hand revealed: Rebel Pathfinder, Wing Leader, Moment of Peace
```

This hierarchy makes it clear which effects belong to which action. A single attack might generate several sub-events:

```
3. Player 1 attacks with Cell Block Guard against Player 2's Rebel Pathfinder
  3a. Cell Block Guard deals 3 damage to Rebel Pathfinder (0 remaining HP)
  3b. Rebel Pathfinder deals 2 damage to Cell Block Guard (1 remaining HP)
  3c. Rebel Pathfinder is defeated
  3d. Cell Block Guard is exhausted
```

**Setup and Regroup** entries are unnumbered since they follow a fixed sequence:

```
─── Setup Phase ───
Player 1 draws 6 cards in starting hand
  [Cards Drawn] Player 1: Viper Probe Droid, Cell Block Guard, Vanquish, Force Choke, Admiral Ozzel, Overconfident, Open Fire
Player 1 will keep their hand
Player 2 draws 6 cards in starting hand
  [Cards Drawn] Player 2: Rebel Pathfinder, Wing Leader, Moment of Peace, Snowspeeder, Jedha City, Surprise Strike
Player 2 will mulligan
Player 2 shuffles their deck
Player 2 draws 6 cards in starting hand
  [Cards Drawn] Player 2: Rebel Pathfinder, Echo Base Defender, Moment of Peace, Wing Leader, Alliance X-Wing, Repair
Player 1 resources 1 card from hand: Vanquish
  [Card Resourced] Player 1: Vanquish
Player 2 resources 1 card from hand: Asteroid Sanctuary
  [Card Resourced] Player 2: Asteroid Sanctuary
```

```
─── Regroup Phase ───
Player 1 draws 2 cards
  [Cards Drawn] Player 1: Superlaser Technician, Relentless, Konstantine's Folly
Player 2 draws 2 cards
  [Cards Drawn] Player 2: Luke Skywalker, Jedi Knight, Recruit
Player 1 resources 1 card from hand: Admiral Ozzel, Overconfident
  [Card Resourced] Player 1: Admiral Ozzel, Overconfident
Player 2 resources 0 cards
All cards readied
```

#### How Cards Are Named

Cards are always written using their printed name:

- **Cards with a subtitle:** `Title, Subtitle` (e.g., `Darth Vader, Commanding the First Legion`)
- **Cards without a subtitle:** `Title` only (e.g., `Cell Block Guard`, `Vanquish`)
- **Token units:** `Title token` (e.g., `X-Wing token`)

This matches how players talk about cards. The Card Index maps every name to its unique set ID, so there's never ambiguity about which printing is meant.

#### How Players Are Named

Players are always `Player 1` and `Player 2`. Possessive: `Player 1's`, `Player 2's`.

#### All Hidden Information Is Revealed

Since this is a post-game record, nothing is hidden:

- **Resourced cards** are named: `Player 1 resources 1 card from hand: Vanquish`
- **Hand reveals** show all cards: `Player 2's hand revealed: Rebel Pathfinder, Wing Leader, Moment of Peace`
- **Search results** show what was found: `Player 2 finds Snowspeeder and puts it into hand`

#### Common Action Patterns

Here are the sentence patterns you'll see in the notation:

| Action | Pattern |
|--------|---------|
| Play a unit/upgrade | `N. Player 1 plays Card Name to Zone (cost X)` |
| Play an event | `N. Player 1 plays Event Name (cost X)` |
| Deploy a leader | `N. Player 1 deploys Leader Name, Subtitle to Zone (cost X)` |
| Attack a unit | `N. Player 1 attacks with Attacker against Player 2's Defender` |
| Attack a base | `N. Player 1 attacks with Attacker against Player 2's Base` |
| Pass | `N. Player 1 passes` |
| Claim initiative | `N. Player 1 claims initiative and passes` |
| Triggered ability | `  Na. Player 1's Card triggers Type: effect description` |
| Damage dealt | `  Na. Card deals X damage to Target (Y remaining HP)` |
| Card defeated | `  Na. Card is defeated` |
| Card exhausted | `  Na. Card is exhausted` |
| Heal | `  Na. X damage healed from Card (Y remaining HP)` |
| Shield gained | `  Na. Card gains a Shield token` |
| Shield used | `  Na. Card's Shield token is defeated to prevent damage` |
| Token created | `  Na. Token Name enters Zone (X/Y)` |
| Overwhelm | `  Na. X Overwhelm damage dealt to Player 2's Base (Y remaining HP)` |
| Game state | `  [Game State] Player 1: 25/30 HP, 4 cards, ... \| Player 2: 18/30 HP, 3 cards, ...` |
| Cards drawn | `  [Cards Drawn] Player 1: Card A, Card B` |
| Card resourced | `  [Card Resourced] Player 1: Card Name, Subtitle` |
| Search | `  Na. Player 1 searches their deck` / `  Nb. Player 1 finds Card and puts it into Zone` |

#### Combat Examples

**Basic combat** (unit vs. unit):
```
3. Player 1 attacks with Cell Block Guard against Player 2's Rebel Pathfinder
  3a. Cell Block Guard deals 3 damage to Rebel Pathfinder (0 remaining HP)
  3b. Rebel Pathfinder deals 2 damage to Cell Block Guard (1 remaining HP)
  3c. Rebel Pathfinder is defeated
  3d. Cell Block Guard is exhausted
```

**Overwhelm** (excess damage hits the base):
```
3. Player 1 attacks with AT-AT against Rebel Pathfinder
  3a. AT-AT deals 6 damage to Rebel Pathfinder (0 remaining HP)
  3b. Rebel Pathfinder is defeated
  3c. 4 Overwhelm damage dealt to Player 2's Echo Base (16 remaining HP)
  3d. Rebel Pathfinder deals 2 damage to AT-AT (6 remaining HP)
  3e. AT-AT is exhausted
  [Game State] Player 1: 25/30 HP, 3 cards, 2/6 resources, 0 credits | Player 2: 16/30 HP, 4 cards, 3/5 resources, 0 credits, Force, 1 ground/2 space
```

**Base attack** (game state snapshot appears after every completed action):
```
5. Player 1 attacks with Viper Probe Droid against Player 2's Base
  5a. Viper Probe Droid deals 2 damage to Echo Base (28 remaining HP)
  5b. Viper Probe Droid is exhausted
  [Game State] Player 1: 30/30 HP, 5 cards, 4/6 resources, 0 credits, Initiative | Player 2: 28/30 HP, 5 cards, 4/5 resources, 0 credits, Force, 0 ground/0 space
```

**Sentinel** (attack redirected):
```
3. Player 1 attacks with Viper Probe Droid against Player 2's Base
  3a. Attack redirected to Snowtrooper Lieutenant (Sentinel)
  3b. Viper Probe Droid deals 2 damage to Snowtrooper Lieutenant (1 remaining HP)
  3c. Snowtrooper Lieutenant deals 2 damage to Viper Probe Droid (0 remaining HP)
  3d. Viper Probe Droid is defeated
```

---

## The `.swureplay` File (Machine Replay)

### File Layout

```
[Header]                    Game metadata (same as .swupgn)
═══ CARD INDEX ═══          Full decklists (same as .swupgn)
=== REPLAY ===          <-- Start of the machine-readable replay data
[JSON Replay Data]          One JSON object per line: events + full state snapshots
```

### Replay Data Format

After `=== REPLAY ===`, each line is a standalone JSON object representing one game event. A computer reads these line by line to reconstruct or replay the game.

The replay data contains two types of records interleaved:

1. **Granular event records** -- individual game actions (PLAY, ATTACK, DAMAGE, etc.)
2. **Full state snapshot records** -- complete serialized game state after each top-level action

#### Granular Event Records

Every event record has these fields:

| Field | What It Is | Example |
|-------|-----------|---------|
| `seq` | Position in the game | `"R1.A.3b"` |
| `type` | What happened | `"PLAY"`, `"ATTACK"`, `"DAMAGE"` |
| `player` | Who did it | `"Player 1"` or `"Player 2"` |

#### Full State Snapshot Records

After each top-level action, a `GAME_STATE` record with a `snapshot` field contains the complete serialized game state -- the same data structure the spectator UI uses to render the game board. This includes:

- Per-player: full card state for every zone (ground arena, space arena, resources, discard, hand size, base, leader), individual card damage, upgrades, exhausted status, tokens
- Game-level: phase, initiative, round number, game mode

```json
{"seq":"R1.A.1b-snapshot","type":"GAME_STATE","snapshot":{ ... full getState() object ... }}
```

The snapshot `seq` uses a `-snapshot` suffix to distinguish it from the summary GAME_STATE records.

Player names and IDs within snapshots are anonymized to "Player 1"/"Player 2", matching the rest of the file.

#### The Sequence ID (`seq`)

The `seq` field tells you exactly where this event sits in the game:

```
R1.A.3b
│  │ ││
│  │ │└─ Sub-event "b" (second sub-event)
│  │ └── Action 3
│  └──── Phase: A=Action, S=Setup, G=Regroup
└─────── Round 1
```

Examples:
- `R1.S.1` -- Round 1, Setup Phase, first event
- `R1.A.5` -- Round 1, Action Phase, 5th action
- `R1.A.5a` -- First sub-event of that action
- `R2.G.3` -- Round 2, Regroup Phase, third event
- `R1.start` -- ROUND_START for Round 1
- `R1.end` -- ROUND_END for Round 1
- `R1.A.start` -- PHASE_START for Action Phase of Round 1
- `R1.A.end` -- PHASE_END for Action Phase of Round 1
- `R1.A.5a-snapshot` -- Full state snapshot after action 5's sub-events

### Action Types

Each `type` value tells the computer what kind of event this is:

**Player decisions:**
`PLAY`, `PLAY_EVENT`, `PLAY_UPGRADE`, `PLAY_SMUGGLE`, `DEPLOY_LEADER`, `ATTACK`, `PASS`, `CLAIM_INITIATIVE`, `MULLIGAN`, `KEEP_HAND`, `RESOURCE`, `MODAL_CHOICE`, `ABILITY_ACTIVATE`

**Game effects:**
`TRIGGER`, `DAMAGE`, `DEFEAT`, `EXHAUST`, `READY`, `DRAW`, `DISCARD`, `HEAL`, `SEARCH`, `SHUFFLE`, `CREATE_TOKEN`, `CAPTURE`, `RESCUE`, `REVEAL`, `MOVE`, `TAKE_CONTROL`, `OVERWHELM`, `SHIELD_GAIN`, `SHIELD_USE`, `EXPERIENCE_GAIN`, `STATUS_TOKEN`

**Game structure:**
`PHASE_START`, `PHASE_END`, `ROUND_START`, `ROUND_END`, `GAME_END`

**Status tracking:**
`GAME_STATE` -- Two variants:
- **Summary** (flat fields): emitted after every completed player action with aggregate counts
- **Snapshot** (`snapshot` field, seq ends in `-snapshot`): full serialized game state for replay

### Example Records

**Playing a card:**
```json
{"seq":"R1.A.1","type":"PLAY","player":"Player 1","card":"SOR#108","zone":"Ground","playType":"playFromHand"}
```

**Attacking:**
```json
{"seq":"R1.A.5","type":"ATTACK","player":"Player 1","attacker":"SOR#108","defender":"SOR#020","defenderType":"base"}
```

**Dealing damage:**
```json
{"seq":"R1.A.5a","type":"DAMAGE","source":"SOR#108","target":"SOR#020","amount":2,"damageType":"combat","remainingHp":28}
```

**Summary game state** (emitted after every completed player action):
```json
{"seq":"R1.A.5c","type":"GAME_STATE","p1BaseHp":30,"p1BaseMaxHp":30,"p1HandSize":5,"p1ResourcesReady":4,"p1ResourcesExhausted":2,"p1Credits":0,"p1HasForce":false,"p1HasInitiative":true,"p1GroundUnits":1,"p1SpaceUnits":0,"p2BaseHp":28,"p2BaseMaxHp":30,"p2HandSize":5,"p2ResourcesReady":4,"p2ResourcesExhausted":1,"p2Credits":0,"p2HasForce":true,"p2HasInitiative":false,"p2GroundUnits":0,"p2SpaceUnits":0}
```

**Full state snapshot** (for replay viewer, emitted after the summary):
```json
{"seq":"R1.A.5c-snapshot","type":"GAME_STATE","snapshot":{"players":{"Player 1":{...},"Player 2":{...}},"phase":"action","initiativeClaimed":false,...}}
```

**Triggered ability:**
```json
{"seq":"R1.A.1a","type":"TRIGGER","card":"SOR#108","player":"Player 1"}
```

**Defeating a unit:**
```json
{"seq":"R2.A.2c","type":"DEFEAT","card":"SOR#045","reason":"no_remaining_hp","defeatedBy":"SOR#095"}
```

**Creating a token:**
```json
{"seq":"R2.A.1b","type":"CREATE_TOKEN","player":"Player 2","token":"X-Wing","zone":"Space","power":2,"hp":3}
```

**Drawing cards** (includes the actual cards drawn):
```json
{"seq":"R1.S.1","type":"DRAW","player":"Player 1","count":6,"cards":["SOR#108","SOR#095","SOR#142","SOR#138","SOR#087","SOR#148"]}
```

**Resourcing a card** (includes the card name):
```json
{"seq":"R1.S.7","type":"RESOURCE","player":"Player 1","card":"SOR#142","cardName":"Vanquish"}
```

**Hand reveal:**
```json
{"seq":"R1.A.1b","type":"REVEAL","player":"Player 2","zone":"Hand","cards":["SOR#045","SOR#042","SOR#165","SOR#150","SOR#176"]}
```

**Game ending:**
```json
{"seq":"R4.A.14e","type":"GAME_END","winner":"P1","reason":"Base Destroyed"}
```

### Card References

Cards are identified by `SET#NUM` in the parseable layer (e.g., `SOR#108`). The Card Index maps these to human-readable names.

When multiple copies of the same card are in play, a suffix distinguishes them:
- First copy: `SOR#095`
- Second copy: `SOR#095:2`
- Third copy: `SOR#095:3`

---

## Quick Reference

### File Types

| Extension | Purpose | Contains |
|-----------|---------|----------|
| `.swupgn` | Human-readable game record | Header + Card Index + Freeform notation |
| `.swureplay` | Machine-replay data | Header + Card Index + JSON events + full state snapshots |

### File Markers

| Marker | Appears In | Meaning |
|--------|-----------|---------|
| `=== FREEFORM ===` | `.swupgn` | Start of human-readable game log |
| `=== REPLAY ===` | `.swureplay` | Start of computer-readable JSON data |
| `═══ ROUND N ═══` | `.swupgn` | Round boundary (within freeform) |
| `─── Phase Name ───` | `.swupgn` | Phase boundary (within freeform) |
| `═══ CARD INDEX ═══` | Both | Start of decklists |

### Notation Numbering

| Format | Meaning | Example |
|--------|---------|---------|
| `N.` | Top-level player action | `3. Player 1 attacks with...` |
| `Na.` | Sub-event of action N | `3a. Cell Block Guard deals...` |
| `Na-i.` | Nested sub-event | `3a-i. Triggers another ability...` |
| (no number) | Setup/Regroup phase entry | `Player 1 draws 2 cards` |

### Card Name Format

| Card Type | Has Subtitle? | Example |
|-----------|--------------|---------|
| Named unit | Yes | `Darth Vader, Commanding the First Legion` |
| Generic unit | No | `Cell Block Guard` |
| Leader | Yes | `Luke Skywalker, Faithful Friend` |
| Event | No | `Vanquish` |
| Upgrade | Sometimes | `Darksaber, Ancient Weapon` or `Experience token` |
| Base | No | `Echo Base` |
| Token | No | `X-Wing token` |

### Set Codes

| Code | Set Name |
|------|----------|
| `SOR` | Spark of Rebellion |
| `SHD` | Shadows of the Galaxy |
| `JTL` | Jump to Lightspeed |
| `TWI` | Twilight of the Republic |

---

## Sample File

A complete sample `.swupgn` file is available at: [docs/samples/sample-game.swupgn](samples/sample-game.swupgn)
