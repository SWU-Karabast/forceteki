import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class InquisitorsLightsaber extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '3895004077',
            internalName: 'inquisitors-lightsaber',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => !context.attachTarget.hasSomeTrait(Trait.Vehicle));

        registrar.addConstantAbilityTargetingAttached({
            title: `While attacking a ${TextHelper.Trait.Force} unit, this unit gets +2/+0.`,
            condition: (context) => context.source.parentCard.isAttacking() && context.source.parentCard.activeAttack?.targetIsUnit((card) => card.hasSomeTrait(Trait.Force), true),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
        });
    }
}