const DrawCard = require('../../drawcard.js');
const { CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class FearlessSailor extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Move a fate from a character to a ring',
            condition: context => context.source.isParticipating(),
            target: {
                cardType: CardTypes.Character,
                cardCondition: card => card.hasStatusTokens && card.isParticipating(),
                gameAction: AbilityDsl.actions.cardLastingEffect({
                    effect: AbilityDsl.effects.modifyMilitarySkill(-2)
                })
            },
            effect: 'give {0} -2{1}',
            effectArgs: () => ['military']
        });
    }
}

FearlessSailor.id = 'fearless-sailor';

module.exports = FearlessSailor;
