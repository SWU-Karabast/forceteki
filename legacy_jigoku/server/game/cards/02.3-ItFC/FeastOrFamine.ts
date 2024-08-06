import { CardTypes, Players } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class FeastOrFamine extends ProvinceCard {
    static id = 'feast-or-famine';

    setupCardAbilities() {
        this.interrupt({
            title: 'Move 1 fate from an opposing character',
            when: {
                onBreakProvince: (event, context) => event.card === context.source
            },
            target: {
                cardType: CardTypes.Character,
                controller: Players.Opponent,
                gameAction: AbilityDsl.actions.selectCard((context) => ({
                    cardType: CardTypes.Character,
                    controller: Players.Self,
                    message: '{0} moves 1 fate from {1} to {2}',
                    messageArgs: (card) => [context.player, context.target, card],
                    gameAction: AbilityDsl.actions.placeFate({
                        origin: context.target,
                        amount: 1
                    })
                }))
            },
            effect: 'move 1 fate from {0} to a character they control'
        });
    }
}
