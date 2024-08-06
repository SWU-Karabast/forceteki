import { ProvinceCard } from '../../../ProvinceCard';
import AbilityDsl from '../../../abilitydsl';

export default class YatakabunePort extends ProvinceCard {
    static id = 'yatakabune-port';

    public setupCardAbilities() {
        this.interrupt({
            title: 'Claim the imperial favor',
            when: {
                onBreakProvince: (event, context) => event.card === context.source && context.game.isDuringConflict()
            },
            gameAction: AbilityDsl.actions.claimImperialFavor((context) => ({
                target: context.player
            }))
        });
    }
}
