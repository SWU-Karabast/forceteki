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

### Fortify (test under the keyword, not per card)
- A Fortify upgrade can only be attached to a base you control: in Always Two never the teammate's base, in Twin Suns never an opponent's. Tested once here; the per-card notes for Fortify upgrades do not repeat it.

### Plot (test under the keyword, not per card)
- A Plot card can be played from resources only when you deploy one of your own leaders, paying with your own resources: in Twin Suns either of your two leaders, in Always Two never when the teammate deploys theirs. Tested once here; the per-card notes for Plot cards do not repeat it.

### Bounty (test under the keyword, not per card)
- A Bounty is always collected by an opponent of the player who controls the unit (in Always Two, by one of the two enemies, never the teammate of the controller).
- If an opponent of the controller defeats or captures the unit, that opponent collects it.
- If the controller defeats their own unit, or (Always Two) their teammate defeats it, the defeating player chooses which opponent collects it.
- Per-card notes cover only what the card does beyond that.

### Reveal, look at, disclose (test once here, not per card)
- A reveal is seen by every player, including the teammate in Always Two.
- A look at is private to the player who looks; the teammate does not see it (they may be told).
- Disclose uses only the disclosing player's own hand and aspects; a teammate's hand or aspects never satisfy it.
- Per-card notes cover only what is unusual about a card (which opponent or enemy's hand or deck, the choice of it, what later steps depend on the reveal).

### Bases and winning
- A base's damage counts up and can exceed its health. A base at or past its health is not eliminated and has 0 remaining HP (R10, R28).
- A team wins only when both enemy bases have reached their health. Whenever one player wins or loses the game through a card effect, both teammates win or lose (general rule, e.g. Final Showdown, Confidence in Victory).
- Shared turns: one action per team per turn by either teammate; shared initiative; no passing.
- "You take the initiative" in Always Two (open): the initiative is the team's, and when one teammate takes it neither can take it again. Whether a card worded "when/the next time you take the initiative" (Premonition of Doom) triggers when the teammate takes it is unknown. Decide and test it once here as a general engine behavior; per-card notes only cover what the card does beyond that.
- "Defeat a base" in Always Two (open): what an ability that defeats a base does mechanically (damage set equal to its health?) is not published. Twin Suns: a defeated base is one with damage at or above its health, so its player is eliminated. Decide and test the Always Two behavior once here as a general engine behavior; per-card notes and questions about it (Grand Moff Tarkin) are dropped.
- "When you heal damage from your base" in Always Two (open): whether a heal of your base done by the teammate's card or ability counts as you healing it (Darth Sidious) is unknown. Decide and test it once here; per-card notes only cover what the card does beyond that. Twin Suns: the heal of up to 5 for eliminating a player is real healing and triggers "when you heal" abilities for the damage actually healed.
- Replacing a teammate's attacker (open, Always Two): whether a hand-based replacement such as Asajj Ventress, Death From Above can be used when the TEAMMATE's unit is the attacker, and who controls the unit put into play as the attacker (and so deals the combat damage), are unknown. Decide and test once here; no per-card note on Asajj.
- Indirect damage and bases (open, Always Two; the Twin Suns answer is also not stated): whether the player assigning indirect damage may put more on a base than it can still take before reaching its health, and where the excess goes. Units can never be over-assigned. The answer is unknown, so it is decided and tested once here as a general engine behavior; per-card notes and open questions about it are dropped.

## Twin Suns (3-4 players)
- A player whose base takes damage equal to its health is eliminated, whatever dealt the damage. This core rule is tested once here, not per card; per-card notes only cover what a card does differently.
- Sentinel protects only its own controller's units and base. Saboteur ignores it.
- Attack targeting is per opponent: the attacker chooses which opponent's unit or base to attack.
- Ambush and effects that say "attack with a unit" let the controller choose the defender among every opponent's units, not only one opponent's. The defending player is the controller of the chosen defender.
- "An opponent" is chosen by the controller and the choice persists through the ability; "each opponent" is all non-eliminated opponents (R1, R18).
- The player who eliminates another player heals 5 damage from their own base, after the elimination is resolved. If a player eliminates themself through an ability, no player heals (to be tested once here, not per card).
- When a player is eliminated, every card they own is removed from the game immediately, even if another player controls it (to be tested once here).
- Cards removed from the game by an elimination are not counted as leaving play. If an effect eliminates a player partway through, the rest of the effect that refers to that player's cards fizzles (to be tested once here).
- Cards the eliminated player controls but does not own go to their owner's discard pile; that move is not a defeat and not leaving play, except that an effect lasting "until it leaves play" ends (to be tested once here).
- A card that makes a player lose the game (Final Showdown) eliminates them exactly like a defeated base: owned cards removed, no heal for anyone, and the game ends at the end of the phase with the most remaining base HP winning (ties share). Test once here. For Final Showdown specifically: if nobody is eliminated during the action phase, the player loses at the start of regroup and the game ends at the end of that regroup phase.
- A card that makes a player win the game (Confidence in Victory) ends the game at once: that player wins, everyone else loses, and the end-of-phase and base-HP rules do not apply. Test once here.
- Final Showdown engine cases (test once here): two players in the same Twin Suns game each playing it (both lose at the start of regroup, winner by remaining base HP among the survivors); the player who played it being eliminated during the action phase (the delayed regroup loss must not trigger or cause any further effect); in Always Two, a team loss by card effect when the other team has not met the win condition ends the game with the enemy team winning.
- The effects that do not fizzle mid-effect are still being settled (cards tagged "Twin Suns: Elimination Unclear").

## To check later (code scan)
- Scan every card that says "your base" or "friendly base" and check the code finds the base controlled by the player, not just any friendly base (in Always Two the teammate's base is friendly too). If it does, the Always Two notes about "your own base, not the teammate's" on those cards can go. Until then they stay.

## Indirect damage (test once here, not per card)
- "A player" (unqualified) can be any player, chosen by the controller of the ability: Twin Suns yourself or any one remaining opponent (never an eliminated player); Always Two yourself, the teammate or either enemy.
- The receiving player, not the player dealing it, assigns the damage among their own base and units; no other player's base or units are damaged and nobody else assigns it. (Whether a base can be over-assigned is open, below.)
- "To each opponent" deals it to every remaining opponent separately (Always Two: both enemies, never the teammate), each opponent assigning their own; an eliminated opponent is skipped.
- Indirect damage counts as dealt by the controller of the ability (or, for an ability granted to a unit, the controller of that unit), not by the player who receives it. A teammate's card dealing indirect damage is not "indirect damage you deal".
- "If a base was damaged this way" or "each unit damaged this way" looks only at what the receiving player actually assigned.
- Per-card notes cover only what a card does beyond this (a count, a condition, a follow-up effect, an override of who assigns).

## Both formats
- "Choose any number of players / opponents / bases" must support every subset, including none and all, and the controller (and the teammate in Always Two) where the card allows it (R30). The current engine is not set up for this.
- "Choose N players" (an exact count) must work for any N legal players.
- Choices made in turn by each player go clockwise starting with the player who played the card; "in player order" starts to the active player's left (R9). Cards that depend on this are reviewed manually.
- Pilots can be attached to, or deployed onto, a teammate's Vehicle in Always Two (to be tested). The player who plays or deploys the Pilot controls the upgrade, and the Vehicle keeps its controller. What a Pilot grants to the Vehicle belongs to the Vehicle's controller ("you" in any granted ability is the controller of the card that has it, in both formats); the Pilot's own text uses the player who plays or controls the Pilot. Bounty on a Vehicle defeated by a teammate follows the Bounty rule above.
