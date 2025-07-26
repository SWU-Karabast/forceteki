import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class IonCannon extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9782761594',
            internalName: 'ion-cannon',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Deal 3 damage to a space unit',
            cost: abilityHelper.costs.exhaustSelf(),
            targetResolver: {
                zoneFilter: ZoneName.SpaceArena,
                immediateEffect: abilityHelper.immediateEffects.damage({ amount: 3 })
            }
        });
    }
}