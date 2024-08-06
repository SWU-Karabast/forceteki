import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class TheArtOfWar extends ProvinceCard {
    static id = 'the-art-of-war';

    setupCardAbilities() {
        this.interrupt({
            title: 'Draw 3 cards',
            when: {
                onBreakProvince: (event, context) => event.card === context.source
            },
            gameAction: AbilityDsl.actions.draw({ amount: 3 })
        });
    }
}
