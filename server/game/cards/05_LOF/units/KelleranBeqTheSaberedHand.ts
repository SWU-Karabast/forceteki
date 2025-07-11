import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import AbilityHelper from '../../../AbilityHelper';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import { WildcardCardType } from '../../../core/Constants';

export default class KelleranBeqTheSaberedHand extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1553569317',
            internalName: 'kelleran-beq#the-sabered-hand',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addWhenPlayedAbility({
            title: 'Search the top 7 cards of your deck for a unit, reveal it, and play it. It costs 3 resources less',
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                searchCount: 7,
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.playCardFromOutOfPlay({
                    adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 3 },
                    playAsType: WildcardCardType.Unit
                })
            })
        });
    }
}