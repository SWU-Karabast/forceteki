# `tiny.public.swupgn`

This file is `tiny.full.swupgn` redacted by SPEC §11 for nobody (`public`): a seat is in an audience only when it is `"all"`. These notes are hand-reviewed and informative; the vector files are the normative part.

## Scenario

This is the worked example of the specification (`test/fixtures/design-7-1.ndjson`), with each `a` object's keys put in canonical order (W-07) and nothing else changed. Its card ids are stand-ins: `SOR#130` and `SOR#160` are played as events and `SOR#160` defeats a token and shuffles a unit, which the real cards do not do. SPEC Appendix A reproduces the `RECORDS` of `tiny.full` and `tiny.p1`.

| Step | What happens |
|---|---|
| 0 | Setup: each seat has a base, a leader, two cards in hand and one resource. |
| 1 | P1 plays `SOR#095` from hand to ground and exhausts its resource. |
| 2 | P2 plays the event `SOR#130`. It searches the top 3 of P2's deck (`SOR#200`, `SOR#201`, `SOR#202`), plays `SOR#201` to ground, gives it a Shield token, and the other two go back unseen. |
| 3 | P1 plays the event `SOR#160`. It defeats the Shield token and shuffles `SOR#201` into P2's deck. |
| 4, 5 | Both seats pass. Regroup: each draws 2. P2 draws `SOR#201` again, as a new entity (W-22). |
| 6 | P1 resources one of the cards it drew. |

## The redaction in brief

- The opponent's opening hand is unmaterialized (R-02); each card played from it is created on its `reveal` (R-03) and then moved (R-07).
- The opponent's resource is anonymous (R-02): it carries `to` [its seat] and only `exhausted`, and its `exhausted` change is kept (R-07, public attribute).
- P2's search cards are `to` [2]: in `p1` and `public` they are unmaterialized, the search block loses `targets` and `options` (R-09), and their `remove` emits nothing (R-08).
- P1's regroup resource (step 6) is a hand-to-resource move of a card the viewer never knew: in `p2` and `public`, step 0 applies but finds no known card in that hand, so it emits no `remove`; step 5 then creates an anonymous resource.

## Readings used by every vector

- **Header, `DECKS`, `CARDS` (R-11).** Every tag is kept except `Seed`, and `Visibility` is rewritten. The viewer's own `DECKS` line is kept without `order`. The other line (both lines in `public`) keeps `p`, `leaders` and `base`, sets `complete` to `false`, and lists one `[id]` per distinct card id that this file's `create` and `reveal` records give to an entity of that seat, in the order this file first gives each, leaving out `TOKEN:` ids and the line's own leaders and base. `CARDS` keeps the `full` lines, in their order, whose id appears in this file's header, `DECKS` or `RECORDS`.
- **Empty `a`.** A `create` made by step 3 or step 5 for an entity that has no attributes (a hand card) carries no `a` key, rather than `"a":{}`.
- **Fresh ids (R-14).** Output ids are handed out 1, 2, 3, … in the order the output first uses them. An id removed by step 0, 3, 6 or 8 is never used again.
- **The game itself is illustrative.** Costs and resource payments are not modelled, decks are short, and some timing is simplified. The records, and what each profile may know, are what the vector tests.

## Records

Each line of `RECORDS` in `tiny.public.swupgn`, with the step of SPEC §11.2 that produced it and the `full` record it came from. Entity ids in the "Step" column are `full` ids; ids in the "Record" column are this file's own.

| Line | Record | Step | From `full` line |
|---|---|---|---|
| 36 | `{"t":"set","e":"g","a":{"round":1,"phase":"action","active":1,"initiative":1,"initiativeTaken":false}}` | R-07 set of a known entity (full g) | 67 |
| 37 | `{"t":"set","e":"p1","a":{"deckCount":45,"handCount":2,"credits":0,"force":false}}` | R-07 set of a known entity (full p1) | 68 |
| 38 | `{"t":"set","e":"p2","a":{"deckCount":45,"handCount":2,"credits":0,"force":false}}` | R-07 set of a known entity (full p2) | 69 |
| 39 | `{"t":"create","e":1,"zone":"base","owner":1,"card":"SOR#026","a":{"kind":"base","damage":0,"hp":30}}` | R-01 create, audience "all" holds viewer (full 1) | 70 |
| 40 | `{"t":"create","e":2,"zone":"base","owner":1,"card":"SOR#005","a":{"kind":"leader","exhausted":false,"deploy…` | R-01 create, audience "all" holds viewer (full 2) | 71 |
| 41 | `{"t":"create","e":3,"zone":"base","owner":2,"card":"SOR#029","a":{"kind":"base","damage":0,"hp":28}}` | R-01 create, audience "all" holds viewer (full 3) | 72 |
| 42 | `{"t":"create","e":4,"zone":"base","owner":2,"card":"SOR#010","a":{"kind":"leader","exhausted":false,"deploy…` | R-01 create, audience "all" holds viewer (full 4) | 73 |
| 43 | `{"t":"create","e":5,"zone":"resource","owner":1,"to":[1],"a":{"exhausted":false}}` | R-02 anonymous create (full 9) | 78 |
| 44 | `{"t":"create","e":6,"zone":"resource","owner":2,"to":[2],"a":{"exhausted":false}}` | R-02 anonymous create (full 10) | 79 |
| 45 | `{"t":"step","seq":0}` | R-10 step | 80 |
| 46 | `{"t":"create","e":7,"zone":"hand","owner":1,"card":"SOR#095","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 5) | 81 |
| 47 | `{"t":"set","e":7,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":3,"hp":3}}` | R-07 set of a known entity (full 5) | 82 |
| 48 | `{"t":"block","id":1,"kind":"play","p":1,"src":7}` | R-09 block 1 (play), every reference kept | 83 |
| 49 | `{"t":"set","e":5,"a":{"exhausted":true}}` | R-07 set of an anonymous entity (full 9), public attributes only | 84 |
| 50 | `{"t":"set","e":"p1","a":{"handCount":1}}` | R-07 set of a known entity (full p1) | 85 |
| 51 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 86 |
| 52 | `{"t":"step","seq":1}` | R-10 step | 87 |
| 53 | `{"t":"create","e":8,"zone":"hand","owner":2,"card":"SOR#130","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 7) | 88 |
| 54 | `{"t":"set","e":8,"zone":"discard","a":{"kind":"event"}}` | R-07 set of a known entity (full 7) | 89 |
| 55 | `{"t":"block","id":2,"kind":"play","p":2,"src":8}` | R-09 block 2 (play), every reference kept | 90 |
| 56 | `{"t":"block","id":3,"kind":"search","p":2,"src":8,"amount":3,"parent":2}` | R-09 block 3 (search); targets element dropped (full 12 is unmaterialized); targets removed: no element left; options element dropped (full 11 is unmaterialized); options element dropped (full 12 is unmaterialized); options element dropped (full 13 is unmaterialized); options removed: no element left | 94 |
| 57 | `{"t":"create","e":9,"zone":"deck","owner":2,"card":"SOR#201","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 12) | 95 |
| 58 | `{"t":"set","e":9,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":2,"hp":4}}` | R-07 set of a known entity (full 12) | 96 |
| 59 | `{"t":"block","id":4,"kind":"play","p":2,"src":9,"parent":2}` | R-09 block 4 (play), every reference kept | 97 |
| 60 | `{"t":"create","e":10,"zone":"ground","owner":2,"parent":9,"rel":"attached","card":"TOKEN:shield#8752877738"…` | R-01 create, audience "all" holds viewer (full 14) | 98 |
| 61 | `{"t":"set","e":6,"a":{"exhausted":true}}` | R-07 set of an anonymous entity (full 10), public attributes only | 99 |
| 62 | `{"t":"set","e":"p2","a":{"deckCount":44,"handCount":1}}` | R-07 set of a known entity (full p2) | 102 |
| 63 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 103 |
| 64 | `{"t":"step","seq":2}` | R-10 step | 104 |
| 65 | `{"t":"create","e":11,"zone":"hand","owner":1,"card":"SOR#160","to":"all"}` | R-03 reveal of an unmaterialized entity: fresh known create (full 6) | 105 |
| 66 | `{"t":"set","e":11,"zone":"discard","a":{"kind":"event"}}` | R-07 set of a known entity (full 6) | 106 |
| 67 | `{"t":"block","id":5,"kind":"play","p":1,"src":11}` | R-09 block 5 (play), every reference kept | 107 |
| 68 | `{"t":"block","id":6,"kind":"defeat","p":1,"src":11,"targets":[10],"parent":5}` | R-09 block 6 (defeat), every reference kept | 108 |
| 69 | `{"t":"block","id":7,"kind":"shuffle","p":2,"src":11,"targets":[9],"amount":1,"parent":5}` | R-09 block 7 (shuffle), every reference kept | 109 |
| 70 | `{"t":"remove","e":10}` | R-08 remove (full 14) | 110 |
| 71 | `{"t":"remove","e":9}` | R-08 remove (full 12) | 111 |
| 72 | `{"t":"set","e":"p1","a":{"handCount":0}}` | R-07 set of a known entity (full p1) | 112 |
| 73 | `{"t":"set","e":"p2","a":{"deckCount":45}}` | R-07 set of a known entity (full p2) | 113 |
| 74 | `{"t":"set","e":"g","a":{"active":2}}` | R-07 set of a known entity (full g) | 114 |
| 75 | `{"t":"step","seq":3}` | R-10 step | 115 |
| 76 | `{"t":"block","id":8,"kind":"pass","p":2}` | R-09 block 8 (pass), every reference kept | 116 |
| 77 | `{"t":"set","e":"g","a":{"active":1}}` | R-07 set of a known entity (full g) | 117 |
| 78 | `{"t":"step","seq":4}` | R-10 step | 118 |
| 79 | `{"t":"block","id":9,"kind":"pass","p":1}` | R-09 block 9 (pass), every reference kept | 119 |
| 80 | `{"t":"block","id":10,"kind":"regroup"}` | R-09 block 10 (regroup), every reference kept | 120 |
| 81 | `{"t":"block","id":11,"kind":"draw","p":1,"amount":2,"parent":10,"group":1}` | R-09 block 11 (draw); targets element dropped (full 15 is unmaterialized); targets element dropped (full 16 is unmaterialized); targets removed: no element left | 125 |
| 82 | `{"t":"block","id":12,"kind":"draw","p":2,"amount":2,"parent":10,"group":1}` | R-09 block 12 (draw); targets element dropped (full 17 is unmaterialized); targets element dropped (full 18 is unmaterialized); targets removed: no element left | 126 |
| 83 | `{"t":"set","e":"p1","a":{"deckCount":43,"handCount":2}}` | R-07 set of a known entity (full p1) | 127 |
| 84 | `{"t":"set","e":"p2","a":{"deckCount":43,"handCount":3}}` | R-07 set of a known entity (full p2) | 128 |
| 85 | `{"t":"set","e":"g","a":{"phase":"regroup","active":null}}` | R-07 set of a known entity (full g) | 129 |
| 86 | `{"t":"step","seq":5}` | R-10 step | 130 |
| 87 | `{"t":"block","id":13,"kind":"resource","p":1,"amount":1,"parent":10}` | R-09 block 13 (resource); targets element dropped (full 15 is unmaterialized); targets removed: no element left | 131 |
| 88 | `{"t":"create","e":12,"zone":"resource","owner":1,"to":[1],"a":{"exhausted":true}}` | R-05 anonymous create after set (full 15) | 132 |
| 89 | `{"t":"set","e":"p1","a":{"handCount":1}}` | R-07 set of a known entity (full p1) | 133 |
| 90 | `{"t":"step","seq":6}` | R-10 step | 134 |

## `full` records that emit nothing

- `full` line 74: R-02 nothing: full 5 unmaterialized
- `full` line 75: R-02 nothing: full 6 unmaterialized
- `full` line 76: R-02 nothing: full 7 unmaterialized
- `full` line 77: R-02 nothing: full 8 unmaterialized
- `full` line 91: R-02 nothing: full 11 unmaterialized
- `full` line 92: R-02 nothing: full 12 unmaterialized
- `full` line 93: R-02 nothing: full 13 unmaterialized
- `full` line 100: R-08 nothing: unmaterialized (full 11)
- `full` line 101: R-08 nothing: unmaterialized (full 13)
- `full` line 121: R-02 nothing: full 15 unmaterialized
- `full` line 122: R-02 nothing: full 16 unmaterialized
- `full` line 123: R-02 nothing: full 17 unmaterialized
- `full` line 124: R-02 nothing: full 18 unmaterialized
