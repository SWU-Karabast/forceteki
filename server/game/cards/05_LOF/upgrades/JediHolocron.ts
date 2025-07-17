import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait, WildcardCardType } from '../../../core/Constants';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class JediHolocron extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '7377298352',
            internalName: 'jedi-holocron',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((card) => card.isUnit() && card.hasSomeTrait(Trait.Force));
        registrar.addGainOnAttackAbilityTargetingAttached({
            title: 'You may heal 3 damage from another unit.',
            optional: true,
            targetResolver: {
                cardCondition: (card, context) => card !== context.source,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.heal({ amount: 3 }),
            }
        });
    }
}