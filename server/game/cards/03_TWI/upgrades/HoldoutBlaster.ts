import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class HoldoutBlaster extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '7280804443',
            internalName: 'holdout-blaster',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => !context.attachTarget.hasSomeTrait(Trait.Vehicle));

        registrar.addWhenPlayedAbility({
            title: 'You may have attached unit deal 1 damage to a ground unit.',
            optional: true,
            targetResolver: {
                zoneFilter: ZoneName.GroundArena,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                    amount: 1,
                    source: context.source.parentCard
                }))
            }
        });
    }
}
