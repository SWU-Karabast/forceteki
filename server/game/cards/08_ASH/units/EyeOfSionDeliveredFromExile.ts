import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode, WildcardCardType } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class EyeOfSionDeliveredFromExile extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'eye-of-sion#delivered-from-exile-id',
            internalName: 'eye-of-sion#delivered-from-exile',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.addActionAbility({
            title: 'Search the top 8 cards of your deck for a unit that costs the same as or less than this unit\'s power. Play it for free. It enters play ready.',
            cost: abilityHelper.costs.exhaustSelf(),
            immediateEffect: abilityHelper.immediateEffects.deckSearch({
                targetMode: TargetMode.Single,
                searchCount: 8,
                cardCondition: (card, context) => card.isUnit() && card.cost <= context.source.getPower(),
                selectedCardsImmediateEffect: abilityHelper.immediateEffects.playCardFromOutOfPlay({
                    adjustCost: { costAdjustType: CostAdjustType.Free },
                    entersReady: true,
                    playAsType: WildcardCardType.Unit,
                }),
            }),
        });
    }
}
