# SWU Portable Game Notation (SWU-PGN) Design Spec

## Overview

SWU-PGN is a dual-layer file format (`.swupgn`) for recording complete Star Wars Unlimited games. It serves two audiences in a single file:

1. **Human-readable notation** -- natural language shorthand for reading, analysis, and mental replay
2. **Machine-readable replay data** -- JSON-lines for computer parsing, game replay, and statistical analysis

The format captures the full cascade of every game action: player choices, triggered abilities, damage resolution, token creation, card movement, and all state changes. Nothing is hidden -- resourced cards, searched cards, and hand contents are all recorded since this is a post-game artifact.

Players are anonymized as P1 and P2.

---

## File Structure

A `.swupgn` file has four sections in this order:

```
[Header Block]
[Human Notation]
[Card Index]
=== REPLAY DATA ===
[JSON-lines Replay Log]
```

---

## Section 1: Header Block

Chess PGN-style metadata tags. Each tag is on its own line in the format `[TagName "Value"]`.

### Required Tags

| Tag | Description | Example |
|-----|-------------|---------|
| `Game` | Format identifier and version | `"SWU-PGN v1.0"` |
| `Date` | Game date in YYYY.MM.DD | `"2026.04.04"` |
| `Player1` | P1 display label (always anonymized) | `"Player 1"` |
| `Player2` | P2 display label (always anonymized) | `"Player 2"` |
| `P1Leader` | P1's leader card (Title, Subtitle) | `"Darth Vader, Commanding the First Legion"` |
| `P1Base` | P1's base card (Title) | `"Command Center"` |
| `P2Leader` | P2's leader card (Title, Subtitle) | `"Luke Skywalker, Faithful Friend"` |
| `P2Base` | P2's base card (Title) | `"Echo Base"` |
| `Result` | Game outcome | `"P1 Win"`, `"P2 Win"`, or `"Draw"` |
| `Reason` | How the game ended | `"Base Destroyed"`, `"Concession"`, `"Timeout"`, `"Disconnection"` |

### Optional Tags

| Tag | Description | Example |
|-----|-------------|---------|
| `Format` | Game format | `"Premier"`, `"Twin Suns"` |
| `Rounds` | Total round count | `"7"` |

### Example

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
[Rounds "5"]
```

---

## Section 2: Human Notation

### Structure Markers

Round and phase boundaries use visual separators:

```
═══ ROUND 1 ═══

─── Setup Phase ───
...

─── Action Phase ───
...

─── Regroup Phase ───
...

═══ ROUND 2 ═══

─── Action Phase ───
...
```

- Round markers use `═══ ROUND N ═══` (triple box-drawing equals)
- Phase markers use `─── Phase Name ───` (triple box-drawing dashes)
- Setup Phase only appears in Round 1
- A blank line separates each phase section for readability

### Action Numbering

- **Top-level actions** are numbered sequentially within each Action Phase, resetting each round: `1.`, `2.`, `3.`
- **Sub-events** (triggered abilities, damage resolution, state changes) use lettered suffixes: `1a.`, `1b.`, `1c.`
- **Nested sub-events** (a trigger causing another trigger) add depth: `1a-i.`, `1a-ii.`
- Setup Phase and Regroup Phase entries are unnumbered (they follow a fixed sequence)

### Card Naming Convention

Cards are referenced by their printed name throughout the notation:

- **Cards with a subtitle**: `Title, Subtitle` (e.g., `Darth Vader, Commanding the First Legion`)
- **Cards without a subtitle**: `Title` only (e.g., `Cell Block Guard`, `Vanquish`, `Echo Base`)
- **Token units**: `Title` followed by `token` (e.g., `X-Wing token`)

This applies everywhere: the notation body, the card index, and the header block.

The Card Index (Section 3) maps every card name to its unique set ID (`SET#NUM`), resolving any ambiguity.

### Player References

Players are always referred to as `P1` and `P2`. Possessive form: `P1's`, `P2's`.

### Action Sentence Patterns

The notation uses consistent natural language patterns. Each pattern corresponds to a game action type. Below are the canonical sentence templates:

#### Player Actions (Top-level, numbered)

**Play a card from hand:**
```
N. P1 plays Card Name to Zone (cost X)
```

**Play a card via Smuggle:**
```
N. P1 plays Card Name to Zone using Smuggle from their resource row (cost X)
```

**Play an upgrade:**
```
N. P1 plays Upgrade Name, attaching it to Target Unit (cost X)
```

**Play an event:**
```
N. P1 plays Event Name (cost X)
```

**Deploy leader:**
```
N. P1 deploys Leader Name, Subtitle to Zone (cost X)
```

**Attack a unit:**
```
N. P1 attacks with Attacker Name against P2's Defender Name
```

**Attack a base:**
```
N. P1 attacks with Attacker Name against P2's Base
```

**Pass:**
```
N. P1 passes
```

**Claim initiative:**
```
N. P1 claims initiative and passes
```

#### Sub-events (Lettered, indented with 2 spaces)

**Triggered ability:**
```
  Na. P1's Card Name triggers Ability Type: description of effect
```
Where Ability Type is one of: `When Played`, `When Defeated`, `On Attack`, `On Defense`, `Bounty`.

**Damage dealt:**
```
  Na. Card Name deals X damage to Target Name (Y remaining HP)
```

**Card defeated:**
```
  Na. Card Name is defeated (0 remaining HP)
```

**Card exhausted:**
```
  Na. Card Name is exhausted
```

**Card readied:**
```
  Na. Card Name is readied
```

**Draw cards:**
```
  Na. P1 draws X card(s)
```

**Discard cards:**
```
  Na. P1 discards Card Name from hand
```

**Card captured:**
```
  Na. Card Name captures Target Name
```

**Card rescued:**
```
  Na. P1 rescues Card Name
```

**Token created:**
```
  Na. Token Name enters Zone (X/Y)
```
Where X/Y are power/HP.

**Shield gained:**
```
  Na. Card Name gains a Shield token
```

**Shield used:**
```
  Na. Card Name's Shield token is defeated to prevent damage
```

**Experience gained:**
```
  Na. Card Name gains an Experience token
```

**Search deck:**
```
  Na. P1 searches their deck
  Nb. P1 finds Card Name and puts it into Zone
  Nc. P1 shuffles their deck
```

**Look at cards:**
```
  Na. P1 looks at P2's hand
  Nb. P2's hand revealed: Card A, Card B, Card C
```

**Card moved between zones:**
```
  Na. Card Name is moved from Zone to Zone
```

**Take control:**
```
  Na. P1 takes control of Card Name
```

**Heal damage:**
```
  Na. X damage healed from Card Name (Y remaining HP)
```

**Leader ability (action):**
```
  Na. P1 activates Leader Name, Subtitle ability: description
```

**Overwhelm damage:**
```
  Na. X Overwhelm damage dealt to P2's Base
```

**Ongoing effect applied:**
```
  Na. Card Name gains/loses Keyword until end of phase/round
```

**Modal choice:**
```
  Na. P1 chooses "Option text" on Card Name
```

#### Setup Phase Entries (Unnumbered)

```
P1 draws 6 cards in starting hand
P1 will keep their hand
P1 will mulligan
P1 shuffles their deck
P1 draws 6 cards in starting hand
P1 resources 1 card from hand: Card Name, Subtitle
P2 resources 1 card from hand: Card Name
```

#### Regroup Phase Entries (Unnumbered)

```
P1 draws 2 cards
P2 draws 2 cards
P1 resources 1 card from hand: Card Name, Subtitle
P2 resources 0 cards
All cards readied
```

### Combat Resolution Detail

Combat is recorded as a sequence of sub-events under the attack action:

```
3. P1 attacks with Cell Block Guard against P2's Rebel Pathfinder
  3a. Cell Block Guard deals 3 damage to Rebel Pathfinder (0 remaining HP)
  3b. Rebel Pathfinder deals 2 damage to Cell Block Guard (1 remaining HP)
  3c. Rebel Pathfinder is defeated
  3d. Cell Block Guard is exhausted
```

When Sentinel is involved:
```
3. P1 attacks with Viper Probe Droid against P2's Base
  3a. Attack redirected to Snowtrooper Lieutenant (Sentinel)
  3b. Viper Probe Droid deals 2 damage to Snowtrooper Lieutenant (1 remaining HP)
  3c. Snowtrooper Lieutenant deals 2 damage to Viper Probe Droid (0 remaining HP)
  ...
```

When Overwhelm applies:
```
3. P1 attacks with AT-AT against Rebel Pathfinder
  3a. AT-AT deals 6 damage to Rebel Pathfinder (0 remaining HP)
  3b. Rebel Pathfinder is defeated
  3c. 4 Overwhelm damage dealt to P2's Echo Base (16 remaining HP)
  3d. Rebel Pathfinder deals 2 damage to AT-AT (6 remaining HP)
  3e. AT-AT is exhausted
```

---

## Section 3: Card Index

The card index appears after the final round's notation and before the replay data separator. It contains full decklists for both players.

### Format

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
  ...

── P2 Decklist ──
Leader: Luke Skywalker, Faithful Friend = SOR#005
Base: Echo Base = SOR#020
Deck:
  2x Asteroid Sanctuary = SHD#062
  1x Jedha City = SOR#176
  2x Moment of Peace = SOR#165
  3x Rebel Pathfinder = SOR#045
  1x Snowspeeder = SOR#039
  2x Surprise Strike = SOR#150
  3x Wing Leader = SOR#042
  ...
```

### Rules

- Leader and Base are listed first, each on their own line with the `Leader:` / `Base:` prefix
- Deck cards listed under `Deck:`, indented with 2 spaces
- Each deck entry: `Nx Card Name, Subtitle = SET#NUM` where N is the count
- Cards sorted alphabetically by title
- SET is the set code (e.g., `SOR`, `SHD`, `JTL`, `LOF`, `TWI`)
- NUM is the card number within the set, zero-padded to 3 digits (e.g., `#010`, `#095`, `#176`)
- Every card referenced in the notation body appears in this index
- Sideboard cards, if available, listed under a `Sideboard:` sub-section

---

## Section 4: Replay Data (Machine-Readable)

### Separator

The replay data section begins with a separator line on its own:

```
=== REPLAY DATA ===
```

### Format

JSON-lines (one JSON object per line). Each line is a self-contained action record.

### Common Fields

Every replay record contains:

| Field | Type | Description |
|-------|------|-------------|
| `seq` | string | Sequence ID matching human notation (e.g., `"R1.S.1"`, `"R1.A.3"`, `"R1.A.3b"`, `"R1.G.1"`) |
| `type` | string | Action type enum (see below) |
| `player` | string | `"P1"` or `"P2"` (omitted for system events) |

### Sequence ID Format

The `seq` field encodes the structural position:

- `R{round}.{phase}.{action}{sub}` where:
  - Round: `R1`, `R2`, etc.
  - Phase: `S` (Setup), `A` (Action), `G` (Regroup)
  - Action: number for action phase, sequential for others
  - Sub-event: lowercase letter suffix (`a`, `b`, `c`), nested as `a-i`, `a-ii`

Examples:
- `"R1.S.1"` -- first setup action
- `"R1.A.3"` -- third action in round 1 action phase
- `"R1.A.3b"` -- second sub-event of third action
- `"R1.G.2"` -- second regroup entry

### Action Type Enum

```
PLAY            -- Play a card from hand or other zone
PLAY_SMUGGLE    -- Play a card via Smuggle
PLAY_UPGRADE    -- Play an upgrade
PLAY_EVENT      -- Play an event card
DEPLOY_LEADER   -- Deploy leader as unit
ATTACK          -- Declare attack
PASS            -- Pass priority
CLAIM_INITIATIVE-- Claim initiative
TRIGGER         -- Triggered ability fires
DAMAGE          -- Damage dealt to a target
DEFEAT          -- Card defeated
EXHAUST         -- Card exhausted
READY           -- Card readied
DRAW            -- Cards drawn
DISCARD         -- Card discarded
RESOURCE        -- Card resourced
SEARCH          -- Deck searched
SHUFFLE         -- Deck shuffled
CREATE_TOKEN    -- Token unit/upgrade created
CAPTURE         -- Card captured
RESCUE          -- Card rescued
HEAL            -- Damage healed
REVEAL          -- Cards revealed
MOVE            -- Card moved between zones
TAKE_CONTROL    -- Control of card changed
SHIELD_GAIN     -- Shield token gained
SHIELD_USE      -- Shield token defeated
EXPERIENCE_GAIN -- Experience token gained
STATUS_TOKEN    -- Other status token change
MULLIGAN        -- Mulligan decision
KEEP_HAND       -- Keep hand decision
MODAL_CHOICE    -- Modal ability choice
ABILITY_ACTIVATE-- Activated ability used
OVERWHELM       -- Overwhelm damage to base
GAME_END        -- Game over
PHASE_START     -- Phase begins
PHASE_END       -- Phase ends
ROUND_START     -- Round begins
ROUND_END       -- Round ends
```

### Action-Specific Fields

Beyond the common fields, each action type includes relevant data fields:

**PLAY / PLAY_SMUGGLE / PLAY_UPGRADE / PLAY_EVENT / DEPLOY_LEADER:**
```json
{"seq":"R1.A.1","type":"PLAY","player":"P1","card":"SOR#095","zone":"Ground","cost":3,"playType":"playFromHand"}
```
| Field | Type | Description |
|-------|------|-------------|
| `card` | string | Card ID (`SET#NUM`) |
| `zone` | string | Destination zone (`Ground`, `Space`, `Base`) |
| `cost` | number | Resources spent |
| `playType` | string | `playFromHand`, `smuggle`, `piloting`, `plot`, `playFromOutOfPlay` |
| `target` | string | (PLAY_UPGRADE only) Card ID of attachment target |

**ATTACK:**
```json
{"seq":"R1.A.5","type":"ATTACK","player":"P1","attacker":"SOR#108","defender":"SOR#020","defenderType":"base"}
```
| Field | Type | Description |
|-------|------|-------------|
| `attacker` | string | Attacking card ID |
| `defender` | string | Defending card ID |
| `defenderType` | string | `unit` or `base` |

**DAMAGE:**
```json
{"seq":"R1.A.5a","type":"DAMAGE","source":"SOR#108","target":"SOR#020","amount":2,"damageType":"combat","remainingHp":28}
```
| Field | Type | Description |
|-------|------|-------------|
| `source` | string | Card dealing damage |
| `target` | string | Card receiving damage |
| `amount` | number | Damage amount |
| `damageType` | string | `combat`, `ability`, `overwhelm` |
| `remainingHp` | number | Target's HP after damage |

**DEFEAT:**
```json
{"seq":"R1.A.3c","type":"DEFEAT","card":"SOR#045","reason":"no_remaining_hp","defeatedBy":"SOR#095"}
```
| Field | Type | Description |
|-------|------|-------------|
| `card` | string | Defeated card ID |
| `reason` | string | `no_remaining_hp`, `ability`, `unique_rule` |
| `defeatedBy` | string | Card/source responsible (if applicable) |

**TRIGGER:**
```json
{"seq":"R1.A.1a","type":"TRIGGER","card":"SOR#108","abilityType":"whenPlayed","description":"looks at opponent hand"}
```
| Field | Type | Description |
|-------|------|-------------|
| `card` | string | Card whose ability triggered |
| `abilityType` | string | `whenPlayed`, `whenDefeated`, `onAttack`, `onDefense`, `bounty`, `action`, `constant` |
| `description` | string | Human-readable effect summary |

**DRAW:**
```json
{"seq":"R1.G.1","type":"DRAW","player":"P1","count":2}
```

**RESOURCE:**
```json
{"seq":"R1.S.7","type":"RESOURCE","player":"P1","card":"SOR#142","count":1}
```

**MULLIGAN / KEEP_HAND:**
```json
{"seq":"R1.S.3","type":"MULLIGAN","player":"P2"}
{"seq":"R1.S.2","type":"KEEP_HAND","player":"P1"}
```

**CREATE_TOKEN:**
```json
{"seq":"R2.A.1b","type":"CREATE_TOKEN","player":"P2","token":"X-Wing","zone":"Space","power":2,"hp":3}
```

**REVEAL:**
```json
{"seq":"R1.A.1b","type":"REVEAL","player":"P2","zone":"Hand","cards":["SOR#045","SOR#042","SOR#165","SOR#150","SOR#176"]}
```

**SEARCH:**
```json
{"seq":"R1.A.2a","type":"SEARCH","player":"P2","zone":"Deck","found":"SOR#039","destination":"Hand"}
```

**CAPTURE / RESCUE:**
```json
{"seq":"R2.A.4a","type":"CAPTURE","card":"SOR#095","target":"SOR#045"}
{"seq":"R3.A.2a","type":"RESCUE","player":"P1","card":"SOR#045"}
```

**HEAL:**
```json
{"seq":"R2.A.6a","type":"HEAL","card":"SOR#095","amount":2,"remainingHp":5}
```

**PASS / CLAIM_INITIATIVE:**
```json
{"seq":"R1.A.4","type":"PASS","player":"P2"}
{"seq":"R1.A.6","type":"CLAIM_INITIATIVE","player":"P2"}
```

**PHASE_START / PHASE_END / ROUND_START / ROUND_END:**
```json
{"seq":"R1.A.0","type":"PHASE_START","phase":"Action","round":1}
{"seq":"R1.A.end","type":"PHASE_END","phase":"Action","round":1}
```

**GAME_END:**
```json
{"seq":"R5.A.12","type":"GAME_END","winner":"P1","reason":"Base Destroyed"}
```

### Duplicate Card Disambiguation

When a player has multiple copies of the same card in play, the replay data uses instance suffixes:

- First instance played: `SOR#095` (no suffix)
- Second instance: `SOR#095:2`
- Third instance: `SOR#095:3`

Instance numbers are assigned in the order cards enter play. This suffix is used in the replay data only -- the human notation does not use it (context and sub-event nesting make it unambiguous for human readers).

---

## Complete Example

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
[Rounds "2"]

═══ ROUND 1 ═══

─── Setup Phase ───
P1 draws 6 cards in starting hand
P1 will keep their hand
P2 draws 6 cards in starting hand
P2 will mulligan
P2 shuffles their deck
P2 draws 6 cards in starting hand
P1 resources 1 card from hand: Vanquish
P2 resources 1 card from hand: Asteroid Sanctuary

─── Action Phase ───
1. P1 plays Viper Probe Droid to Ground Arena (cost 2)
  1a. P1's Viper Probe Droid triggers When Played: looks at P2's hand
  1b. P2's hand revealed: Rebel Pathfinder, Wing Leader, Moment of Peace, Surprise Strike, Jedha City
2. P2 plays Rebel Pathfinder to Ground Arena (cost 2)
  2a. P2's Rebel Pathfinder triggers When Played: P2 searches deck
  2b. P2 finds Snowspeeder and puts it into hand
  2c. P2 shuffles their deck
3. P1 plays Cell Block Guard to Ground Arena (cost 3)
  3a. P1 activates Darth Vader, Commanding the First Legion ability: deals 1 damage to P1's Base
  3b. Command Center takes 1 damage (29 remaining HP)
  3c. P1 draws 1 card
4. P2 passes
5. P1 attacks with Viper Probe Droid against P2's Base
  5a. Viper Probe Droid deals 2 damage to Echo Base (28 remaining HP)
  5b. Viper Probe Droid is exhausted
6. P2 claims initiative and passes

─── Regroup Phase ───
P1 draws 2 cards
P2 draws 2 cards
P1 resources 1 card from hand: Admiral Ozzel, Overconfident
P2 resources 0 cards
All cards readied

═══ ROUND 2 ═══

─── Action Phase ───
1. P2 plays Wing Leader to Space Arena (cost 3)
  1a. P2's Wing Leader triggers When Played: creates X-Wing token
  1b. X-Wing token enters Space Arena (2/3)
2. P1 attacks with Cell Block Guard against P2's Rebel Pathfinder
  2a. Cell Block Guard deals 3 damage to Rebel Pathfinder (0 remaining HP)
  2b. Rebel Pathfinder deals 2 damage to Cell Block Guard (1 remaining HP)
  2c. Rebel Pathfinder is defeated
  2d. Cell Block Guard is exhausted

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
  2x Asteroid Sanctuary = SHD#062
  1x Jedha City = SOR#176
  2x Moment of Peace = SOR#165
  3x Rebel Pathfinder = SOR#045
  1x Snowspeeder = SOR#039
  2x Surprise Strike = SOR#150
  3x Wing Leader = SOR#042

=== REPLAY DATA ===
{"seq":"R1.S.1","type":"DRAW","player":"P1","count":6}
{"seq":"R1.S.2","type":"KEEP_HAND","player":"P1"}
{"seq":"R1.S.3","type":"DRAW","player":"P2","count":6}
{"seq":"R1.S.4","type":"MULLIGAN","player":"P2"}
{"seq":"R1.S.5","type":"SHUFFLE","player":"P2"}
{"seq":"R1.S.6","type":"DRAW","player":"P2","count":6}
{"seq":"R1.S.7","type":"RESOURCE","player":"P1","card":"SOR#142","count":1}
{"seq":"R1.S.8","type":"RESOURCE","player":"P2","card":"SHD#062","count":1}
{"seq":"R1.A.0","type":"PHASE_START","phase":"Action","round":1}
{"seq":"R1.A.1","type":"PLAY","player":"P1","card":"SOR#108","zone":"Ground","cost":2,"playType":"playFromHand"}
{"seq":"R1.A.1a","type":"TRIGGER","card":"SOR#108","abilityType":"whenPlayed","description":"looks at opponent hand"}
{"seq":"R1.A.1b","type":"REVEAL","player":"P2","zone":"Hand","cards":["SOR#045","SOR#042","SOR#165","SOR#150","SOR#176"]}
{"seq":"R1.A.2","type":"PLAY","player":"P2","card":"SOR#045","zone":"Ground","cost":2,"playType":"playFromHand"}
{"seq":"R1.A.2a","type":"TRIGGER","card":"SOR#045","abilityType":"whenPlayed","description":"search deck"}
{"seq":"R1.A.2b","type":"SEARCH","player":"P2","zone":"Deck","found":"SOR#039","destination":"Hand"}
{"seq":"R1.A.2c","type":"SHUFFLE","player":"P2"}
{"seq":"R1.A.3","type":"PLAY","player":"P1","card":"SOR#095","zone":"Ground","cost":3,"playType":"playFromHand"}
{"seq":"R1.A.3a","type":"ABILITY_ACTIVATE","player":"P1","card":"SOR#010","abilityType":"action","description":"deals 1 damage to own base"}
{"seq":"R1.A.3b","type":"DAMAGE","source":"SOR#010","target":"SOR#028","amount":1,"damageType":"ability","remainingHp":29}
{"seq":"R1.A.3c","type":"DRAW","player":"P1","count":1}
{"seq":"R1.A.4","type":"PASS","player":"P2"}
{"seq":"R1.A.5","type":"ATTACK","player":"P1","attacker":"SOR#108","defender":"SOR#020","defenderType":"base"}
{"seq":"R1.A.5a","type":"DAMAGE","source":"SOR#108","target":"SOR#020","amount":2,"damageType":"combat","remainingHp":28}
{"seq":"R1.A.5b","type":"EXHAUST","card":"SOR#108"}
{"seq":"R1.A.6","type":"CLAIM_INITIATIVE","player":"P2"}
{"seq":"R1.A.end","type":"PHASE_END","phase":"Action","round":1}
{"seq":"R1.G.0","type":"PHASE_START","phase":"Regroup","round":1}
{"seq":"R1.G.1","type":"DRAW","player":"P1","count":2}
{"seq":"R1.G.2","type":"DRAW","player":"P2","count":2}
{"seq":"R1.G.3","type":"RESOURCE","player":"P1","card":"SOR#087","count":1}
{"seq":"R1.G.4","type":"RESOURCE","player":"P2","card":null,"count":0}
{"seq":"R1.G.5","type":"READY","card":"all"}
{"seq":"R1.G.end","type":"PHASE_END","phase":"Regroup","round":1}
{"seq":"R2.A.0","type":"PHASE_START","phase":"Action","round":2}
{"seq":"R2.A.1","type":"PLAY","player":"P2","card":"SOR#042","zone":"Space","cost":3,"playType":"playFromHand"}
{"seq":"R2.A.1a","type":"TRIGGER","card":"SOR#042","abilityType":"whenPlayed","description":"creates X-Wing token"}
{"seq":"R2.A.1b","type":"CREATE_TOKEN","player":"P2","token":"X-Wing","zone":"Space","power":2,"hp":3}
{"seq":"R2.A.2","type":"ATTACK","player":"P1","attacker":"SOR#095","defender":"SOR#045","defenderType":"unit"}
{"seq":"R2.A.2a","type":"DAMAGE","source":"SOR#095","target":"SOR#045","amount":3,"damageType":"combat","remainingHp":0}
{"seq":"R2.A.2b","type":"DAMAGE","source":"SOR#045","target":"SOR#095","amount":2,"damageType":"combat","remainingHp":1}
{"seq":"R2.A.2c","type":"DEFEAT","card":"SOR#045","reason":"no_remaining_hp","defeatedBy":"SOR#095"}
{"seq":"R2.A.2d","type":"EXHAUST","card":"SOR#095"}
```

---

## Implementation Notes

### Source Data

The notation is generated from two data sources available in the Karabast game engine:

1. **GameChat.messages** (`server/game/core/chat/GameChat.ts`) -- the existing message log, which contains timestamped formatted messages for the human notation layer
2. **Player.decklist / Player.allCards** (`server/game/core/Player.ts`) -- full decklist data including card set IDs for the card index and replay data
3. **Game events** (`server/game/core/event/GameEvent.ts`) -- the structured event stream that powers the replay data layer

### Card ID Resolution

Each card has a `setId: { set: string, number: number }` property and a `title` / `subtitle` pair. The notation maps between them:
- Human layer: `Title, Subtitle` (or just `Title`)
- Machine layer: `SET#NUM` (e.g., `SOR#010`)
- Card Index: both, linked with `=`

### Download Mechanism

The `.swupgn` file should be downloadable from the game client after a game concludes. Two download options:

1. **SWU-PGN file** (`.swupgn`) -- the dual-layer format described in this spec
2. **Raw game log** (`.txt`) -- the existing GameChat messages as plain text

### File Extension

`.swupgn` -- a unique extension that identifies the format and can be associated with parser tools.

### Encoding

UTF-8. The box-drawing characters (`═`, `─`) are standard Unicode and render correctly in all modern text editors and terminals.

---

## Parser Guidance

### Reading the Human Layer

A parser targeting only the human-readable portion should:
1. Parse header tags with regex: `\[(\w+) "(.+)"\]`
2. Detect round boundaries with: `═══ ROUND (\d+) ═══`
3. Detect phase boundaries with: `─── (.+) Phase ───`
4. Parse numbered actions with: `(\d+)\. (P[12]) (.+)`
5. Parse sub-events with: `  (\d+)([a-z](?:-[ivx]+)?)\. (.+)`
6. Stop at `═══ CARD INDEX ═══`

### Reading the Replay Layer

A parser targeting the machine-readable portion should:
1. Scan forward to the line `=== REPLAY DATA ===`
2. Read each subsequent line as a JSON object
3. Use the `type` field to dispatch to type-specific handlers
4. Use `seq` for ordering and structural context

### Reading the Card Index

1. Scan for `═══ CARD INDEX ═══`
2. Parse player sections with `── P[12] Decklist ──`
3. Parse leader/base: `(Leader|Base): (.+) = ([A-Z]+#\d{3})`
4. Parse deck entries: `  (\d+)x (.+) = ([A-Z]+#\d{3})`
