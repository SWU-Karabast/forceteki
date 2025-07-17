import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType } from '../../../core/Constants';

export default class _41stEliteCorps extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '2260777958',
            internalName: '41st-elite-corps',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addCoordinateAbility({
            type: AbilityType.Constant,
            title: 'This unit gets +0/+3',
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 0, hp: 3 })
        });
    }
}
