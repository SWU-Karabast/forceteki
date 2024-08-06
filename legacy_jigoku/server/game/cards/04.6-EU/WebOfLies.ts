import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class WebOfLies extends ProvinceCard {
    static id = 'web-of-lies';

    setupCardAbilities() {
        this.persistentEffect({
            effect: AbilityDsl.effects.modifyBaseProvinceStrength((card) => card.controller.showBid * 2)
        });
    }
}
