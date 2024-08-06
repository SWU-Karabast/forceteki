const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { AbilityTypes, CardTypes, Players } = require('../../Constants.js');

class JadeInlaidKatana extends DrawCard {
    setupCardAbilities() {
        this.whileAttached({
            effect: AbilityDsl.effects.gainAbility(AbilityTypes.Reaction, {
                title: 'Remove 1 fate from a character',
                printedAbility: false,
                when: {
                    afterConflict: (event, context) =>
                        context.source.isParticipating() && event.conflict.winner === context.source.controller
                },
                target: {
                    cardType: CardTypes.Character,
                    controller: Players.Any,
                    cardCondition: (card) => {
                        return card.hasStatusTokens && card.isParticipating();
                    },
                    gameAction: AbilityDsl.actions.removeFate()
                }
            })
        });
    }
}

JadeInlaidKatana.id = 'jade-inlaid-katana';

module.exports = JadeInlaidKatana;
