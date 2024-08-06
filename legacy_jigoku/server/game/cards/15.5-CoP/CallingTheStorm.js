const DrawCard = require('../../drawcard.js');
const { Locations, Players, PlayTypes, Durations } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class CallingTheStorm extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Make top card of conflict deck playable',
            cost: AbilityDsl.costs.discardHand(),
            effect: 'play cards from their conflict deck this phase',
            gameAction: AbilityDsl.actions.multiple([
                AbilityDsl.actions.cardLastingEffect(context => ({
                    target: context.player.getAllConflictCards(), //since this applies in one shot, apply it to all conflict cards
                    targetLocation: Locations.Any,
                    duration: Durations.UntilEndOfPhase,
                    targetController: Players.Self,
                    canChangeZoneNTimes: 9999999, // can change zones infinite times and still be playable if it ends up in the deck
                    effect: AbilityDsl.effects.canPlayFromOutOfPlay((player, card) => {
                        return player && player.conflictDeck &&
                            context.player.conflictDeck.size() > 0 && card === player.conflictDeck.first() &&
                            player === card.owner && card.location === Locations.ConflictDeck;
                    }, PlayTypes.PlayFromHand)
                })),
                AbilityDsl.actions.playerLastingEffect(() => ({
                    targetController: Players.Self,
                    duration: Durations.UntilEndOfPhase,
                    effect: AbilityDsl.effects.showTopConflictCard(Players.Self)
                }))
            ])
        });
    }
}

CallingTheStorm.id = 'calling-the-storm';

module.exports = CallingTheStorm;
