import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class MerchantOfDesires extends DrawCard {
    static id = 'merchant-of-desires';

    setupCardAbilities() {
        this.action({
            title: 'Draw a card',
            cost: [
                AbilityDsl.costs.payHonor(1),
                AbilityDsl.costs.optionalOpponentLoseHonor('Lose 1 honor to draw a card?')
            ],
            gameAction: AbilityDsl.actions.draw((context) => ({
                amount: 1,
                target: context.costs.optionalOpponentLoseHonorPaid
                    ? [context.player, context.player.opponent]
                    : context.player
            })),
            effect: 'draw a card. {1} {2}',
            effectArgs: (context) => [
                context.player.opponent,
                context.costs.optionalOpponentLoseHonorPaid
                    ? 'does not resist and lose 1 honor to also draw a card'
                    : 'resists the temptation'
            ]
        });
    }
}
