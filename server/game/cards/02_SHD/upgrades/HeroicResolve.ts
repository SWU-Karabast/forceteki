import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName, WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';

export default class HeroicResolve extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '4085341914',
            internalName: 'heroic-resolve',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addGainActionAbilityTargetingAttached({
            title: 'Attack with this unit. It gains +4/+0 and Overwhelm for this attack.',
            cost: [
                AbilityHelper.costs.abilityActivationResourceCost(2),
                AbilityHelper.costs.defeat({
                    cardCondition: (card, context) => card.isUpgrade() && card.parentCard === context.source && card.title === 'Heroic Resolve',
                    controller: WildcardRelativePlayer.Any,
                    cardTypeFilter: WildcardCardType.Upgrade
                })
            ],
            immediateEffect: AbilityHelper.immediateEffects.attack({
                attackerLastingEffects: [
                    { effect: AbilityHelper.ongoingEffects.modifyStats({ power: 4, hp: 0 }) },
                    { effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm) }
                ]
            })
        });
    }
}
