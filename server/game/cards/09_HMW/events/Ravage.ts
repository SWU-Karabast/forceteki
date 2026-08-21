import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { WildcardCardType } from '../../../core/Constants';

export default class Ravage extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'ravage-id',
            internalName: 'ravage',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Distribute up to 3 Weakness tokens among any number of units',
            immediateEffect: AbilityHelper.immediateEffects.distributeWeaknessAmong({
                amountToDistribute: 3,
                canChooseNoTargets: true,
                canDistributeLess: true,
                cardTypeFilter: WildcardCardType.Unit,
            }),
        });
    }
}
