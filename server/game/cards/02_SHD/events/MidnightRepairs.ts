import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';

export default class MidnightRepairs extends EventCard {
    protected override getImplementationId () {
        return {
            id: '8818201543',
            internalName: 'midnight-repairs',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Heal up to 8 total damage from any number of units',
            immediateEffect: AbilityHelper.immediateEffects.distributeHealingAmong({
                amountToDistribute: 8,
                canChooseNoTargets: true,
                controller: WildcardRelativePlayer.Any,
                cardTypeFilter: WildcardCardType.Unit
            })
        });
    }
}
