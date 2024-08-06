import { CardTypes, Players, TargetModes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import type BaseCard from '../../../basecard';
import DrawCard from '../../../drawcard';
import type { GameAction } from '../../../GameActions/GameAction';

export default class HeartOfTheInferno extends DrawCard {
    static id = 'heart-of-the-inferno';

    setupCardAbilities() {
        this.action({
            title: 'Bow a card',
            condition: (context) =>
                context.player.cardsInPlay.some(
                    (card: DrawCard) => card.isParticipating() && card.hasTrait('shugenja')
                ),
            target: {
                mode: TargetModes.Single,
                controller: Players.Opponent,
                cardCondition: (card: BaseCard) => card.isParticipating() || card.parent?.isParticipating(),
                gameAction: AbilityDsl.actions.multipleContext((context) => {
                    if (!(context.target instanceof DrawCard)) {
                        return { gameActions: [] };
                    }

                    const gameActions: Array<GameAction> = [];
                    if (context.target.type === CardTypes.Character && context.target.attachments.length === 0) {
                        gameActions.push(AbilityDsl.actions.bow({ target: context.target }));
                    }
                    if (context.target.type === CardTypes.Attachment && context.player.hasAffinity('fire', context)) {
                        gameActions.push(AbilityDsl.actions.discardFromPlay({ target: context.target }));
                    }

                    return { gameActions };
                })
            }
        });
    }
}
