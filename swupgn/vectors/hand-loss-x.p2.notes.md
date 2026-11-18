# `hand-loss-x.p2.swupgn`

This file is `hand-loss-x.full.swupgn` redacted by SPEC §11 for seat 2 (`perspective:2`). These notes are hand-reviewed and informative; the vector files are the normative part.

This is the `-x` variant: at step 17 P1 resources Battlefield Marine (`full` 5), a card P2 knows. This file is byte-identical to `hand-loss-u.p2.swupgn`.

## Scenario

Losing track in a hidden hand (§10.3, R-17), from the viewpoint of P2, who watches P1's hand. The two variants `hand-loss-x` and `hand-loss-u` are the same game except at step 17: in `-x` P1 resources Battlefield Marine (`full` 5), a card P2 knows; in `-u` P1 resources Underworld Thug (`full` 26), a card P2 has never seen. Their `p2` files are byte-identical, and so are their `public` files (case b).

| Step | What happens | Case |
|---|---|---|
| 0 | Setup (`g.phase` `setup`): bases, leaders and opening hands. | |
| 1 | The mulligan decision, made by both seats in one step (W-39): both keep, so the step group is empty. | |
| 2 | The opening resources, chosen by both seats in one step, P1 (which has the initiative) first. The action phase begins: `g.phase` becomes `action` and `g.active` 1. | |
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

Each line of `RECORDS` in `hand-loss-x.p2.swupgn`, with the step of SPEC §11.2 that produced it and the `full` record it came from. Entity ids in the "Step" column are `full` ids; ids in the "Record" column are this file's own.

| Line | Record | Step | From `full` line |
|---|---|---|---|
| 50 | `{"t":"set","e":"g","a":{"round":1,"phase":"setup","initiative":1,"initiativeTaken":false}}` | R-07 set of a known entity (full g) | 57 |
| 51 | `{"t":"set","e":"p1","a":{"deckCount":37,"handCount":9,"credits":0,"force":false}}` | R-07 set of a known entity (full p1) | 58 |
| 52 | `{"t":"set","e":"p2","a":{"deckCount":22,"handCount":5,"credits":0,"force":false}}` | R-07 set of a known entity (full p2) | 59 |
| 53 | `{"t":"create","e":1,"zone":"base","owner":1,"card":"SOR#026","a":{"kind":"base","damage":0,"hp":30}}` | R-01 create, audience "all" holds viewer (full 1) | 60 |
| 54 | `{"t":"create","e":2,"zone":"base","owner":1,"card":"SOR#017","a":{"kind":"leader","exhausted":false,"deploy…` | R-01 create, audience "all" holds viewer (full 2) | 61 |
| 55 | `{"t":"create","e":3,"zone":"base","owner":2,"card":"SOR#029","a":{"kind":"base","damage":0,"hp":28}}` | R-01 create, audience "all" holds viewer (full 3) | 62 |
| 56 | `{"t":"create","e":4,"zone":"base","owner":2,"card":"LOF#013","a":{"kind":"leader","exhausted":false,"deploy…` | R-01 create, audience "all" holds viewer (full 4) | 63 |
| 57 | `{"t":"create","e":5,"zone":"hand","owner":2,"card":"TWI#226","to":[2]}` | R-01 create, audience [2] holds viewer (full 14) | 73 |
| 58 | `{"t":"create","e":6,"zone":"hand","owner":2,"card":"TWI#226","to":[2]}` | R-01 create, audience [2] holds viewer (full 15) | 74 |
| 59 | `{"t":"create","e":7,"zone":"hand","owner":2,"card":"SEC#210","to":[2]}` | R-01 create, audience [2] holds viewer (full 16) | 75 |
| 60 | `{"t":"create","e":8,"zone":"hand","owner":2,"card":"HMW#102","to":[2]}` | R-01 create, audience [2] holds viewer (full 17) | 76 |
| 61 | `{"t":"create","e":9,"zone":"hand","owner":2,"card":"TWI#253","to":[2]}` | R-01 create, audience [2] holds viewer (full 18) | 77 |
| 62 | `{"t":"step","seq":0}` | R-10 step | 78 |
| 63 | `{"t":"step","seq":1}` | R-10 step | 79 |
| 64 | `{"t":"create","e":10,"zone":"resource","owner":1,"to":[1],"a":{"exhausted":false}}` | R-02 anonymous create (full 19) | 80 |
| 65 | `{"t":"create","e":11,"zone":"resource","owner":1,"to":[1],"a":{"exhausted":false}}` | R-02 anonymous create (full 20) | 81 |
| 66 | `{"t":"create","e":12,"zone":"resource","owner":2,"card":"SOR#062","to":[2],"a":{"exhausted":false}}` | R-01 create, audience [2] holds viewer (full 21) | 82 |
| 67 | `{"t":"create","e":13,"zone":"resource","owner":2,"card":"SOR#064","to":[2],"a":{"exhausted":false}}` | R-01 create, audience [2] holds viewer (full 22) | 83 |
| 68 | `{"t":"create","e":14,"zone":"resource","owner":2,"card":"SOR#066","to":[2],"a":{"exhausted":false}}` | R-01 create, audience [2] holds viewer (full 23) | 84 |
| 69 | `{"t":"set","e":"g","a":{"phase":"action","active":1}}` | R-07 set of a known entity (full g) | 85 |
| 70 | `{"t":"step","seq":2}` | R-10 step | 86 |
| 71 | `{"t":"create","e":15,"zone":"hand","owner":1,"card":"SOR#095","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 5) | 87 |
| 72 | `{"t":"set","e":15,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":3,"hp":3}}` | R-07 set of a known entity (full 5) | 88 |
| 73 | `{"t":"block","id":1,"kind":"play","p":1,"src":15}` | R-09 block 1 (play), every reference kept | 89 |
| 74 | `{"t":"set","e":"p1","a":{"handCount":8}}` | R-07 set of a known entity (full p1) | 90 |
| 75 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 91 |
| 76 | `{"t":"step","seq":3}` | R-10 step | 92 |
| 77 | `{"t":"block","id":2,"kind":"deploy","p":2,"src":4}` | R-09 block 2 (deploy), every reference kept | 93 |
| 78 | `{"t":"set","e":4,"zone":"ground","a":{"damage":0,"power":4,"hp":7,"deployed":true,"epicActionUsed":true}}` | R-07 set of a known entity (full 4) | 94 |
| 79 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 95 |
| 80 | `{"t":"step","seq":4}` | R-10 step | 96 |
| 81 | `{"t":"create","e":16,"zone":"hand","owner":1,"card":"HMW#044","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 6) | 97 |
| 82 | `{"t":"set","e":16,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":5,"hp":3}}` | R-07 set of a known entity (full 6) | 98 |
| 83 | `{"t":"block","id":3,"kind":"play","p":1,"src":16}` | R-09 block 3 (play), every reference kept | 99 |
| 84 | `{"t":"set","e":"p1","a":{"handCount":7}}` | R-07 set of a known entity (full p1) | 100 |
| 85 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 101 |
| 86 | `{"t":"step","seq":5}` | R-10 step | 102 |
| 87 | `{"t":"reveal","e":7,"card":"SEC#210","to":"all"}` | R-03 reveal of a known entity (full 16) | 103 |
| 88 | `{"t":"set","e":7,"zone":"ground","parent":4,"rel":"attached","a":{"kind":"upgrade"}}` | R-07 set of a known entity (full 16) | 104 |
| 89 | `{"t":"block","id":4,"kind":"play","p":2,"src":7,"targets":[4]}` | R-09 block 4 (play), every reference kept | 105 |
| 90 | `{"t":"set","e":4,"a":{"power":5,"hp":8}}` | R-07 set of a known entity (full 4) | 106 |
| 91 | `{"t":"set","e":"p2","a":{"handCount":4}}` | R-07 set of a known entity (full p2) | 107 |
| 92 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 108 |
| 93 | `{"t":"step","seq":6}` | R-10 step | 109 |
| 94 | `{"t":"create","e":17,"zone":"hand","owner":1,"card":"SOR#046","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 7) | 110 |
| 95 | `{"t":"set","e":17,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":3,"hp":7}}` | R-07 set of a known entity (full 7) | 111 |
| 96 | `{"t":"block","id":5,"kind":"play","p":1,"src":17}` | R-09 block 5 (play), every reference kept | 112 |
| 97 | `{"t":"set","e":"p1","a":{"handCount":6}}` | R-07 set of a known entity (full p1) | 113 |
| 98 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 114 |
| 99 | `{"t":"step","seq":7}` | R-10 step | 115 |
| 100 | `{"t":"block","id":6,"kind":"attack","p":2,"src":4,"targets":[16]}` | R-09 block 6 (attack), every reference kept | 116 |
| 101 | `{"t":"set","e":4,"a":{"exhausted":true}}` | R-07 set of a known entity (full 4) | 117 |
| 102 | `{"t":"block","id":7,"kind":"trigger","p":2,"src":4,"parent":6,"via":7}` | R-09 block 7 (trigger), every reference kept | 118 |
| 103 | `{"t":"block","id":8,"kind":"name","p":2,"src":4,"parent":7,"text":"Wampa"}` | R-09 block 8 (name), every reference kept | 119 |
| 104 | `{"t":"create","e":18,"zone":"hand","owner":1,"card":"TS26#039","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 8) | 120 |
| 105 | `{"t":"create","e":19,"zone":"hand","owner":1,"card":"SOR#219","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 9) | 121 |
| 106 | `{"t":"create","e":20,"zone":"hand","owner":1,"card":"SEC#093","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 10) | 122 |
| 107 | `{"t":"create","e":21,"zone":"hand","owner":1,"card":"SHD#200","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 11) | 123 |
| 108 | `{"t":"create","e":22,"zone":"hand","owner":1,"card":"SOR#210","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 12) | 124 |
| 109 | `{"t":"create","e":23,"zone":"hand","owner":1,"card":"SHD#148","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 13) | 125 |
| 110 | `{"t":"block","id":9,"kind":"look","p":2,"src":4,"amount":6,"parent":7}` | R-09 block 9 (look); targets element dropped (full 8 is in a hand that is not the viewer's); targets element dropped (full 9 is in a hand that is not the viewer's); targets element dropped (full 10 is in a hand that is not the viewer's); targets element dropped (full 11 is in a hand that is not the viewer's); targets element dropped (full 12 is in a hand that is not the viewer's); targets element dropped (full 13 is in a hand that is not the viewer's); targets removed: no element left | 126 |
| 111 | `{"t":"block","id":10,"kind":"damage","p":2,"src":4,"targets":[16],"amount":5,"parent":6,"group":1}` | R-09 block 10 (damage), every reference kept | 127 |
| 112 | `{"t":"block","id":11,"kind":"damage","p":1,"src":16,"targets":[4],"amount":5,"parent":6,"group":1}` | R-09 block 11 (damage), every reference kept | 128 |
| 113 | `{"t":"set","e":4,"a":{"damage":5}}` | R-07 set of a known entity (full 4) | 129 |
| 114 | `{"t":"block","id":12,"kind":"defeat","p":2,"src":4,"targets":[16],"parent":6}` | R-09 block 12 (defeat), every reference kept | 130 |
| 115 | `{"t":"set","e":16,"zone":"discard","a":{"exhausted":null,"damage":null,"power":null,"hp":null}}` | R-07 set of a known entity (full 6) | 131 |
| 116 | `{"t":"block","id":13,"kind":"trigger","p":1,"src":16,"parent":6}` | R-09 block 13 (trigger), every reference kept | 132 |
| 117 | `{"t":"block","id":14,"kind":"resource","p":1,"src":16,"amount":1,"parent":13}` | R-09 block 14 (resource); targets element dropped (full 13 is in a hand that is not the viewer's); targets removed: no element left | 133 |
| 118 | `{"t":"remove","e":18}` | R-17 lose track (full 8) | 134 |
| 119 | `{"t":"remove","e":19}` | R-17 lose track (full 9) | 134 |
| 120 | `{"t":"remove","e":20}` | R-17 lose track (full 10) | 134 |
| 121 | `{"t":"remove","e":21}` | R-17 lose track (full 11) | 134 |
| 122 | `{"t":"remove","e":22}` | R-17 lose track (full 12) | 134 |
| 123 | `{"t":"remove","e":23}` | R-17 lose track (full 13, the moving card) | 134 |
| 124 | `{"t":"create","e":24,"zone":"resource","owner":1,"to":[1],"a":{"exhausted":true}}` | R-05 anonymous create after set (full 13) | 134 |
| 125 | `{"t":"create","e":25,"zone":"resource","owner":1,"to":[1],"a":{"exhausted":true}}` | R-02 anonymous create (full 24) | 135 |
| 126 | `{"t":"block","id":15,"kind":"resource","p":1,"src":16,"amount":1,"parent":13}` | R-09 block 15 (resource); targets element dropped (full 24 is anonymous); targets removed: no element left | 136 |
| 127 | `{"t":"set","e":"p1","a":{"deckCount":36,"handCount":5}}` | R-07 set of a known entity (full p1) | 137 |
| 128 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 138 |
| 129 | `{"t":"step","seq":8}` | R-10 step | 139 |
| 130 | `{"t":"create","e":26,"zone":"hand","owner":1,"card":"TS26#039","to":"all"}` | R-03 reveal of an unmaterialized (forgotten) entity: fresh known create (full 8) | 140 |
| 131 | `{"t":"set","e":26,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":2,"hp":5}}` | R-07 set of a known entity (full 8) | 141 |
| 132 | `{"t":"block","id":16,"kind":"play","p":1,"src":26}` | R-09 block 16 (play), every reference kept | 142 |
| 133 | `{"t":"set","e":"p1","a":{"handCount":4}}` | R-07 set of a known entity (full p1) | 143 |
| 134 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 144 |
| 135 | `{"t":"step","seq":9}` | R-10 step | 145 |
| 136 | `{"t":"reveal","e":5,"card":"TWI#226","to":"all"}` | R-03 reveal of a known entity (full 14) | 146 |
| 137 | `{"t":"set","e":5,"zone":"discard","a":{"kind":"event"}}` | R-07 set of a known entity (full 14) | 147 |
| 138 | `{"t":"block","id":17,"kind":"play","p":2,"src":5,"targets":[17]}` | R-09 block 17 (play), every reference kept | 148 |
| 139 | `{"t":"set","e":17,"zone":"hand","a":{"exhausted":null,"damage":null,"power":null,"hp":null}}` | R-07 set of a known entity (full 7) | 149 |
| 140 | `{"t":"set","e":"p1","a":{"handCount":5}}` | R-07 set of a known entity (full p1) | 150 |
| 141 | `{"t":"set","e":"p2","a":{"handCount":3}}` | R-07 set of a known entity (full p2) | 151 |
| 142 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 152 |
| 143 | `{"t":"step","seq":10}` | R-10 step | 153 |
| 144 | `{"t":"create","e":27,"zone":"hand","owner":1,"card":"SOR#219","to":"all"}` | R-03 reveal of an unmaterialized (forgotten) entity: fresh known create (full 9) | 154 |
| 145 | `{"t":"set","e":27,"zone":"discard","a":{"kind":"event"}}` | R-07 set of a known entity (full 9) | 155 |
| 146 | `{"t":"block","id":18,"kind":"play","p":1,"src":27}` | R-09 block 18 (play), every reference kept | 156 |
| 147 | `{"t":"create","e":28,"zone":"hand","owner":1,"card":"SEC#093","to":"all"}` | R-03 reveal of an unmaterialized (forgotten) entity: fresh known create (full 10) | 157 |
| 148 | `{"t":"set","e":28,"zone":"ground","a":{"kind":"unit","exhausted":false,"damage":0,"power":1,"hp":3}}` | R-07 set of a known entity (full 10) | 158 |
| 149 | `{"t":"block","id":19,"kind":"play","p":1,"src":28,"parent":18,"via":27}` | R-09 block 19 (play), every reference kept | 159 |
| 150 | `{"t":"create","e":29,"owner":1,"to":"all","a":{"kind":"effect","src":27,"targets":[28],"duration":"delayed"…` | R-01 create, audience "all" holds viewer (full 25) | 160 |
| 151 | `{"t":"set","e":"p1","a":{"handCount":3}}` | R-07 set of a known entity (full p1) | 161 |
| 152 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 162 |
| 153 | `{"t":"step","seq":11}` | R-10 step | 163 |
| 154 | `{"t":"reveal","e":8,"card":"HMW#102","to":"all"}` | R-03 reveal of a known entity (full 17) | 164 |
| 155 | `{"t":"set","e":8,"zone":"discard","a":{"kind":"event"}}` | R-07 set of a known entity (full 17) | 165 |
| 156 | `{"t":"block","id":20,"kind":"play","p":2,"src":8,"targets":[26]}` | R-09 block 20 (play), every reference kept | 166 |
| 157 | `{"t":"block","id":21,"kind":"defeat","p":2,"src":8,"targets":[26],"parent":20}` | R-09 block 21 (defeat), every reference kept | 167 |
| 158 | `{"t":"set","e":26,"zone":"discard","a":{"exhausted":null,"damage":null,"power":null,"hp":null}}` | R-07 set of a known entity (full 8) | 168 |
| 159 | `{"t":"block","id":22,"kind":"trigger","p":1,"src":26,"parent":20}` | R-09 block 22 (trigger), every reference kept | 169 |
| 160 | `{"t":"block","id":23,"kind":"search","p":1,"src":26,"amount":3,"parent":22}` | R-09 block 23 (search); targets element dropped (full 26 is unmaterialized); targets removed: no element left; options element dropped (full 26 is unmaterialized); options element dropped (full 27 is unmaterialized); options element dropped (full 28 is unmaterialized); options removed: no element left | 173 |
| 161 | `{"t":"block","id":24,"kind":"draw","p":1,"src":26,"amount":1,"parent":22}` | R-09 block 24 (draw); targets element dropped (full 26 is unmaterialized); targets removed: no element left | 175 |
| 162 | `{"t":"remove","e":17}` | R-17 lose track (full 7, the moving card) | 178 |
| 163 | `{"t":"set","e":"p2","a":{"handCount":2}}` | R-07 set of a known entity (full p2) | 179 |
| 164 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 180 |
| 165 | `{"t":"step","seq":12}` | R-10 step | 181 |
| 166 | `{"t":"create","e":30,"zone":"hand","owner":1,"card":"SHD#200","to":"all"}` | R-03 reveal of an unmaterialized (forgotten) entity: fresh known create (full 11) | 182 |
| 167 | `{"t":"set","e":30,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":3,"hp":5}}` | R-07 set of a known entity (full 11) | 183 |
| 168 | `{"t":"block","id":25,"kind":"play","p":1,"src":30}` | R-09 block 25 (play), every reference kept | 184 |
| 169 | `{"t":"set","e":"p1","a":{"handCount":2}}` | R-07 set of a known entity (full p1) | 185 |
| 170 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 186 |
| 171 | `{"t":"step","seq":13}` | R-10 step | 187 |
| 172 | `{"t":"reveal","e":6,"card":"TWI#226","to":"all"}` | R-03 reveal of a known entity (full 15) | 188 |
| 173 | `{"t":"set","e":6,"zone":"discard","a":{"kind":"event"}}` | R-07 set of a known entity (full 15) | 189 |
| 174 | `{"t":"block","id":26,"kind":"play","p":2,"src":6,"targets":[15]}` | R-09 block 26 (play), every reference kept | 190 |
| 175 | `{"t":"set","e":15,"zone":"hand","a":{"exhausted":null,"damage":null,"power":null,"hp":null}}` | R-07 set of a known entity (full 5) | 191 |
| 176 | `{"t":"set","e":"p1","a":{"handCount":3}}` | R-07 set of a known entity (full p1) | 192 |
| 177 | `{"t":"set","e":"p2","a":{"handCount":1}}` | R-07 set of a known entity (full p2) | 193 |
| 178 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 194 |
| 179 | `{"t":"step","seq":14}` | R-10 step | 195 |
| 180 | `{"t":"block","id":27,"kind":"ability","p":1,"src":28,"targets":[30]}` | R-09 block 27 (ability), every reference kept | 196 |
| 181 | `{"t":"set","e":28,"zone":"hand","a":{"exhausted":null,"damage":null,"power":null,"hp":null}}` | R-07 set of a known entity (full 10) | 197 |
| 182 | `{"t":"remove","e":29}` | R-08 remove (full 25) | 198 |
| 183 | `{"t":"create","e":31,"owner":1,"to":"all","a":{"kind":"effect","targets":[30],"duration":"phase"}}` | R-01 create, audience "all" holds viewer (full 29); src dropped (full 10 is in a hand that is not the viewer's); text dropped with it | 199 |
| 184 | `{"t":"set","e":30,"a":{"power":5,"hp":7}}` | R-07 set of a known entity (full 11) | 200 |
| 185 | `{"t":"set","e":"p1","a":{"handCount":4}}` | R-07 set of a known entity (full p1) | 201 |
| 186 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 202 |
| 187 | `{"t":"step","seq":15}` | R-10 step | 203 |
| 188 | `{"t":"block","id":28,"kind":"pass","p":2}` | R-09 block 28 (pass), every reference kept | 204 |
| 189 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 205 |
| 190 | `{"t":"step","seq":16}` | R-10 step | 206 |
| 191 | `{"t":"block","id":29,"kind":"ability","p":1,"src":2}` | R-09 block 29 (ability), every reference kept | 207 |
| 192 | `{"t":"set","e":2,"a":{"exhausted":true}}` | R-07 set of a known entity (full 2) | 208 |
| 193 | `{"t":"block","id":30,"kind":"resource","p":1,"src":2,"amount":1,"parent":29}` | R-09 block 30 (resource); targets element dropped (full 5 is in a hand that is not the viewer's); targets removed: no element left | 209 |
| 194 | `{"t":"remove","e":15}` | R-17 lose track (full 5, the moving card) | 210 |
| 195 | `{"t":"remove","e":28}` | R-17 lose track (full 10) | 210 |
| 196 | `{"t":"create","e":32,"zone":"resource","owner":1,"to":[1],"a":{"exhausted":false}}` | R-05 anonymous create after set (full 5) | 210 |
| 197 | `{"t":"create","e":33,"owner":1,"to":"all","a":{"kind":"effect","src":2,"targets":["p1"],"duration":"delayed…` | R-01 create, audience "all" holds viewer (full 30) | 211 |
| 198 | `{"t":"set","e":"p1","a":{"handCount":3}}` | R-07 set of a known entity (full p1) | 212 |
| 199 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 213 |
| 200 | `{"t":"step","seq":17}` | R-10 step | 214 |
| 201 | `{"t":"block","id":31,"kind":"pass","p":2}` | R-09 block 31 (pass), every reference kept | 215 |
| 202 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 216 |
| 203 | `{"t":"step","seq":18}` | R-10 step | 217 |
| 204 | `{"t":"create","e":34,"zone":"hand","owner":1,"card":"SEC#093","to":"all","a":{"kind":"unit"}}` | R-03 reveal of an unmaterialized (forgotten) entity: fresh known create (full 10) | 218 |
| 205 | `{"t":"set","e":34,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":1,"hp":3}}` | R-07 set of a known entity (full 10) | 219 |
| 206 | `{"t":"block","id":32,"kind":"play","p":1,"src":34}` | R-09 block 32 (play), every reference kept | 220 |
| 207 | `{"t":"set","e":"p1","a":{"handCount":2}}` | R-07 set of a known entity (full p1) | 221 |
| 208 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 222 |
| 209 | `{"t":"step","seq":19}` | R-10 step | 223 |
| 210 | `{"t":"block","id":33,"kind":"pass","p":2}` | R-09 block 33 (pass), every reference kept | 224 |
| 211 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 225 |
| 212 | `{"t":"step","seq":20}` | R-10 step | 226 |
| 213 | `{"t":"remove","e":24}` | R-03 reveal of an anonymous entity: remove its output id (full 13) | 227 |
| 214 | `{"t":"create","e":35,"zone":"resource","owner":1,"card":"SHD#148","to":"all","a":{"exhausted":true}}` | R-03 reveal of an anonymous entity: fresh known create (full 13) | 227 |
| 215 | `{"t":"set","e":35,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":3,"hp":5}}` | R-07 set of a known entity (full 13) | 228 |
| 216 | `{"t":"block","id":34,"kind":"play","p":1,"src":35}` | R-09 block 34 (play), every reference kept | 229 |
| 217 | `{"t":"create","e":36,"zone":"resource","owner":1,"to":[1],"a":{"exhausted":true}}` | R-02 anonymous create (full 31) | 230 |
| 218 | `{"t":"block","id":35,"kind":"resource","p":1,"src":35,"amount":1,"parent":34}` | R-09 block 35 (resource); targets element dropped (full 31 is anonymous); targets removed: no element left | 231 |
| 219 | `{"t":"block","id":36,"kind":"trigger","p":1,"src":35,"parent":34}` | R-09 block 36 (trigger), every reference kept | 232 |
| 220 | `{"t":"set","e":35,"a":{"exhausted":false}}` | R-07 set of a known entity (full 13) | 233 |
| 221 | `{"t":"set","e":"p1","a":{"deckCount":35}}` | R-07 set of a known entity (full p1) | 234 |
| 222 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 235 |
| 223 | `{"t":"step","seq":21}` | R-10 step | 236 |
| 224 | `{"t":"block","id":37,"kind":"pass","p":2}` | R-09 block 37 (pass), every reference kept | 237 |
| 225 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 238 |
| 226 | `{"t":"step","seq":22}` | R-10 step | 239 |

## `full` records that emit nothing

- `full` line 64: R-02 nothing: full 5 unmaterialized
- `full` line 65: R-02 nothing: full 6 unmaterialized
- `full` line 66: R-02 nothing: full 7 unmaterialized
- `full` line 67: R-02 nothing: full 8 unmaterialized
- `full` line 68: R-02 nothing: full 9 unmaterialized
- `full` line 69: R-02 nothing: full 10 unmaterialized
- `full` line 70: R-02 nothing: full 11 unmaterialized
- `full` line 71: R-02 nothing: full 12 unmaterialized
- `full` line 72: R-02 nothing: full 13 unmaterialized
- `full` line 170: R-02 nothing: full 26 unmaterialized
- `full` line 171: R-02 nothing: full 27 unmaterialized
- `full` line 172: R-02 nothing: full 28 unmaterialized
- `full` line 174: R-05 nothing (full 26)
- `full` line 176: R-08 nothing: unmaterialized (full 27)
- `full` line 177: R-08 nothing: unmaterialized (full 28)
- `full` line 178: R-08 nothing: unmaterialized (full 7)
