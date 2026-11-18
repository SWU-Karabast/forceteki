# `tiny.public.swupgn`

This file is `tiny.full.swupgn` redacted by SPEC §11 for nobody (`public`): a seat is in an audience only when it is `"all"`. These notes are hand-reviewed and informative; the vector files are the normative part.

## Scenario

The worked example of the specification: SPEC Appendix A reproduces the `RECORDS` of `tiny.full` and `tiny.p1`, and `test/fixtures/design-7-1.ndjson` holds the same records as `tiny.full`. A card is searched out of a deck, put back on top of it and drawn again. Every card does what its real text says. This version replaces the stand-ins of the first draft, which played two units as events. The `p1`, `p2` and `public` files and all four boards were derived by hand. A spec-reading cross-check then gave the same bytes.

| Step | What happens |
|---|---|
| 0 | Setup (`g.phase` `setup`). P1 holds Battlefield Marine (`SOR#095`), New Tactics (`HMW#218`) and Rebel Assault (`SOR#103`); P2 holds Bodhi Rook (`SOR#201`) and Trust Yourself (`HMW#101`). Each seat has a base and a leader. Each deck is shuffled (a `shuffle` block per seat) and each seat draws its opening hand (a `draw` block per seat, sharing a `group`). |
| 1 | The mulligan decision, made by both seats in one step (W-39): both keep, a `mulligan` block each with `amount` 0. |
| 2 | Each seat puts one card into its resource row, chosen by both seats in one step, P1 (which has the initiative) first. A `resource` block each, sharing a `group` (W-65). The action phase begins: `g.phase` becomes `action` and `g.active` 1. |
| 3 | P1 plays Battlefield Marine to ground and exhausts its resource. |
| 4 | P2 plays Bodhi Rook (3/3). His When Played looks at P1's hand: each card in it is revealed to [2] (W-43). P2 discards the non-unit Rebel Assault from it, which is revealed to everyone before it moves (W-44). New Tactics stays in P1's hand, known to P2. |
| 5 | P1 passes. |
| 6 | P2 plays Trust Yourself. A Shield token goes on Bodhi Rook, created after Bodhi is in play (W-28). P2 then searches the top 3 of P2's deck (`SOR#200`, `SOR#202`, `SOR#212`), draws Strafing Gunship (`SOR#212`), and the other two go to the bottom unseen. |
| 7 | P1 plays New Tactics on Bodhi Rook. P2, his owner, chooses the top of the deck (a `choice` block). The Shield token is defeated as he leaves play, then Bodhi goes on top of P2's deck. |
| 8, 9 | Both seats pass. Regroup: each draws 2. P2 draws Bodhi Rook again, as a new entity (W-22). |
| 10 | P1 resources one of the cards it drew. |

## The redaction in brief

- The opponent's opening hand is unmaterialized (R-02). Each card played from it is created on its `reveal` (R-03) and then moved (R-07).
- The opponent's resource is anonymous (R-02): it carries `to` [its seat] and only the face-down `exhausted`, and its `exhausted` change is kept (R-07).
- Step 4, `p1`: Bodhi Rook's reveals to [2] emit nothing (R-04). The `look` block keeps its targets, which are in the viewer's own hand.
- Step 4, `p2`: the reveals to [2] create New Tactics and Rebel Assault with `to` [1,2] (R-03, unmaterialized branch). The `look` block names cards in a hand that is not P2's, so it loses `targets` (R-09). The `discard` block is written after the move to the discard pile and keeps its target (W-66).
- Step 4, `public`: the reveals to [2] emit nothing. Rebel Assault appears only on its reveal to everyone.
- Step 6: P2's search cards are `to` [2]. In `p1` and `public` they are unmaterialized: the `search` and `draw` blocks lose `targets` and `options` (R-09), and their `remove` emits nothing (R-08).
- Step 7: in `p2`, New Tactics was known in P1's hand since step 4, so its `reveal` is emitted with the mapped id (R-03, known branch). Bodhi Rook going into the deck is a `remove` of a card in play, not in a hand, so step 0 does not apply.
- Step 7: the `choice` block keeps its `src` but loses its `text` ("Top of the deck"), as every block but a `name` block does in a redacted file (R-09). The `full` file keeps it.
- Step 10: P1's regroup resource is a hand-to-resource move of a card the viewer never knew. In `p2` and `public`, step 0 applies but finds no known card in that hand, so it emits no `remove`; step 5 then creates an anonymous resource.

## Readings used by every vector

- **Header, `DECKS`, `CARDS` (R-11).** Every tag that SPEC §5.1 or §5.2 defines is kept except `Seed`, any other tag is dropped (W-67), and `Visibility` is rewritten. The viewer's own `DECKS` line is kept without `order`. The other line (both lines in `public`) keeps `p`, `leaders` and `base`, sets `complete` to `false`, and lists one `[id]` per distinct card id that this file's `create` and `reveal` records give to an entity of that seat, in the order this file first gives each, leaving out `TOKEN:` ids and the line's own leaders and base. `CARDS` keeps the `full` lines, in their order, whose id appears in this file's header, `DECKS` or `RECORDS`.
- **Empty `a`.** A `create` made by step 3 or step 5 for an entity that has no attributes (a hand card) carries no `a` key, rather than `"a":{}`.
- **Fresh ids (R-14).** Output ids are handed out 1, 2, 3, … in the order the output first uses them. An id removed by step 0, 3, 6 or 8 is never used again.
- **The game itself is illustrative.** Costs and resource payments are not modelled, decks are short, and some timing is simplified. The records, and what each profile may know, are what the vector tests.

## Records

Each line of `RECORDS` in `tiny.public.swupgn`, with the step of SPEC §11.2 that produced it and the `full` record it came from. Entity ids in the "Step" column are `full` ids; ids in the "Record" column are this file's own.

| Line | Record | Step | From `full` line |
|---|---|---|---|
| 37 | `{"t":"set","e":"g","a":{"round":1,"phase":"setup","initiative":1,"initiativeTaken":false}}` | R-07 set of a known entity (full g) | 67 |
| 38 | `{"t":"set","e":"p1","a":{"deckCount":44,"handCount":3,"credits":0,"force":false}}` | R-07 set of a known entity (full p1) | 68 |
| 39 | `{"t":"set","e":"p2","a":{"deckCount":45,"handCount":2,"credits":0,"force":false}}` | R-07 set of a known entity (full p2) | 69 |
| 40 | `{"t":"create","e":1,"zone":"base","owner":1,"card":"SOR#026","a":{"kind":"base","damage":0,"hp":30}}` | R-01 create, audience "all" holds viewer (full 1) | 70 |
| 41 | `{"t":"create","e":2,"zone":"base","owner":1,"card":"SOR#005","a":{"kind":"leader","exhausted":false,"deploy…` | R-01 create, audience "all" holds viewer (full 2) | 71 |
| 42 | `{"t":"create","e":3,"zone":"base","owner":2,"card":"SOR#029","a":{"kind":"base","damage":0,"hp":28}}` | R-01 create, audience "all" holds viewer (full 3) | 72 |
| 43 | `{"t":"create","e":4,"zone":"base","owner":2,"card":"SOR#010","a":{"kind":"leader","exhausted":false,"deploy…` | R-01 create, audience "all" holds viewer (full 4) | 73 |
| 44 | `{"t":"block","id":1,"kind":"shuffle","p":1,"amount":0}` | R-09 block 1 (shuffle), every reference kept | 74 |
| 45 | `{"t":"block","id":2,"kind":"shuffle","p":2,"amount":0}` | R-09 block 2 (shuffle), every reference kept | 75 |
| 46 | `{"t":"block","id":3,"kind":"draw","p":1,"amount":3,"group":2}` | R-09 block 3 (draw); targets element dropped (full 5 is unmaterialized); targets element dropped (full 6 is unmaterialized); targets element dropped (full 7 is unmaterialized); targets removed: no element left | 81 |
| 47 | `{"t":"block","id":4,"kind":"draw","p":2,"amount":2,"group":2}` | R-09 block 4 (draw); targets element dropped (full 8 is unmaterialized); targets element dropped (full 9 is unmaterialized); targets removed: no element left | 82 |
| 48 | `{"t":"step","seq":0}` | R-10 step | 83 |
| 49 | `{"t":"block","id":5,"kind":"mulligan","p":1,"amount":0}` | R-09 block 5 (mulligan), every reference kept | 84 |
| 50 | `{"t":"block","id":6,"kind":"mulligan","p":2,"amount":0}` | R-09 block 6 (mulligan), every reference kept | 85 |
| 51 | `{"t":"step","seq":1}` | R-10 step | 86 |
| 52 | `{"t":"create","e":5,"zone":"resource","owner":1,"to":[1],"a":{"exhausted":false}}` | R-02 anonymous create (full 10) | 87 |
| 53 | `{"t":"create","e":6,"zone":"resource","owner":2,"to":[2],"a":{"exhausted":false}}` | R-02 anonymous create (full 11) | 88 |
| 54 | `{"t":"block","id":7,"kind":"resource","p":1,"amount":1,"group":3}` | R-09 block 7 (resource); targets element dropped (full 10 is anonymous); targets removed: no element left | 89 |
| 55 | `{"t":"block","id":8,"kind":"resource","p":2,"amount":1,"group":3}` | R-09 block 8 (resource); targets element dropped (full 11 is anonymous); targets removed: no element left | 90 |
| 56 | `{"t":"set","e":"g","a":{"phase":"action","active":1}}` | R-07 set of a known entity (full g) | 91 |
| 57 | `{"t":"step","seq":2}` | R-10 step | 92 |
| 58 | `{"t":"create","e":7,"zone":"hand","owner":1,"card":"SOR#095","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 5) | 93 |
| 59 | `{"t":"set","e":7,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":3,"hp":3}}` | R-07 set of a known entity (full 5) | 94 |
| 60 | `{"t":"block","id":9,"kind":"play","p":1,"src":7}` | R-09 block 9 (play), every reference kept | 95 |
| 61 | `{"t":"set","e":5,"a":{"exhausted":true}}` | R-07 set of an anonymous entity (full 10), public attributes only | 96 |
| 62 | `{"t":"set","e":"p1","a":{"handCount":2}}` | R-07 set of a known entity (full p1) | 97 |
| 63 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 98 |
| 64 | `{"t":"step","seq":3}` | R-10 step | 99 |
| 65 | `{"t":"create","e":8,"zone":"hand","owner":2,"card":"SOR#201","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 8) | 100 |
| 66 | `{"t":"set","e":8,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":3,"hp":3}}` | R-07 set of a known entity (full 8) | 101 |
| 67 | `{"t":"block","id":10,"kind":"play","p":2,"src":8}` | R-09 block 10 (play), every reference kept | 102 |
| 68 | `{"t":"set","e":6,"a":{"exhausted":true}}` | R-07 set of an anonymous entity (full 11), public attributes only | 103 |
| 69 | `{"t":"block","id":11,"kind":"trigger","p":2,"src":8,"parent":10}` | R-09 block 11 (trigger), every reference kept | 104 |
| 70 | `{"t":"block","id":12,"kind":"look","p":2,"src":8,"amount":2,"parent":11}` | R-09 block 12 (look); targets element dropped (full 6 is unmaterialized); targets element dropped (full 7 is unmaterialized); targets removed: no element left | 107 |
| 71 | `{"t":"create","e":9,"zone":"hand","owner":1,"card":"SOR#103","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 7) | 108 |
| 72 | `{"t":"set","e":9,"zone":"discard","a":{"kind":"event"}}` | R-07 set of a known entity (full 7) | 109 |
| 73 | `{"t":"block","id":13,"kind":"discard","p":1,"src":8,"targets":[9],"amount":1,"parent":11}` | R-09 block 13 (discard), every reference kept | 110 |
| 74 | `{"t":"set","e":"p1","a":{"handCount":1}}` | R-07 set of a known entity (full p1) | 111 |
| 75 | `{"t":"set","e":"p2","a":{"handCount":1}}` | R-07 set of a known entity (full p2) | 112 |
| 76 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 113 |
| 77 | `{"t":"step","seq":4}` | R-10 step | 114 |
| 78 | `{"t":"block","id":14,"kind":"pass","p":1}` | R-09 block 14 (pass), every reference kept | 115 |
| 79 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 116 |
| 80 | `{"t":"step","seq":5}` | R-10 step | 117 |
| 81 | `{"t":"create","e":10,"zone":"hand","owner":2,"card":"HMW#101","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 9) | 118 |
| 82 | `{"t":"set","e":10,"zone":"discard","a":{"kind":"event"}}` | R-07 set of a known entity (full 9) | 119 |
| 83 | `{"t":"block","id":15,"kind":"play","p":2,"src":10,"targets":[8]}` | R-09 block 15 (play), every reference kept | 120 |
| 84 | `{"t":"create","e":11,"zone":"ground","owner":2,"parent":8,"rel":"attached","card":"TOKEN:shield#8752877738"…` | R-01 create, audience "all" holds viewer (full 12) | 121 |
| 85 | `{"t":"block","id":16,"kind":"search","p":2,"src":10,"amount":3,"parent":15}` | R-09 block 16 (search); targets element dropped (full 15 is unmaterialized); targets removed: no element left; options element dropped (full 13 is unmaterialized); options element dropped (full 14 is unmaterialized); options element dropped (full 15 is unmaterialized); options removed: no element left | 125 |
| 86 | `{"t":"block","id":17,"kind":"draw","p":2,"src":10,"amount":1,"parent":15}` | R-09 block 17 (draw); targets element dropped (full 15 is unmaterialized); targets removed: no element left | 127 |
| 87 | `{"t":"set","e":"p2","a":{"deckCount":44}}` | R-07 set of a known entity (full p2) | 130 |
| 88 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 131 |
| 89 | `{"t":"step","seq":6}` | R-10 step | 132 |
| 90 | `{"t":"create","e":12,"zone":"hand","owner":1,"card":"HMW#218","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 6) | 133 |
| 91 | `{"t":"set","e":12,"zone":"discard","a":{"kind":"event"}}` | R-07 set of a known entity (full 6) | 134 |
| 92 | `{"t":"block","id":18,"kind":"play","p":1,"src":12,"targets":[8]}` | R-09 block 18 (play), every reference kept | 135 |
| 93 | `{"t":"block","id":19,"kind":"choice","p":2,"src":12,"parent":18}` | R-09 block 19 (choice), every reference kept; `text` removed (not a `name` block) | 136 |
| 94 | `{"t":"block","id":20,"kind":"defeat","p":1,"src":12,"targets":[11],"parent":18}` | R-09 block 20 (defeat), every reference kept | 137 |
| 95 | `{"t":"remove","e":11}` | R-08 remove (full 12) | 138 |
| 96 | `{"t":"remove","e":8}` | R-08 remove (full 8) | 139 |
| 97 | `{"t":"set","e":"p1","a":{"handCount":0}}` | R-07 set of a known entity (full p1) | 140 |
| 98 | `{"t":"set","e":"p2","a":{"deckCount":45}}` | R-07 set of a known entity (full p2) | 141 |
| 99 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 142 |
| 100 | `{"t":"step","seq":7}` | R-10 step | 143 |
| 101 | `{"t":"block","id":21,"kind":"pass","p":2}` | R-09 block 21 (pass), every reference kept | 144 |
| 102 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 145 |
| 103 | `{"t":"step","seq":8}` | R-10 step | 146 |
| 104 | `{"t":"block","id":22,"kind":"pass","p":1}` | R-09 block 22 (pass), every reference kept | 147 |
| 105 | `{"t":"block","id":23,"kind":"regroup"}` | R-09 block 23 (regroup), every reference kept | 148 |
| 106 | `{"t":"block","id":24,"kind":"draw","p":1,"amount":2,"parent":23,"group":1}` | R-09 block 24 (draw); targets element dropped (full 16 is unmaterialized); targets element dropped (full 17 is unmaterialized); targets removed: no element left | 153 |
| 107 | `{"t":"block","id":25,"kind":"draw","p":2,"amount":2,"parent":23,"group":1}` | R-09 block 25 (draw); targets element dropped (full 18 is unmaterialized); targets element dropped (full 19 is unmaterialized); targets removed: no element left | 154 |
| 108 | `{"t":"set","e":"p1","a":{"deckCount":42,"handCount":2}}` | R-07 set of a known entity (full p1) | 155 |
| 109 | `{"t":"set","e":"p2","a":{"deckCount":43,"handCount":3}}` | R-07 set of a known entity (full p2) | 156 |
| 110 | `{"t":"set","e":"g","a":{"phase":"regroup","active":null}}` | R-07 set of a known entity (full g) | 157 |
| 111 | `{"t":"step","seq":9}` | R-10 step | 158 |
| 112 | `{"t":"block","id":26,"kind":"resource","p":1,"amount":1,"parent":23}` | R-09 block 26 (resource); targets element dropped (full 16 is unmaterialized); targets removed: no element left | 159 |
| 113 | `{"t":"create","e":13,"zone":"resource","owner":1,"to":[1],"a":{"exhausted":true}}` | R-05 anonymous create after set (full 16) | 160 |
| 114 | `{"t":"set","e":"p1","a":{"handCount":1}}` | R-07 set of a known entity (full p1) | 161 |
| 115 | `{"t":"step","seq":10}` | R-10 step | 162 |

## `full` records that emit nothing

- `full` line 76: R-02 nothing: full 5 unmaterialized
- `full` line 77: R-02 nothing: full 6 unmaterialized
- `full` line 78: R-02 nothing: full 7 unmaterialized
- `full` line 79: R-02 nothing: full 8 unmaterialized
- `full` line 80: R-02 nothing: full 9 unmaterialized
- `full` line 105: R-04 nothing (full 6)
- `full` line 106: R-04 nothing (full 7)
- `full` line 122: R-02 nothing: full 13 unmaterialized
- `full` line 123: R-02 nothing: full 14 unmaterialized
- `full` line 124: R-02 nothing: full 15 unmaterialized
- `full` line 126: R-05 nothing (full 15)
- `full` line 128: R-08 nothing: unmaterialized (full 13)
- `full` line 129: R-08 nothing: unmaterialized (full 14)
- `full` line 149: R-02 nothing: full 16 unmaterialized
- `full` line 150: R-02 nothing: full 17 unmaterialized
- `full` line 151: R-02 nothing: full 18 unmaterialized
- `full` line 152: R-02 nothing: full 19 unmaterialized
