import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class AboveQuestion extends DrawCard {
    static id = 'above-question';

    setupCardAbilities() {
        this.whileAttached({
            effect: AbilityDsl.effects.cardCannot({
                cannot: 'target',
                restricts: 'opponentsEvents',
                source: this
            })
        });
    }
}
