import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { CardType, KeywordName, WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';

export default class TopTarget extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '4282425335',
            internalName: 'top-target',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addGainKeywordTargetingAttached({
            keyword: KeywordName.Bounty,
            ability: {
                title: 'Heal 4 damage from a unit or base. If the Bounty unit is unique, heal 6 damage instead.',
                targetResolver: {
                    controller: WildcardRelativePlayer.Any,
                    cardTypeFilter: [CardType.Base, WildcardCardType.Unit],
                    immediateEffect: AbilityHelper.immediateEffects.heal((context) => ({ amount: context.source.unique ? 6 : 4 })),
                }
            }
        });
    }
}
