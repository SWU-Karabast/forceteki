import AbilityDsl from '../../../abilitydsl';
import { CardTypes, FavorTypes, Players } from '../../../Constants';
import DrawCard from '../../../drawcard';
import type { GameAction } from '../../../GameActions/GameAction';

export default class BeguilingMaiko extends DrawCard {
    static id = 'beguiling-maiko';

    setupCardAbilities() {
        this.reaction({
            title: 'Employ your charm',
            when: {
                onCharacterEntersPlay: (event, context) => event.card === context.source
            },
            gameAction: AbilityDsl.actions.sequentialContext((context) => {
                const favor = context.game.getFavorSide();
                if (favor === undefined) {
                    return {
                        gameActions: [AbilityDsl.actions.claimImperialFavor((context) => ({ target: context.player }))]
                    };
                }
                const gameActions: Array<GameAction> = [];
                if (favor === FavorTypes.Military || favor === FavorTypes.Both) {
                    gameActions.push(
                        AbilityDsl.actions.lookAt((context) => ({
                            target: context.player.opponent.hand.sortBy((card: DrawCard) => card.name),
                            chatMessage: true
                        }))
                    );
                }
                if (favor === FavorTypes.Political || favor === FavorTypes.Both) {
                    gameActions.push(
                        AbilityDsl.actions.selectCard({
                            effect: 'force {0} to dishonor one of their characters',
                            effectArgs: (context) => [context.player.opponent],
                            cardType: CardTypes.Character,
                            player: Players.Opponent,
                            controller: Players.Opponent,
                            gameAction: AbilityDsl.actions.dishonor(),
                            message: '{0} dishonors {1}',
                            messageArgs: (card, player) => [player, card]
                        })
                    );
                }
                return { gameActions };
            })
        });
    }
}
