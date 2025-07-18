import type { IAbilityHelper } from '../../../AbilityHelper';
import { KeywordName, TargetMode, WildcardCardType } from '../../../core/Constants';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';


export default class BountyHuntersQuarry extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '9642863632',
            internalName: 'bounty-hunters-quarry'
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addGainKeywordTargetingAttached({
            keyword: KeywordName.Bounty,
            ability: {
                title: 'Search the top 5 cards of your deck, or 10 cards instead if this unit is unique, for a unit that costs 3 or less and play it for free.',
                immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                    targetMode: TargetMode.Single,
                    searchCount: (context) => (context.source.unique ? 10 : 5),
                    cardCondition: (card) => card.isUnit() && card.cost <= 3,
                    selectedCardsImmediateEffect: AbilityHelper.immediateEffects.playCardFromOutOfPlay({
                        adjustCost: { costAdjustType: CostAdjustType.Free },
                        playAsType: WildcardCardType.Unit,
                    }),
                }),
            }
        });
    }
}
