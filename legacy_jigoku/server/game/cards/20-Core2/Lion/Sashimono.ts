import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class Sashimono extends DrawCard {
    static id = 'sashimono';

    setupCardAbilities() {
        this.attachmentConditions({ trait: 'bushi' });

        this.whileAttached({
            condition: () => this.game.isDuringConflict('military'),
            effect: AbilityDsl.effects.doesNotBow()
        });
    }
}
