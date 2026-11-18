# `known-in-hand.p2.swupgn`

This file is `known-in-hand.full.swupgn` redacted by SPEC §11 for seat 2 (`perspective:2`). These notes are hand-reviewed and informative; the vector files are the normative part.

## Scenario

Review Focus 4 of the SDK plan: a known card bounced back into its owner's hand stays the same entity, with its identity, for the opponent, and is gone once it leaves that hand face down. P2 is the viewer that matters.

| Step | What happens |
|---|---|
| 0 | Setup (`g.phase` `setup`): bases, leaders and opening hands. |
| 1 | The mulligan decision, made by both seats in one step (W-39): both keep, so the step group is empty. |
| 2 | The opening resources, chosen by both seats in one step, P1 (which has the initiative) first. The action phase begins: `g.phase` becomes `action` and `g.active` 1. |
| 3 | P1 plays Battlefield Marine (`SOR#095`, `full` 5). |
| 4 | P2 plays Waylay (`TWI#226`) and returns it to P1's hand. P2 still knows it (§10.2). |
| 5 | P1 plays Captain Vaughn (`TS26#039`, `full` 6). |
| 6 | P2 plays Bodhi Rook (`SOR#201`): its When Played looks at P1's hand. Each card in it is revealed to [2] (W-43), the Marine included, so P2 now also knows Consular Security Force (`SOR#046`, `full` 7). Bodhi discards a non-unit card, and there is none. |
| 7 | P1 passes. |
| 8 | P2 plays Dragon's Might (`HMW#102`) on Vaughn. His When Defeated searches the top 3 of P1's deck, draws one (`SOR#210`), and puts a card from P1's hand on top of P1's deck: the Marine (`remove` of `full` 5, W-24). |
| 9, 10 | Both pass. Regroup: P1 draws the Marine again, as a new entity `full` 19 (W-22), and `SOR#101`. |

Captain Vaughn puts the card on top of the deck rather than shuffling it in. Putting a card from hand into a deck is not an occurrence of any registered block kind, so no block names it.

## The point of the vector

- `p2`: the Marine keeps its output id from its first `create` through the bounce (step 7 emits the `set` to `hand`) and through Bodhi Rook's private reveal (step 3, known branch: the `reveal` to [2] is emitted with the mapped id).
- `p2`, step 8: the `remove` of `full` 5 is a move out of a hand that is not P2's. Step 0 removes every card P2 knows in that hand, in ascending output id: the Marine and Consular Security Force. Nothing else is emitted for the Marine (step 8: it is unmaterialized). The search and draw blocks keep `amount` and lose their references.
- `p2`, step 10: the Marine drawn again is unmaterialized: P2's file holds no entity for it, only the new `handCount`.
- `p1`: Bodhi Rook's reveals to [2] are not emitted (R-04). The look block keeps its targets, because they are in the viewer's own hand.
- `public`: only the Marine is known in P1's hand (audience `"all"`); Consular Security Force was shown to P2 alone. Step 0 removes the Marine only.

## Readings used by every vector

- **Header, `DECKS`, `CARDS` (R-11).** Every tag that SPEC §5.1 or §5.2 defines is kept except `Seed`, any other tag is dropped (W-67), and `Visibility` is rewritten. The viewer's own `DECKS` line is kept without `order`. The other line (both lines in `public`) keeps `p`, `leaders` and `base`, sets `complete` to `false`, and lists one `[id]` per distinct card id that this file's `create` and `reveal` records give to an entity of that seat, in the order this file first gives each, leaving out `TOKEN:` ids and the line's own leaders and base. `CARDS` keeps the `full` lines, in their order, whose id appears in this file's header, `DECKS` or `RECORDS`.
- **Empty `a`.** A `create` made by step 3 or step 5 for an entity that has no attributes (a hand card) carries no `a` key, rather than `"a":{}`.
- **Fresh ids (R-14).** Output ids are handed out 1, 2, 3, … in the order the output first uses them. An id removed by step 0, 3, 6 or 8 is never used again.
- **The game itself is illustrative.** Costs and resource payments are not modelled, decks are short, and some timing is simplified. The records, and what each profile may know, are what the vector tests.

## Records

Each line of `RECORDS` in `known-in-hand.p2.swupgn`, with the step of SPEC §11.2 that produced it and the `full` record it came from. Entity ids in the "Step" column are `full` ids; ids in the "Record" column are this file's own.

| Line | Record | Step | From `full` line |
|---|---|---|---|
| 44 | `{"t":"set","e":"g","a":{"round":1,"phase":"setup","initiative":1,"initiativeTaken":false}}` | R-07 set of a known entity (full g) | 51 |
| 45 | `{"t":"set","e":"p1","a":{"deckCount":25,"handCount":3,"credits":0,"force":false}}` | R-07 set of a known entity (full p1) | 52 |
| 46 | `{"t":"set","e":"p2","a":{"deckCount":24,"handCount":4,"credits":0,"force":false}}` | R-07 set of a known entity (full p2) | 53 |
| 47 | `{"t":"create","e":1,"zone":"base","owner":1,"card":"SOR#026","a":{"kind":"base","damage":0,"hp":30}}` | R-01 create, audience "all" holds viewer (full 1) | 54 |
| 48 | `{"t":"create","e":2,"zone":"base","owner":1,"card":"SOR#005","a":{"kind":"leader","exhausted":false,"deploy…` | R-01 create, audience "all" holds viewer (full 2) | 55 |
| 49 | `{"t":"create","e":3,"zone":"base","owner":2,"card":"SOR#029","a":{"kind":"base","damage":0,"hp":28}}` | R-01 create, audience "all" holds viewer (full 3) | 56 |
| 50 | `{"t":"create","e":4,"zone":"base","owner":2,"card":"SOR#010","a":{"kind":"leader","exhausted":false,"deploy…` | R-01 create, audience "all" holds viewer (full 4) | 57 |
| 51 | `{"t":"create","e":5,"zone":"hand","owner":2,"card":"TWI#226","to":[2]}` | R-01 create, audience [2] holds viewer (full 8) | 61 |
| 52 | `{"t":"create","e":6,"zone":"hand","owner":2,"card":"SOR#201","to":[2]}` | R-01 create, audience [2] holds viewer (full 9) | 62 |
| 53 | `{"t":"create","e":7,"zone":"hand","owner":2,"card":"HMW#102","to":[2]}` | R-01 create, audience [2] holds viewer (full 10) | 63 |
| 54 | `{"t":"create","e":8,"zone":"hand","owner":2,"card":"SOR#130","to":[2]}` | R-01 create, audience [2] holds viewer (full 11) | 64 |
| 55 | `{"t":"step","seq":0}` | R-10 step | 65 |
| 56 | `{"t":"step","seq":1}` | R-10 step | 66 |
| 57 | `{"t":"create","e":9,"zone":"resource","owner":1,"to":[1],"a":{"exhausted":false}}` | R-02 anonymous create (full 12) | 67 |
| 58 | `{"t":"create","e":10,"zone":"resource","owner":1,"to":[1],"a":{"exhausted":false}}` | R-02 anonymous create (full 13) | 68 |
| 59 | `{"t":"create","e":11,"zone":"resource","owner":2,"card":"SOR#062","to":[2],"a":{"exhausted":false}}` | R-01 create, audience [2] holds viewer (full 14) | 69 |
| 60 | `{"t":"create","e":12,"zone":"resource","owner":2,"card":"SOR#064","to":[2],"a":{"exhausted":false}}` | R-01 create, audience [2] holds viewer (full 15) | 70 |
| 61 | `{"t":"set","e":"g","a":{"phase":"action","active":1}}` | R-07 set of a known entity (full g) | 71 |
| 62 | `{"t":"step","seq":2}` | R-10 step | 72 |
| 63 | `{"t":"create","e":13,"zone":"hand","owner":1,"card":"SOR#095","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 5) | 73 |
| 64 | `{"t":"set","e":13,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":3,"hp":3}}` | R-07 set of a known entity (full 5) | 74 |
| 65 | `{"t":"block","id":1,"kind":"play","p":1,"src":13}` | R-09 block 1 (play), every reference kept | 75 |
| 66 | `{"t":"set","e":"p1","a":{"handCount":2}}` | R-07 set of a known entity (full p1) | 76 |
| 67 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 77 |
| 68 | `{"t":"step","seq":3}` | R-10 step | 78 |
| 69 | `{"t":"reveal","e":5,"card":"TWI#226","to":"all"}` | R-03 reveal of a known entity (full 8) | 79 |
| 70 | `{"t":"set","e":5,"zone":"discard","a":{"kind":"event"}}` | R-07 set of a known entity (full 8) | 80 |
| 71 | `{"t":"block","id":2,"kind":"play","p":2,"src":5,"targets":[13]}` | R-09 block 2 (play), every reference kept | 81 |
| 72 | `{"t":"set","e":13,"zone":"hand","a":{"exhausted":null,"damage":null,"power":null,"hp":null}}` | R-07 set of a known entity (full 5) | 82 |
| 73 | `{"t":"set","e":"p1","a":{"handCount":3}}` | R-07 set of a known entity (full p1) | 83 |
| 74 | `{"t":"set","e":"p2","a":{"handCount":3}}` | R-07 set of a known entity (full p2) | 84 |
| 75 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 85 |
| 76 | `{"t":"step","seq":4}` | R-10 step | 86 |
| 77 | `{"t":"create","e":14,"zone":"hand","owner":1,"card":"TS26#039","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 6) | 87 |
| 78 | `{"t":"set","e":14,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":2,"hp":5}}` | R-07 set of a known entity (full 6) | 88 |
| 79 | `{"t":"block","id":3,"kind":"play","p":1,"src":14}` | R-09 block 3 (play), every reference kept | 89 |
| 80 | `{"t":"set","e":"p1","a":{"handCount":2}}` | R-07 set of a known entity (full p1) | 90 |
| 81 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 91 |
| 82 | `{"t":"step","seq":5}` | R-10 step | 92 |
| 83 | `{"t":"reveal","e":6,"card":"SOR#201","to":"all"}` | R-03 reveal of a known entity (full 9) | 93 |
| 84 | `{"t":"set","e":6,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":3,"hp":3}}` | R-07 set of a known entity (full 9) | 94 |
| 85 | `{"t":"block","id":4,"kind":"play","p":2,"src":6}` | R-09 block 4 (play), every reference kept | 95 |
| 86 | `{"t":"block","id":5,"kind":"trigger","p":2,"src":6,"parent":4}` | R-09 block 5 (trigger), every reference kept | 96 |
| 87 | `{"t":"reveal","e":13,"card":"SOR#095","to":[2]}` | R-03 reveal of a known entity (full 5) | 97 |
| 88 | `{"t":"create","e":15,"zone":"hand","owner":1,"card":"SOR#046","to":[1,2]}` | R-03 reveal of an unmaterialized entity: fresh known create (full 7) | 98 |
| 89 | `{"t":"block","id":6,"kind":"look","p":2,"src":6,"amount":2,"parent":5}` | R-09 block 6 (look); targets element dropped (full 5 is in a hand that is not the viewer's); targets element dropped (full 7 is in a hand that is not the viewer's); targets removed: no element left | 99 |
| 90 | `{"t":"set","e":"p2","a":{"handCount":2}}` | R-07 set of a known entity (full p2) | 100 |
| 91 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 101 |
| 92 | `{"t":"step","seq":6}` | R-10 step | 102 |
| 93 | `{"t":"block","id":7,"kind":"pass","p":1}` | R-09 block 7 (pass), every reference kept | 103 |
| 94 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 104 |
| 95 | `{"t":"step","seq":7}` | R-10 step | 105 |
| 96 | `{"t":"reveal","e":7,"card":"HMW#102","to":"all"}` | R-03 reveal of a known entity (full 10) | 106 |
| 97 | `{"t":"set","e":7,"zone":"discard","a":{"kind":"event"}}` | R-07 set of a known entity (full 10) | 107 |
| 98 | `{"t":"block","id":8,"kind":"play","p":2,"src":7,"targets":[14]}` | R-09 block 8 (play), every reference kept | 108 |
| 99 | `{"t":"block","id":9,"kind":"defeat","p":2,"src":7,"targets":[14],"parent":8}` | R-09 block 9 (defeat), every reference kept | 109 |
| 100 | `{"t":"set","e":14,"zone":"discard","a":{"exhausted":null,"damage":null,"power":null,"hp":null}}` | R-07 set of a known entity (full 6) | 110 |
| 101 | `{"t":"block","id":10,"kind":"trigger","p":1,"src":14,"parent":8}` | R-09 block 10 (trigger), every reference kept | 111 |
| 102 | `{"t":"block","id":11,"kind":"search","p":1,"src":14,"amount":3,"parent":10}` | R-09 block 11 (search); targets element dropped (full 16 is unmaterialized); targets removed: no element left; options element dropped (full 16 is unmaterialized); options element dropped (full 17 is unmaterialized); options element dropped (full 18 is unmaterialized); options removed: no element left | 115 |
| 103 | `{"t":"block","id":12,"kind":"draw","p":1,"src":14,"amount":1,"parent":10}` | R-09 block 12 (draw); targets element dropped (full 16 is unmaterialized); targets removed: no element left | 117 |
| 104 | `{"t":"remove","e":13}` | R-17 lose track (full 5, the moving card) | 120 |
| 105 | `{"t":"remove","e":15}` | R-17 lose track (full 7) | 120 |
| 106 | `{"t":"set","e":"p2","a":{"handCount":1}}` | R-07 set of a known entity (full p2) | 121 |
| 107 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 122 |
| 108 | `{"t":"step","seq":8}` | R-10 step | 123 |
| 109 | `{"t":"block","id":13,"kind":"pass","p":1}` | R-09 block 13 (pass), every reference kept | 124 |
| 110 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 125 |
| 111 | `{"t":"step","seq":9}` | R-10 step | 126 |
| 112 | `{"t":"block","id":14,"kind":"pass","p":2}` | R-09 block 14 (pass), every reference kept | 127 |
| 113 | `{"t":"block","id":15,"kind":"regroup"}` | R-09 block 15 (regroup), every reference kept | 128 |
| 114 | `{"t":"create","e":16,"zone":"hand","owner":2,"card":"SOR#132","to":[2]}` | R-01 create, audience [2] holds viewer (full 21) | 131 |
| 115 | `{"t":"create","e":17,"zone":"hand","owner":2,"card":"SOR#134","to":[2]}` | R-01 create, audience [2] holds viewer (full 22) | 132 |
| 116 | `{"t":"block","id":16,"kind":"draw","p":1,"amount":2,"parent":15,"group":1}` | R-09 block 16 (draw); targets element dropped (full 19 is unmaterialized); targets element dropped (full 20 is unmaterialized); targets removed: no element left | 133 |
| 117 | `{"t":"block","id":17,"kind":"draw","p":2,"targets":[16,17],"amount":2,"parent":15,"group":1}` | R-09 block 17 (draw), every reference kept | 134 |
| 118 | `{"t":"set","e":"p1","a":{"deckCount":23,"handCount":4}}` | R-07 set of a known entity (full p1) | 135 |
| 119 | `{"t":"set","e":"p2","a":{"deckCount":22,"handCount":3}}` | R-07 set of a known entity (full p2) | 136 |
| 120 | `{"t":"set","e":"g","a":{"phase":"regroup","active":null}}` | R-07 set of a known entity (full g) | 137 |
| 121 | `{"t":"step","seq":10}` | R-10 step | 138 |

## `full` records that emit nothing

- `full` line 58: R-02 nothing: full 5 unmaterialized
- `full` line 59: R-02 nothing: full 6 unmaterialized
- `full` line 60: R-02 nothing: full 7 unmaterialized
- `full` line 112: R-02 nothing: full 16 unmaterialized
- `full` line 113: R-02 nothing: full 17 unmaterialized
- `full` line 114: R-02 nothing: full 18 unmaterialized
- `full` line 116: R-05 nothing (full 16)
- `full` line 118: R-08 nothing: unmaterialized (full 17)
- `full` line 119: R-08 nothing: unmaterialized (full 18)
- `full` line 120: R-08 nothing: unmaterialized (full 5)
- `full` line 129: R-02 nothing: full 19 unmaterialized
- `full` line 130: R-02 nothing: full 20 unmaterialized
