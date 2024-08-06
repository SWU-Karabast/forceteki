const DrawCard = require('../../../drawcard.js');
const AbilityDsl = require('../../../abilitydsl.js');
const { CardTypes, Players } = require('../../../Constants.js');

class NightshadeInfiltrator extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Give a character -3/-3',
            cost: AbilityDsl.costs.dishonorSelf(),
            condition: context => context.source.isParticipating(),
            target: {
                player: Players.Self,
                cardType: CardTypes.Character,
                cardCondition: card => card.isParticipating(),
                gameAction: AbilityDsl.actions.cardLastingEffect(context => ({
                    target: context.target,
                    effect: AbilityDsl.effects.modifyBothSkills(-3)
                }))
            },
            effect: 'give {0} -3{1}/-3{2}',
            effectArgs: () => ['military', 'political']
        });
    }
}

NightshadeInfiltrator.id = 'nightshade-infiltrator';
module.exports = NightshadeInfiltrator;
