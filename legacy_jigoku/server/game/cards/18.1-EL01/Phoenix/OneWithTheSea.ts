import AbilityDsl from '../../../abilitydsl';
import { CardTypes, Players } from '../../../Constants';
import DrawCard from '../../../drawcard';

export default class OneWithTheSea extends DrawCard {
    static id = 'one-with-the-sea';

    setupCardAbilities() {
        this.action({
            title: 'Move a character you control to the conflict',
            condition: (context) => context.game.isDuringConflict(),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                gameAction: AbilityDsl.actions.moveToConflict()
            }
        });

        this.action({
            title: 'Move any character to the conflict',
            cost: AbilityDsl.costs.payFate(1),
            max: AbilityDsl.limit.perRound(1),
            condition: (context) =>
                context.game.isDuringConflict() && context.game.rings['water'].isConsideredClaimed(context.player),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Any,
                gameAction: AbilityDsl.actions.moveToConflict()
            }
        });
    }
}
