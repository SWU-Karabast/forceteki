# `known-in-hand.p1.swupgn`

This file is `known-in-hand.full.swupgn` redacted by SPEC §11 for seat 1 (`perspective:1`). These notes are hand-reviewed and informative; the vector files are the normative part.

## Scenario

Review Focus 4 of the SDK plan: a known card bounced back into its owner's hand stays the same entity, with its identity, for the opponent, and is gone once it leaves that hand face down. P2 is the viewer that matters.

| Step | What happens |
|---|---|
| 1 | P1 plays Battlefield Marine (`SOR#095`, `full` 5). |
| 2 | P2 plays Waylay (`TWI#226`) and returns it to P1's hand. P2 still knows it (§10.2). |
| 3 | P1 plays Captain Vaughn (`TS26#039`, `full` 6). |
| 4 | P2 plays Bodhi Rook (`SOR#201`): its When Played looks at P1's hand. Each card in it is revealed to [2] (W-43), the Marine included, so P2 now also knows Consular Security Force (`SOR#046`, `full` 7). Bodhi discards a non-unit card, and there is none. |
| 5 | P1 passes. |
| 6 | P2 plays Dragon's Might (`HMW#102`) on Vaughn. His When Defeated searches the top 3 of P1's deck, draws one (`SOR#210`), and puts a card from P1's hand on top of P1's deck: the Marine (`remove` of `full` 5, W-24). |
| 7, 8 | Both pass. Regroup: P1 draws the Marine again, as a new entity `full` 19 (W-22), and `SOR#101`. |

Captain Vaughn puts the card on top of the deck rather than shuffling it in. Putting a card from hand into a deck is not an occurrence of any registered block kind, so no block names it.

## The point of the vector

- `p2`: the Marine keeps its output id from its first `create` through the bounce (step 7 emits the `set` to `hand`) and through Bodhi Rook's private reveal (step 3, known branch: the `reveal` to [2] is emitted with the mapped id).
- `p2`, step 6: the `remove` of `full` 5 is a move out of a hand that is not P2's. Step 0 removes every card P2 knows in that hand, in ascending output id: the Marine and Consular Security Force. Nothing else is emitted for the Marine (step 8: it is unmaterialized). The search and draw blocks keep `amount` and lose their references.
- `p2`, step 8: the Marine drawn again is unmaterialized: P2's file holds no entity for it, only the new `handCount`.
- `p1`: Bodhi Rook's reveals to [2] are not emitted (R-04). The look block keeps its targets, because they are in the viewer's own hand.
- `public`: only the Marine is known in P1's hand (audience `"all"`); Consular Security Force was shown to P2 alone. Step 0 removes the Marine only.

## Readings used by every vector

- **Header, `DECKS`, `CARDS` (R-11).** Every tag is kept except `Seed`, and `Visibility` is rewritten. The viewer's own `DECKS` line is kept without `order`. The other line (both lines in `public`) keeps `p`, `leaders` and `base`, sets `complete` to `false`, and lists one `[id]` per distinct card id that this file's `create` and `reveal` records give to an entity of that seat, in the order this file first gives each, leaving out `TOKEN:` ids and the line's own leaders and base. `CARDS` keeps the `full` lines, in their order, whose id appears in this file's header, `DECKS` or `RECORDS`.
- **Empty `a`.** A `create` made by step 3 or step 5 for an entity that has no attributes (a hand card) carries no `a` key, rather than `"a":{}`.
- **Fresh ids (R-14).** Output ids are handed out 1, 2, 3, … in the order the output first uses them. An id removed by step 0, 3, 6 or 8 is never used again.
- **The game itself is illustrative.** Costs and resource payments are not modelled, decks are short, and some timing is simplified. The records, and what each profile may know, are what the vector tests.

## Records

Each line of `RECORDS` in `known-in-hand.p1.swupgn`, with the step of SPEC §11.2 that produced it and the `full` record it came from. Entity ids in the "Step" column are `full` ids; ids in the "Record" column are this file's own.

| Line | Record | Step | From `full` line |
|---|---|---|---|
| 44 | `{"t":"set","e":"g","a":{"round":1,"phase":"action","active":1,"initiative":1,"initiativeTaken":false}}` | R-07 set of a known entity (full g) | 51 |
| 45 | `{"t":"set","e":"p1","a":{"deckCount":25,"handCount":3,"credits":0,"force":false}}` | R-07 set of a known entity (full p1) | 52 |
| 46 | `{"t":"set","e":"p2","a":{"deckCount":24,"handCount":4,"credits":0,"force":false}}` | R-07 set of a known entity (full p2) | 53 |
| 47 | `{"t":"create","e":1,"zone":"base","owner":1,"card":"SOR#026","a":{"kind":"base","damage":0,"hp":30}}` | R-01 create, audience "all" holds viewer (full 1) | 54 |
| 48 | `{"t":"create","e":2,"zone":"base","owner":1,"card":"SOR#005","a":{"kind":"leader","exhausted":false,"deploy…` | R-01 create, audience "all" holds viewer (full 2) | 55 |
| 49 | `{"t":"create","e":3,"zone":"base","owner":2,"card":"SOR#029","a":{"kind":"base","damage":0,"hp":28}}` | R-01 create, audience "all" holds viewer (full 3) | 56 |
| 50 | `{"t":"create","e":4,"zone":"base","owner":2,"card":"SOR#010","a":{"kind":"leader","exhausted":false,"deploy…` | R-01 create, audience "all" holds viewer (full 4) | 57 |
| 51 | `{"t":"create","e":5,"zone":"hand","owner":1,"card":"SOR#095","to":[1]}` | R-01 create, audience [1] holds viewer (full 5) | 58 |
| 52 | `{"t":"create","e":6,"zone":"hand","owner":1,"card":"TS26#039","to":[1]}` | R-01 create, audience [1] holds viewer (full 6) | 59 |
| 53 | `{"t":"create","e":7,"zone":"hand","owner":1,"card":"SOR#046","to":[1]}` | R-01 create, audience [1] holds viewer (full 7) | 60 |
| 54 | `{"t":"create","e":8,"zone":"resource","owner":1,"card":"SOR#048","to":[1],"a":{"exhausted":false}}` | R-01 create, audience [1] holds viewer (full 12) | 65 |
| 55 | `{"t":"create","e":9,"zone":"resource","owner":1,"card":"SOR#050","to":[1],"a":{"exhausted":false}}` | R-01 create, audience [1] holds viewer (full 13) | 66 |
| 56 | `{"t":"create","e":10,"zone":"resource","owner":2,"to":[2],"a":{"exhausted":false}}` | R-02 anonymous create (full 14) | 67 |
| 57 | `{"t":"create","e":11,"zone":"resource","owner":2,"to":[2],"a":{"exhausted":false}}` | R-02 anonymous create (full 15) | 68 |
| 58 | `{"t":"step","seq":0}` | R-10 step | 69 |
| 59 | `{"t":"reveal","e":5,"card":"SOR#095","to":"all"}` | R-03 reveal of a known entity (full 5) | 70 |
| 60 | `{"t":"set","e":5,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":3,"hp":3}}` | R-07 set of a known entity (full 5) | 71 |
| 61 | `{"t":"block","id":1,"kind":"play","p":1,"src":5}` | R-09 block 1 (play), every reference kept | 72 |
| 62 | `{"t":"set","e":"p1","a":{"handCount":2}}` | R-07 set of a known entity (full p1) | 73 |
| 63 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 74 |
| 64 | `{"t":"step","seq":1}` | R-10 step | 75 |
| 65 | `{"t":"create","e":12,"zone":"hand","owner":2,"card":"TWI#226","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 8) | 76 |
| 66 | `{"t":"set","e":12,"zone":"discard","a":{"kind":"event"}}` | R-07 set of a known entity (full 8) | 77 |
| 67 | `{"t":"block","id":2,"kind":"play","p":2,"src":12,"targets":[5]}` | R-09 block 2 (play), every reference kept | 78 |
| 68 | `{"t":"set","e":5,"zone":"hand","a":{"exhausted":null,"damage":null,"power":null,"hp":null}}` | R-07 set of a known entity (full 5) | 79 |
| 69 | `{"t":"set","e":"p1","a":{"handCount":3}}` | R-07 set of a known entity (full p1) | 80 |
| 70 | `{"t":"set","e":"p2","a":{"handCount":3}}` | R-07 set of a known entity (full p2) | 81 |
| 71 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 82 |
| 72 | `{"t":"step","seq":2}` | R-10 step | 83 |
| 73 | `{"t":"reveal","e":6,"card":"TS26#039","to":"all"}` | R-03 reveal of a known entity (full 6) | 84 |
| 74 | `{"t":"set","e":6,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":2,"hp":5}}` | R-07 set of a known entity (full 6) | 85 |
| 75 | `{"t":"block","id":3,"kind":"play","p":1,"src":6}` | R-09 block 3 (play), every reference kept | 86 |
| 76 | `{"t":"set","e":"p1","a":{"handCount":2}}` | R-07 set of a known entity (full p1) | 87 |
| 77 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 88 |
| 78 | `{"t":"step","seq":3}` | R-10 step | 89 |
| 79 | `{"t":"create","e":13,"zone":"hand","owner":2,"card":"SOR#201","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 9) | 90 |
| 80 | `{"t":"set","e":13,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":3,"hp":3}}` | R-07 set of a known entity (full 9) | 91 |
| 81 | `{"t":"block","id":4,"kind":"play","p":2,"src":13}` | R-09 block 4 (play), every reference kept | 92 |
| 82 | `{"t":"block","id":5,"kind":"trigger","p":2,"src":13,"parent":4}` | R-09 block 5 (trigger), every reference kept | 93 |
| 83 | `{"t":"block","id":6,"kind":"look","p":2,"src":13,"targets":[5,7],"amount":2,"parent":5}` | R-09 block 6 (look), every reference kept | 96 |
| 84 | `{"t":"set","e":"p2","a":{"handCount":2}}` | R-07 set of a known entity (full p2) | 97 |
| 85 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 98 |
| 86 | `{"t":"step","seq":4}` | R-10 step | 99 |
| 87 | `{"t":"block","id":7,"kind":"pass","p":1}` | R-09 block 7 (pass), every reference kept | 100 |
| 88 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 101 |
| 89 | `{"t":"step","seq":5}` | R-10 step | 102 |
| 90 | `{"t":"create","e":14,"zone":"hand","owner":2,"card":"HMW#102","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 10) | 103 |
| 91 | `{"t":"set","e":14,"zone":"discard","a":{"kind":"event"}}` | R-07 set of a known entity (full 10) | 104 |
| 92 | `{"t":"block","id":8,"kind":"play","p":2,"src":14,"targets":[6]}` | R-09 block 8 (play), every reference kept | 105 |
| 93 | `{"t":"block","id":9,"kind":"defeat","p":2,"src":14,"targets":[6],"parent":8}` | R-09 block 9 (defeat), every reference kept | 106 |
| 94 | `{"t":"set","e":6,"zone":"discard","a":{"exhausted":null,"damage":null,"power":null,"hp":null}}` | R-07 set of a known entity (full 6) | 107 |
| 95 | `{"t":"block","id":10,"kind":"trigger","p":1,"src":6,"parent":8}` | R-09 block 10 (trigger), every reference kept | 108 |
| 96 | `{"t":"create","e":15,"zone":"deck","owner":1,"card":"SOR#210","to":[1]}` | R-01 create, audience [1] holds viewer (full 16) | 109 |
| 97 | `{"t":"create","e":16,"zone":"deck","owner":1,"card":"SOR#097","to":[1]}` | R-01 create, audience [1] holds viewer (full 17) | 110 |
| 98 | `{"t":"create","e":17,"zone":"deck","owner":1,"card":"SOR#099","to":[1]}` | R-01 create, audience [1] holds viewer (full 18) | 111 |
| 99 | `{"t":"block","id":11,"kind":"search","p":1,"src":6,"targets":[15],"options":[15,16,17],"amount":3,"parent":10}` | R-09 block 11 (search), every reference kept | 112 |
| 100 | `{"t":"set","e":15,"zone":"hand"}` | R-07 set of a known entity (full 16) | 113 |
| 101 | `{"t":"block","id":12,"kind":"draw","p":1,"src":6,"targets":[15],"amount":1,"parent":10}` | R-09 block 12 (draw), every reference kept | 114 |
| 102 | `{"t":"remove","e":16}` | R-08 remove (full 17) | 115 |
| 103 | `{"t":"remove","e":17}` | R-08 remove (full 18) | 116 |
| 104 | `{"t":"remove","e":5}` | R-08 remove (full 5) | 117 |
| 105 | `{"t":"set","e":"p2","a":{"handCount":1}}` | R-07 set of a known entity (full p2) | 118 |
| 106 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 119 |
| 107 | `{"t":"step","seq":6}` | R-10 step | 120 |
| 108 | `{"t":"block","id":13,"kind":"pass","p":1}` | R-09 block 13 (pass), every reference kept | 121 |
| 109 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 122 |
| 110 | `{"t":"step","seq":7}` | R-10 step | 123 |
| 111 | `{"t":"block","id":14,"kind":"pass","p":2}` | R-09 block 14 (pass), every reference kept | 124 |
| 112 | `{"t":"block","id":15,"kind":"regroup"}` | R-09 block 15 (regroup), every reference kept | 125 |
| 113 | `{"t":"create","e":18,"zone":"hand","owner":1,"card":"SOR#095","to":[1]}` | R-01 create, audience [1] holds viewer (full 19) | 126 |
| 114 | `{"t":"create","e":19,"zone":"hand","owner":1,"card":"SOR#101","to":[1]}` | R-01 create, audience [1] holds viewer (full 20) | 127 |
| 115 | `{"t":"block","id":16,"kind":"draw","p":1,"targets":[18,19],"amount":2,"parent":15,"group":1}` | R-09 block 16 (draw), every reference kept | 130 |
| 116 | `{"t":"block","id":17,"kind":"draw","p":2,"amount":2,"parent":15,"group":1}` | R-09 block 17 (draw); targets element dropped (full 21 is unmaterialized); targets element dropped (full 22 is unmaterialized); targets removed: no element left | 131 |
| 117 | `{"t":"set","e":"p1","a":{"deckCount":23,"handCount":4}}` | R-07 set of a known entity (full p1) | 132 |
| 118 | `{"t":"set","e":"p2","a":{"deckCount":22,"handCount":3}}` | R-07 set of a known entity (full p2) | 133 |
| 119 | `{"t":"set","e":"g","a":{"phase":"regroup","active":null}}` | R-07 set of a known entity (full g) | 134 |
| 120 | `{"t":"step","seq":8}` | R-10 step | 135 |

## `full` records that emit nothing

- `full` line 61: R-02 nothing: full 8 unmaterialized
- `full` line 62: R-02 nothing: full 9 unmaterialized
- `full` line 63: R-02 nothing: full 10 unmaterialized
- `full` line 64: R-02 nothing: full 11 unmaterialized
- `full` line 94: R-04 nothing (full 5)
- `full` line 95: R-04 nothing (full 7)
- `full` line 128: R-02 nothing: full 21 unmaterialized
- `full` line 129: R-02 nothing: full 22 unmaterialized
