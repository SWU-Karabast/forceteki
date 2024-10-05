import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';

export default class CovertStrength extends EventCard {
    protected override getImplementationId () {
        return {
            id: '8645125292',
            internalName: 'covert-strength',
        };
    }

    public override setupCardAbilities () {
        this.setEventAbility({
            title: 'Heal 2 damage from a unit and give an Experience token to it',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.heal({ amount: 2 }),
                    AbilityHelper.immediateEffects.giveExperience()
                ])
            }
        });
    }
}

CovertStrength.implemented = true;
