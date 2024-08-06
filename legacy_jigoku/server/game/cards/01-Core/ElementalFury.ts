import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class ElementalFury extends ProvinceCard {
    static id = 'elemental-fury';

    setupCardAbilities() {
        this.reaction({
            title: 'Switch the contested ring',
            when: {
                onCardRevealed: (event, context) => event.card === context.source && this.game.isDuringConflict()
            },
            gameAction: AbilityDsl.actions.selectRing({
                message: '{0} switches the contested ring with {1}',
                ringCondition: (ring) => ring.isUnclaimed(),
                messageArgs: (ring, player) => [player, ring],
                gameAction: AbilityDsl.actions.switchConflictElement()
            }),
            effect: 'switch the contested ring with an unclaimed one'
        });
    }
}
