import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class ManicuredGarden extends ProvinceCard {
    static id = 'manicured-garden';

    setupCardAbilities() {
        this.action({
            title: 'Gain 1 fate',
            gameAction: AbilityDsl.actions.gainFate()
        });
    }
}
