import { Direction } from '../../GameActions/ModifyBidAction';
import AbilityDsl = require('../../abilitydsl');
import DrawCard = require('../../drawcard');

export default class ContingencyPlan extends DrawCard {
    static id = 'contingency-plan';

    public setupCardAbilities() {
        this.reaction({
            title: 'Change your bid by 1',
            when: { onHonorDialsRevealed: (event) => event.isHonorBid },
            gameAction: AbilityDsl.actions.modifyBid({ direction: Direction.Prompt })
        });
    }
}
