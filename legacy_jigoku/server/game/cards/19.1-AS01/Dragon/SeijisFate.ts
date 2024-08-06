import AbilityDsl = require('../../../abilitydsl');
import DrawCard = require('../../../drawcard');

export default class SeijisFate extends DrawCard {
    static id = 'seiji-s-fate';

    public setupCardAbilities() {
        this.whileAttached({
            effect: [
                AbilityDsl.effects.addTrait('creature'),
                AbilityDsl.effects.loseTrait('bushi'),
                AbilityDsl.effects.loseTrait('courtier'),
                AbilityDsl.effects.blank()
            ]
        });
    }
}
