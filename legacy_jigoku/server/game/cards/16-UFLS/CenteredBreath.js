const DrawCard = require('../../drawcard.js');
const { Durations, Players, CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class CenteredBreath extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Add an additional ability use to a monk',
            target: {
                cardType: CardTypes.Character,
                controller: Players.Any,
                cardCondition: card => card.hasTrait('monk') && card.isParticipating(),
                gameAction: AbilityDsl.actions.sequential([
                    AbilityDsl.actions.cardLastingEffect({
                        duration: Durations.UntilEndOfRound,
                        effect: AbilityDsl.effects.increaseLimitOnPrintedAbilities()
                    }),
                    AbilityDsl.actions.playerLastingEffect(context => ({
                        targetController: context.player,
                        duration: Durations.UntilPassPriority,
                        effect: context.player.isKihoPlayedThisConflict(context, this) ? AbilityDsl.effects.additionalAction() : []
                    }))
                ])
            },
            effect: 'add an additional use to each of {0}\'s printed abilities{1}',
            effectArgs: context => [context.player.isKihoPlayedThisConflict(context, this) ? ' and take an additional action' : '']
        });
    }
}

CenteredBreath.id = 'centered-breath';

module.exports = CenteredBreath;
