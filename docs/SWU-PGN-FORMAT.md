# SWU-PGN: Portable Game Notation for Star Wars Unlimited

**Version 1.0**

## What Is SWU-PGN?

SWU-PGN is a file format for recording complete Star Wars Unlimited games. Think of it like chess PGN notation, but designed for SWU. A single `.swupgn` file captures everything that happened in a game so you can:

- **Read through a game** like a story, following every play, attack, and ability trigger
- **Replay a game on a computer** using the structured data layer
- **Analyze decisions** -- since all hidden information (resourced cards, hand reveals, search results) is recorded after the fact
- **Share games** in a compact, portable text file

Every `.swupgn` file has four sections: general game data (header), decklists (card index), a **Freeform** game log that humans can read naturally, and a **Parseable** section with structured JSON data that computers can process.

---

## File Layout

A `.swupgn` file is a plain text file (UTF-8) with this structure:

```
[Header]                    Game metadata (date, players, leaders, result)
[Card Index]                Full decklists with card set IDs

=== FREEFORM ===        <-- Start of the human-readable game log
[Game Notation]             Round-by-round account of every action

=== PARSEABLE ===       <-- Start of the computer-readable replay data
[JSON Replay Data]          One JSON object per line, every game event
```

The file starts with the game metadata header and full decklists for both players. The `=== FREEFORM ===` marker signals the start of the human-readable game log. The `=== PARSEABLE ===` marker signals the start of the machine-readable JSON replay data.

---

## Header

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

---

## Card Index (Decklists)

After the header, the Card Index lists both players' complete decklists. Every card name used in the notation is mapped to its unique set ID (`SET#NUM`).

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

## The Freeform Game Log

After the decklists, the `=== FREEFORM ===` marker signals the start of the human-readable game log. This records every round, organized by phase.

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
1. P1 plays Viper Probe Droid to Ground Arena (cost 2)
2. P2 plays Rebel Pathfinder to Ground Arena (cost 2)
3. P1 attacks with Cell Block Guard against P2's Rebel Pathfinder
4. P2 passes
5. P1 claims initiative and passes
```

**Sub-events** -- triggered abilities, damage, defeats -- are indented and lettered under the action that caused them:

```
1. P1 plays Viper Probe Droid to Ground Arena (cost 2)
  1a. P1's Viper Probe Droid triggers When Played: looks at P2's hand
  1b. P2's hand revealed: Rebel Pathfinder, Wing Leader, Moment of Peace
```

This hierarchy makes it clear which effects belong to which action. A single attack might generate several sub-events:

```
3. P1 attacks with Cell Block Guard against P2's Rebel Pathfinder
  3a. Cell Block Guard deals 3 damage to Rebel Pathfinder (0 remaining HP)
  3b. Rebel Pathfinder deals 2 damage to Cell Block Guard (1 remaining HP)
  3c. Rebel Pathfinder is defeated
  3d. Cell Block Guard is exhausted
```

**Setup and Regroup** entries are unnumbered since they follow a fixed sequence:

```
─── Setup Phase ───
P1 draws 6 cards in starting hand
P1 will keep their hand
P2 draws 6 cards in starting hand
P2 will mulligan
P2 shuffles their deck
P2 draws 6 cards in starting hand
P1 resources 1 card from hand: Vanquish
P2 resources 1 card from hand: Asteroid Sanctuary
```

```
─── Regroup Phase ───
P1 draws 2 cards
P2 draws 2 cards
P1 resources 1 card from hand: Admiral Ozzel, Overconfident
P2 resources 0 cards
All cards readied
```

#### How Cards Are Named

Cards are always written using their printed name:

- **Cards with a subtitle:** `Title, Subtitle` (e.g., `Darth Vader, Commanding the First Legion`)
- **Cards without a subtitle:** `Title` only (e.g., `Cell Block Guard`, `Vanquish`)
- **Token units:** `Title token` (e.g., `X-Wing token`)

This matches how players talk about cards. The Card Index at the bottom maps every name to its unique set ID, so there's never ambiguity about which printing is meant.

#### How Players Are Named

Players are always `P1` and `P2`. Possessive: `P1's`, `P2's`.

#### All Hidden Information Is Revealed

Since this is a post-game record, nothing is hidden:

- **Resourced cards** are named: `P1 resources 1 card from hand: Vanquish`
- **Hand reveals** show all cards: `P2's hand revealed: Rebel Pathfinder, Wing Leader, Moment of Peace`
- **Search results** show what was found: `P2 finds Snowspeeder and puts it into hand`

#### Common Action Patterns

Here are the sentence patterns you'll see in the notation:

| Action | Pattern |
|--------|---------|
| Play a unit/upgrade | `N. P1 plays Card Name to Zone (cost X)` |
| Play an event | `N. P1 plays Event Name (cost X)` |
| Deploy a leader | `N. P1 deploys Leader Name, Subtitle to Zone (cost X)` |
| Attack a unit | `N. P1 attacks with Attacker against P2's Defender` |
| Attack a base | `N. P1 attacks with Attacker against P2's Base` |
| Pass | `N. P1 passes` |
| Claim initiative | `N. P1 claims initiative and passes` |
| Triggered ability | `  Na. P1's Card triggers Type: effect description` |
| Damage dealt | `  Na. Card deals X damage to Target (Y remaining HP)` |
| Card defeated | `  Na. Card is defeated` |
| Card exhausted | `  Na. Card is exhausted` |
| Heal | `  Na. X damage healed from Card (Y remaining HP)` |
| Shield gained | `  Na. Card gains a Shield token` |
| Shield used | `  Na. Card's Shield token is defeated to prevent damage` |
| Token created | `  Na. Token Name enters Zone (X/Y)` |
| Overwhelm | `  Na. X Overwhelm damage dealt to P2's Base (Y remaining HP)` |
| Base status | `  [Base Status] P1: 25/30 HP \| P2: 18/30 HP` |
| Search | `  Na. P1 searches their deck` / `  Nb. P1 finds Card and puts it into Zone` |

#### Combat Examples

**Basic combat** (unit vs. unit):
```
3. P1 attacks with Cell Block Guard against P2's Rebel Pathfinder
  3a. Cell Block Guard deals 3 damage to Rebel Pathfinder (0 remaining HP)
  3b. Rebel Pathfinder deals 2 damage to Cell Block Guard (1 remaining HP)
  3c. Rebel Pathfinder is defeated
  3d. Cell Block Guard is exhausted
```

**Overwhelm** (excess damage hits the base — note the base status snapshot):
```
3. P1 attacks with AT-AT against Rebel Pathfinder
  3a. AT-AT deals 6 damage to Rebel Pathfinder (0 remaining HP)
  3b. Rebel Pathfinder is defeated
  3c. 4 Overwhelm damage dealt to P2's Echo Base (16 remaining HP)
  [Base Status] P1: 25/30 HP | P2: 16/30 HP
  3d. Rebel Pathfinder deals 2 damage to AT-AT (6 remaining HP)
  3e. AT-AT is exhausted
```

**Base attack** (base status appears after every hit to a base):
```
5. P1 attacks with Viper Probe Droid against P2's Base
  5a. Viper Probe Droid deals 2 damage to Echo Base (28 remaining HP)
  [Base Status] P1: 30/30 HP | P2: 28/30 HP
  5b. Viper Probe Droid is exhausted
```

**Sentinel** (attack redirected):
```
3. P1 attacks with Viper Probe Droid against P2's Base
  3a. Attack redirected to Snowtrooper Lieutenant (Sentinel)
  3b. Viper Probe Droid deals 2 damage to Snowtrooper Lieutenant (1 remaining HP)
  3c. Snowtrooper Lieutenant deals 2 damage to Viper Probe Droid (0 remaining HP)
  3d. Viper Probe Droid is defeated
```

---

## The Parseable Layer (For Computers)

After `=== PARSEABLE ===`, each line is a standalone JSON object representing one game event. A computer reads these line by line to reconstruct or replay the game.

### Every Record Has These Fields

| Field | What It Is | Example |
|-------|-----------|---------|
| `seq` | Position in the game | `"R1.A.3b"` |
| `type` | What happened | `"PLAY"`, `"ATTACK"`, `"DAMAGE"` |
| `player` | Who did it | `"P1"` or `"P2"` |

### The Sequence ID (`seq`)

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

### Action Types

Each `type` value tells the computer what kind of event this is:

**Player decisions:**
`PLAY`, `PLAY_EVENT`, `PLAY_UPGRADE`, `PLAY_SMUGGLE`, `DEPLOY_LEADER`, `ATTACK`, `PASS`, `CLAIM_INITIATIVE`, `MULLIGAN`, `KEEP_HAND`, `RESOURCE`, `MODAL_CHOICE`, `ABILITY_ACTIVATE`

**Game effects:**
`TRIGGER`, `DAMAGE`, `DEFEAT`, `EXHAUST`, `READY`, `DRAW`, `DISCARD`, `HEAL`, `SEARCH`, `SHUFFLE`, `CREATE_TOKEN`, `CAPTURE`, `RESCUE`, `REVEAL`, `MOVE`, `TAKE_CONTROL`, `OVERWHELM`, `SHIELD_GAIN`, `SHIELD_USE`, `EXPERIENCE_GAIN`, `STATUS_TOKEN`

**Game structure:**
`PHASE_START`, `PHASE_END`, `ROUND_START`, `ROUND_END`, `GAME_END`

**Status tracking:**
`BASE_STATUS` (emitted after any damage or heal to a base, shows both bases' HP)

### Example Records

**Playing a card:**
```json
{"seq":"R1.A.1","type":"PLAY","player":"P1","card":"SOR#108","zone":"Ground","cost":2,"playType":"playFromHand"}
```

**Attacking:**
```json
{"seq":"R1.A.5","type":"ATTACK","player":"P1","attacker":"SOR#108","defender":"SOR#020","defenderType":"base"}
```

**Dealing damage:**
```json
{"seq":"R1.A.5a","type":"DAMAGE","source":"SOR#108","target":"SOR#020","amount":2,"damageType":"combat","remainingHp":28}
```

**Base status snapshot** (emitted after any damage/heal to a base):
```json
{"seq":"R1.A.5b","type":"BASE_STATUS","p1Base":"SOR#028","p1Hp":30,"p1MaxHp":30,"p2Base":"SOR#020","p2Hp":28,"p2MaxHp":30}
```

**Triggered ability:**
```json
{"seq":"R1.A.1a","type":"TRIGGER","card":"SOR#108","abilityType":"whenPlayed","description":"looks at opponent hand"}
```

**Defeating a unit:**
```json
{"seq":"R2.A.2c","type":"DEFEAT","card":"SOR#045","reason":"no_remaining_hp","defeatedBy":"SOR#095"}
```

**Creating a token:**
```json
{"seq":"R2.A.1b","type":"CREATE_TOKEN","player":"P2","token":"X-Wing","zone":"Space","power":2,"hp":3}
```

**Resourcing a card:**
```json
{"seq":"R1.S.7","type":"RESOURCE","player":"P1","card":"SOR#142","count":1}
```

**Hand reveal:**
```json
{"seq":"R1.A.1b","type":"REVEAL","player":"P2","zone":"Hand","cards":["SOR#045","SOR#042","SOR#165","SOR#150","SOR#176"]}
```

**Game ending:**
```json
{"seq":"R4.A.14e","type":"GAME_END","winner":"P1","reason":"Base Destroyed"}
```

### Card References

Cards are identified by `SET#NUM` in the parseable layer (e.g., `SOR#108`). The Card Index in the freeform layer maps these to human-readable names.

When multiple copies of the same card are in play, a suffix distinguishes them:
- First copy: `SOR#095`
- Second copy: `SOR#095:2`
- Third copy: `SOR#095:3`

---

## Quick Reference

### File Markers

| Marker | Meaning |
|--------|---------|
| `═══ CARD INDEX ═══` | Start of decklists (after header) |
| `=== FREEFORM ===` | Start of human-readable game log |
| `═══ ROUND N ═══` | Round boundary (within freeform) |
| `─── Phase Name ───` | Phase boundary (within freeform) |
| `=== PARSEABLE ===` | Start of computer-readable JSON data |

### Notation Numbering

| Format | Meaning | Example |
|--------|---------|---------|
| `N.` | Top-level player action | `3. P1 attacks with...` |
| `Na.` | Sub-event of action N | `3a. Cell Block Guard deals...` |
| `Na-i.` | Nested sub-event | `3a-i. Triggers another ability...` |
| (no number) | Setup/Regroup phase entry | `P1 draws 2 cards` |

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
