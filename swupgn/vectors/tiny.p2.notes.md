# `tiny.p2.swupgn`

This file is `tiny.full.swupgn` redacted by SPEC §11 for seat 2 (`perspective:2`). These notes are hand-reviewed and informative; the vector files are the normative part.

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

Each line of `RECORDS` in `tiny.p2.swupgn`, with the step of SPEC §11.2 that produced it and the `full` record it came from. Entity ids in the "Step" column are `full` ids; ids in the "Record" column are this file's own.

| Line | Record | Step | From `full` line |
|---|---|---|---|
| 52 | `{"t":"set","e":"g","a":{"round":1,"phase":"setup","initiative":1,"initiativeTaken":false}}` | R-07 set of a known entity (full g) | 67 |
| 53 | `{"t":"set","e":"p1","a":{"deckCount":44,"handCount":3,"credits":0,"force":false}}` | R-07 set of a known entity (full p1) | 68 |
| 54 | `{"t":"set","e":"p2","a":{"deckCount":45,"handCount":2,"credits":0,"force":false}}` | R-07 set of a known entity (full p2) | 69 |
| 55 | `{"t":"create","e":1,"zone":"base","owner":1,"card":"SOR#026","a":{"kind":"base","damage":0,"hp":30}}` | R-01 create, audience "all" holds viewer (full 1) | 70 |
| 56 | `{"t":"create","e":2,"zone":"base","owner":1,"card":"SOR#005","a":{"kind":"leader","exhausted":false,"deploy…` | R-01 create, audience "all" holds viewer (full 2) | 71 |
| 57 | `{"t":"create","e":3,"zone":"base","owner":2,"card":"SOR#029","a":{"kind":"base","damage":0,"hp":28}}` | R-01 create, audience "all" holds viewer (full 3) | 72 |
| 58 | `{"t":"create","e":4,"zone":"base","owner":2,"card":"SOR#010","a":{"kind":"leader","exhausted":false,"deploy…` | R-01 create, audience "all" holds viewer (full 4) | 73 |
| 59 | `{"t":"block","id":1,"kind":"shuffle","p":1,"amount":0}` | R-09 block 1 (shuffle), every reference kept | 74 |
| 60 | `{"t":"block","id":2,"kind":"shuffle","p":2,"amount":0}` | R-09 block 2 (shuffle), every reference kept | 75 |
| 61 | `{"t":"create","e":5,"zone":"hand","owner":2,"card":"SOR#201","to":[2]}` | R-01 create, audience [2] holds viewer (full 8) | 79 |
| 62 | `{"t":"create","e":6,"zone":"hand","owner":2,"card":"HMW#101","to":[2]}` | R-01 create, audience [2] holds viewer (full 9) | 80 |
| 63 | `{"t":"block","id":3,"kind":"draw","p":1,"amount":3,"group":2}` | R-09 block 3 (draw); targets element dropped (full 5 is unmaterialized); targets element dropped (full 6 is unmaterialized); targets element dropped (full 7 is unmaterialized); targets removed: no element left | 81 |
| 64 | `{"t":"block","id":4,"kind":"draw","p":2,"targets":[5,6],"amount":2,"group":2}` | R-09 block 4 (draw), every reference kept | 82 |
| 65 | `{"t":"step","seq":0}` | R-10 step | 83 |
| 66 | `{"t":"block","id":5,"kind":"mulligan","p":1,"amount":0}` | R-09 block 5 (mulligan), every reference kept | 84 |
| 67 | `{"t":"block","id":6,"kind":"mulligan","p":2,"amount":0}` | R-09 block 6 (mulligan), every reference kept | 85 |
| 68 | `{"t":"step","seq":1}` | R-10 step | 86 |
| 69 | `{"t":"create","e":7,"zone":"resource","owner":1,"to":[1],"a":{"exhausted":false}}` | R-02 anonymous create (full 10) | 87 |
| 70 | `{"t":"create","e":8,"zone":"resource","owner":2,"card":"SOR#061","to":[2],"a":{"exhausted":false}}` | R-01 create, audience [2] holds viewer (full 11) | 88 |
| 71 | `{"t":"block","id":7,"kind":"resource","p":1,"amount":1,"group":3}` | R-09 block 7 (resource); targets element dropped (full 10 is anonymous); targets removed: no element left | 89 |
| 72 | `{"t":"block","id":8,"kind":"resource","p":2,"targets":[8],"amount":1,"group":3}` | R-09 block 8 (resource), every reference kept | 90 |
| 73 | `{"t":"set","e":"g","a":{"phase":"action","active":1}}` | R-07 set of a known entity (full g) | 91 |
| 74 | `{"t":"step","seq":2}` | R-10 step | 92 |
| 75 | `{"t":"create","e":9,"zone":"hand","owner":1,"card":"SOR#095","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 5) | 93 |
| 76 | `{"t":"set","e":9,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":3,"hp":3}}` | R-07 set of a known entity (full 5) | 94 |
| 77 | `{"t":"block","id":9,"kind":"play","p":1,"src":9}` | R-09 block 9 (play), every reference kept | 95 |
| 78 | `{"t":"set","e":7,"a":{"exhausted":true}}` | R-07 set of an anonymous entity (full 10), public attributes only | 96 |
| 79 | `{"t":"set","e":"p1","a":{"handCount":2}}` | R-07 set of a known entity (full p1) | 97 |
| 80 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 98 |
| 81 | `{"t":"step","seq":3}` | R-10 step | 99 |
| 82 | `{"t":"reveal","e":5,"card":"SOR#201","to":"all"}` | R-03 reveal of a known entity (full 8) | 100 |
| 83 | `{"t":"set","e":5,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":3,"hp":3}}` | R-07 set of a known entity (full 8) | 101 |
| 84 | `{"t":"block","id":10,"kind":"play","p":2,"src":5}` | R-09 block 10 (play), every reference kept | 102 |
| 85 | `{"t":"set","e":8,"a":{"exhausted":true}}` | R-07 set of a known entity (full 11) | 103 |
| 86 | `{"t":"block","id":11,"kind":"trigger","p":2,"src":5,"parent":10}` | R-09 block 11 (trigger), every reference kept | 104 |
| 87 | `{"t":"create","e":10,"zone":"hand","owner":1,"card":"HMW#218","to":[1,2]}` | R-03 reveal of an unmaterialized entity: fresh known create (full 6) | 105 |
| 88 | `{"t":"create","e":11,"zone":"hand","owner":1,"card":"SOR#103","to":[1,2]}` | R-03 reveal of an unmaterialized entity: fresh known create (full 7) | 106 |
| 89 | `{"t":"block","id":12,"kind":"look","p":2,"src":5,"amount":2,"parent":11}` | R-09 block 12 (look); targets element dropped (full 6 is in a hand that is not the viewer's); targets element dropped (full 7 is in a hand that is not the viewer's); targets removed: no element left | 107 |
| 90 | `{"t":"reveal","e":11,"card":"SOR#103","to":"all"}` | R-03 reveal of a known entity (full 7) | 108 |
| 91 | `{"t":"set","e":11,"zone":"discard","a":{"kind":"event"}}` | R-07 set of a known entity (full 7) | 109 |
| 92 | `{"t":"block","id":13,"kind":"discard","p":1,"src":5,"targets":[11],"amount":1,"parent":11}` | R-09 block 13 (discard), every reference kept | 110 |
| 93 | `{"t":"set","e":"p1","a":{"handCount":1}}` | R-07 set of a known entity (full p1) | 111 |
| 94 | `{"t":"set","e":"p2","a":{"handCount":1}}` | R-07 set of a known entity (full p2) | 112 |
| 95 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 113 |
| 96 | `{"t":"step","seq":4}` | R-10 step | 114 |
| 97 | `{"t":"block","id":14,"kind":"pass","p":1}` | R-09 block 14 (pass), every reference kept | 115 |
| 98 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 116 |
| 99 | `{"t":"step","seq":5}` | R-10 step | 117 |
| 100 | `{"t":"reveal","e":6,"card":"HMW#101","to":"all"}` | R-03 reveal of a known entity (full 9) | 118 |
| 101 | `{"t":"set","e":6,"zone":"discard","a":{"kind":"event"}}` | R-07 set of a known entity (full 9) | 119 |
| 102 | `{"t":"block","id":15,"kind":"play","p":2,"src":6,"targets":[5]}` | R-09 block 15 (play), every reference kept | 120 |
| 103 | `{"t":"create","e":12,"zone":"ground","owner":2,"parent":5,"rel":"attached","card":"TOKEN:shield#8752877738"…` | R-01 create, audience "all" holds viewer (full 12) | 121 |
| 104 | `{"t":"create","e":13,"zone":"deck","owner":2,"card":"SOR#200","to":[2]}` | R-01 create, audience [2] holds viewer (full 13) | 122 |
| 105 | `{"t":"create","e":14,"zone":"deck","owner":2,"card":"SOR#202","to":[2]}` | R-01 create, audience [2] holds viewer (full 14) | 123 |
| 106 | `{"t":"create","e":15,"zone":"deck","owner":2,"card":"SOR#212","to":[2]}` | R-01 create, audience [2] holds viewer (full 15) | 124 |
| 107 | `{"t":"block","id":16,"kind":"search","p":2,"src":6,"targets":[15],"options":[13,14,15],"amount":3,"parent":15}` | R-09 block 16 (search), every reference kept | 125 |
| 108 | `{"t":"set","e":15,"zone":"hand"}` | R-07 set of a known entity (full 15) | 126 |
| 109 | `{"t":"block","id":17,"kind":"draw","p":2,"src":6,"targets":[15],"amount":1,"parent":15}` | R-09 block 17 (draw), every reference kept | 127 |
| 110 | `{"t":"remove","e":13}` | R-08 remove (full 13) | 128 |
| 111 | `{"t":"remove","e":14}` | R-08 remove (full 14) | 129 |
| 112 | `{"t":"set","e":"p2","a":{"deckCount":44}}` | R-07 set of a known entity (full p2) | 130 |
| 113 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 131 |
| 114 | `{"t":"step","seq":6}` | R-10 step | 132 |
| 115 | `{"t":"reveal","e":10,"card":"HMW#218","to":"all"}` | R-03 reveal of a known entity (full 6) | 133 |
| 116 | `{"t":"set","e":10,"zone":"discard","a":{"kind":"event"}}` | R-07 set of a known entity (full 6) | 134 |
| 117 | `{"t":"block","id":18,"kind":"play","p":1,"src":10,"targets":[5]}` | R-09 block 18 (play), every reference kept | 135 |
| 118 | `{"t":"block","id":19,"kind":"choice","p":2,"src":10,"parent":18}` | R-09 block 19 (choice), every reference kept; `text` removed (not a `name` block) | 136 |
| 119 | `{"t":"block","id":20,"kind":"defeat","p":1,"src":10,"targets":[12],"parent":18}` | R-09 block 20 (defeat), every reference kept | 137 |
| 120 | `{"t":"remove","e":12}` | R-08 remove (full 12) | 138 |
| 121 | `{"t":"remove","e":5}` | R-08 remove (full 8) | 139 |
| 122 | `{"t":"set","e":"p1","a":{"handCount":0}}` | R-07 set of a known entity (full p1) | 140 |
| 123 | `{"t":"set","e":"p2","a":{"deckCount":45}}` | R-07 set of a known entity (full p2) | 141 |
| 124 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 142 |
| 125 | `{"t":"step","seq":7}` | R-10 step | 143 |
| 126 | `{"t":"block","id":21,"kind":"pass","p":2}` | R-09 block 21 (pass), every reference kept | 144 |
| 127 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 145 |
| 128 | `{"t":"step","seq":8}` | R-10 step | 146 |
| 129 | `{"t":"block","id":22,"kind":"pass","p":1}` | R-09 block 22 (pass), every reference kept | 147 |
| 130 | `{"t":"block","id":23,"kind":"regroup"}` | R-09 block 23 (regroup), every reference kept | 148 |
| 131 | `{"t":"create","e":16,"zone":"hand","owner":2,"card":"SOR#201","to":[2]}` | R-01 create, audience [2] holds viewer (full 18) | 151 |
| 132 | `{"t":"create","e":17,"zone":"hand","owner":2,"card":"SOR#214","to":[2]}` | R-01 create, audience [2] holds viewer (full 19) | 152 |
| 133 | `{"t":"block","id":24,"kind":"draw","p":1,"amount":2,"parent":23,"group":1}` | R-09 block 24 (draw); targets element dropped (full 16 is unmaterialized); targets element dropped (full 17 is unmaterialized); targets removed: no element left | 153 |
| 134 | `{"t":"block","id":25,"kind":"draw","p":2,"targets":[16,17],"amount":2,"parent":23,"group":1}` | R-09 block 25 (draw), every reference kept | 154 |
| 135 | `{"t":"set","e":"p1","a":{"deckCount":42,"handCount":2}}` | R-07 set of a known entity (full p1) | 155 |
| 136 | `{"t":"set","e":"p2","a":{"deckCount":43,"handCount":3}}` | R-07 set of a known entity (full p2) | 156 |
| 137 | `{"t":"set","e":"g","a":{"phase":"regroup","active":null}}` | R-07 set of a known entity (full g) | 157 |
| 138 | `{"t":"step","seq":9}` | R-10 step | 158 |
| 139 | `{"t":"block","id":26,"kind":"resource","p":1,"amount":1,"parent":23}` | R-09 block 26 (resource); targets element dropped (full 16 is unmaterialized); targets removed: no element left | 159 |
| 140 | `{"t":"create","e":18,"zone":"resource","owner":1,"to":[1],"a":{"exhausted":true}}` | R-05 anonymous create after set (full 16) | 160 |
| 141 | `{"t":"set","e":"p1","a":{"handCount":1}}` | R-07 set of a known entity (full p1) | 161 |
| 142 | `{"t":"step","seq":10}` | R-10 step | 162 |

## `full` records that emit nothing

- `full` line 76: R-02 nothing: full 5 unmaterialized
- `full` line 77: R-02 nothing: full 6 unmaterialized
- `full` line 78: R-02 nothing: full 7 unmaterialized
- `full` line 149: R-02 nothing: full 16 unmaterialized
- `full` line 150: R-02 nothing: full 17 unmaterialized
