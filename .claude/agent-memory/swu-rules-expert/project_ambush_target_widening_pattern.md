---
name: ambush-target-widening-pattern
description: Reasoning pattern for cards that grant "can attack bases while using Ambush" or similar Ambush-target-widening permissions (e.g. Fett's Firespray: Settling the Score)
metadata:
  type: project
---

Ambush (CR 7.5.5) is templated as a triggered ability whose trigger condition is "If there is an
enemy UNIT this unit can attack" — normal Ambush attacks can only ever target enemy units, never
bases, unlike normal attacks (which can always hit bases per 4.3.3/4.4.3). Some novel cards (e.g.
Fett's Firespray: Settling the Score, Homeworlds set — constant ability "Friendly units can attack
bases while using Ambush") relax this specific restriction.

Key rulings worked out for this pattern (2026-09-10, no official admiral/dev-team ruling found on
this exact interaction — treat as reasoned-from-rules, not confirmed):

1. **Self-application**: "Friendly units" self-applies to the source card too (no "other" qualifier
   used), same precedent as Admiral Yularen ("each friendly Vehicle unit gains X" applying to
   Yularen itself). If the source card has no printed Ambush, the permission is inert on itself
   unless it separately gains Ambush from another effect (e.g. Energy Conversion Lab Epic Action,
   confirmed in misc.md to allow ambushing via granted Ambush).

2. **Timing**: This is a constant ability (7.3.1-7.3.2), must be active at Declare Intent (6.3.1)
   and Check Restrictions (6.3.2) of the Ambush attack to make a base a legal target. If the source
   leaves play before the Ambush target is declared, the widened target set is gone. If it leaves
   play after the attack is validly declared/begun, the attack proceeds normally — analogous to
   6.3.3.c (attacker/defender leaving play mid-step doesn't unwind already-completed steps) and to
   the ruling that Play-a-Card keyword grants lock in at Declare Intent and stay active through the
   action (admiral-timing-abilities.md).

3. **Sentinel**: Restriction overrides permission (8.3, Golden Rule 1.3.3). A "can attack bases"
   permission does NOT let an Ambushing unit bypass an enemy Sentinel unit in the arena — Sentinel
   still forces the attack onto itself unless the ambushing unit separately has Saboteur (7.5.10).
   Same logic as the ruled Darth Maul vs Sentinel case (dev-team-sets-123.md).

4. **Scope of the permission**: It only widens legal targets for units *already* making an Ambush
   attack (from a printed or granted Ambush elsewhere) — it does not grant Ambush itself. A unit
   with no Ambush is entirely unaffected.

5. **Fizzle prevention (the genuinely open question)**: Normally, if no enemy unit is attackable, an
   Ambush trigger fizzles with no attack occurring (7.5.5.b). The reasoned default ruling: since the
   widening constant ability is continuously active (not gated behind the Ambush attack already
   existing), it should also broaden the Ambush trigger's own condition check — i.e., a unit that
   has no attackable enemy unit but does have an attackable enemy base should NOT fizzle and instead
   Ambush-attacks the base. This follows "do as much as possible" (1.3.2) and the phrasing pattern of
   4.3.4/4.4.4 (granted cross-arena attack permissions make those targets legal for all purposes,
   including whether the attack action is available at all). No official ruling confirms this either
   way — flag for confirmation if this pattern recurs in a real dev-team/admiral Q&A.

See also: [[admiral-timing-abilities]] (Declare Intent timing for granted keywords), Sentinel section
of 05-keywords.md, and the Darth Maul vs Sentinel ruling in dev-team-sets-123.md.
