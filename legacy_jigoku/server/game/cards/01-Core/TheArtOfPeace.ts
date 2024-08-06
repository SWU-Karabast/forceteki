import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class TheArtOfPeace extends ProvinceCard {
    static id = 'the-art-of-peace';

    setupCardAbilities() {
        this.interrupt({
            title: 'Honor all defenders and dishonor all attackers',
            when: {
                onBreakProvince: (event, context) => event.card === context.source
            },
            effect: 'dishonor all attackers and honor all defenders in this conflict',
            gameAction: [
                AbilityDsl.actions.dishonor((context) => ({ target: (context as any).event.conflict.getAttackers() })),
                AbilityDsl.actions.honor((context) => ({ target: (context as any).event.conflict.getDefenders() }))
            ]
        });
    }
}
