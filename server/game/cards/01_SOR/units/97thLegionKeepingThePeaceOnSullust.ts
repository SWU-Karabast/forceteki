import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class _97thLegionKeepingThePeaceOnSullust extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7648077180',
            internalName: '97th-legion#keeping-the-peace-on-sullust',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'This unit gets +1/+1 for each resource you control.',
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats((target) => ({
                power: target.controller.resources.length,
                hp: target.controller.resources.length,
            })),
        });
    }
}
