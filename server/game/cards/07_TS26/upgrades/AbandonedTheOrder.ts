import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName, Trait, WildcardCardType } from '../../../core/Constants';

export default class AbandonedTheOrder extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '8767791219',
            internalName: 'abandoned-the-order',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addGainKeywordTargetingAttached({ keyword: KeywordName.Restore, amount: 1 });
        registrar.addConstantAbilityTargetingAttached({
            title: 'Attached unit loses the Jedi trait',
            ongoingEffect: AbilityHelper.ongoingEffects.loseTrait(Trait.Jedi)
        });

        registrar.addWhenPlayedAbility({
            title: 'Return a non-leader unit to its owner\'s hand',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            }
        });
    }
}
