# `hand-loss-u.public.swupgn`

This file is `hand-loss-u.full.swupgn` redacted by SPEC §11 for nobody (`public`): a seat is in an audience only when it is `"all"`. These notes are hand-reviewed and informative; the vector files are the normative part.

This is the `-u` variant: at step 17 P1 resources Underworld Thug (`full` 26), a card P2 never saw. This file is byte-identical to `hand-loss-x.public.swupgn`, although the `full` files differ.

## Scenario

Losing track in a hidden hand (§10.3, R-17), from the viewpoint of P2, who watches P1's hand. The two variants `hand-loss-x` and `hand-loss-u` are the same game except at step 17: in `-x` P1 resources Battlefield Marine (`full` 5), a card P2 knows; in `-u` P1 resources Underworld Thug (`full` 26), a card P2 has never seen. Their `p2` files are byte-identical, and so are their `public` files (case b).

| Step | What happens | Case |
|---|---|---|
| 0 | Setup (`g.phase` `setup`): bases, leaders and opening hands. Each deck is shuffled (a `shuffle` block per seat) and each seat draws its opening hand (a `draw` block per seat, sharing a `group`). | |
| 1 | The mulligan decision, made by both seats in one step (W-39): both keep, a `mulligan` block each with `amount` 0. | |
| 2 | The opening resources, chosen by both seats in one step, P1 (which has the initiative) first. A `resource` block each, sharing a `group` (W-65). The action phase begins: `g.phase` becomes `action` and `g.active` 1. | |
| 3 | P1 plays Battlefield Marine (X, `full` 5). | |
| 4 | P2 deploys Barriss Offee (`LOF#013`, `full` 4). | |
| 5 | P1 plays Ima-Gun Di (`HMW#044`, `full` 6). | |
| 6 | P2 attaches Stolen Starpath Unit (`SEC#210`) to Barriss. | |
| 7 | P1 plays Consular Security Force (Z, `full` 7). | |
| 8 | Barriss attacks Ima-Gun Di. The granted On Attack names a card, and P1 reveals the whole hand to everyone: Captain Vaughn, Sneak Attack, C-3PO, Liberated Slaves, Swoop Racer, Cassian Andor (`full` 8 to 13). Ima-Gun Di is defeated; his When Defeated resources Cassian Andor (E) from that hand, then the top card of the deck. | (e) |
| 9 | P1 plays Captain Vaughn, which P2 forgot in step 8. | (f) |
| 10 | P2 Waylays Consular Security Force back to P1's hand. | |
| 11 | P1 plays Sneak Attack and through it C-3PO (K, `full` 10), ready, with a delayed effect on him. | |
| 12 | P2 plays Dragon's Might on Vaughn. His When Defeated draws Underworld Thug (U, `full` 26) and puts Consular Security Force from hand on top of the deck. | (d) |
| 13 | P1 plays Liberated Slaves (Y, `full` 11). | |
| 14 | P2 Waylays Battlefield Marine back to P1's hand. | |
| 15 | P1 uses C-3PO: he returns to P1's hand as the cost, and Liberated Slaves gets +2/+2 for this phase. The new effect's `src` is C-3PO, now in P1's hand. The Sneak Attack effect on him ends. | ref |
| 17 | Han Solo (`SOR#017`) puts a card from P1's hand into play as a resource: X in `-x`, U in `-u`. Before the move P1's hand holds Swoop Racer (forgotten in step 8), Underworld Thug (never seen by P2), Battlefield Marine and C-3PO (both known to P2). | (a) (b) (c) |
| 19 | P1 plays C-3PO, forgotten in step 17. | (f) |
| 21 | P1 plays Cassian Andor from the resource row with Smuggle. Its replacement resource comes from the deck. | (g) |

Steps 0 and 1 are the setup decisions (mulligans, then opening resources: both seats in one step each, W-39); steps 16, 18, 20 and 22 are passes by P2.

## Cases

- **(a)** Step 17 in `p2`, `-x`: a `remove` of X's output id comes before the fresh anonymous resource, which has `to` [1] and only `exhausted`. The `resource` block, written before the move (W-66), has no `targets` and no `text`.
- **(b)** Step 17 in `p2`, `-u`: U was never known, but the records are the same as in `-x`, byte for byte.
- **(c)** Step 17: P2 knows X and C-3PO in that hand. Both are removed, in ascending output id; `handCount` changes only by the card that left.
- **(d)** Step 12: putting Consular Security Force into the deck is a `remove` of a hand card. P2 knew it from step 10, so step 0 removes it and step 8 emits nothing more. The search and draw blocks keep `amount` and lose their references.
- **(e)** Step 8: P2 was shown every card in that hand a moment before Cassian Andor was resourced, and still loses track of all six (R-17 has no reveal exception).
- **(f)** Steps 9 and 19: a forgotten card played from hand is created afresh, with its identity, on the `reveal` that W-44 requires (R-03, unmaterialized branch), and then moved by the `set`.
- **(g)** Step 21: Cassian Andor was forgotten in step 8 and then became anonymous in the resource row. Its `reveal` removes the anonymous entity and creates it afresh as a known one (R-03, anonymous branch).
- **Blocks and references.** The `look` block of step 8 and both `resource` blocks naming a hand card lose their `targets` in `p2` and `public`, even though the cards were shown to everyone (R-09, §10.3). Each `play` block is written after the move to a public zone and keeps its `src`. In step 15 the C-3PO effect is created with its `src` in P1's hand: `p2` and `public` drop `src`, and its `text` with it (§11.1).

## Readings used by every vector

- **Header, `DECKS`, `CARDS` (R-11).** Every tag that SPEC §5.1 or §5.2 defines is kept except `Seed`, any other tag is dropped (W-67), and `Visibility` is rewritten. The viewer's own `DECKS` line is kept without `order`. The other line (both lines in `public`) keeps `p`, `leaders` and `base`, sets `complete` to `false`, and lists one `[id]` per distinct card id that this file's `create` and `reveal` records give to an entity of that seat, in the order this file first gives each, leaving out `TOKEN:` ids and the line's own leaders and base. `CARDS` keeps the `full` lines, in their order, whose id appears in this file's header, `DECKS` or `RECORDS`.
- **Empty `a`.** A `create` made by step 3 or step 5 for an entity that has no attributes (a hand card) carries no `a` key, rather than `"a":{}`.
- **Fresh ids (R-14).** Output ids are handed out 1, 2, 3, … in the order the output first uses them. An id removed by step 0, 3, 6 or 8 is never used again.
- **The game itself is illustrative.** Costs and resource payments are not modelled, decks are short, and some timing is simplified. The records, and what each profile may know, are what the vector tests.

## Records

Each line of `RECORDS` in `hand-loss-u.public.swupgn`, with the step of SPEC §11.2 that produced it and the `full` record it came from. Entity ids in the "Step" column are `full` ids; ids in the "Record" column are this file's own.

| Line | Record | Step | From `full` line |
|---|---|---|---|
| 43 | `{"t":"set","e":"g","a":{"round":1,"phase":"setup","initiative":1,"initiativeTaken":false}}` | R-07 set of a known entity (full g) | 57 |
| 44 | `{"t":"set","e":"p1","a":{"deckCount":37,"handCount":9,"credits":0,"force":false}}` | R-07 set of a known entity (full p1) | 58 |
| 45 | `{"t":"set","e":"p2","a":{"deckCount":22,"handCount":5,"credits":0,"force":false}}` | R-07 set of a known entity (full p2) | 59 |
| 46 | `{"t":"create","e":1,"zone":"base","owner":1,"card":"SOR#026","a":{"kind":"base","damage":0,"hp":30}}` | R-01 create, audience "all" holds viewer (full 1) | 60 |
| 47 | `{"t":"create","e":2,"zone":"base","owner":1,"card":"SOR#017","a":{"kind":"leader","exhausted":false,"deploy…` | R-01 create, audience "all" holds viewer (full 2) | 61 |
| 48 | `{"t":"create","e":3,"zone":"base","owner":2,"card":"SOR#029","a":{"kind":"base","damage":0,"hp":28}}` | R-01 create, audience "all" holds viewer (full 3) | 62 |
| 49 | `{"t":"create","e":4,"zone":"base","owner":2,"card":"LOF#013","a":{"kind":"leader","exhausted":false,"deploy…` | R-01 create, audience "all" holds viewer (full 4) | 63 |
| 50 | `{"t":"block","id":1,"kind":"shuffle","p":1,"amount":0}` | R-09 block 1 (shuffle), every reference kept | 64 |
| 51 | `{"t":"block","id":2,"kind":"shuffle","p":2,"amount":0}` | R-09 block 2 (shuffle), every reference kept | 65 |
| 52 | `{"t":"block","id":3,"kind":"draw","p":1,"amount":9,"group":2}` | R-09 block 3 (draw); targets element dropped (full 5 is unmaterialized); targets element dropped (full 6 is unmaterialized); targets element dropped (full 7 is unmaterialized); targets element dropped (full 8 is unmaterialized); targets element dropped (full 9 is unmaterialized); targets element dropped (full 10 is unmaterialized); targets element dropped (full 11 is unmaterialized); targets element dropped (full 12 is unmaterialized); targets element dropped (full 13 is unmaterialized); targets removed: no element left | 80 |
| 53 | `{"t":"block","id":4,"kind":"draw","p":2,"amount":5,"group":2}` | R-09 block 4 (draw); targets element dropped (full 14 is unmaterialized); targets element dropped (full 15 is unmaterialized); targets element dropped (full 16 is unmaterialized); targets element dropped (full 17 is unmaterialized); targets element dropped (full 18 is unmaterialized); targets removed: no element left | 81 |
| 54 | `{"t":"step","seq":0}` | R-10 step | 82 |
| 55 | `{"t":"block","id":5,"kind":"mulligan","p":1,"amount":0}` | R-09 block 5 (mulligan), every reference kept | 83 |
| 56 | `{"t":"block","id":6,"kind":"mulligan","p":2,"amount":0}` | R-09 block 6 (mulligan), every reference kept | 84 |
| 57 | `{"t":"step","seq":1}` | R-10 step | 85 |
| 58 | `{"t":"create","e":5,"zone":"resource","owner":1,"to":[1],"a":{"exhausted":false}}` | R-02 anonymous create (full 19) | 86 |
| 59 | `{"t":"create","e":6,"zone":"resource","owner":1,"to":[1],"a":{"exhausted":false}}` | R-02 anonymous create (full 20) | 87 |
| 60 | `{"t":"create","e":7,"zone":"resource","owner":2,"to":[2],"a":{"exhausted":false}}` | R-02 anonymous create (full 21) | 88 |
| 61 | `{"t":"create","e":8,"zone":"resource","owner":2,"to":[2],"a":{"exhausted":false}}` | R-02 anonymous create (full 22) | 89 |
| 62 | `{"t":"create","e":9,"zone":"resource","owner":2,"to":[2],"a":{"exhausted":false}}` | R-02 anonymous create (full 23) | 90 |
| 63 | `{"t":"block","id":7,"kind":"resource","p":1,"amount":2,"group":3}` | R-09 block 7 (resource); targets element dropped (full 19 is anonymous); targets element dropped (full 20 is anonymous); targets removed: no element left | 91 |
| 64 | `{"t":"block","id":8,"kind":"resource","p":2,"amount":3,"group":3}` | R-09 block 8 (resource); targets element dropped (full 21 is anonymous); targets element dropped (full 22 is anonymous); targets element dropped (full 23 is anonymous); targets removed: no element left | 92 |
| 65 | `{"t":"set","e":"g","a":{"phase":"action","active":1}}` | R-07 set of a known entity (full g) | 93 |
| 66 | `{"t":"step","seq":2}` | R-10 step | 94 |
| 67 | `{"t":"create","e":10,"zone":"hand","owner":1,"card":"SOR#095","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 5) | 95 |
| 68 | `{"t":"set","e":10,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":3,"hp":3}}` | R-07 set of a known entity (full 5) | 96 |
| 69 | `{"t":"block","id":9,"kind":"play","p":1,"src":10}` | R-09 block 9 (play), every reference kept | 97 |
| 70 | `{"t":"set","e":"p1","a":{"handCount":8}}` | R-07 set of a known entity (full p1) | 98 |
| 71 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 99 |
| 72 | `{"t":"step","seq":3}` | R-10 step | 100 |
| 73 | `{"t":"block","id":10,"kind":"deploy","p":2,"src":4}` | R-09 block 10 (deploy), every reference kept | 101 |
| 74 | `{"t":"set","e":4,"zone":"ground","a":{"damage":0,"power":4,"hp":7,"deployed":true,"epicActionUsed":true}}` | R-07 set of a known entity (full 4) | 102 |
| 75 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 103 |
| 76 | `{"t":"step","seq":4}` | R-10 step | 104 |
| 77 | `{"t":"create","e":11,"zone":"hand","owner":1,"card":"HMW#044","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 6) | 105 |
| 78 | `{"t":"set","e":11,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":5,"hp":3}}` | R-07 set of a known entity (full 6) | 106 |
| 79 | `{"t":"block","id":11,"kind":"play","p":1,"src":11}` | R-09 block 11 (play), every reference kept | 107 |
| 80 | `{"t":"set","e":"p1","a":{"handCount":7}}` | R-07 set of a known entity (full p1) | 108 |
| 81 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 109 |
| 82 | `{"t":"step","seq":5}` | R-10 step | 110 |
| 83 | `{"t":"create","e":12,"zone":"hand","owner":2,"card":"SEC#210","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 16) | 111 |
| 84 | `{"t":"set","e":12,"zone":"ground","parent":4,"rel":"attached","a":{"kind":"upgrade"}}` | R-07 set of a known entity (full 16) | 112 |
| 85 | `{"t":"block","id":12,"kind":"play","p":2,"src":12,"targets":[4]}` | R-09 block 12 (play), every reference kept | 113 |
| 86 | `{"t":"set","e":4,"a":{"power":5,"hp":8}}` | R-07 set of a known entity (full 4) | 114 |
| 87 | `{"t":"set","e":"p2","a":{"handCount":4}}` | R-07 set of a known entity (full p2) | 115 |
| 88 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 116 |
| 89 | `{"t":"step","seq":6}` | R-10 step | 117 |
| 90 | `{"t":"create","e":13,"zone":"hand","owner":1,"card":"SOR#046","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 7) | 118 |
| 91 | `{"t":"set","e":13,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":3,"hp":7}}` | R-07 set of a known entity (full 7) | 119 |
| 92 | `{"t":"block","id":13,"kind":"play","p":1,"src":13}` | R-09 block 13 (play), every reference kept | 120 |
| 93 | `{"t":"set","e":"p1","a":{"handCount":6}}` | R-07 set of a known entity (full p1) | 121 |
| 94 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 122 |
| 95 | `{"t":"step","seq":7}` | R-10 step | 123 |
| 96 | `{"t":"block","id":14,"kind":"attack","p":2,"src":4,"targets":[11]}` | R-09 block 14 (attack), every reference kept | 124 |
| 97 | `{"t":"set","e":4,"a":{"exhausted":true}}` | R-07 set of a known entity (full 4) | 125 |
| 98 | `{"t":"block","id":15,"kind":"trigger","p":2,"src":4,"parent":14,"via":12}` | R-09 block 15 (trigger), every reference kept | 126 |
| 99 | `{"t":"block","id":16,"kind":"name","p":2,"src":4,"parent":15,"text":"Wampa"}` | R-09 block 16 (name), every reference kept | 127 |
| 100 | `{"t":"create","e":14,"zone":"hand","owner":1,"card":"TS26#039","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 8) | 128 |
| 101 | `{"t":"create","e":15,"zone":"hand","owner":1,"card":"SOR#219","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 9) | 129 |
| 102 | `{"t":"create","e":16,"zone":"hand","owner":1,"card":"SEC#093","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 10) | 130 |
| 103 | `{"t":"create","e":17,"zone":"hand","owner":1,"card":"SHD#200","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 11) | 131 |
| 104 | `{"t":"create","e":18,"zone":"hand","owner":1,"card":"SOR#210","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 12) | 132 |
| 105 | `{"t":"create","e":19,"zone":"hand","owner":1,"card":"SHD#148","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 13) | 133 |
| 106 | `{"t":"block","id":17,"kind":"look","p":2,"src":4,"amount":6,"parent":15}` | R-09 block 17 (look); targets element dropped (full 8 is in a hand that is not the viewer's); targets element dropped (full 9 is in a hand that is not the viewer's); targets element dropped (full 10 is in a hand that is not the viewer's); targets element dropped (full 11 is in a hand that is not the viewer's); targets element dropped (full 12 is in a hand that is not the viewer's); targets element dropped (full 13 is in a hand that is not the viewer's); targets removed: no element left | 134 |
| 107 | `{"t":"block","id":18,"kind":"damage","p":2,"src":4,"targets":[11],"amount":5,"parent":14,"group":1}` | R-09 block 18 (damage), every reference kept | 135 |
| 108 | `{"t":"block","id":19,"kind":"damage","p":1,"src":11,"targets":[4],"amount":5,"parent":14,"group":1}` | R-09 block 19 (damage), every reference kept | 136 |
| 109 | `{"t":"set","e":4,"a":{"damage":5}}` | R-07 set of a known entity (full 4) | 137 |
| 110 | `{"t":"block","id":20,"kind":"defeat","p":2,"src":4,"targets":[11],"parent":14}` | R-09 block 20 (defeat), every reference kept | 138 |
| 111 | `{"t":"set","e":11,"zone":"discard","a":{"exhausted":null,"damage":null,"power":null,"hp":null}}` | R-07 set of a known entity (full 6) | 139 |
| 112 | `{"t":"block","id":21,"kind":"trigger","p":1,"src":11,"parent":14}` | R-09 block 21 (trigger), every reference kept | 140 |
| 113 | `{"t":"block","id":22,"kind":"resource","p":1,"src":11,"amount":1,"parent":21}` | R-09 block 22 (resource); targets element dropped (full 13 is in a hand that is not the viewer's); targets removed: no element left | 141 |
| 114 | `{"t":"remove","e":14}` | R-17 lose track (full 8) | 142 |
| 115 | `{"t":"remove","e":15}` | R-17 lose track (full 9) | 142 |
| 116 | `{"t":"remove","e":16}` | R-17 lose track (full 10) | 142 |
| 117 | `{"t":"remove","e":17}` | R-17 lose track (full 11) | 142 |
| 118 | `{"t":"remove","e":18}` | R-17 lose track (full 12) | 142 |
| 119 | `{"t":"remove","e":19}` | R-17 lose track (full 13, the moving card) | 142 |
| 120 | `{"t":"create","e":20,"zone":"resource","owner":1,"to":[1],"a":{"exhausted":true}}` | R-05 anonymous create after set (full 13) | 142 |
| 121 | `{"t":"create","e":21,"zone":"resource","owner":1,"to":[1],"a":{"exhausted":true}}` | R-02 anonymous create (full 24) | 143 |
| 122 | `{"t":"block","id":23,"kind":"resource","p":1,"src":11,"amount":1,"parent":21}` | R-09 block 23 (resource); targets element dropped (full 24 is anonymous); targets removed: no element left | 144 |
| 123 | `{"t":"set","e":"p1","a":{"deckCount":36,"handCount":5}}` | R-07 set of a known entity (full p1) | 145 |
| 124 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 146 |
| 125 | `{"t":"step","seq":8}` | R-10 step | 147 |
| 126 | `{"t":"create","e":22,"zone":"hand","owner":1,"card":"TS26#039","to":"all"}` | R-03 reveal of an unmaterialized (forgotten) entity: fresh known create (full 8) | 148 |
| 127 | `{"t":"set","e":22,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":2,"hp":5}}` | R-07 set of a known entity (full 8) | 149 |
| 128 | `{"t":"block","id":24,"kind":"play","p":1,"src":22}` | R-09 block 24 (play), every reference kept | 150 |
| 129 | `{"t":"set","e":"p1","a":{"handCount":4}}` | R-07 set of a known entity (full p1) | 151 |
| 130 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 152 |
| 131 | `{"t":"step","seq":9}` | R-10 step | 153 |
| 132 | `{"t":"create","e":23,"zone":"hand","owner":2,"card":"TWI#226","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 14) | 154 |
| 133 | `{"t":"set","e":23,"zone":"discard","a":{"kind":"event"}}` | R-07 set of a known entity (full 14) | 155 |
| 134 | `{"t":"block","id":25,"kind":"play","p":2,"src":23,"targets":[13]}` | R-09 block 25 (play), every reference kept | 156 |
| 135 | `{"t":"set","e":13,"zone":"hand","a":{"exhausted":null,"damage":null,"power":null,"hp":null}}` | R-07 set of a known entity (full 7) | 157 |
| 136 | `{"t":"set","e":"p1","a":{"handCount":5}}` | R-07 set of a known entity (full p1) | 158 |
| 137 | `{"t":"set","e":"p2","a":{"handCount":3}}` | R-07 set of a known entity (full p2) | 159 |
| 138 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 160 |
| 139 | `{"t":"step","seq":10}` | R-10 step | 161 |
| 140 | `{"t":"create","e":24,"zone":"hand","owner":1,"card":"SOR#219","to":"all"}` | R-03 reveal of an unmaterialized (forgotten) entity: fresh known create (full 9) | 162 |
| 141 | `{"t":"set","e":24,"zone":"discard","a":{"kind":"event"}}` | R-07 set of a known entity (full 9) | 163 |
| 142 | `{"t":"block","id":26,"kind":"play","p":1,"src":24}` | R-09 block 26 (play), every reference kept | 164 |
| 143 | `{"t":"create","e":25,"zone":"hand","owner":1,"card":"SEC#093","to":"all"}` | R-03 reveal of an unmaterialized (forgotten) entity: fresh known create (full 10) | 165 |
| 144 | `{"t":"set","e":25,"zone":"ground","a":{"kind":"unit","exhausted":false,"damage":0,"power":1,"hp":3}}` | R-07 set of a known entity (full 10) | 166 |
| 145 | `{"t":"block","id":27,"kind":"play","p":1,"src":25,"parent":26,"via":24}` | R-09 block 27 (play), every reference kept | 167 |
| 146 | `{"t":"create","e":26,"owner":1,"to":"all","a":{"kind":"effect","src":24,"targets":[25],"duration":"delayed"…` | R-01 create, audience "all" holds viewer (full 25) | 168 |
| 147 | `{"t":"set","e":"p1","a":{"handCount":3}}` | R-07 set of a known entity (full p1) | 169 |
| 148 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 170 |
| 149 | `{"t":"step","seq":11}` | R-10 step | 171 |
| 150 | `{"t":"create","e":27,"zone":"hand","owner":2,"card":"HMW#102","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 17) | 172 |
| 151 | `{"t":"set","e":27,"zone":"discard","a":{"kind":"event"}}` | R-07 set of a known entity (full 17) | 173 |
| 152 | `{"t":"block","id":28,"kind":"play","p":2,"src":27,"targets":[22]}` | R-09 block 28 (play), every reference kept | 174 |
| 153 | `{"t":"block","id":29,"kind":"defeat","p":2,"src":27,"targets":[22],"parent":28}` | R-09 block 29 (defeat), every reference kept | 175 |
| 154 | `{"t":"set","e":22,"zone":"discard","a":{"exhausted":null,"damage":null,"power":null,"hp":null}}` | R-07 set of a known entity (full 8) | 176 |
| 155 | `{"t":"block","id":30,"kind":"trigger","p":1,"src":22,"parent":28}` | R-09 block 30 (trigger), every reference kept | 177 |
| 156 | `{"t":"block","id":31,"kind":"search","p":1,"src":22,"amount":3,"parent":30}` | R-09 block 31 (search); targets element dropped (full 26 is unmaterialized); targets removed: no element left; options element dropped (full 26 is unmaterialized); options element dropped (full 27 is unmaterialized); options element dropped (full 28 is unmaterialized); options removed: no element left | 181 |
| 157 | `{"t":"block","id":32,"kind":"draw","p":1,"src":22,"amount":1,"parent":30}` | R-09 block 32 (draw); targets element dropped (full 26 is unmaterialized); targets removed: no element left | 183 |
| 158 | `{"t":"remove","e":13}` | R-17 lose track (full 7, the moving card) | 186 |
| 159 | `{"t":"set","e":"p2","a":{"handCount":2}}` | R-07 set of a known entity (full p2) | 187 |
| 160 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 188 |
| 161 | `{"t":"step","seq":12}` | R-10 step | 189 |
| 162 | `{"t":"create","e":28,"zone":"hand","owner":1,"card":"SHD#200","to":"all"}` | R-03 reveal of an unmaterialized (forgotten) entity: fresh known create (full 11) | 190 |
| 163 | `{"t":"set","e":28,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":3,"hp":5}}` | R-07 set of a known entity (full 11) | 191 |
| 164 | `{"t":"block","id":33,"kind":"play","p":1,"src":28}` | R-09 block 33 (play), every reference kept | 192 |
| 165 | `{"t":"set","e":"p1","a":{"handCount":2}}` | R-07 set of a known entity (full p1) | 193 |
| 166 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 194 |
| 167 | `{"t":"step","seq":13}` | R-10 step | 195 |
| 168 | `{"t":"create","e":29,"zone":"hand","owner":2,"card":"TWI#226","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 15) | 196 |
| 169 | `{"t":"set","e":29,"zone":"discard","a":{"kind":"event"}}` | R-07 set of a known entity (full 15) | 197 |
| 170 | `{"t":"block","id":34,"kind":"play","p":2,"src":29,"targets":[10]}` | R-09 block 34 (play), every reference kept | 198 |
| 171 | `{"t":"set","e":10,"zone":"hand","a":{"exhausted":null,"damage":null,"power":null,"hp":null}}` | R-07 set of a known entity (full 5) | 199 |
| 172 | `{"t":"set","e":"p1","a":{"handCount":3}}` | R-07 set of a known entity (full p1) | 200 |
| 173 | `{"t":"set","e":"p2","a":{"handCount":1}}` | R-07 set of a known entity (full p2) | 201 |
| 174 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 202 |
| 175 | `{"t":"step","seq":14}` | R-10 step | 203 |
| 176 | `{"t":"block","id":35,"kind":"ability","p":1,"src":25,"targets":[28]}` | R-09 block 35 (ability), every reference kept | 204 |
| 177 | `{"t":"set","e":25,"zone":"hand","a":{"exhausted":null,"damage":null,"power":null,"hp":null}}` | R-07 set of a known entity (full 10) | 205 |
| 178 | `{"t":"remove","e":26}` | R-08 remove (full 25) | 206 |
| 179 | `{"t":"create","e":30,"owner":1,"to":"all","a":{"kind":"effect","targets":[28],"duration":"phase"}}` | R-01 create, audience "all" holds viewer (full 29); src dropped (full 10 is in a hand that is not the viewer's); text dropped with it | 207 |
| 180 | `{"t":"set","e":28,"a":{"power":5,"hp":7}}` | R-07 set of a known entity (full 11) | 208 |
| 181 | `{"t":"set","e":"p1","a":{"handCount":4}}` | R-07 set of a known entity (full p1) | 209 |
| 182 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 210 |
| 183 | `{"t":"step","seq":15}` | R-10 step | 211 |
| 184 | `{"t":"block","id":36,"kind":"pass","p":2}` | R-09 block 36 (pass), every reference kept | 212 |
| 185 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 213 |
| 186 | `{"t":"step","seq":16}` | R-10 step | 214 |
| 187 | `{"t":"block","id":37,"kind":"ability","p":1,"src":2}` | R-09 block 37 (ability), every reference kept | 215 |
| 188 | `{"t":"set","e":2,"a":{"exhausted":true}}` | R-07 set of a known entity (full 2) | 216 |
| 189 | `{"t":"block","id":38,"kind":"resource","p":1,"src":2,"amount":1,"parent":37}` | R-09 block 38 (resource); targets element dropped (full 26 is unmaterialized); targets removed: no element left | 217 |
| 190 | `{"t":"remove","e":10}` | R-17 lose track (full 5) | 218 |
| 191 | `{"t":"remove","e":25}` | R-17 lose track (full 10) | 218 |
| 192 | `{"t":"create","e":31,"zone":"resource","owner":1,"to":[1],"a":{"exhausted":false}}` | R-05 anonymous create after set (full 26) | 218 |
| 193 | `{"t":"create","e":32,"owner":1,"to":"all","a":{"kind":"effect","src":2,"targets":["p1"],"duration":"delayed…` | R-01 create, audience "all" holds viewer (full 30) | 219 |
| 194 | `{"t":"set","e":"p1","a":{"handCount":3}}` | R-07 set of a known entity (full p1) | 220 |
| 195 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 221 |
| 196 | `{"t":"step","seq":17}` | R-10 step | 222 |
| 197 | `{"t":"block","id":39,"kind":"pass","p":2}` | R-09 block 39 (pass), every reference kept | 223 |
| 198 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 224 |
| 199 | `{"t":"step","seq":18}` | R-10 step | 225 |
| 200 | `{"t":"create","e":33,"zone":"hand","owner":1,"card":"SEC#093","to":"all","a":{"kind":"unit"}}` | R-03 reveal of an unmaterialized (forgotten) entity: fresh known create (full 10) | 226 |
| 201 | `{"t":"set","e":33,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":1,"hp":3}}` | R-07 set of a known entity (full 10) | 227 |
| 202 | `{"t":"block","id":40,"kind":"play","p":1,"src":33}` | R-09 block 40 (play), every reference kept | 228 |
| 203 | `{"t":"set","e":"p1","a":{"handCount":2}}` | R-07 set of a known entity (full p1) | 229 |
| 204 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 230 |
| 205 | `{"t":"step","seq":19}` | R-10 step | 231 |
| 206 | `{"t":"block","id":41,"kind":"pass","p":2}` | R-09 block 41 (pass), every reference kept | 232 |
| 207 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 233 |
| 208 | `{"t":"step","seq":20}` | R-10 step | 234 |
| 209 | `{"t":"remove","e":20}` | R-03 reveal of an anonymous entity: remove its output id (full 13) | 235 |
| 210 | `{"t":"create","e":34,"zone":"resource","owner":1,"card":"SHD#148","to":"all","a":{"exhausted":true}}` | R-03 reveal of an anonymous entity: fresh known create (full 13) | 235 |
| 211 | `{"t":"set","e":34,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":3,"hp":5}}` | R-07 set of a known entity (full 13) | 236 |
| 212 | `{"t":"block","id":42,"kind":"play","p":1,"src":34}` | R-09 block 42 (play), every reference kept | 237 |
| 213 | `{"t":"create","e":35,"zone":"resource","owner":1,"to":[1],"a":{"exhausted":true}}` | R-02 anonymous create (full 31) | 238 |
| 214 | `{"t":"block","id":43,"kind":"resource","p":1,"src":34,"amount":1,"parent":42}` | R-09 block 43 (resource); targets element dropped (full 31 is anonymous); targets removed: no element left | 239 |
| 215 | `{"t":"block","id":44,"kind":"trigger","p":1,"src":34,"parent":42}` | R-09 block 44 (trigger), every reference kept | 240 |
| 216 | `{"t":"set","e":34,"a":{"exhausted":false}}` | R-07 set of a known entity (full 13) | 241 |
| 217 | `{"t":"set","e":"p1","a":{"deckCount":35}}` | R-07 set of a known entity (full p1) | 242 |
| 218 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 243 |
| 219 | `{"t":"step","seq":21}` | R-10 step | 244 |
| 220 | `{"t":"block","id":45,"kind":"pass","p":2}` | R-09 block 45 (pass), every reference kept | 245 |
| 221 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 246 |
| 222 | `{"t":"step","seq":22}` | R-10 step | 247 |

## `full` records that emit nothing

- `full` line 66: R-02 nothing: full 5 unmaterialized
- `full` line 67: R-02 nothing: full 6 unmaterialized
- `full` line 68: R-02 nothing: full 7 unmaterialized
- `full` line 69: R-02 nothing: full 8 unmaterialized
- `full` line 70: R-02 nothing: full 9 unmaterialized
- `full` line 71: R-02 nothing: full 10 unmaterialized
- `full` line 72: R-02 nothing: full 11 unmaterialized
- `full` line 73: R-02 nothing: full 12 unmaterialized
- `full` line 74: R-02 nothing: full 13 unmaterialized
- `full` line 75: R-02 nothing: full 14 unmaterialized
- `full` line 76: R-02 nothing: full 15 unmaterialized
- `full` line 77: R-02 nothing: full 16 unmaterialized
- `full` line 78: R-02 nothing: full 17 unmaterialized
- `full` line 79: R-02 nothing: full 18 unmaterialized
- `full` line 178: R-02 nothing: full 26 unmaterialized
- `full` line 179: R-02 nothing: full 27 unmaterialized
- `full` line 180: R-02 nothing: full 28 unmaterialized
- `full` line 182: R-05 nothing (full 26)
- `full` line 184: R-08 nothing: unmaterialized (full 27)
- `full` line 185: R-08 nothing: unmaterialized (full 28)
- `full` line 186: R-08 nothing: unmaterialized (full 7)
