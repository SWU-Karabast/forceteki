import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType } from '../../../core/Constants';

export default class CloneHeavyGunner extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '9227411088',
            internalName: 'clone-heavy-gunner',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addCoordinateAbility({
            type: AbilityType.Constant,
            title: 'This unit gets +2/+0',
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
        });
    }
}
