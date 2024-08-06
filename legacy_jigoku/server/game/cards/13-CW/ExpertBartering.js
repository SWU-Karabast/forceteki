const DrawCard = require('../../drawcard.js');
const { Players, CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class ExpertBartering extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Switch this attachment with another',
            cost: AbilityDsl.costs.optionalFateCost(1),
            target: {
                cardType: CardTypes.Attachment,
                cardCondition: (card, context) => card !== context.source,
                controller: context => context.costs.optionalFateCost > 0 ? Players.Any : Players.Self
            },
            gameAction: AbilityDsl.actions.joint([
                AbilityDsl.actions.ifAble(context => ({
                    ifAbleAction: AbilityDsl.actions.attach({
                        target: context.source.parent,
                        attachment: context.target,
                        takeControl: context.target.controller !== context.player
                    }),
                    otherwiseAction: AbilityDsl.actions.discardFromPlay({ target: context.target })
                })),
                AbilityDsl.actions.ifAble(context => ({
                    ifAbleAction: AbilityDsl.actions.attach({
                        target: context.target.parent,
                        attachment: context.source,
                        giveControl: context.target.controller !== context.player
                    }),
                    otherwiseAction: AbilityDsl.actions.discardFromPlay({ target: context.source })
                }))
            ]),
            cannotTargetFirst: true,
            effect: 'switch {1} with {2}',
            effectArgs: context => [context.source, context.target]
        });
    }
}

ExpertBartering.id = 'expert-bartering';

module.exports = ExpertBartering;
