import AbilityDsl = require('../../abilitydsl');
import DrawCard = require('../../drawcard');

export default class BayushiManipulator extends DrawCard {
    static id = 'bayushi-manipulator';

    public setupCardAbilities() {
        this.reaction({
            title: 'Increase bid by 1',
            when: { onHonorDialsRevealed: (event) => event.isHonorBid },
            effect: 'increase their bid by 1',
            gameAction: AbilityDsl.actions.modifyBid()
        });
    }
}
