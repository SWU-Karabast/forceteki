---
name: Context Card Naming
description: How internal card names map to context properties, and disambiguation rules
type: feedback
---

## Rule

Cards are auto-referenced on `context` in camelCase derived from the card's title, with the subtitle appended in camelCase only when needed to disambiguate multiple cards with the same title (Sabine Wren, Galvanized Revolutionary vs Sabine Wren, Explosives Artist) in the same test scope.

### Examples

| Internal name | Context property |
|---|---|
| `sabine-wren#explosives-artist` | `context.sabineWren` |
| `ahsoka-tano#i-learned-it-from-you` | `context.ahsokaTano` |
| `colonel-yularen#this-is-why-we-plan` | `context.colonelYularen` |
| `darth-vader#dark-lord-of-the-sith` | `context.darthVader` |
| `wampa` | `context.wampa` |

## Disambiguation

Only include the subtitle in the property name when the same base title appears multiple times in the same test scope. For example, if only one Darth Vader is in the test, `context.darthVader` is preferred over the full subtitle form.

**Why:** Shorter names reduce line length and improve readability. The subtitle form is only needed for disambiguation.
**How to apply:** Check the card file's `internalName` field to determine the correct camelCase expansion.

## ⚠ Known failure pattern — audit this explicitly

When auditing any spec file, **grep the file for `context.<title><Subtitle>`** patterns and verify each one actually needs the subtitle. This is a frequent miss. A card like `grogu#charming-companion` used alone in a file should appear as `context.grogu`, never `context.groguCharmingCompanion`.

**Checklist step:** After all other edits, do a final scan — search the file for any `context.[a-z]+[A-Z]` access that looks like it includes a subtitle word, and verify disambiguation is actually required before leaving it.
