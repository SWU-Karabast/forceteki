import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class MidnightRepairs extends EventCard {
    protected override getImplementationId () {
        return {
            id: '8818201543',
            internalName: 'midnight-repairs',
        };
    }

    public override setupCardAbilities () {
        this.setEventAbility({
            title: 'Heal up to 8 total damage from any number of units',
            immediateEffect: AbilityHelper.immediateEffects.distributeHealingAmong({
                amountToDistribute: 8,
                canChooseNoTargets: true,
                controller: RelativePlayer.Any,
                cardTypeFilter: WildcardCardType.Unit
            })
        });
    }
}

MidnightRepairs.implemented = true;
