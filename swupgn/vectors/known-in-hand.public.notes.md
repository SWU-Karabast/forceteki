# `known-in-hand.public.swupgn`

This file is `known-in-hand.full.swupgn` redacted by SPEC §11 for nobody (`public`): a seat is in an audience only when it is `"all"`. These notes are hand-reviewed and informative; the vector files are the normative part.

## Scenario

Review Focus 4 of the SDK plan: a known card bounced back into its owner's hand stays the same entity, with its identity, for the opponent, and is gone once it leaves that hand face down. P2 is the viewer that matters.

| Step | What happens |
|---|---|
| 0 | Setup (`g.phase` `setup`): bases, leaders and opening hands. Each deck is shuffled (a `shuffle` block per seat) and each seat draws its opening hand (a `draw` block per seat, sharing a `group`). |
| 1 | The mulligan decision, made by both seats in one step (W-39): both keep, a `mulligan` block each with `amount` 0. |
| 2 | The opening resources, chosen by both seats in one step, P1 (which has the initiative) first. A `resource` block each, sharing a `group` (W-65). The action phase begins: `g.phase` becomes `action` and `g.active` 1. |
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

Each line of `RECORDS` in `known-in-hand.public.swupgn`, with the step of SPEC §11.2 that produced it and the `full` record it came from. Entity ids in the "Step" column are `full` ids; ids in the "Record" column are this file's own.

| Line | Record | Step | From `full` line |
|---|---|---|---|
| 36 | `{"t":"set","e":"g","a":{"round":1,"phase":"setup","initiative":1,"initiativeTaken":false}}` | R-07 set of a known entity (full g) | 51 |
| 37 | `{"t":"set","e":"p1","a":{"deckCount":25,"handCount":3,"credits":0,"force":false}}` | R-07 set of a known entity (full p1) | 52 |
| 38 | `{"t":"set","e":"p2","a":{"deckCount":24,"handCount":4,"credits":0,"force":false}}` | R-07 set of a known entity (full p2) | 53 |
| 39 | `{"t":"create","e":1,"zone":"base","owner":1,"card":"SOR#026","a":{"kind":"base","damage":0,"hp":30}}` | R-01 create, audience "all" holds viewer (full 1) | 54 |
| 40 | `{"t":"create","e":2,"zone":"base","owner":1,"card":"SOR#005","a":{"kind":"leader","exhausted":false,"deploy…` | R-01 create, audience "all" holds viewer (full 2) | 55 |
| 41 | `{"t":"create","e":3,"zone":"base","owner":2,"card":"SOR#029","a":{"kind":"base","damage":0,"hp":28}}` | R-01 create, audience "all" holds viewer (full 3) | 56 |
| 42 | `{"t":"create","e":4,"zone":"base","owner":2,"card":"SOR#010","a":{"kind":"leader","exhausted":false,"deploy…` | R-01 create, audience "all" holds viewer (full 4) | 57 |
| 43 | `{"t":"block","id":1,"kind":"shuffle","p":1,"amount":0}` | R-09 block 1 (shuffle), every reference kept | 58 |
| 44 | `{"t":"block","id":2,"kind":"shuffle","p":2,"amount":0}` | R-09 block 2 (shuffle), every reference kept | 59 |
| 45 | `{"t":"block","id":3,"kind":"draw","p":1,"amount":3,"group":2}` | R-09 block 3 (draw); targets element dropped (full 5 is unmaterialized); targets element dropped (full 6 is unmaterialized); targets element dropped (full 7 is unmaterialized); targets removed: no element left | 67 |
| 46 | `{"t":"block","id":4,"kind":"draw","p":2,"amount":4,"group":2}` | R-09 block 4 (draw); targets element dropped (full 8 is unmaterialized); targets element dropped (full 9 is unmaterialized); targets element dropped (full 10 is unmaterialized); targets element dropped (full 11 is unmaterialized); targets removed: no element left | 68 |
| 47 | `{"t":"step","seq":0}` | R-10 step | 69 |
| 48 | `{"t":"block","id":5,"kind":"mulligan","p":1,"amount":0}` | R-09 block 5 (mulligan), every reference kept | 70 |
| 49 | `{"t":"block","id":6,"kind":"mulligan","p":2,"amount":0}` | R-09 block 6 (mulligan), every reference kept | 71 |
| 50 | `{"t":"step","seq":1}` | R-10 step | 72 |
| 51 | `{"t":"create","e":5,"zone":"resource","owner":1,"to":[1],"a":{"exhausted":false}}` | R-02 anonymous create (full 12) | 73 |
| 52 | `{"t":"create","e":6,"zone":"resource","owner":1,"to":[1],"a":{"exhausted":false}}` | R-02 anonymous create (full 13) | 74 |
| 53 | `{"t":"create","e":7,"zone":"resource","owner":2,"to":[2],"a":{"exhausted":false}}` | R-02 anonymous create (full 14) | 75 |
| 54 | `{"t":"create","e":8,"zone":"resource","owner":2,"to":[2],"a":{"exhausted":false}}` | R-02 anonymous create (full 15) | 76 |
| 55 | `{"t":"block","id":7,"kind":"resource","p":1,"amount":2,"group":3}` | R-09 block 7 (resource); targets element dropped (full 12 is anonymous); targets element dropped (full 13 is anonymous); targets removed: no element left | 77 |
| 56 | `{"t":"block","id":8,"kind":"resource","p":2,"amount":2,"group":3}` | R-09 block 8 (resource); targets element dropped (full 14 is anonymous); targets element dropped (full 15 is anonymous); targets removed: no element left | 78 |
| 57 | `{"t":"set","e":"g","a":{"phase":"action","active":1}}` | R-07 set of a known entity (full g) | 79 |
| 58 | `{"t":"step","seq":2}` | R-10 step | 80 |
| 59 | `{"t":"create","e":9,"zone":"hand","owner":1,"card":"SOR#095","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 5) | 81 |
| 60 | `{"t":"set","e":9,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":3,"hp":3}}` | R-07 set of a known entity (full 5) | 82 |
| 61 | `{"t":"block","id":9,"kind":"play","p":1,"src":9}` | R-09 block 9 (play), every reference kept | 83 |
| 62 | `{"t":"set","e":"p1","a":{"handCount":2}}` | R-07 set of a known entity (full p1) | 84 |
| 63 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 85 |
| 64 | `{"t":"step","seq":3}` | R-10 step | 86 |
| 65 | `{"t":"create","e":10,"zone":"hand","owner":2,"card":"TWI#226","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 8) | 87 |
| 66 | `{"t":"set","e":10,"zone":"discard","a":{"kind":"event"}}` | R-07 set of a known entity (full 8) | 88 |
| 67 | `{"t":"block","id":10,"kind":"play","p":2,"src":10,"targets":[9]}` | R-09 block 10 (play), every reference kept | 89 |
| 68 | `{"t":"set","e":9,"zone":"hand","a":{"exhausted":null,"damage":null,"power":null,"hp":null}}` | R-07 set of a known entity (full 5) | 90 |
| 69 | `{"t":"set","e":"p1","a":{"handCount":3}}` | R-07 set of a known entity (full p1) | 91 |
| 70 | `{"t":"set","e":"p2","a":{"handCount":3}}` | R-07 set of a known entity (full p2) | 92 |
| 71 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 93 |
| 72 | `{"t":"step","seq":4}` | R-10 step | 94 |
| 73 | `{"t":"create","e":11,"zone":"hand","owner":1,"card":"TS26#039","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 6) | 95 |
| 74 | `{"t":"set","e":11,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":2,"hp":5}}` | R-07 set of a known entity (full 6) | 96 |
| 75 | `{"t":"block","id":11,"kind":"play","p":1,"src":11}` | R-09 block 11 (play), every reference kept | 97 |
| 76 | `{"t":"set","e":"p1","a":{"handCount":2}}` | R-07 set of a known entity (full p1) | 98 |
| 77 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 99 |
| 78 | `{"t":"step","seq":5}` | R-10 step | 100 |
| 79 | `{"t":"create","e":12,"zone":"hand","owner":2,"card":"SOR#201","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 9) | 101 |
| 80 | `{"t":"set","e":12,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":3,"hp":3}}` | R-07 set of a known entity (full 9) | 102 |
| 81 | `{"t":"block","id":12,"kind":"play","p":2,"src":12}` | R-09 block 12 (play), every reference kept | 103 |
| 82 | `{"t":"block","id":13,"kind":"trigger","p":2,"src":12,"parent":12}` | R-09 block 13 (trigger), every reference kept | 104 |
| 83 | `{"t":"block","id":14,"kind":"look","p":2,"src":12,"amount":2,"parent":13}` | R-09 block 14 (look); targets element dropped (full 5 is in a hand that is not the viewer's); targets element dropped (full 7 is unmaterialized); targets removed: no element left | 107 |
| 84 | `{"t":"set","e":"p2","a":{"handCount":2}}` | R-07 set of a known entity (full p2) | 108 |
| 85 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 109 |
| 86 | `{"t":"step","seq":6}` | R-10 step | 110 |
| 87 | `{"t":"block","id":15,"kind":"pass","p":1}` | R-09 block 15 (pass), every reference kept | 111 |
| 88 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 112 |
| 89 | `{"t":"step","seq":7}` | R-10 step | 113 |
| 90 | `{"t":"create","e":13,"zone":"hand","owner":2,"card":"HMW#102","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 10) | 114 |
| 91 | `{"t":"set","e":13,"zone":"discard","a":{"kind":"event"}}` | R-07 set of a known entity (full 10) | 115 |
| 92 | `{"t":"block","id":16,"kind":"play","p":2,"src":13,"targets":[11]}` | R-09 block 16 (play), every reference kept | 116 |
| 93 | `{"t":"block","id":17,"kind":"defeat","p":2,"src":13,"targets":[11],"parent":16}` | R-09 block 17 (defeat), every reference kept | 117 |
| 94 | `{"t":"set","e":11,"zone":"discard","a":{"exhausted":null,"damage":null,"power":null,"hp":null}}` | R-07 set of a known entity (full 6) | 118 |
| 95 | `{"t":"block","id":18,"kind":"trigger","p":1,"src":11,"parent":16}` | R-09 block 18 (trigger), every reference kept | 119 |
| 96 | `{"t":"block","id":19,"kind":"search","p":1,"src":11,"amount":3,"parent":18}` | R-09 block 19 (search); targets element dropped (full 16 is unmaterialized); targets removed: no element left; options element dropped (full 16 is unmaterialized); options element dropped (full 17 is unmaterialized); options element dropped (full 18 is unmaterialized); options removed: no element left | 123 |
| 97 | `{"t":"block","id":20,"kind":"draw","p":1,"src":11,"amount":1,"parent":18}` | R-09 block 20 (draw); targets element dropped (full 16 is unmaterialized); targets removed: no element left | 125 |
| 98 | `{"t":"remove","e":9}` | R-17 lose track (full 5, the moving card) | 128 |
| 99 | `{"t":"set","e":"p2","a":{"handCount":1}}` | R-07 set of a known entity (full p2) | 129 |
| 100 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 130 |
| 101 | `{"t":"step","seq":8}` | R-10 step | 131 |
| 102 | `{"t":"block","id":21,"kind":"pass","p":1}` | R-09 block 21 (pass), every reference kept | 132 |
| 103 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 133 |
| 104 | `{"t":"step","seq":9}` | R-10 step | 134 |
| 105 | `{"t":"block","id":22,"kind":"pass","p":2}` | R-09 block 22 (pass), every reference kept | 135 |
| 106 | `{"t":"block","id":23,"kind":"regroup"}` | R-09 block 23 (regroup), every reference kept | 136 |
| 107 | `{"t":"block","id":24,"kind":"draw","p":1,"amount":2,"parent":23,"group":1}` | R-09 block 24 (draw); targets element dropped (full 19 is unmaterialized); targets element dropped (full 20 is unmaterialized); targets removed: no element left | 141 |
| 108 | `{"t":"block","id":25,"kind":"draw","p":2,"amount":2,"parent":23,"group":1}` | R-09 block 25 (draw); targets element dropped (full 21 is unmaterialized); targets element dropped (full 22 is unmaterialized); targets removed: no element left | 142 |
| 109 | `{"t":"set","e":"p1","a":{"deckCount":23,"handCount":4}}` | R-07 set of a known entity (full p1) | 143 |
| 110 | `{"t":"set","e":"p2","a":{"deckCount":22,"handCount":3}}` | R-07 set of a known entity (full p2) | 144 |
| 111 | `{"t":"set","e":"g","a":{"phase":"regroup","active":null}}` | R-07 set of a known entity (full g) | 145 |
| 112 | `{"t":"step","seq":10}` | R-10 step | 146 |

## `full` records that emit nothing

- `full` line 60: R-02 nothing: full 5 unmaterialized
- `full` line 61: R-02 nothing: full 6 unmaterialized
- `full` line 62: R-02 nothing: full 7 unmaterialized
- `full` line 63: R-02 nothing: full 8 unmaterialized
- `full` line 64: R-02 nothing: full 9 unmaterialized
- `full` line 65: R-02 nothing: full 10 unmaterialized
- `full` line 66: R-02 nothing: full 11 unmaterialized
- `full` line 105: R-04 nothing (full 5)
- `full` line 106: R-04 nothing (full 7)
- `full` line 120: R-02 nothing: full 16 unmaterialized
- `full` line 121: R-02 nothing: full 17 unmaterialized
- `full` line 122: R-02 nothing: full 18 unmaterialized
- `full` line 124: R-05 nothing (full 16)
- `full` line 126: R-08 nothing: unmaterialized (full 17)
- `full` line 127: R-08 nothing: unmaterialized (full 18)
- `full` line 128: R-08 nothing: unmaterialized (full 5)
- `full` line 137: R-02 nothing: full 19 unmaterialized
- `full` line 138: R-02 nothing: full 20 unmaterialized
- `full` line 139: R-02 nothing: full 21 unmaterialized
- `full` line 140: R-02 nothing: full 22 unmaterialized
