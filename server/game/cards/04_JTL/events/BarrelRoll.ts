import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType, ZoneName } from '../../../core/Constants';

export default class BarrelRoll extends EventCard {
    protected override getImplementationId () {
        return {
            id: '7660822254',
            internalName: 'barrel-roll',
        };
    }

    public override setupCardAbilities () {
        this.setEventAbility({
            title: 'Attack with a space unit',
            targetResolver: {
                zoneFilter: ZoneName.SpaceArena,
                immediateEffect: AbilityHelper.immediateEffects.attack(),
            },
            then: (thenContext) => ({
                title: 'Exhaust a space unit',
                thenCondition: () => thenContext.events.length > 0,
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: ZoneName.SpaceArena,
                    immediateEffect: AbilityHelper.immediateEffects.exhaust()
                }
            })
        });
    }
}
