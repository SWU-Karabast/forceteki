import type { AbilityContext } from '../../../AbilityContext';
import AbilityDsl from '../../../abilitydsl';
import { CardTypes, Players } from '../../../Constants';
import DrawCard from '../../../drawcard';
import type { GameAction } from '../../../GameActions/GameAction';

export default class MangroveSafehouse extends DrawCard {
    static id = 'mangrove-safehouse';

    public setupCardAbilities() {
        this.action({
            title: 'Move an attacker out of the conflict',
            effect: 'move {0} home{1}',
            effectArgs: (context) => [
                this.targetIsMantis(context) && this.opponentHasFateToBeStolen(context) ? ' and steal 1 fate' : ''
            ],
            condition: (context) => context.game.isDuringConflict(),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                cardCondition: (card) => card.isAttacking(),
                gameAction: AbilityDsl.actions.multipleContext((context) => {
                    const gameActions: GameAction[] = [AbilityDsl.actions.sendHome()];
                    if (this.targetIsMantis(context)) {
                        gameActions.push(AbilityDsl.actions.takeFate({ target: context.player.opponent }));
                    }
                    return { gameActions };
                })
            }
        });
    }

    private targetIsMantis(context: AbilityContext): boolean {
        return context.target.traits.some((trait: string) => trait === 'mantis-clan');
    }

    private opponentHasFateToBeStolen(context: AbilityContext): boolean {
        return context.player.opponent.fate > 0;
    }
}
