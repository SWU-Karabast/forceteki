import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import { Aspect, WildcardCardType } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class DevastatorLordVadersFlagship extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'devastator#lord-vaders-flagship-id',
            internalName: 'devastator#lord-vaders-flagship',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: `Search the top 5 cards of your deck for a ${TextHelper.Villainy} unit that costs 12 or less and play it for free`,
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                searchCount: 5,
                activePromptTitle: `Choose a ${TextHelper.Villainy} unit that costs 12 or less to play for free`,
                cardCondition: (card) => card.isUnit() && card.hasSomeAspect(Aspect.Villainy) && card.cost <= 12,
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.playCardFromOutOfPlay({
                    adjustCost: { costAdjustType: CostAdjustType.Free },
                    playAsType: WildcardCardType.Unit,
                    nested: true
                })
            })
        });
    }
}