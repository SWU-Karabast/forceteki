import AbilityDsl from '../../../abilitydsl';
import { Phases } from '../../../Constants';
import DrawCard from '../../../drawcard';

export default class MountainTattoo extends DrawCard {
    static id = 'mountain-tattoo';

    setupCardAbilities() {
        this.attachmentConditions({ trait: 'monk' });

        this.whileAttached({ effect: AbilityDsl.effects.addKeyword('tattooed') });

        this.whileAttached({
            effect: AbilityDsl.effects.cardCannot({
                cannot: 'target',
                restricts: 'opponentsEvents',
                source: this
            })
        });

        this.whileAttached({
            condition: (context) => context.game.currentPhase !== Phases.Fate,
            effect: AbilityDsl.effects.cardCannot({
                cannot: 'ready',
                source: this
            })
        });
    }
}
