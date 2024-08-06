import { CardTypes, Players } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class BordersEdgeBarracks extends DrawCard {
    static id = 'border-s-edge-barracks';

    setupCardAbilities() {
        this.action({
            title: 'Move a character to the conflict',
            condition: (context) => context.player.isDefendingPlayer(),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                gameAction: AbilityDsl.actions.moveToConflict()
            },
            limit: AbilityDsl.limit.perConflict(1),
        });
    }
}
