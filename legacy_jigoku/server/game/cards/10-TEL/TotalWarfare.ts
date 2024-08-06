import { CardTypes, Players } from '../../Constants';
import { BattlefieldAttachment } from '../BattlefieldAttachment';
import AbilityDsl = require('../../abilitydsl');

export default class TotalWarfare extends BattlefieldAttachment {
    static id = 'total-warfare';

    public setupCardAbilities() {
        super.setupCardAbilities();

        this.forcedReaction({
            title: 'Loser sacrifices a character',
            when: {
                afterConflict: (event, context) =>
                    context.source.parent && event.conflict.loser && context.source.parent.isConflictProvince()
            },
            target: {
                cardType: CardTypes.Character,
                player: (context) =>
                    context.player === this.game.currentConflict.loser ? Players.Self : Players.Opponent,
                cardCondition: (card) => card.isParticipating() && card.controller === this.game.currentConflict.loser,
                gameAction: AbilityDsl.actions.sacrifice()
            }
        });
    }
}
