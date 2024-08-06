import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class TheRoarOfTheLioness extends ProvinceCard {
    static id = 'the-roar-of-the-lioness';

    setupCardAbilities() {
        this.persistentEffect({
            effect: AbilityDsl.effects.modifyBaseProvinceStrength((card) => Math.round(card.controller.honor / 2))
        });
    }
}
