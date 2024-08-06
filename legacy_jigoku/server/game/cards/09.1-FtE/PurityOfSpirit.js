const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Durations, CardTypes } = require('../../Constants');

class PurityOfSpirit extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Choose a bushi character to honor',
            condition: () => this.game.isDuringConflict(),
            effect: 'honor {0}. Their status token will be discarded at the end of the conflict',
            target: {
                cardType: CardTypes.Character,
                cardCondition: card => card.hasTrait('bushi') && card.isParticipating(),
                gameAction: AbilityDsl.actions.multiple([
                    AbilityDsl.actions.honor(),
                    AbilityDsl.actions.cardLastingEffect(context => ({
                        duration: Durations.UntilEndOfPhase,
                        effect: AbilityDsl.effects.delayedEffect({
                            when : {
                                onConflictFinished: () => true
                            },
                            message: '{0} {3} removed from {1} due to the delayed effect of {2}',
                            messageArgs: [context.target.statusTokens, context.target, context.source, context.target.statusTokens.length > 1 ? 'are' : 'is'],
                            gameAction: AbilityDsl.actions.discardStatusToken(() => ({ target: context.target.statusTokens }))
                        })
                    }))
                ])
            }
        });
    }
}

PurityOfSpirit.id = 'purity-of-spirit';

module.exports = PurityOfSpirit;
