import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class KensonNoGakka extends ProvinceCard {
    static id = 'kenson-no-gakka';

    setupCardAbilities() {
        this.reaction({
            title: 'Honor all defenders',
            when: {
                afterConflict: (event, context) =>
                    context.source.isConflictProvince() && event.conflict.loser === context.player
            },
            gameAction: AbilityDsl.actions.honor((context) => ({
                target: context.game.currentConflict.getDefenders()
            }))
        });
    }
}
