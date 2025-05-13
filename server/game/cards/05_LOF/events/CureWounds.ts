import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';

export default class CureWounds extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3853063436',
            internalName: 'cure-wounds',
        };
    }

    protected override setupCardAbilities() {
        this.setEventAbility({
            title: 'Use the Force',
            immediateEffect: AbilityHelper.immediateEffects.useTheForce(),
            ifYouDo: {
                title: 'Heal 6 damage from a unit',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.heal({ amount: 6 }),
                }
            }
        });
    }
}