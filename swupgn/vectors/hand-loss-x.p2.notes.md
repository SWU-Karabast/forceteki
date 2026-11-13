# `hand-loss-x.p2.swupgn`

This file is `hand-loss-x.full.swupgn` redacted by SPEC §11 for seat 2 (`perspective:2`). These notes are hand-reviewed and informative; the vector files are the normative part.

This is the `-x` variant: at step 15 P1 resources Battlefield Marine (`full` 5), a card P2 knows. This file is byte-identical to `hand-loss-u.p2.swupgn`.

## Scenario

Losing track in a hidden hand (§10.3, R-17), from the viewpoint of P2, who watches P1's hand. The two variants `hand-loss-x` and `hand-loss-u` are the same game except at step 15: in `-x` P1 resources Battlefield Marine (`full` 5), a card P2 knows; in `-u` P1 resources Underworld Thug (`full` 26), a card P2 has never seen. Their `p2` files are byte-identical, and so are their `public` files (case b).

| Step | What happens | Case |
|---|---|---|
| 1 | P1 plays Battlefield Marine (X, `full` 5). | |
| 2 | P2 deploys Barriss Offee (`LOF#013`, `full` 4). | |
| 3 | P1 plays Ima-Gun Di (`HMW#044`, `full` 6). | |
| 4 | P2 attaches Stolen Starpath Unit (`SEC#210`) to Barriss. | |
| 5 | P1 plays Consular Security Force (Z, `full` 7). | |
| 6 | Barriss attacks Ima-Gun Di. The granted On Attack names a card, and P1 reveals the whole hand to everyone: Captain Vaughn, Sneak Attack, C-3PO, Liberated Slaves, Swoop Racer, Cassian Andor (`full` 8 to 13). Ima-Gun Di is defeated; his When Defeated resources Cassian Andor (E) from that hand, then the top card of the deck. | (e) |
| 7 | P1 plays Captain Vaughn, which P2 forgot in step 6. | (f) |
| 8 | P2 Waylays Consular Security Force back to P1's hand. | |
| 9 | P1 plays Sneak Attack and through it C-3PO (K, `full` 10), ready, with a delayed effect on him. | |
| 10 | P2 plays Dragon's Might on Vaughn. His When Defeated draws Underworld Thug (U, `full` 26) and puts Consular Security Force from hand on top of the deck. | (d) |
| 11 | P1 plays Liberated Slaves (Y, `full` 11). | |
| 12 | P2 Waylays Battlefield Marine back to P1's hand. | |
| 13 | P1 uses C-3PO: he returns to P1's hand as the cost, and Liberated Slaves gets +2/+2 for this phase. The new effect's `src` is C-3PO, now in P1's hand. The Sneak Attack effect on him ends. | ref |
| 15 | Han Solo (`SOR#017`) puts a card from P1's hand into play as a resource: X in `-x`, U in `-u`. Before the move P1's hand holds Swoop Racer (forgotten in step 6), Underworld Thug (never seen by P2), Battlefield Marine and C-3PO (both known to P2). | (a) (b) (c) |
| 17 | P1 plays C-3PO, forgotten in step 15. | (f) |
| 19 | P1 plays Cassian Andor from the resource row with Smuggle. Its replacement resource comes from the deck. | (g) |

Steps 14, 16, 18 and 20 are passes by P2.

## Cases

- **(a)** Step 15 in `p2`, `-x`: a `remove` of X's output id comes before the fresh anonymous resource, which has `to` [1] and only `exhausted`. The `resource` block, written before the move (W-66), has no `targets` and no `text`.
- **(b)** Step 15 in `p2`, `-u`: U was never known, but the records are the same as in `-x`, byte for byte.
- **(c)** Step 15: P2 knows X and C-3PO in that hand. Both are removed, in ascending output id; `handCount` changes only by the card that left.
- **(d)** Step 10: putting Consular Security Force into the deck is a `remove` of a hand card. P2 knew it from step 8, so step 0 removes it and step 8 emits nothing more. The search and draw blocks keep `amount` and lose their references.
- **(e)** Step 6: P2 was shown every card in that hand a moment before Cassian Andor was resourced, and still loses track of all six (R-17 has no reveal exception).
- **(f)** Steps 7 and 17: a forgotten card played from hand is created afresh, with its identity, on the `reveal` that W-44 requires (R-03, unmaterialized branch), and then moved by the `set`.
- **(g)** Step 19: Cassian Andor was forgotten in step 6 and then became anonymous in the resource row. Its `reveal` removes the anonymous entity and creates it afresh as a known one (R-03, anonymous branch).
- **Blocks and references.** The `look` block of step 6 and both `resource` blocks naming a hand card lose their `targets` in `p2` and `public`, even though the cards were shown to everyone (R-09, §10.3). Each `play` block is written after the move to a public zone and keeps its `src`. In step 13 the C-3PO effect is created with its `src` in P1's hand: `p2` and `public` drop `src`, and its `text` with it (§11.1).

## Readings used by every vector

- **Header, `DECKS`, `CARDS` (R-11).** Every tag that SPEC §5.1 or §5.2 defines is kept except `Seed`, any other tag is dropped (W-67), and `Visibility` is rewritten. The viewer's own `DECKS` line is kept without `order`. The other line (both lines in `public`) keeps `p`, `leaders` and `base`, sets `complete` to `false`, and lists one `[id]` per distinct card id that this file's `create` and `reveal` records give to an entity of that seat, in the order this file first gives each, leaving out `TOKEN:` ids and the line's own leaders and base. `CARDS` keeps the `full` lines, in their order, whose id appears in this file's header, `DECKS` or `RECORDS`.
- **Empty `a`.** A `create` made by step 3 or step 5 for an entity that has no attributes (a hand card) carries no `a` key, rather than `"a":{}`.
- **Fresh ids (R-14).** Output ids are handed out 1, 2, 3, … in the order the output first uses them. An id removed by step 0, 3, 6 or 8 is never used again.
- **The game itself is illustrative.** Costs and resource payments are not modelled, decks are short, and some timing is simplified. The records, and what each profile may know, are what the vector tests.

## Records

Each line of `RECORDS` in `hand-loss-x.p2.swupgn`, with the step of SPEC §11.2 that produced it and the `full` record it came from. Entity ids in the "Step" column are `full` ids; ids in the "Record" column are this file's own.

| Line | Record | Step | From `full` line |
|---|---|---|---|
| 50 | `{"t":"set","e":"g","a":{"round":1,"phase":"action","active":1,"initiative":1,"initiativeTaken":false}}` | R-07 set of a known entity (full g) | 57 |
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
| 62 | `{"t":"create","e":10,"zone":"resource","owner":1,"to":[1],"a":{"exhausted":false}}` | R-02 anonymous create (full 19) | 78 |
| 63 | `{"t":"create","e":11,"zone":"resource","owner":1,"to":[1],"a":{"exhausted":false}}` | R-02 anonymous create (full 20) | 79 |
| 64 | `{"t":"create","e":12,"zone":"resource","owner":2,"card":"SOR#062","to":[2],"a":{"exhausted":false}}` | R-01 create, audience [2] holds viewer (full 21) | 80 |
| 65 | `{"t":"create","e":13,"zone":"resource","owner":2,"card":"SOR#064","to":[2],"a":{"exhausted":false}}` | R-01 create, audience [2] holds viewer (full 22) | 81 |
| 66 | `{"t":"create","e":14,"zone":"resource","owner":2,"card":"SOR#066","to":[2],"a":{"exhausted":false}}` | R-01 create, audience [2] holds viewer (full 23) | 82 |
| 67 | `{"t":"step","seq":0}` | R-10 step | 83 |
| 68 | `{"t":"create","e":15,"zone":"hand","owner":1,"card":"SOR#095","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 5) | 84 |
| 69 | `{"t":"set","e":15,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":3,"hp":3}}` | R-07 set of a known entity (full 5) | 85 |
| 70 | `{"t":"block","id":1,"kind":"play","p":1,"src":15}` | R-09 block 1 (play), every reference kept | 86 |
| 71 | `{"t":"set","e":"p1","a":{"handCount":8}}` | R-07 set of a known entity (full p1) | 87 |
| 72 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 88 |
| 73 | `{"t":"step","seq":1}` | R-10 step | 89 |
| 74 | `{"t":"block","id":2,"kind":"deploy","p":2,"src":4}` | R-09 block 2 (deploy), every reference kept | 90 |
| 75 | `{"t":"set","e":4,"zone":"ground","a":{"damage":0,"power":4,"hp":7,"deployed":true,"epicActionUsed":true}}` | R-07 set of a known entity (full 4) | 91 |
| 76 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 92 |
| 77 | `{"t":"step","seq":2}` | R-10 step | 93 |
| 78 | `{"t":"create","e":16,"zone":"hand","owner":1,"card":"HMW#044","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 6) | 94 |
| 79 | `{"t":"set","e":16,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":5,"hp":3}}` | R-07 set of a known entity (full 6) | 95 |
| 80 | `{"t":"block","id":3,"kind":"play","p":1,"src":16}` | R-09 block 3 (play), every reference kept | 96 |
| 81 | `{"t":"set","e":"p1","a":{"handCount":7}}` | R-07 set of a known entity (full p1) | 97 |
| 82 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 98 |
| 83 | `{"t":"step","seq":3}` | R-10 step | 99 |
| 84 | `{"t":"reveal","e":7,"card":"SEC#210","to":"all"}` | R-03 reveal of a known entity (full 16) | 100 |
| 85 | `{"t":"set","e":7,"zone":"ground","parent":4,"rel":"attached","a":{"kind":"upgrade"}}` | R-07 set of a known entity (full 16) | 101 |
| 86 | `{"t":"block","id":4,"kind":"play","p":2,"src":7,"targets":[4]}` | R-09 block 4 (play), every reference kept | 102 |
| 87 | `{"t":"set","e":4,"a":{"power":5,"hp":8}}` | R-07 set of a known entity (full 4) | 103 |
| 88 | `{"t":"set","e":"p2","a":{"handCount":4}}` | R-07 set of a known entity (full p2) | 104 |
| 89 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 105 |
| 90 | `{"t":"step","seq":4}` | R-10 step | 106 |
| 91 | `{"t":"create","e":17,"zone":"hand","owner":1,"card":"SOR#046","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 7) | 107 |
| 92 | `{"t":"set","e":17,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":3,"hp":7}}` | R-07 set of a known entity (full 7) | 108 |
| 93 | `{"t":"block","id":5,"kind":"play","p":1,"src":17}` | R-09 block 5 (play), every reference kept | 109 |
| 94 | `{"t":"set","e":"p1","a":{"handCount":6}}` | R-07 set of a known entity (full p1) | 110 |
| 95 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 111 |
| 96 | `{"t":"step","seq":5}` | R-10 step | 112 |
| 97 | `{"t":"block","id":6,"kind":"attack","p":2,"src":4,"targets":[16]}` | R-09 block 6 (attack), every reference kept | 113 |
| 98 | `{"t":"set","e":4,"a":{"exhausted":true}}` | R-07 set of a known entity (full 4) | 114 |
| 99 | `{"t":"block","id":7,"kind":"trigger","p":2,"src":4,"parent":6,"via":7}` | R-09 block 7 (trigger), every reference kept | 115 |
| 100 | `{"t":"block","id":8,"kind":"name","p":2,"src":4,"parent":7,"text":"Wampa"}` | R-09 block 8 (name), every reference kept | 116 |
| 101 | `{"t":"create","e":18,"zone":"hand","owner":1,"card":"TS26#039","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 8) | 117 |
| 102 | `{"t":"create","e":19,"zone":"hand","owner":1,"card":"SOR#219","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 9) | 118 |
| 103 | `{"t":"create","e":20,"zone":"hand","owner":1,"card":"SEC#093","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 10) | 119 |
| 104 | `{"t":"create","e":21,"zone":"hand","owner":1,"card":"SHD#200","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 11) | 120 |
| 105 | `{"t":"create","e":22,"zone":"hand","owner":1,"card":"SOR#210","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 12) | 121 |
| 106 | `{"t":"create","e":23,"zone":"hand","owner":1,"card":"SHD#148","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 13) | 122 |
| 107 | `{"t":"block","id":9,"kind":"look","p":2,"src":4,"amount":6,"parent":7}` | R-09 block 9 (look); targets element dropped (full 8 is in a hand that is not the viewer's); targets element dropped (full 9 is in a hand that is not the viewer's); targets element dropped (full 10 is in a hand that is not the viewer's); targets element dropped (full 11 is in a hand that is not the viewer's); targets element dropped (full 12 is in a hand that is not the viewer's); targets element dropped (full 13 is in a hand that is not the viewer's); targets removed: no element left | 123 |
| 108 | `{"t":"block","id":10,"kind":"damage","p":2,"src":4,"targets":[16],"amount":5,"parent":6,"group":1}` | R-09 block 10 (damage), every reference kept | 124 |
| 109 | `{"t":"block","id":11,"kind":"damage","p":1,"src":16,"targets":[4],"amount":5,"parent":6,"group":1}` | R-09 block 11 (damage), every reference kept | 125 |
| 110 | `{"t":"set","e":4,"a":{"damage":5}}` | R-07 set of a known entity (full 4) | 126 |
| 111 | `{"t":"block","id":12,"kind":"defeat","p":2,"src":4,"targets":[16],"parent":6}` | R-09 block 12 (defeat), every reference kept | 127 |
| 112 | `{"t":"set","e":16,"zone":"discard","a":{"exhausted":null,"damage":null,"power":null,"hp":null}}` | R-07 set of a known entity (full 6) | 128 |
| 113 | `{"t":"block","id":13,"kind":"trigger","p":1,"src":16,"parent":6}` | R-09 block 13 (trigger), every reference kept | 129 |
| 114 | `{"t":"block","id":14,"kind":"resource","p":1,"src":16,"amount":1,"parent":13}` | R-09 block 14 (resource); targets element dropped (full 13 is in a hand that is not the viewer's); targets removed: no element left | 130 |
| 115 | `{"t":"remove","e":18}` | R-17 lose track (full 8) | 131 |
| 116 | `{"t":"remove","e":19}` | R-17 lose track (full 9) | 131 |
| 117 | `{"t":"remove","e":20}` | R-17 lose track (full 10) | 131 |
| 118 | `{"t":"remove","e":21}` | R-17 lose track (full 11) | 131 |
| 119 | `{"t":"remove","e":22}` | R-17 lose track (full 12) | 131 |
| 120 | `{"t":"remove","e":23}` | R-17 lose track (full 13, the moving card) | 131 |
| 121 | `{"t":"create","e":24,"zone":"resource","owner":1,"to":[1],"a":{"exhausted":true}}` | R-05 anonymous create after set (full 13) | 131 |
| 122 | `{"t":"create","e":25,"zone":"resource","owner":1,"to":[1],"a":{"exhausted":true}}` | R-02 anonymous create (full 24) | 132 |
| 123 | `{"t":"block","id":15,"kind":"resource","p":1,"src":16,"amount":1,"parent":13}` | R-09 block 15 (resource); targets element dropped (full 24 is anonymous); targets removed: no element left | 133 |
| 124 | `{"t":"set","e":"p1","a":{"deckCount":36,"handCount":5}}` | R-07 set of a known entity (full p1) | 134 |
| 125 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 135 |
| 126 | `{"t":"step","seq":6}` | R-10 step | 136 |
| 127 | `{"t":"create","e":26,"zone":"hand","owner":1,"card":"TS26#039","to":"all"}` | R-03 reveal of an unmaterialized (forgotten) entity: fresh known create (full 8) | 137 |
| 128 | `{"t":"set","e":26,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":2,"hp":5}}` | R-07 set of a known entity (full 8) | 138 |
| 129 | `{"t":"block","id":16,"kind":"play","p":1,"src":26}` | R-09 block 16 (play), every reference kept | 139 |
| 130 | `{"t":"set","e":"p1","a":{"handCount":4}}` | R-07 set of a known entity (full p1) | 140 |
| 131 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 141 |
| 132 | `{"t":"step","seq":7}` | R-10 step | 142 |
| 133 | `{"t":"reveal","e":5,"card":"TWI#226","to":"all"}` | R-03 reveal of a known entity (full 14) | 143 |
| 134 | `{"t":"set","e":5,"zone":"discard","a":{"kind":"event"}}` | R-07 set of a known entity (full 14) | 144 |
| 135 | `{"t":"block","id":17,"kind":"play","p":2,"src":5,"targets":[17]}` | R-09 block 17 (play), every reference kept | 145 |
| 136 | `{"t":"set","e":17,"zone":"hand","a":{"exhausted":null,"damage":null,"power":null,"hp":null}}` | R-07 set of a known entity (full 7) | 146 |
| 137 | `{"t":"set","e":"p1","a":{"handCount":5}}` | R-07 set of a known entity (full p1) | 147 |
| 138 | `{"t":"set","e":"p2","a":{"handCount":3}}` | R-07 set of a known entity (full p2) | 148 |
| 139 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 149 |
| 140 | `{"t":"step","seq":8}` | R-10 step | 150 |
| 141 | `{"t":"create","e":27,"zone":"hand","owner":1,"card":"SOR#219","to":"all"}` | R-03 reveal of an unmaterialized (forgotten) entity: fresh known create (full 9) | 151 |
| 142 | `{"t":"set","e":27,"zone":"discard","a":{"kind":"event"}}` | R-07 set of a known entity (full 9) | 152 |
| 143 | `{"t":"block","id":18,"kind":"play","p":1,"src":27}` | R-09 block 18 (play), every reference kept | 153 |
| 144 | `{"t":"create","e":28,"zone":"hand","owner":1,"card":"SEC#093","to":"all"}` | R-03 reveal of an unmaterialized (forgotten) entity: fresh known create (full 10) | 154 |
| 145 | `{"t":"set","e":28,"zone":"ground","a":{"kind":"unit","exhausted":false,"damage":0,"power":1,"hp":3}}` | R-07 set of a known entity (full 10) | 155 |
| 146 | `{"t":"block","id":19,"kind":"play","p":1,"src":28,"parent":18,"via":27}` | R-09 block 19 (play), every reference kept | 156 |
| 147 | `{"t":"create","e":29,"owner":1,"to":"all","a":{"kind":"effect","src":27,"targets":[28],"duration":"delayed"…` | R-01 create, audience "all" holds viewer (full 25) | 157 |
| 148 | `{"t":"set","e":"p1","a":{"handCount":3}}` | R-07 set of a known entity (full p1) | 158 |
| 149 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 159 |
| 150 | `{"t":"step","seq":9}` | R-10 step | 160 |
| 151 | `{"t":"reveal","e":8,"card":"HMW#102","to":"all"}` | R-03 reveal of a known entity (full 17) | 161 |
| 152 | `{"t":"set","e":8,"zone":"discard","a":{"kind":"event"}}` | R-07 set of a known entity (full 17) | 162 |
| 153 | `{"t":"block","id":20,"kind":"play","p":2,"src":8,"targets":[26]}` | R-09 block 20 (play), every reference kept | 163 |
| 154 | `{"t":"block","id":21,"kind":"defeat","p":2,"src":8,"targets":[26],"parent":20}` | R-09 block 21 (defeat), every reference kept | 164 |
| 155 | `{"t":"set","e":26,"zone":"discard","a":{"exhausted":null,"damage":null,"power":null,"hp":null}}` | R-07 set of a known entity (full 8) | 165 |
| 156 | `{"t":"block","id":22,"kind":"trigger","p":1,"src":26,"parent":20}` | R-09 block 22 (trigger), every reference kept | 166 |
| 157 | `{"t":"block","id":23,"kind":"search","p":1,"src":26,"amount":3,"parent":22}` | R-09 block 23 (search); targets element dropped (full 26 is unmaterialized); targets removed: no element left; options element dropped (full 26 is unmaterialized); options element dropped (full 27 is unmaterialized); options element dropped (full 28 is unmaterialized); options removed: no element left | 170 |
| 158 | `{"t":"block","id":24,"kind":"draw","p":1,"src":26,"amount":1,"parent":22}` | R-09 block 24 (draw); targets element dropped (full 26 is unmaterialized); targets removed: no element left | 172 |
| 159 | `{"t":"remove","e":17}` | R-17 lose track (full 7, the moving card) | 175 |
| 160 | `{"t":"set","e":"p2","a":{"handCount":2}}` | R-07 set of a known entity (full p2) | 176 |
| 161 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 177 |
| 162 | `{"t":"step","seq":10}` | R-10 step | 178 |
| 163 | `{"t":"create","e":30,"zone":"hand","owner":1,"card":"SHD#200","to":"all"}` | R-03 reveal of an unmaterialized (forgotten) entity: fresh known create (full 11) | 179 |
| 164 | `{"t":"set","e":30,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":3,"hp":5}}` | R-07 set of a known entity (full 11) | 180 |
| 165 | `{"t":"block","id":25,"kind":"play","p":1,"src":30}` | R-09 block 25 (play), every reference kept | 181 |
| 166 | `{"t":"set","e":"p1","a":{"handCount":2}}` | R-07 set of a known entity (full p1) | 182 |
| 167 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 183 |
| 168 | `{"t":"step","seq":11}` | R-10 step | 184 |
| 169 | `{"t":"reveal","e":6,"card":"TWI#226","to":"all"}` | R-03 reveal of a known entity (full 15) | 185 |
| 170 | `{"t":"set","e":6,"zone":"discard","a":{"kind":"event"}}` | R-07 set of a known entity (full 15) | 186 |
| 171 | `{"t":"block","id":26,"kind":"play","p":2,"src":6,"targets":[15]}` | R-09 block 26 (play), every reference kept | 187 |
| 172 | `{"t":"set","e":15,"zone":"hand","a":{"exhausted":null,"damage":null,"power":null,"hp":null}}` | R-07 set of a known entity (full 5) | 188 |
| 173 | `{"t":"set","e":"p1","a":{"handCount":3}}` | R-07 set of a known entity (full p1) | 189 |
| 174 | `{"t":"set","e":"p2","a":{"handCount":1}}` | R-07 set of a known entity (full p2) | 190 |
| 175 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 191 |
| 176 | `{"t":"step","seq":12}` | R-10 step | 192 |
| 177 | `{"t":"block","id":27,"kind":"ability","p":1,"src":28,"targets":[30]}` | R-09 block 27 (ability), every reference kept | 193 |
| 178 | `{"t":"set","e":28,"zone":"hand","a":{"exhausted":null,"damage":null,"power":null,"hp":null}}` | R-07 set of a known entity (full 10) | 194 |
| 179 | `{"t":"remove","e":29}` | R-08 remove (full 25) | 195 |
| 180 | `{"t":"create","e":31,"owner":1,"to":"all","a":{"kind":"effect","targets":[30],"duration":"phase"}}` | R-01 create, audience "all" holds viewer (full 29); src dropped (full 10 is in a hand that is not the viewer's); text dropped with it | 196 |
| 181 | `{"t":"set","e":30,"a":{"power":5,"hp":7}}` | R-07 set of a known entity (full 11) | 197 |
| 182 | `{"t":"set","e":"p1","a":{"handCount":4}}` | R-07 set of a known entity (full p1) | 198 |
| 183 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 199 |
| 184 | `{"t":"step","seq":13}` | R-10 step | 200 |
| 185 | `{"t":"block","id":28,"kind":"pass","p":2}` | R-09 block 28 (pass), every reference kept | 201 |
| 186 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 202 |
| 187 | `{"t":"step","seq":14}` | R-10 step | 203 |
| 188 | `{"t":"block","id":29,"kind":"ability","p":1,"src":2}` | R-09 block 29 (ability), every reference kept | 204 |
| 189 | `{"t":"set","e":2,"a":{"exhausted":true}}` | R-07 set of a known entity (full 2) | 205 |
| 190 | `{"t":"block","id":30,"kind":"resource","p":1,"src":2,"amount":1,"parent":29}` | R-09 block 30 (resource); targets element dropped (full 5 is in a hand that is not the viewer's); targets removed: no element left | 206 |
| 191 | `{"t":"remove","e":15}` | R-17 lose track (full 5, the moving card) | 207 |
| 192 | `{"t":"remove","e":28}` | R-17 lose track (full 10) | 207 |
| 193 | `{"t":"create","e":32,"zone":"resource","owner":1,"to":[1],"a":{"exhausted":false}}` | R-05 anonymous create after set (full 5) | 207 |
| 194 | `{"t":"create","e":33,"owner":1,"to":"all","a":{"kind":"effect","src":2,"targets":["p1"],"duration":"delayed…` | R-01 create, audience "all" holds viewer (full 30) | 208 |
| 195 | `{"t":"set","e":"p1","a":{"handCount":3}}` | R-07 set of a known entity (full p1) | 209 |
| 196 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 210 |
| 197 | `{"t":"step","seq":15}` | R-10 step | 211 |
| 198 | `{"t":"block","id":31,"kind":"pass","p":2}` | R-09 block 31 (pass), every reference kept | 212 |
| 199 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 213 |
| 200 | `{"t":"step","seq":16}` | R-10 step | 214 |
| 201 | `{"t":"create","e":34,"zone":"hand","owner":1,"card":"SEC#093","to":"all","a":{"kind":"unit"}}` | R-03 reveal of an unmaterialized (forgotten) entity: fresh known create (full 10) | 215 |
| 202 | `{"t":"set","e":34,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":1,"hp":3}}` | R-07 set of a known entity (full 10) | 216 |
| 203 | `{"t":"block","id":32,"kind":"play","p":1,"src":34}` | R-09 block 32 (play), every reference kept | 217 |
| 204 | `{"t":"set","e":"p1","a":{"handCount":2}}` | R-07 set of a known entity (full p1) | 218 |
| 205 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 219 |
| 206 | `{"t":"step","seq":17}` | R-10 step | 220 |
| 207 | `{"t":"block","id":33,"kind":"pass","p":2}` | R-09 block 33 (pass), every reference kept | 221 |
| 208 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 222 |
| 209 | `{"t":"step","seq":18}` | R-10 step | 223 |
| 210 | `{"t":"remove","e":24}` | R-03 reveal of an anonymous entity: remove its output id (full 13) | 224 |
| 211 | `{"t":"create","e":35,"zone":"resource","owner":1,"card":"SHD#148","to":"all","a":{"exhausted":true}}` | R-03 reveal of an anonymous entity: fresh known create (full 13) | 224 |
| 212 | `{"t":"set","e":35,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":3,"hp":5}}` | R-07 set of a known entity (full 13) | 225 |
| 213 | `{"t":"block","id":34,"kind":"play","p":1,"src":35}` | R-09 block 34 (play), every reference kept | 226 |
| 214 | `{"t":"create","e":36,"zone":"resource","owner":1,"to":[1],"a":{"exhausted":true}}` | R-02 anonymous create (full 31) | 227 |
| 215 | `{"t":"block","id":35,"kind":"resource","p":1,"src":35,"amount":1,"parent":34}` | R-09 block 35 (resource); targets element dropped (full 31 is anonymous); targets removed: no element left | 228 |
| 216 | `{"t":"block","id":36,"kind":"trigger","p":1,"src":35,"parent":34}` | R-09 block 36 (trigger), every reference kept | 229 |
| 217 | `{"t":"set","e":35,"a":{"exhausted":false}}` | R-07 set of a known entity (full 13) | 230 |
| 218 | `{"t":"set","e":"p1","a":{"deckCount":35}}` | R-07 set of a known entity (full p1) | 231 |
| 219 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 232 |
| 220 | `{"t":"step","seq":19}` | R-10 step | 233 |
| 221 | `{"t":"block","id":37,"kind":"pass","p":2}` | R-09 block 37 (pass), every reference kept | 234 |
| 222 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 235 |
| 223 | `{"t":"step","seq":20}` | R-10 step | 236 |

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
- `full` line 167: R-02 nothing: full 26 unmaterialized
- `full` line 168: R-02 nothing: full 27 unmaterialized
- `full` line 169: R-02 nothing: full 28 unmaterialized
- `full` line 171: R-05 nothing (full 26)
- `full` line 173: R-08 nothing: unmaterialized (full 27)
- `full` line 174: R-08 nothing: unmaterialized (full 28)
- `full` line 175: R-08 nothing: unmaterialized (full 7)
