# `attachments.public.swupgn`

This file is `attachments.full.swupgn` redacted by SPEC §11 for nobody (`public`): a seat is in an audience only when it is `"all"`. These notes are hand-reviewed and informative; the vector files are the normative part.

## Scenario

Relations (`attached`, `pilot`, `captured`), `controller` different from `owner`, and an anonymous entity that changes zone.

| Step | What happens |
|---|---|
| 1 | P1 plays Battlefield Marine (`SOR#095`, `full` 5). |
| 3 | P1 plays Academy Training (`SOR#120`, `full` 6) on the Marine: `parent` 5, `rel` `attached`. |
| 5 | P1 plays Clan Wren Rescuer (`SHD#040`). Its When Played gives the Marine an Experience token (`full` 21). |
| 6 | P2 plays Pre Vizsla (`SHD#142`, `full` 13). His When Played takes control of Academy Training and attaches it to him: `controller` 2, `parent` 13, `owner` still 1. |
| 7 | P1 plays a second Academy Training (`full` 8, same card id as `full` 6) on the Marine. |
| 8 | P2 plays Bamboozle (`SOR#199`) on the Marine: the second Academy Training returns to its owner's hand (`parent: null`, `rel: null`, W-34) and the Experience token is removed (W-25). |
| 9 | P1 plays the Fortify upgrade Alliance Shield Generator (`HMW#081`) on P1's base: `zone` `base`, `parent` 1. |
| 10 | P2 plays Discerning Veteran (`SHD#120`, `full` 15), which captures the Marine: `zone` `captured`, `parent` 15, `rel` `captured` (W-28). |
| 11 | P1 plays Republic Y-Wing (`JTL#212`, `full` 10). |
| 13 | P1 deploys Asajj Ventress (`JTL#001`, `full` 2) as a pilot on the Y-Wing: `zone` `space`, `parent` 10, `rel` `pilot`. The Y-Wing becomes a leader unit with Grit. |
| 15 | P1 plays Eject (`JTL#126`): Asajj detaches and moves to ground as an exhausted unit. P1 draws a card. |
| 17 | P1 plays Dragon's Might (`HMW#102`) on Discerning Veteran. The Marine is rescued first (detached before its captor moves, W-30), then the Veteran goes to the discard pile. |
| 18 | P2 uses Bail Organa (`SEC#008`): a P2 resource returns to P2's hand, and the top card of P2's deck becomes a resource. |

Steps 2, 4, 12, 14 and 16 are passes by P2. Every step carries `ms` (R-10 copies it unchanged).

## The point of the vector

- Every `parent` is mapped through the id map (§11.1). Each upgrade's host is created before the upgrade moves onto it, in all four files.
- The upgrade returned to P1's hand at step 8 was public, so it stays known in P1's hand for P2 and in `public` (§10.2). Nothing leaves that hand face down afterwards, so it is still there at the last step.
- Step 18 in `p1` and `public`: the returned resource is anonymous and changes zone. Step 6 removes it, and step 5 then emits nothing because `hand` is count-only for the opponent. The new resource is a fresh anonymous entity (R-02).

## Readings used by every vector

- **Header, `DECKS`, `CARDS` (R-11).** Every tag that SPEC §5.1 or §5.2 defines is kept except `Seed`, any other tag is dropped (W-67), and `Visibility` is rewritten. The viewer's own `DECKS` line is kept without `order`. The other line (both lines in `public`) keeps `p`, `leaders` and `base`, sets `complete` to `false`, and lists one `[id]` per distinct card id that this file's `create` and `reveal` records give to an entity of that seat, in the order this file first gives each, leaving out `TOKEN:` ids and the line's own leaders and base. `CARDS` keeps the `full` lines, in their order, whose id appears in this file's header, `DECKS` or `RECORDS`.
- **Empty `a`.** A `create` made by step 3 or step 5 for an entity that has no attributes (a hand card) carries no `a` key, rather than `"a":{}`.
- **Fresh ids (R-14).** Output ids are handed out 1, 2, 3, … in the order the output first uses them. An id removed by step 0, 3, 6 or 8 is never used again.
- **The game itself is illustrative.** Costs and resource payments are not modelled, decks are short, and some timing is simplified. The records, and what each profile may know, are what the vector tests.

## Records

Each line of `RECORDS` in `attachments.public.swupgn`, with the step of SPEC §11.2 that produced it and the `full` record it came from. Entity ids in the "Step" column are `full` ids; ids in the "Record" column are this file's own.

| Line | Record | Step | From `full` line |
|---|---|---|---|
| 42 | `{"t":"set","e":"g","a":{"round":1,"phase":"action","active":1,"initiative":1,"initiativeTaken":false}}` | R-07 set of a known entity (full g) | 52 |
| 43 | `{"t":"set","e":"p1","a":{"deckCount":20,"handCount":8,"credits":0,"force":false}}` | R-07 set of a known entity (full p1) | 53 |
| 44 | `{"t":"set","e":"p2","a":{"deckCount":24,"handCount":4,"credits":0,"force":false}}` | R-07 set of a known entity (full p2) | 54 |
| 45 | `{"t":"create","e":1,"zone":"base","owner":1,"card":"SOR#026","a":{"kind":"base","damage":0,"hp":30}}` | R-01 create, audience "all" holds viewer (full 1) | 55 |
| 46 | `{"t":"create","e":2,"zone":"base","owner":1,"card":"JTL#001","a":{"kind":"leader","exhausted":false,"deploy…` | R-01 create, audience "all" holds viewer (full 2) | 56 |
| 47 | `{"t":"create","e":3,"zone":"base","owner":2,"card":"SOR#029","a":{"kind":"base","damage":0,"hp":28}}` | R-01 create, audience "all" holds viewer (full 3) | 57 |
| 48 | `{"t":"create","e":4,"zone":"base","owner":2,"card":"SEC#008","a":{"kind":"leader","exhausted":false,"deploy…` | R-01 create, audience "all" holds viewer (full 4) | 58 |
| 49 | `{"t":"create","e":5,"zone":"resource","owner":1,"to":[1],"a":{"exhausted":false}}` | R-02 anonymous create (full 17) | 71 |
| 50 | `{"t":"create","e":6,"zone":"resource","owner":1,"to":[1],"a":{"exhausted":false}}` | R-02 anonymous create (full 18) | 72 |
| 51 | `{"t":"create","e":7,"zone":"resource","owner":2,"to":[2],"a":{"exhausted":false}}` | R-02 anonymous create (full 19) | 73 |
| 52 | `{"t":"create","e":8,"zone":"resource","owner":2,"to":[2],"a":{"exhausted":false}}` | R-02 anonymous create (full 20) | 74 |
| 53 | `{"t":"step","seq":0,"ms":0}` | R-10 step | 75 |
| 54 | `{"t":"create","e":9,"zone":"hand","owner":1,"card":"SOR#095","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 5) | 76 |
| 55 | `{"t":"set","e":9,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":3,"hp":3}}` | R-07 set of a known entity (full 5) | 77 |
| 56 | `{"t":"block","id":1,"kind":"play","p":1,"src":9}` | R-09 block 1 (play), every reference kept | 78 |
| 57 | `{"t":"set","e":"p1","a":{"handCount":7}}` | R-07 set of a known entity (full p1) | 79 |
| 58 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 80 |
| 59 | `{"t":"step","seq":1,"ms":6100}` | R-10 step | 81 |
| 60 | `{"t":"block","id":2,"kind":"pass","p":2}` | R-09 block 2 (pass), every reference kept | 82 |
| 61 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 83 |
| 62 | `{"t":"step","seq":2,"ms":9400}` | R-10 step | 84 |
| 63 | `{"t":"create","e":10,"zone":"hand","owner":1,"card":"SOR#120","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 6) | 85 |
| 64 | `{"t":"set","e":10,"zone":"ground","parent":9,"rel":"attached","a":{"kind":"upgrade"}}` | R-07 set of a known entity (full 6) | 86 |
| 65 | `{"t":"block","id":3,"kind":"play","p":1,"src":10,"targets":[9]}` | R-09 block 3 (play), every reference kept | 87 |
| 66 | `{"t":"set","e":9,"a":{"power":5,"hp":5}}` | R-07 set of a known entity (full 5) | 88 |
| 67 | `{"t":"set","e":"p1","a":{"handCount":6}}` | R-07 set of a known entity (full p1) | 89 |
| 68 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 90 |
| 69 | `{"t":"step","seq":3,"ms":15800}` | R-10 step | 91 |
| 70 | `{"t":"block","id":4,"kind":"pass","p":2}` | R-09 block 4 (pass), every reference kept | 92 |
| 71 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 93 |
| 72 | `{"t":"step","seq":4,"ms":18000}` | R-10 step | 94 |
| 73 | `{"t":"create","e":11,"zone":"hand","owner":1,"card":"SHD#040","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 7) | 95 |
| 74 | `{"t":"set","e":11,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":1,"hp":2}}` | R-07 set of a known entity (full 7) | 96 |
| 75 | `{"t":"block","id":5,"kind":"play","p":1,"src":11}` | R-09 block 5 (play), every reference kept | 97 |
| 76 | `{"t":"block","id":6,"kind":"trigger","p":1,"src":11,"targets":[9],"parent":5}` | R-09 block 6 (trigger), every reference kept | 98 |
| 77 | `{"t":"create","e":12,"zone":"ground","owner":1,"parent":9,"rel":"attached","card":"TOKEN:experience#2007868…` | R-01 create, audience "all" holds viewer (full 21) | 99 |
| 78 | `{"t":"set","e":9,"a":{"power":6,"hp":6}}` | R-07 set of a known entity (full 5) | 100 |
| 79 | `{"t":"set","e":"p1","a":{"handCount":5}}` | R-07 set of a known entity (full p1) | 101 |
| 80 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 102 |
| 81 | `{"t":"step","seq":5,"ms":24500}` | R-10 step | 103 |
| 82 | `{"t":"create","e":13,"zone":"hand","owner":2,"card":"SHD#142","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 13) | 104 |
| 83 | `{"t":"set","e":13,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":8,"hp":7}}` | R-07 set of a known entity (full 13) | 105 |
| 84 | `{"t":"block","id":7,"kind":"play","p":2,"src":13}` | R-09 block 7 (play), every reference kept | 106 |
| 85 | `{"t":"block","id":8,"kind":"trigger","p":2,"src":13,"targets":[10],"parent":7}` | R-09 block 8 (trigger), every reference kept | 107 |
| 86 | `{"t":"set","e":10,"controller":2,"parent":13,"rel":"attached"}` | R-07 set of a known entity (full 6) | 108 |
| 87 | `{"t":"set","e":9,"a":{"power":4,"hp":4}}` | R-07 set of a known entity (full 5) | 109 |
| 88 | `{"t":"set","e":13,"a":{"power":10,"hp":9}}` | R-07 set of a known entity (full 13) | 110 |
| 89 | `{"t":"set","e":"p2","a":{"handCount":3}}` | R-07 set of a known entity (full p2) | 111 |
| 90 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 112 |
| 91 | `{"t":"step","seq":6,"ms":33900}` | R-10 step | 113 |
| 92 | `{"t":"create","e":14,"zone":"hand","owner":1,"card":"SOR#120","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 8) | 114 |
| 93 | `{"t":"set","e":14,"zone":"ground","parent":9,"rel":"attached","a":{"kind":"upgrade"}}` | R-07 set of a known entity (full 8) | 115 |
| 94 | `{"t":"block","id":9,"kind":"play","p":1,"src":14,"targets":[9]}` | R-09 block 9 (play), every reference kept | 116 |
| 95 | `{"t":"set","e":9,"a":{"power":6,"hp":6}}` | R-07 set of a known entity (full 5) | 117 |
| 96 | `{"t":"set","e":"p1","a":{"handCount":4}}` | R-07 set of a known entity (full p1) | 118 |
| 97 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 119 |
| 98 | `{"t":"step","seq":7,"ms":38200}` | R-10 step | 120 |
| 99 | `{"t":"create","e":15,"zone":"hand","owner":2,"card":"SOR#199","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 14) | 121 |
| 100 | `{"t":"set","e":15,"zone":"discard","a":{"kind":"event"}}` | R-07 set of a known entity (full 14) | 122 |
| 101 | `{"t":"block","id":10,"kind":"play","p":2,"src":15,"targets":[9]}` | R-09 block 10 (play), every reference kept | 123 |
| 102 | `{"t":"set","e":14,"zone":"hand","parent":null,"rel":null}` | R-07 set of a known entity (full 8) | 124 |
| 103 | `{"t":"remove","e":12}` | R-08 remove (full 21) | 125 |
| 104 | `{"t":"set","e":9,"a":{"power":3,"hp":3}}` | R-07 set of a known entity (full 5) | 126 |
| 105 | `{"t":"set","e":"p1","a":{"handCount":5}}` | R-07 set of a known entity (full p1) | 127 |
| 106 | `{"t":"set","e":"p2","a":{"handCount":2}}` | R-07 set of a known entity (full p2) | 128 |
| 107 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 129 |
| 108 | `{"t":"step","seq":8,"ms":45000}` | R-10 step | 130 |
| 109 | `{"t":"create","e":16,"zone":"hand","owner":1,"card":"HMW#081","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 9) | 131 |
| 110 | `{"t":"set","e":16,"zone":"base","parent":1,"rel":"attached","a":{"kind":"upgrade"}}` | R-07 set of a known entity (full 9) | 132 |
| 111 | `{"t":"block","id":11,"kind":"play","p":1,"src":16,"targets":[1]}` | R-09 block 11 (play), every reference kept | 133 |
| 112 | `{"t":"set","e":"p1","a":{"handCount":4}}` | R-07 set of a known entity (full p1) | 134 |
| 113 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 135 |
| 114 | `{"t":"step","seq":9,"ms":49700}` | R-10 step | 136 |
| 115 | `{"t":"create","e":17,"zone":"hand","owner":2,"card":"SHD#120","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 15) | 137 |
| 116 | `{"t":"set","e":17,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":3,"hp":4}}` | R-07 set of a known entity (full 15) | 138 |
| 117 | `{"t":"block","id":12,"kind":"play","p":2,"src":17}` | R-09 block 12 (play), every reference kept | 139 |
| 118 | `{"t":"block","id":13,"kind":"trigger","p":2,"src":17,"targets":[9],"parent":12}` | R-09 block 13 (trigger), every reference kept | 140 |
| 119 | `{"t":"block","id":14,"kind":"capture","p":2,"src":17,"targets":[9],"parent":13}` | R-09 block 14 (capture), every reference kept | 141 |
| 120 | `{"t":"set","e":9,"zone":"captured","parent":17,"rel":"captured","a":{"exhausted":null,"damage":null,"power"…` | R-07 set of a known entity (full 5) | 142 |
| 121 | `{"t":"set","e":"p2","a":{"handCount":1}}` | R-07 set of a known entity (full p2) | 143 |
| 122 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 144 |
| 123 | `{"t":"step","seq":10,"ms":56300}` | R-10 step | 145 |
| 124 | `{"t":"create","e":18,"zone":"hand","owner":1,"card":"JTL#212","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 10) | 146 |
| 125 | `{"t":"set","e":18,"zone":"space","a":{"kind":"unit","exhausted":true,"damage":0,"power":1,"hp":3}}` | R-07 set of a known entity (full 10) | 147 |
| 126 | `{"t":"block","id":15,"kind":"play","p":1,"src":18}` | R-09 block 15 (play), every reference kept | 148 |
| 127 | `{"t":"set","e":"p1","a":{"handCount":3}}` | R-07 set of a known entity (full p1) | 149 |
| 128 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 150 |
| 129 | `{"t":"step","seq":11,"ms":60100}` | R-10 step | 151 |
| 130 | `{"t":"block","id":16,"kind":"pass","p":2}` | R-09 block 16 (pass), every reference kept | 152 |
| 131 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 153 |
| 132 | `{"t":"step","seq":12,"ms":61900}` | R-10 step | 154 |
| 133 | `{"t":"block","id":17,"kind":"deploy","p":1,"src":2,"targets":[18]}` | R-09 block 17 (deploy), every reference kept | 155 |
| 134 | `{"t":"set","e":2,"zone":"space","parent":18,"rel":"pilot","a":{"exhausted":null,"deployed":true,"epicAction…` | R-07 set of a known entity (full 2) | 156 |
| 135 | `{"t":"set","e":18,"a":{"power":4,"hp":7,"keywords":["grit"],"leaderUnit":true}}` | R-07 set of a known entity (full 10) | 157 |
| 136 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 158 |
| 137 | `{"t":"step","seq":13,"ms":68800}` | R-10 step | 159 |
| 138 | `{"t":"block","id":18,"kind":"pass","p":2}` | R-09 block 18 (pass), every reference kept | 160 |
| 139 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 161 |
| 140 | `{"t":"step","seq":14,"ms":70300}` | R-10 step | 162 |
| 141 | `{"t":"create","e":19,"zone":"hand","owner":1,"card":"JTL#126","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 11) | 163 |
| 142 | `{"t":"set","e":19,"zone":"discard","a":{"kind":"event"}}` | R-07 set of a known entity (full 11) | 164 |
| 143 | `{"t":"block","id":19,"kind":"play","p":1,"src":19,"targets":[2]}` | R-09 block 19 (play), every reference kept | 165 |
| 144 | `{"t":"set","e":2,"zone":"ground","parent":null,"rel":null,"a":{"exhausted":true,"damage":0,"power":4,"hp":6}}` | R-07 set of a known entity (full 2) | 166 |
| 145 | `{"t":"set","e":18,"a":{"power":1,"hp":3,"keywords":null,"leaderUnit":null}}` | R-07 set of a known entity (full 10) | 167 |
| 146 | `{"t":"block","id":20,"kind":"draw","p":1,"src":19,"amount":1,"parent":19}` | R-09 block 20 (draw); targets element dropped (full 22 is unmaterialized); targets removed: no element left | 169 |
| 147 | `{"t":"set","e":"p1","a":{"deckCount":19}}` | R-07 set of a known entity (full p1) | 170 |
| 148 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 171 |
| 149 | `{"t":"step","seq":15,"ms":77600}` | R-10 step | 172 |
| 150 | `{"t":"block","id":21,"kind":"pass","p":2}` | R-09 block 21 (pass), every reference kept | 173 |
| 151 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 174 |
| 152 | `{"t":"step","seq":16,"ms":79000}` | R-10 step | 175 |
| 153 | `{"t":"create","e":20,"zone":"hand","owner":1,"card":"HMW#102","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 12) | 176 |
| 154 | `{"t":"set","e":20,"zone":"discard","a":{"kind":"event"}}` | R-07 set of a known entity (full 12) | 177 |
| 155 | `{"t":"block","id":22,"kind":"play","p":1,"src":20,"targets":[17]}` | R-09 block 22 (play), every reference kept | 178 |
| 156 | `{"t":"block","id":23,"kind":"defeat","p":1,"src":20,"targets":[17],"parent":22}` | R-09 block 23 (defeat), every reference kept | 179 |
| 157 | `{"t":"block","id":24,"kind":"rescue","p":1,"targets":[9],"parent":22}` | R-09 block 24 (rescue), every reference kept | 180 |
| 158 | `{"t":"set","e":9,"zone":"ground","parent":null,"rel":null,"a":{"exhausted":true,"damage":0,"power":3,"hp":3}}` | R-07 set of a known entity (full 5) | 181 |
| 159 | `{"t":"set","e":17,"zone":"discard","a":{"exhausted":null,"damage":null,"power":null,"hp":null}}` | R-07 set of a known entity (full 15) | 182 |
| 160 | `{"t":"set","e":"p1","a":{"handCount":2}}` | R-07 set of a known entity (full p1) | 183 |
| 161 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 184 |
| 162 | `{"t":"step","seq":17,"ms":86400}` | R-10 step | 185 |
| 163 | `{"t":"block","id":25,"kind":"ability","p":2,"src":4}` | R-09 block 25 (ability), every reference kept | 186 |
| 164 | `{"t":"set","e":4,"a":{"exhausted":true}}` | R-07 set of a known entity (full 4) | 187 |
| 165 | `{"t":"remove","e":7}` | R-06 anonymous entity changes zone: remove (full 19) | 188 |
| 166 | `{"t":"create","e":21,"zone":"resource","owner":2,"to":[2],"a":{"exhausted":true}}` | R-02 anonymous create (full 23) | 189 |
| 167 | `{"t":"block","id":26,"kind":"resource","p":2,"src":4,"amount":1,"parent":25}` | R-09 block 26 (resource); targets element dropped (full 23 is anonymous); targets removed: no element left | 190 |
| 168 | `{"t":"set","e":"p2","a":{"deckCount":23,"handCount":2}}` | R-07 set of a known entity (full p2) | 191 |
| 169 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 192 |
| 170 | `{"t":"step","seq":18,"ms":93100}` | R-10 step | 193 |

## `full` records that emit nothing

- `full` line 59: R-02 nothing: full 5 unmaterialized
- `full` line 60: R-02 nothing: full 6 unmaterialized
- `full` line 61: R-02 nothing: full 7 unmaterialized
- `full` line 62: R-02 nothing: full 8 unmaterialized
- `full` line 63: R-02 nothing: full 9 unmaterialized
- `full` line 64: R-02 nothing: full 10 unmaterialized
- `full` line 65: R-02 nothing: full 11 unmaterialized
- `full` line 66: R-02 nothing: full 12 unmaterialized
- `full` line 67: R-02 nothing: full 13 unmaterialized
- `full` line 68: R-02 nothing: full 14 unmaterialized
- `full` line 69: R-02 nothing: full 15 unmaterialized
- `full` line 70: R-02 nothing: full 16 unmaterialized
- `full` line 168: R-02 nothing: full 22 unmaterialized
- `full` line 188: R-05 nothing (full 19)
