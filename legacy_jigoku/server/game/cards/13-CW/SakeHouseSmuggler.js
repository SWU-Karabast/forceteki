const DrawCard = require('../../drawcard.js');
const { Durations, CardTypes, Phases } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class SakeHouseSmuggler extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Reduce cost of next non-event card by 1',
            phase: Phases.Conflict,
            effect: 'reduce the cost of each player\'s next non-event card by 1',
            gameAction: AbilityDsl.actions.multiple([
                AbilityDsl.actions.playerLastingEffect(context => ({
                    targetController: context.player,
                    duration: Durations.UntilEndOfPhase,
                    effect: AbilityDsl.effects.reduceNextPlayedCardCost(1, card => card.type !== CardTypes.Event)
                })),
                AbilityDsl.actions.playerLastingEffect(context => ({
                    duration: Durations.UntilEndOfPhase,
                    targetController: context.player.opponent,
                    effect: AbilityDsl.effects.reduceNextPlayedCardCost(1, card => card.type !== CardTypes.Event)
                }))
            ])
        });
    }
}

SakeHouseSmuggler.id = 'sake-house-smuggler';

module.exports = SakeHouseSmuggler;
