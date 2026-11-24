# `attachments.public.swupgn`

This file is `attachments.full.swupgn` redacted by SPEC §11 for nobody (`public`): a seat is in an audience only when it is `"all"`. These notes are hand-reviewed and informative; the vector files are the normative part.

## Scenario

Relations (`attached`, `pilot`, `captured`), `controller` different from `owner`, and an anonymous entity that changes zone.

| Step | What happens |
|---|---|
| 0 | Setup (`g.phase` `setup`): bases, leaders and opening hands. Each deck is shuffled (a `shuffle` block per seat) and each seat draws its opening hand (a `draw` block per seat, sharing a `group`). |
| 1 | The mulligan decision, made by both seats in one step (W-39): both keep, a `mulligan` block each with `amount` 0. |
| 2 | The opening resources, chosen by both seats in one step, P1 (which has the initiative) first. A `resource` block each, sharing a `group` (W-65). The action phase begins: `g.phase` becomes `action` and `g.active` 1. |
| 3 | P1 plays Battlefield Marine (`SOR#095`, `full` 5). |
| 5 | P1 plays Academy Training (`SOR#120`, `full` 6) on the Marine: `parent` 5, `rel` `attached`. |
| 7 | P1 plays Clan Wren Rescuer (`SHD#040`). Its When Played gives the Marine an Experience token (`full` 21). |
| 8 | P2 plays Pre Vizsla (`SHD#142`, `full` 13). His When Played takes control of Academy Training and attaches it to him: `controller` 2, `parent` 13, `owner` still 1. |
| 9 | P1 plays a second Academy Training (`full` 8, same card id as `full` 6) on the Marine. |
| 10 | P2 plays Bamboozle (`SOR#199`) on the Marine: the second Academy Training returns to its owner's hand (`parent: null`, `rel: null`, W-34) and the Experience token is removed (W-25). |
| 11 | P1 plays the Fortify upgrade Alliance Shield Generator (`HMW#081`) on P1's base: `zone` `base`, `parent` 1. |
| 12 | P2 plays Discerning Veteran (`SHD#120`, `full` 15), which captures the Marine: `zone` `captured`, `parent` 15, `rel` `captured` (W-28). |
| 13 | P1 plays Republic Y-Wing (`JTL#212`, `full` 10). |
| 15 | P1 deploys Asajj Ventress (`JTL#001`, `full` 2) as a pilot on the Y-Wing: `zone` `space`, `parent` 10, `rel` `pilot`. The Y-Wing becomes a leader unit with Grit. |
| 17 | P1 plays Eject (`JTL#126`): Asajj detaches and moves to ground as an exhausted unit. P1 draws a card. |
| 19 | P1 plays Dragon's Might (`HMW#102`) on Discerning Veteran. The Marine is rescued first (detached before its captor moves, W-30), then the Veteran goes to the discard pile. |
| 20 | P2 uses Bail Organa (`SEC#008`): a P2 resource returns to P2's hand, and the top card of P2's deck becomes a resource. |

Steps 0 and 1 are the setup decisions (mulligans, then opening resources: both seats in one step each, W-39); steps 4, 6, 14, 16 and 18 are passes by P2. Every step carries `ms` (R-10 copies it unchanged).

## The point of the vector

- Every `parent` is mapped through the id map (§11.1). Each upgrade's host is created before the upgrade moves onto it, in all four files.
- The upgrade returned to P1's hand at step 10 was public, so it stays known in P1's hand for P2 and in `public` (§10.2). Nothing leaves that hand face down afterwards, so it is still there at the last step.
- Step 20 in `p1` and `public`: the returned resource is anonymous and changes zone. Step 6 removes it, and step 5 then emits nothing because `hand` is count-only for the opponent. The new resource is a fresh anonymous entity (R-02).

## Readings used by every vector

- **Header, `DECKS`, `CARDS` (R-11).** Every tag that SPEC §5.1 or §5.2 defines is kept except `Seed`, any other tag is dropped (W-67), and `Visibility` is rewritten. The viewer's own `DECKS` line is kept without `order`. The other line (both lines in `public`) keeps `p`, `leaders` and `base`, sets `complete` to `false`, and lists one `[id]` per distinct card id that this file's `create` and `reveal` records give to an entity of that seat, in the order this file first gives each, leaving out `TOKEN:` ids and the line's own leaders and base. `CARDS` keeps the `full` lines, in their order, whose id appears in this file's header, `DECKS` or `RECORDS`.
- **Empty `a`.** A `create` made by step 3 or step 5 for an entity that has no attributes (a hand card) carries no `a` key, rather than `"a":{}`.
- **Fresh ids (R-14).** Output ids are handed out 1, 2, 3, … in the order the output first uses them. An id removed by step 0, 3, 6 or 8 is never used again.
- **The game itself is illustrative.** Costs and resource payments are not modelled, decks are short, and some timing is simplified. The records, and what each profile may know, are what the vector tests.

## Records

Each line of `RECORDS` in `attachments.public.swupgn`, with the step of SPEC §11.2 that produced it and the `full` record it came from. Entity ids in the "Step" column are `full` ids; ids in the "Record" column are this file's own.

| Line | Record | Step | From `full` line |
|---|---|---|---|
| 42 | `{"t":"set","e":"g","a":{"round":1,"phase":"setup","initiative":1,"initiativeTaken":false}}` | R-07 set of a known entity (full g) | 52 |
| 43 | `{"t":"set","e":"p1","a":{"deckCount":20,"handCount":8,"credits":0,"force":false}}` | R-07 set of a known entity (full p1) | 53 |
| 44 | `{"t":"set","e":"p2","a":{"deckCount":24,"handCount":4,"credits":0,"force":false}}` | R-07 set of a known entity (full p2) | 54 |
| 45 | `{"t":"create","e":1,"zone":"base","owner":1,"card":"SOR#026","a":{"kind":"base","damage":0,"hp":30}}` | R-01 create, audience "all" holds viewer (full 1) | 55 |
| 46 | `{"t":"create","e":2,"zone":"base","owner":1,"card":"JTL#001","a":{"kind":"leader","exhausted":false,"deploy…` | R-01 create, audience "all" holds viewer (full 2) | 56 |
| 47 | `{"t":"create","e":3,"zone":"base","owner":2,"card":"SOR#029","a":{"kind":"base","damage":0,"hp":28}}` | R-01 create, audience "all" holds viewer (full 3) | 57 |
| 48 | `{"t":"create","e":4,"zone":"base","owner":2,"card":"SEC#008","a":{"kind":"leader","exhausted":false,"deploy…` | R-01 create, audience "all" holds viewer (full 4) | 58 |
| 49 | `{"t":"block","id":1,"kind":"shuffle","p":1,"amount":0}` | R-09 block 1 (shuffle), every reference kept | 59 |
| 50 | `{"t":"block","id":2,"kind":"shuffle","p":2,"amount":0}` | R-09 block 2 (shuffle), every reference kept | 60 |
| 51 | `{"t":"block","id":3,"kind":"draw","p":1,"amount":8,"group":1}` | R-09 block 3 (draw); targets element dropped (full 5 is unmaterialized); targets element dropped (full 6 is unmaterialized); targets element dropped (full 7 is unmaterialized); targets element dropped (full 8 is unmaterialized); targets element dropped (full 9 is unmaterialized); targets element dropped (full 10 is unmaterialized); targets element dropped (full 11 is unmaterialized); targets element dropped (full 12 is unmaterialized); targets removed: no element left | 73 |
| 52 | `{"t":"block","id":4,"kind":"draw","p":2,"amount":4,"group":1}` | R-09 block 4 (draw); targets element dropped (full 13 is unmaterialized); targets element dropped (full 14 is unmaterialized); targets element dropped (full 15 is unmaterialized); targets element dropped (full 16 is unmaterialized); targets removed: no element left | 74 |
| 53 | `{"t":"step","seq":0,"ms":0}` | R-10 step | 75 |
| 54 | `{"t":"block","id":5,"kind":"mulligan","p":1,"amount":0}` | R-09 block 5 (mulligan), every reference kept | 76 |
| 55 | `{"t":"block","id":6,"kind":"mulligan","p":2,"amount":0}` | R-09 block 6 (mulligan), every reference kept | 77 |
| 56 | `{"t":"step","seq":1,"ms":0}` | R-10 step | 78 |
| 57 | `{"t":"create","e":5,"zone":"resource","owner":1,"to":[1],"a":{"exhausted":false}}` | R-02 anonymous create (full 17) | 79 |
| 58 | `{"t":"create","e":6,"zone":"resource","owner":1,"to":[1],"a":{"exhausted":false}}` | R-02 anonymous create (full 18) | 80 |
| 59 | `{"t":"create","e":7,"zone":"resource","owner":2,"to":[2],"a":{"exhausted":false}}` | R-02 anonymous create (full 19) | 81 |
| 60 | `{"t":"create","e":8,"zone":"resource","owner":2,"to":[2],"a":{"exhausted":false}}` | R-02 anonymous create (full 20) | 82 |
| 61 | `{"t":"block","id":7,"kind":"resource","p":1,"amount":2,"group":2}` | R-09 block 7 (resource); targets element dropped (full 17 is anonymous); targets element dropped (full 18 is anonymous); targets removed: no element left | 83 |
| 62 | `{"t":"block","id":8,"kind":"resource","p":2,"amount":2,"group":2}` | R-09 block 8 (resource); targets element dropped (full 19 is anonymous); targets element dropped (full 20 is anonymous); targets removed: no element left | 84 |
| 63 | `{"t":"set","e":"g","a":{"phase":"action","active":1}}` | R-07 set of a known entity (full g) | 85 |
| 64 | `{"t":"step","seq":2,"ms":0}` | R-10 step | 86 |
| 65 | `{"t":"create","e":9,"zone":"hand","owner":1,"card":"SOR#095","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 5) | 87 |
| 66 | `{"t":"set","e":9,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":3,"hp":3}}` | R-07 set of a known entity (full 5) | 88 |
| 67 | `{"t":"block","id":9,"kind":"play","p":1,"src":9}` | R-09 block 9 (play), every reference kept | 89 |
| 68 | `{"t":"set","e":"p1","a":{"handCount":7}}` | R-07 set of a known entity (full p1) | 90 |
| 69 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 91 |
| 70 | `{"t":"step","seq":3,"ms":6100}` | R-10 step | 92 |
| 71 | `{"t":"block","id":10,"kind":"pass","p":2}` | R-09 block 10 (pass), every reference kept | 93 |
| 72 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 94 |
| 73 | `{"t":"step","seq":4,"ms":9400}` | R-10 step | 95 |
| 74 | `{"t":"create","e":10,"zone":"hand","owner":1,"card":"SOR#120","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 6) | 96 |
| 75 | `{"t":"set","e":10,"zone":"ground","parent":9,"rel":"attached","a":{"kind":"upgrade"}}` | R-07 set of a known entity (full 6) | 97 |
| 76 | `{"t":"block","id":11,"kind":"play","p":1,"src":10,"targets":[9]}` | R-09 block 11 (play), every reference kept | 98 |
| 77 | `{"t":"set","e":9,"a":{"power":5,"hp":5}}` | R-07 set of a known entity (full 5) | 99 |
| 78 | `{"t":"set","e":"p1","a":{"handCount":6}}` | R-07 set of a known entity (full p1) | 100 |
| 79 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 101 |
| 80 | `{"t":"step","seq":5,"ms":15800}` | R-10 step | 102 |
| 81 | `{"t":"block","id":12,"kind":"pass","p":2}` | R-09 block 12 (pass), every reference kept | 103 |
| 82 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 104 |
| 83 | `{"t":"step","seq":6,"ms":18000}` | R-10 step | 105 |
| 84 | `{"t":"create","e":11,"zone":"hand","owner":1,"card":"SHD#040","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 7) | 106 |
| 85 | `{"t":"set","e":11,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":1,"hp":2}}` | R-07 set of a known entity (full 7) | 107 |
| 86 | `{"t":"block","id":13,"kind":"play","p":1,"src":11}` | R-09 block 13 (play), every reference kept | 108 |
| 87 | `{"t":"block","id":14,"kind":"trigger","p":1,"src":11,"targets":[9],"parent":13}` | R-09 block 14 (trigger), every reference kept | 109 |
| 88 | `{"t":"create","e":12,"zone":"ground","owner":1,"parent":9,"rel":"attached","card":"TOKEN:experience#2007868…` | R-01 create, audience "all" holds viewer (full 21) | 110 |
| 89 | `{"t":"set","e":9,"a":{"power":6,"hp":6}}` | R-07 set of a known entity (full 5) | 111 |
| 90 | `{"t":"set","e":"p1","a":{"handCount":5}}` | R-07 set of a known entity (full p1) | 112 |
| 91 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 113 |
| 92 | `{"t":"step","seq":7,"ms":24500}` | R-10 step | 114 |
| 93 | `{"t":"create","e":13,"zone":"hand","owner":2,"card":"SHD#142","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 13) | 115 |
| 94 | `{"t":"set","e":13,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":8,"hp":7}}` | R-07 set of a known entity (full 13) | 116 |
| 95 | `{"t":"block","id":15,"kind":"play","p":2,"src":13}` | R-09 block 15 (play), every reference kept | 117 |
| 96 | `{"t":"block","id":16,"kind":"trigger","p":2,"src":13,"targets":[10],"parent":15}` | R-09 block 16 (trigger), every reference kept | 118 |
| 97 | `{"t":"set","e":10,"controller":2,"parent":13,"rel":"attached"}` | R-07 set of a known entity (full 6) | 119 |
| 98 | `{"t":"set","e":9,"a":{"power":4,"hp":4}}` | R-07 set of a known entity (full 5) | 120 |
| 99 | `{"t":"set","e":13,"a":{"power":10,"hp":9}}` | R-07 set of a known entity (full 13) | 121 |
| 100 | `{"t":"set","e":"p2","a":{"handCount":3}}` | R-07 set of a known entity (full p2) | 122 |
| 101 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 123 |
| 102 | `{"t":"step","seq":8,"ms":33900}` | R-10 step | 124 |
| 103 | `{"t":"create","e":14,"zone":"hand","owner":1,"card":"SOR#120","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 8) | 125 |
| 104 | `{"t":"set","e":14,"zone":"ground","parent":9,"rel":"attached","a":{"kind":"upgrade"}}` | R-07 set of a known entity (full 8) | 126 |
| 105 | `{"t":"block","id":17,"kind":"play","p":1,"src":14,"targets":[9]}` | R-09 block 17 (play), every reference kept | 127 |
| 106 | `{"t":"set","e":9,"a":{"power":6,"hp":6}}` | R-07 set of a known entity (full 5) | 128 |
| 107 | `{"t":"set","e":"p1","a":{"handCount":4}}` | R-07 set of a known entity (full p1) | 129 |
| 108 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 130 |
| 109 | `{"t":"step","seq":9,"ms":38200}` | R-10 step | 131 |
| 110 | `{"t":"create","e":15,"zone":"hand","owner":2,"card":"SOR#199","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 14) | 132 |
| 111 | `{"t":"set","e":15,"zone":"discard","a":{"kind":"event"}}` | R-07 set of a known entity (full 14) | 133 |
| 112 | `{"t":"block","id":18,"kind":"play","p":2,"src":15,"targets":[9]}` | R-09 block 18 (play), every reference kept | 134 |
| 113 | `{"t":"set","e":14,"zone":"hand","parent":null,"rel":null}` | R-07 set of a known entity (full 8) | 135 |
| 114 | `{"t":"remove","e":12}` | R-08 remove (full 21) | 136 |
| 115 | `{"t":"set","e":9,"a":{"power":3,"hp":3}}` | R-07 set of a known entity (full 5) | 137 |
| 116 | `{"t":"set","e":"p1","a":{"handCount":5}}` | R-07 set of a known entity (full p1) | 138 |
| 117 | `{"t":"set","e":"p2","a":{"handCount":2}}` | R-07 set of a known entity (full p2) | 139 |
| 118 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 140 |
| 119 | `{"t":"step","seq":10,"ms":45000}` | R-10 step | 141 |
| 120 | `{"t":"create","e":16,"zone":"hand","owner":1,"card":"HMW#081","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 9) | 142 |
| 121 | `{"t":"set","e":16,"zone":"base","parent":1,"rel":"attached","a":{"kind":"upgrade"}}` | R-07 set of a known entity (full 9) | 143 |
| 122 | `{"t":"block","id":19,"kind":"play","p":1,"src":16,"targets":[1]}` | R-09 block 19 (play), every reference kept | 144 |
| 123 | `{"t":"set","e":"p1","a":{"handCount":4}}` | R-07 set of a known entity (full p1) | 145 |
| 124 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 146 |
| 125 | `{"t":"step","seq":11,"ms":49700}` | R-10 step | 147 |
| 126 | `{"t":"create","e":17,"zone":"hand","owner":2,"card":"SHD#120","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 15) | 148 |
| 127 | `{"t":"set","e":17,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":3,"hp":4}}` | R-07 set of a known entity (full 15) | 149 |
| 128 | `{"t":"block","id":20,"kind":"play","p":2,"src":17}` | R-09 block 20 (play), every reference kept | 150 |
| 129 | `{"t":"block","id":21,"kind":"trigger","p":2,"src":17,"targets":[9],"parent":20}` | R-09 block 21 (trigger), every reference kept | 151 |
| 130 | `{"t":"block","id":22,"kind":"capture","p":2,"src":17,"targets":[9],"parent":21}` | R-09 block 22 (capture), every reference kept | 152 |
| 131 | `{"t":"set","e":9,"zone":"captured","parent":17,"rel":"captured","a":{"exhausted":null,"damage":null,"power"…` | R-07 set of a known entity (full 5) | 153 |
| 132 | `{"t":"set","e":"p2","a":{"handCount":1}}` | R-07 set of a known entity (full p2) | 154 |
| 133 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 155 |
| 134 | `{"t":"step","seq":12,"ms":56300}` | R-10 step | 156 |
| 135 | `{"t":"create","e":18,"zone":"hand","owner":1,"card":"JTL#212","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 10) | 157 |
| 136 | `{"t":"set","e":18,"zone":"space","a":{"kind":"unit","exhausted":true,"damage":0,"power":1,"hp":3}}` | R-07 set of a known entity (full 10) | 158 |
| 137 | `{"t":"block","id":23,"kind":"play","p":1,"src":18}` | R-09 block 23 (play), every reference kept | 159 |
| 138 | `{"t":"set","e":"p1","a":{"handCount":3}}` | R-07 set of a known entity (full p1) | 160 |
| 139 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 161 |
| 140 | `{"t":"step","seq":13,"ms":60100}` | R-10 step | 162 |
| 141 | `{"t":"block","id":24,"kind":"pass","p":2}` | R-09 block 24 (pass), every reference kept | 163 |
| 142 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 164 |
| 143 | `{"t":"step","seq":14,"ms":61900}` | R-10 step | 165 |
| 144 | `{"t":"block","id":25,"kind":"deploy","p":1,"src":2,"targets":[18]}` | R-09 block 25 (deploy), every reference kept | 166 |
| 145 | `{"t":"set","e":2,"zone":"space","parent":18,"rel":"pilot","a":{"exhausted":null,"deployed":true,"epicAction…` | R-07 set of a known entity (full 2) | 167 |
| 146 | `{"t":"set","e":18,"a":{"power":4,"hp":7,"keywords":["grit"],"leaderUnit":true}}` | R-07 set of a known entity (full 10) | 168 |
| 147 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 169 |
| 148 | `{"t":"step","seq":15,"ms":68800}` | R-10 step | 170 |
| 149 | `{"t":"block","id":26,"kind":"pass","p":2}` | R-09 block 26 (pass), every reference kept | 171 |
| 150 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 172 |
| 151 | `{"t":"step","seq":16,"ms":70300}` | R-10 step | 173 |
| 152 | `{"t":"create","e":19,"zone":"hand","owner":1,"card":"JTL#126","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 11) | 174 |
| 153 | `{"t":"set","e":19,"zone":"discard","a":{"kind":"event"}}` | R-07 set of a known entity (full 11) | 175 |
| 154 | `{"t":"block","id":27,"kind":"play","p":1,"src":19,"targets":[2]}` | R-09 block 27 (play), every reference kept | 176 |
| 155 | `{"t":"set","e":2,"zone":"ground","parent":null,"rel":null,"a":{"exhausted":true,"damage":0,"power":4,"hp":6}}` | R-07 set of a known entity (full 2) | 177 |
| 156 | `{"t":"set","e":18,"a":{"power":1,"hp":3,"keywords":null,"leaderUnit":null}}` | R-07 set of a known entity (full 10) | 178 |
| 157 | `{"t":"block","id":28,"kind":"draw","p":1,"src":19,"amount":1,"parent":27}` | R-09 block 28 (draw); targets element dropped (full 22 is unmaterialized); targets removed: no element left | 180 |
| 158 | `{"t":"set","e":"p1","a":{"deckCount":19}}` | R-07 set of a known entity (full p1) | 181 |
| 159 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 182 |
| 160 | `{"t":"step","seq":17,"ms":77600}` | R-10 step | 183 |
| 161 | `{"t":"block","id":29,"kind":"pass","p":2}` | R-09 block 29 (pass), every reference kept | 184 |
| 162 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 185 |
| 163 | `{"t":"step","seq":18,"ms":79000}` | R-10 step | 186 |
| 164 | `{"t":"create","e":20,"zone":"hand","owner":1,"card":"HMW#102","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 12) | 187 |
| 165 | `{"t":"set","e":20,"zone":"discard","a":{"kind":"event"}}` | R-07 set of a known entity (full 12) | 188 |
| 166 | `{"t":"block","id":30,"kind":"play","p":1,"src":20,"targets":[17]}` | R-09 block 30 (play), every reference kept | 189 |
| 167 | `{"t":"block","id":31,"kind":"defeat","p":1,"src":20,"targets":[17],"parent":30}` | R-09 block 31 (defeat), every reference kept | 190 |
| 168 | `{"t":"block","id":32,"kind":"rescue","p":1,"targets":[9],"parent":30}` | R-09 block 32 (rescue), every reference kept | 191 |
| 169 | `{"t":"set","e":9,"zone":"ground","parent":null,"rel":null,"a":{"exhausted":true,"damage":0,"power":3,"hp":3}}` | R-07 set of a known entity (full 5) | 192 |
| 170 | `{"t":"set","e":17,"zone":"discard","a":{"exhausted":null,"damage":null,"power":null,"hp":null}}` | R-07 set of a known entity (full 15) | 193 |
| 171 | `{"t":"set","e":"p1","a":{"handCount":2}}` | R-07 set of a known entity (full p1) | 194 |
| 172 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 195 |
| 173 | `{"t":"step","seq":19,"ms":86400}` | R-10 step | 196 |
| 174 | `{"t":"block","id":33,"kind":"ability","p":2,"src":4}` | R-09 block 33 (ability), every reference kept | 197 |
| 175 | `{"t":"set","e":4,"a":{"exhausted":true}}` | R-07 set of a known entity (full 4) | 198 |
| 176 | `{"t":"remove","e":7}` | R-06 anonymous entity changes zone: remove (full 19) | 199 |
| 177 | `{"t":"create","e":21,"zone":"resource","owner":2,"to":[2],"a":{"exhausted":true}}` | R-02 anonymous create (full 23) | 200 |
| 178 | `{"t":"block","id":34,"kind":"resource","p":2,"src":4,"amount":1,"parent":33}` | R-09 block 34 (resource); targets element dropped (full 23 is anonymous); targets removed: no element left | 201 |
| 179 | `{"t":"set","e":"p2","a":{"deckCount":23,"handCount":2}}` | R-07 set of a known entity (full p2) | 202 |
| 180 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 203 |
| 181 | `{"t":"step","seq":20,"ms":93100}` | R-10 step | 204 |

## `full` records that emit nothing

- `full` line 61: R-02 nothing: full 5 unmaterialized
- `full` line 62: R-02 nothing: full 6 unmaterialized
- `full` line 63: R-02 nothing: full 7 unmaterialized
- `full` line 64: R-02 nothing: full 8 unmaterialized
- `full` line 65: R-02 nothing: full 9 unmaterialized
- `full` line 66: R-02 nothing: full 10 unmaterialized
- `full` line 67: R-02 nothing: full 11 unmaterialized
- `full` line 68: R-02 nothing: full 12 unmaterialized
- `full` line 69: R-02 nothing: full 13 unmaterialized
- `full` line 70: R-02 nothing: full 14 unmaterialized
- `full` line 71: R-02 nothing: full 15 unmaterialized
- `full` line 72: R-02 nothing: full 16 unmaterialized
- `full` line 179: R-02 nothing: full 22 unmaterialized
- `full` line 199: R-05 nothing (full 19)
