# `effects-and-uses.p2.swupgn`

This file is `effects-and-uses.full.swupgn` redacted by SPEC §11 for seat 2 (`perspective:2`). These notes are hand-reviewed and informative; the vector files are the normative part.

## Scenario

Effect entities, a limited-use ability, two leaders on one seat, and the parts of a `full` file a redactor must not copy.

| Step | What happens |
|---|---|
| 0 | P1 has two leaders (`LOF#003` Ahsoka Tano and `SOR#017` Han Solo) and the base Mystic Monastery (`LOF#022`). P2's base carries an extension attribute `x_examplewriter_art`; one resource of each seat carries `x_examplewriter_foil`. |
| 1 | P1 uses Mystic Monastery ("no more than 3 times each game"): `force` becomes `true`, and the base's `abilityUses` records 1 use. An unknown extension record `x_examplewriter_hint` sits just before it. |
| 2 | P2 plays Underworld Thug (`SHD#257`). |
| 3 | P1 plays Sneak Attack (`SOR#219`) and through it Liberated Slaves (`SHD#200`, `full` 7), ready. A delayed effect (`full` 16, `duration` `delayed`) targets it. |
| 5 | P1 uses Ahsoka Tano's action: she exhausts, the Force is used, and a "for this phase" effect (`full` 17) gives the Slaves Sentinel (`keywords`). |
| 7 | P1 uses Mystic Monastery again: `abilityUses` now records 2 uses of 3. |
| 9 | Both seats have passed (steps 4, 6, 8, 9). The phase effect ends: it is removed and the Slaves lose Sentinel. Regroup begins: the delayed effect triggers, defeats the Slaves and is removed. Each seat draws 2. |

The `full` file also has a `STORY` section, an `ANNOTATIONS` section, an unknown header tag `XExamplewriterTable` and an unknown section `X_EXAMPLEWRITER_STATS`.

## The point of the vector

- Each effect has `to` `"all"`, because its source card is public (W-31). An effect has no zone, so it is materialized only through R-01: here, in every file. Its `src` and `targets` are mapped.
- `abilityUses` is `identity`-class, and the base is known everywhere, so it is kept in every file.
- An extension never survives redaction (W-67, §11.1): `x_examplewriter_art` on P2's base and `x_examplewriter_foil` on each seat's own resource are dropped from every redacted file, even where the entity is known, and so are absent from every redacted board.
- R-13: none of the redacted files holds `STORY`, `ANNOTATIONS`, `X_EXAMPLEWRITER_STATS` or the `x_examplewriter_hint` record. R-11 drops the unknown header tag `XExamplewriterTable` (W-67).

## Readings used by every vector

- **Header, `DECKS`, `CARDS` (R-11).** Every tag that SPEC §5.1 or §5.2 defines is kept except `Seed`, any other tag is dropped (W-67), and `Visibility` is rewritten. The viewer's own `DECKS` line is kept without `order`. The other line (both lines in `public`) keeps `p`, `leaders` and `base`, sets `complete` to `false`, and lists one `[id]` per distinct card id that this file's `create` and `reveal` records give to an entity of that seat, in the order this file first gives each, leaving out `TOKEN:` ids and the line's own leaders and base. `CARDS` keeps the `full` lines, in their order, whose id appears in this file's header, `DECKS` or `RECORDS`.
- **Empty `a`.** A `create` made by step 3 or step 5 for an entity that has no attributes (a hand card) carries no `a` key, rather than `"a":{}`.
- **Fresh ids (R-14).** Output ids are handed out 1, 2, 3, … in the order the output first uses them. An id removed by step 0, 3, 6 or 8 is never used again.
- **The game itself is illustrative.** Costs and resource payments are not modelled, decks are short, and some timing is simplified. The records, and what each profile may know, are what the vector tests.

## Records

Each line of `RECORDS` in `effects-and-uses.p2.swupgn`, with the step of SPEC §11.2 that produced it and the `full` record it came from. Entity ids in the "Step" column are `full` ids; ids in the "Record" column are this file's own.

| Line | Record | Step | From `full` line |
|---|---|---|---|
| 44 | `{"t":"set","e":"g","a":{"round":1,"phase":"action","active":1,"initiative":1,"initiativeTaken":false}}` | R-07 set of a known entity (full g) | 61 |
| 45 | `{"t":"set","e":"p1","a":{"deckCount":25,"handCount":3,"credits":0,"force":false}}` | R-07 set of a known entity (full p1) | 62 |
| 46 | `{"t":"set","e":"p2","a":{"deckCount":25,"handCount":3,"credits":0,"force":false}}` | R-07 set of a known entity (full p2) | 63 |
| 47 | `{"t":"create","e":1,"zone":"base","owner":1,"card":"LOF#022","a":{"kind":"base","damage":0,"hp":25}}` | R-01 create, audience "all" holds viewer (full 1) | 64 |
| 48 | `{"t":"create","e":2,"zone":"base","owner":1,"card":"LOF#003","a":{"kind":"leader","exhausted":false,"deploy…` | R-01 create, audience "all" holds viewer (full 2) | 65 |
| 49 | `{"t":"create","e":3,"zone":"base","owner":1,"card":"SOR#017","a":{"kind":"leader","exhausted":false,"deploy…` | R-01 create, audience "all" holds viewer (full 3) | 66 |
| 50 | `{"t":"create","e":4,"zone":"base","owner":2,"card":"SOR#029","a":{"kind":"base","damage":0,"hp":28}}` | R-01 create, audience "all" holds viewer (full 4); unregistered attribute `x_examplewriter_art` dropped (W-67) | 67 |
| 51 | `{"t":"create","e":5,"zone":"base","owner":2,"card":"SOR#010","a":{"kind":"leader","exhausted":false,"deploy…` | R-01 create, audience "all" holds viewer (full 5) | 68 |
| 52 | `{"t":"create","e":6,"zone":"hand","owner":2,"card":"SHD#257","to":[2]}` | R-01 create, audience [2] holds viewer (full 9) | 72 |
| 53 | `{"t":"create","e":7,"zone":"hand","owner":2,"card":"SOR#130","to":[2]}` | R-01 create, audience [2] holds viewer (full 10) | 73 |
| 54 | `{"t":"create","e":8,"zone":"hand","owner":2,"card":"SOR#132","to":[2]}` | R-01 create, audience [2] holds viewer (full 11) | 74 |
| 55 | `{"t":"create","e":9,"zone":"resource","owner":1,"to":[1],"a":{"exhausted":false}}` | R-02 anonymous create (full 12) | 75 |
| 56 | `{"t":"create","e":10,"zone":"resource","owner":1,"to":[1],"a":{"exhausted":false}}` | R-02 anonymous create (full 13) | 76 |
| 57 | `{"t":"create","e":11,"zone":"resource","owner":2,"card":"SOR#062","to":[2],"a":{"exhausted":false}}` | R-01 create, audience [2] holds viewer (full 14); unregistered attribute `x_examplewriter_foil` dropped (W-67) | 77 |
| 58 | `{"t":"create","e":12,"zone":"resource","owner":2,"card":"SOR#064","to":[2],"a":{"exhausted":false}}` | R-01 create, audience [2] holds viewer (full 15) | 78 |
| 59 | `{"t":"step","seq":0}` | R-10 step | 79 |
| 60 | `{"t":"block","id":1,"kind":"ability","p":1,"src":1}` | R-09 block 1 (ability), every reference kept | 81 |
| 61 | `{"t":"set","e":"p1","a":{"force":true}}` | R-07 set of a known entity (full p1) | 82 |
| 62 | `{"t":"set","e":1,"a":{"abilityUses":[{"ability":"mystic-monastery/action","seat":1,"count":1,"per":"game","…` | R-07 set of a known entity (full 1) | 83 |
| 63 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 84 |
| 64 | `{"t":"step","seq":1}` | R-10 step | 85 |
| 65 | `{"t":"reveal","e":6,"card":"SHD#257","to":"all"}` | R-03 reveal of a known entity (full 9) | 86 |
| 66 | `{"t":"set","e":6,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":2,"hp":3}}` | R-07 set of a known entity (full 9) | 87 |
| 67 | `{"t":"block","id":2,"kind":"play","p":2,"src":6}` | R-09 block 2 (play), every reference kept | 88 |
| 68 | `{"t":"set","e":"p2","a":{"handCount":2}}` | R-07 set of a known entity (full p2) | 89 |
| 69 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 90 |
| 70 | `{"t":"step","seq":2}` | R-10 step | 91 |
| 71 | `{"t":"create","e":13,"zone":"hand","owner":1,"card":"SOR#219","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 6) | 92 |
| 72 | `{"t":"set","e":13,"zone":"discard","a":{"kind":"event"}}` | R-07 set of a known entity (full 6) | 93 |
| 73 | `{"t":"block","id":3,"kind":"play","p":1,"src":13}` | R-09 block 3 (play), every reference kept | 94 |
| 74 | `{"t":"create","e":14,"zone":"hand","owner":1,"card":"SHD#200","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 7) | 95 |
| 75 | `{"t":"set","e":14,"zone":"ground","a":{"kind":"unit","exhausted":false,"damage":0,"power":3,"hp":5}}` | R-07 set of a known entity (full 7) | 96 |
| 76 | `{"t":"block","id":4,"kind":"play","p":1,"src":14,"parent":3,"via":13}` | R-09 block 4 (play), every reference kept | 97 |
| 77 | `{"t":"create","e":15,"owner":1,"to":"all","a":{"kind":"effect","src":13,"targets":[14],"duration":"delayed"…` | R-01 create, audience "all" holds viewer (full 16) | 98 |
| 78 | `{"t":"set","e":"p1","a":{"handCount":1}}` | R-07 set of a known entity (full p1) | 99 |
| 79 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 100 |
| 80 | `{"t":"step","seq":3}` | R-10 step | 101 |
| 81 | `{"t":"block","id":5,"kind":"pass","p":2}` | R-09 block 5 (pass), every reference kept | 102 |
| 82 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 103 |
| 83 | `{"t":"step","seq":4}` | R-10 step | 104 |
| 84 | `{"t":"block","id":6,"kind":"ability","p":1,"src":2,"targets":[14]}` | R-09 block 6 (ability), every reference kept | 105 |
| 85 | `{"t":"set","e":2,"a":{"exhausted":true}}` | R-07 set of a known entity (full 2) | 106 |
| 86 | `{"t":"set","e":"p1","a":{"force":false}}` | R-07 set of a known entity (full p1) | 107 |
| 87 | `{"t":"create","e":16,"owner":1,"to":"all","a":{"kind":"effect","src":2,"targets":[14],"duration":"phase","a…` | R-01 create, audience "all" holds viewer (full 17) | 108 |
| 88 | `{"t":"set","e":14,"a":{"keywords":["sentinel"]}}` | R-07 set of a known entity (full 7) | 109 |
| 89 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 110 |
| 90 | `{"t":"step","seq":5}` | R-10 step | 111 |
| 91 | `{"t":"block","id":7,"kind":"pass","p":2}` | R-09 block 7 (pass), every reference kept | 112 |
| 92 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 113 |
| 93 | `{"t":"step","seq":6}` | R-10 step | 114 |
| 94 | `{"t":"block","id":8,"kind":"ability","p":1,"src":1}` | R-09 block 8 (ability), every reference kept | 115 |
| 95 | `{"t":"set","e":"p1","a":{"force":true}}` | R-07 set of a known entity (full p1) | 116 |
| 96 | `{"t":"set","e":1,"a":{"abilityUses":[{"ability":"mystic-monastery/action","seat":1,"count":2,"per":"game","…` | R-07 set of a known entity (full 1) | 117 |
| 97 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 118 |
| 98 | `{"t":"step","seq":7}` | R-10 step | 119 |
| 99 | `{"t":"block","id":9,"kind":"pass","p":2}` | R-09 block 9 (pass), every reference kept | 120 |
| 100 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 121 |
| 101 | `{"t":"step","seq":8}` | R-10 step | 122 |
| 102 | `{"t":"block","id":10,"kind":"pass","p":1}` | R-09 block 10 (pass), every reference kept | 123 |
| 103 | `{"t":"remove","e":16}` | R-08 remove (full 17) | 124 |
| 104 | `{"t":"set","e":14,"a":{"keywords":null}}` | R-07 set of a known entity (full 7) | 125 |
| 105 | `{"t":"block","id":11,"kind":"regroup"}` | R-09 block 11 (regroup), every reference kept | 126 |
| 106 | `{"t":"block","id":12,"kind":"trigger","p":1,"src":13,"targets":[14],"parent":11}` | R-09 block 12 (trigger), every reference kept | 127 |
| 107 | `{"t":"block","id":13,"kind":"defeat","p":1,"src":13,"targets":[14],"parent":12}` | R-09 block 13 (defeat), every reference kept | 128 |
| 108 | `{"t":"set","e":14,"zone":"discard","a":{"exhausted":null,"damage":null,"power":null,"hp":null}}` | R-07 set of a known entity (full 7) | 129 |
| 109 | `{"t":"remove","e":15}` | R-08 remove (full 16) | 130 |
| 110 | `{"t":"create","e":17,"zone":"hand","owner":2,"card":"SOR#134","to":[2]}` | R-01 create, audience [2] holds viewer (full 20) | 133 |
| 111 | `{"t":"create","e":18,"zone":"hand","owner":2,"card":"SOR#136","to":[2]}` | R-01 create, audience [2] holds viewer (full 21) | 134 |
| 112 | `{"t":"block","id":14,"kind":"draw","p":1,"amount":2,"parent":11,"group":1}` | R-09 block 14 (draw); targets element dropped (full 18 is unmaterialized); targets element dropped (full 19 is unmaterialized); targets removed: no element left | 135 |
| 113 | `{"t":"block","id":15,"kind":"draw","p":2,"targets":[17,18],"amount":2,"parent":11,"group":1}` | R-09 block 15 (draw), every reference kept | 136 |
| 114 | `{"t":"set","e":"p1","a":{"deckCount":23,"handCount":3}}` | R-07 set of a known entity (full p1) | 137 |
| 115 | `{"t":"set","e":"p2","a":{"deckCount":23,"handCount":4}}` | R-07 set of a known entity (full p2) | 138 |
| 116 | `{"t":"set","e":"g","a":{"phase":"regroup","active":null}}` | R-07 set of a known entity (full g) | 139 |
| 117 | `{"t":"step","seq":9}` | R-10 step | 140 |

## `full` records that emit nothing

- `full` line 69: R-02 nothing: full 6 unmaterialized
- `full` line 70: R-02 nothing: full 7 unmaterialized
- `full` line 71: R-02 nothing: full 8 unmaterialized
- `full` line 80: R-13 unknown record type x_examplewriter_hint not copied
- `full` line 131: R-02 nothing: full 18 unmaterialized
- `full` line 132: R-02 nothing: full 19 unmaterialized
