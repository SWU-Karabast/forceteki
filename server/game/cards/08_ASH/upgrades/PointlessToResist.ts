import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class PointlessToResist extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: 'pointless-to-resist-id',
            internalName: 'pointless-to-resist',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbilityTargetingAttached({
            title: 'Attached unit gets -3/-0 while attacking a base',
            condition: (context) => context.source.parentCard.isAttacking() && context.source.parentCard.activeAttack?.getAllTargets().some((target) => target.isBase()),
            ongoingEffect: abilityHelper.ongoingEffects.modifyStats({ power: -3, hp: 0 })
        });
    }
}
