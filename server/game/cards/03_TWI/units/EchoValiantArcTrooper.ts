import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType } from '../../../core/Constants';

export default class EchoValiantArcTrooper extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '2265363405',
            internalName: 'echo#valiant-arc-trooper',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addCoordinateAbility({
            type: AbilityType.Constant,
            title: 'This unit gets +2/+2.',
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ hp: 2, power: 2 })
        });
    }
}
