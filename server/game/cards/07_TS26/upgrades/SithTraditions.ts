import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

export default class SithTraditions extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '1377604550',
            internalName: 'sith-traditions',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => !context.attachTarget.hasSomeTrait(Trait.Vehicle));

        registrar.addGainOnAttackAbilityTargetingAttached({
            title: 'Give an Experience token to this unit',
            immediateEffect: abilityHelper.immediateEffects.giveExperience((context) => ({
                target: context.source,
            }))
        });

        registrar.addGainWhenDefeatedAbilityTargetingAttached({
            title: 'Give an Experience token to a friendly unit',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}
