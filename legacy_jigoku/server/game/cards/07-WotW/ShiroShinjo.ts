import { Locations } from '../../Constants';
import { StrongholdCard } from '../../StrongholdCard';
import AbilityDsl from '../../abilitydsl';

export default class ShiroShinjo extends StrongholdCard {
    static id = 'shiro-shinjo';

    setupCardAbilities() {
        this.reaction({
            title: 'Collect additional fate',
            cost: AbilityDsl.costs.bowSelf(),
            when: {
                onFateCollected: (event, context) => event.player === context.player
            },
            gameAction: AbilityDsl.actions.gainFate((context) => ({
                amount: context.player.getNumberOfOpponentsFaceupProvinces(
                    (province) => province.location !== Locations.StrongholdProvince
                )
            }))
        });
    }
}
