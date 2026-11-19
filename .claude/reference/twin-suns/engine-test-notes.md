# Engine-level test notes (Twin Suns and Always Two)

Behaviors that belong to the engine rather than to any one card. They are tested once, in the engine scenarios (`test/scenarios/`), and are deliberately left out of the per-card notes. Each item is a requirement to test, not a record of a code change; the user's note on the first two is that no new code is expected, but the behavior still has to be tested.

Sources: `format-rules.md` (rulings R1-R31 and the official Doubles overview) and the review decisions made while going through the cards.

## Always Two (Doubles)

### Sentinel (test as described in the Doubles rules)
- Friendly Sentinel units protect their teammate's other units and base ("Shared Sentinels"), not only the Sentinel controller's own.
- An enemy attacker in the same arena cannot attack a non-Sentinel unit or the base of either teammate while a friendly Sentinel of that team can be attacked instead.
- Saboteur still ignores Sentinel.
- Which player's Sentinels count is by team: both teammates' Sentinels protect both teammates.

### Coordinate (R31)
- Coordinate counts only units controlled by the **same player**. A teammate's units are not counted, even though they are friendly.
- Check both the keyword on a card and Coordinate granted to a unit by another card (the granted keyword counts the controller of the unit that has it).

### Attacks and shared control
- An attack can only be initiated with a unit you control, never with the teammate's unit.
- You cannot play a teammate's cards or pay with their resources. (Teammate resources are friendly for effects that do not spend them: R21, R26.)
- An Action ability is used by the controller of the card, unless the card says otherwise (for example C-3PO, "Die, Jedi Dogs": "Only opponents may use this ability"). The teammate cannot use it or help pay.
- "Your hand", "your deck" and "your discard pile" mean the player's own zones only, never the teammate's, even though hands are visible.
- A player can never attack a teammate's unit or base. This covers Ambush and effects that say "attack with a unit".

### Keywords whose result depends on whose cards are involved
- **Restore:** heals the base of the controller of the unit with the keyword, however it was gained (R19).
- **Overwhelm:** excess damage goes to the base of the controller of the defending unit (official overview).
- **Exploit:** can only use the player's own units (R15).

### Bases and winning
- A base's damage counts up and can exceed its health. A base at or past its health is not eliminated and has 0 remaining HP (R10, R28).
- A team wins only when both enemy bases have reached their health. If one teammate wins through a card ability, both win.
- Shared turns: one action per team per turn by either teammate; shared initiative; no passing.

## Twin Suns (3-4 players)
- A player whose base takes damage equal to its health is eliminated, whatever dealt the damage. This core rule is tested once here, not per card; per-card notes only cover what a card does differently.
- Sentinel protects only its own controller's units and base. Saboteur ignores it.
- Attack targeting is per opponent: the attacker chooses which opponent's unit or base to attack.
- Ambush and effects that say "attack with a unit" let the controller choose the defender among every opponent's units, not only one opponent's. The defending player is the controller of the chosen defender.
- "An opponent" is chosen by the controller and the choice persists through the ability; "each opponent" is all non-eliminated opponents (R1, R18).
- Elimination, mid-effect elimination, controlled-not-owned cards and the end of the game are still being settled (cards tagged "Twin Suns: Elimination Unclear").

## To check later (code scan)
- Scan every card that says "your base" or "friendly base" and check the code finds the base controlled by the player, not just any friendly base (in Always Two the teammate's base is friendly too). If it does, the Always Two notes about "your own base, not the teammate's" on those cards can go. Until then they stay.

## Both formats
- "Choose any number of players / opponents / bases" must support every subset, including none and all, and the controller (and the teammate in Always Two) where the card allows it (R30). The current engine is not set up for this.
- "Choose N players" (an exact count) must work for any N legal players.
- Choices made in turn by each player go clockwise starting with the player who played the card; "in player order" starts to the active player's left (R9). Cards that depend on this are reviewed manually.
- Pilots can be attached to, or deployed onto, a teammate's Vehicle in Always Two (to be tested). The player who plays or deploys the Pilot controls the upgrade, and the Vehicle keeps its controller. Whose triggers apply to the Pilot's own text and to what it grants is still unknown, as is Bounty collection when a teammate defeats the unit (tagged "Always Two: Rules Unknown").
