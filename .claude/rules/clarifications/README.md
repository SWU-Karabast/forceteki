# Star Wars Unlimited Rules Clarifications — Directory Index

> Highest-authority source for rules questions. These official rulings supersede any ambiguity in the Comprehensive Rules.
> All Ryan Serrano answers are from the Nexus judge program. Dev team answers are collected from social media.

---

## Files in this directory

| File | Contents |
|------|----------|
| [admiral-timing-abilities.md](admiral-timing-abilities.md) | Ryan Serrano Q&A: modified actions, nested triggers, ability resolution windows, sequential vs simultaneous, attack step timing, consecutive passes |
| [admiral-combat-damage.md](admiral-combat-damage.md) | Ryan Serrano Q&A: attack steps, Overwhelm, combat damage timing, power modifiers during combat, indirect damage, damage prevention ("first/next") |
| [admiral-card-mechanics.md](admiral-card-mechanics.md) | Ryan Serrano Q&A: specific card interactions (Rey, Falcon, Annihilator, Yularen, Condemn, Clone, Always Two, Commandeer, Red Leader, Sly Moore, etc.) |
| [admiral-control-lki-effects.md](admiral-control-lki-effects.md) | Ryan Serrano Q&A: control/ownership changes, Last Known Information, replacement effects, upgrade attachment restrictions (3.6.3.B), Traitorous, Sneak Attack, Shadow Caster |
| [dev-team-sets-45.md](dev-team-sets-45.md) | Dev team social media clarifications — Sets 4 (JTL: pilots, indirect damage, Thrawn, Kaz, etc.) and 5 (LOF: Marchion Ro RAID) |
| [dev-team-sets-123.md](dev-team-sets-123.md) | Dev team social media clarifications — Sets 3 (TWI: Darth Maul, Clone, Chancellor Palpatine), 2 (SHD: Lurking TIE, Lando, Bounties), 1 (SOR: Regional Governor, Chirrut) |
| [misc.md](misc.md) | FFG via Jonah rulings, unofficial community explainers, commonly asked questions |

---

## How to use this directory

The `swu-rules-expert` agent uses `Grep` across these files — never reads them in full. When looking up a ruling:

1. **By card name**: `Grep "CardName" .claude/rules/clarifications/` to search all files at once.
2. **By topic**: target the most relevant file based on the table above, e.g., `Grep "Overwhelm" .claude/rules/clarifications/admiral-combat-damage.md`.
3. **Broad search**: `Grep "keyword" .claude/rules/clarifications/` searches the whole directory.
