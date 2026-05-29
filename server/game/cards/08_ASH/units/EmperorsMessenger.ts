import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode } from '../../../core/Constants';

export default class EmperorsMessenger extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6725068449',
            internalName: 'emperors-messenger',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Ready a resource',
            targetResolver: {
                mode: TargetMode.Player,
                immediateEffect: abilityHelper.immediateEffects.readyResources({ amount: 1 })
            }
        });
    }
}
