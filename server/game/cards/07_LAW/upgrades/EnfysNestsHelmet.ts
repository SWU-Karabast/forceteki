import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';

export default class EnfysNestsHelmet extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: 'enfys-nests-helmet-id',
            internalName: 'enfys-nests-helmet'
        };
    }

    public override setupCardAbilities (registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => !context.attachTarget.hasSomeTrait(Trait.Vehicle));

        registrar.addGainOnAttackAbilityTargetingAttached({
            title: 'Give another unit +3/+0 for this phase',
            optional: true,
            targetResolver: {
                cardCondition: (card, context) => card !== context.source && card.isUnit(),
                immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: abilityHelper.ongoingEffects.modifyStats({ power: 3, hp: 0 })
                }),
            }
        });
    }
}
