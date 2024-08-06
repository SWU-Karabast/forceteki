import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class CentipedeTattoo extends DrawCard {
    static id = 'centipede-tattoo';

    setupCardAbilities() {
        this.attachmentConditions({ trait: 'monk' });

        this.whileAttached({ effect: AbilityDsl.effects.addKeyword('tattooed') });

        this.whileAttached({
            condition: () =>
                this.parent.isParticipating() && this.game.currentConflict.loser === this.parent.controller,
            effect: AbilityDsl.effects.doesNotBow()
        });
    }
}
