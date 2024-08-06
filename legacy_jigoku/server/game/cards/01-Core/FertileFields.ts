import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class FertileFields extends ProvinceCard {
    static id = 'fertile-fields';

    setupCardAbilities() {
        this.action({
            title: 'Draw a card',
            gameAction: AbilityDsl.actions.draw()
        });
    }
}
