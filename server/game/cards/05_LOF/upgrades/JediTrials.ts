import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';

export default class JediTrials extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '0545149763',
            internalName: 'jedi-trials',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => context.target.hasSomeTrait(Trait.Force));

        registrar.addGainOnAttackAbilityTargetingAttached({
            title: 'Give an Experience token to this unit',
            immediateEffect: AbilityHelper.immediateEffects.giveExperience()
        });

        registrar.addConstantAbilityTargetingAttached({
            title: 'While attached unit has 4 or more upgrades on it, it gains the Jedi trait',
            condition: (context) => context.source.parentCard.upgrades.length >= 4,
            ongoingEffect: AbilityHelper.ongoingEffects.gainTrait(Trait.Jedi)
        });
    }
}