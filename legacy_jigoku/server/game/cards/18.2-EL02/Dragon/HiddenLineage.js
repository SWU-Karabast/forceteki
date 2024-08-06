const DrawCard = require('../../../drawcard.js');
const { Players, CardTypes } = require('../../../Constants');
const AbilityDsl = require('../../../abilitydsl.js');

class HiddenLineage extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Move an attachment',
            target: {
                cardType: CardTypes.Attachment,
                controller: Players.Any,
                cardCondition: (card, context) => card.parent && card.parent.type === CardTypes.Character && card.parent.controller === context.player,
                gameAction: AbilityDsl.actions.selectCard(context => ({
                    cardType: CardTypes.Character,
                    cardCondition: card => card !== context.target.parent && card.controller === context.player,
                    message: '{0} moves {1} to {2}',
                    messageArgs: card => [context.player, context.target, card],
                    gameAction: AbilityDsl.actions.ifAble(context => ({
                        ifAbleAction: AbilityDsl.actions.attach({
                            attachment: context.target
                        }),
                        otherwiseAction: AbilityDsl.actions.discardFromPlay({ target: context.target })
                    }))
                }))
            },
            effect: 'move {0} to another character they control'
        });
    }
}

HiddenLineage.id = 'hidden-lineage';

module.exports = HiddenLineage;
