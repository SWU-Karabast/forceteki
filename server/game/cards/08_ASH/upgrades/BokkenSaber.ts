import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';

export default class BokkenSaber extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '0136138854',
            internalName: 'bokken-saber',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => !context.attachTarget.hasSomeTrait(Trait.Vehicle));

        registrar.addGainWhenAttackEndsAbilityTargetingAttached({
            title: 'Give an Advantage token to this unit',
            immediateEffect: abilityHelper.immediateEffects.giveAdvantage()
        });
    }
}
