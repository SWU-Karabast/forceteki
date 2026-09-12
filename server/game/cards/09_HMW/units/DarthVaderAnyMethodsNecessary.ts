import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import { WildcardCardType } from '../../../core/Constants';

export default class DarthVaderAnyMethodsNecessary extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'darth-vader#any-methods-necessary-id',
            internalName: 'darth-vader#any-methods-necessary',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Search the top 8 cards of your deck for up to 2 units that each cost 4 or less, play them for free, and deal 2 damage to each of them',
            immediateEffect: abilityHelper.immediateEffects.playMultipleCardsFromDeck({
                searchCount: 8,
                selectCount: 2,
                canChooseFewer: true,
                cardCondition: (card) => card.isUnit() && card.cost <= 4,
                selectedCardsImmediateEffect: abilityHelper.immediateEffects.sequential([
                    abilityHelper.immediateEffects.playCardFromOutOfPlay({
                        adjustCost: { costAdjustType: CostAdjustType.Free },
                        nested: true,
                        playAsType: WildcardCardType.Unit,
                        preResolveGameSystem: abilityHelper.immediateEffects.damage((context) => ({
                            amount: 2,
                            target: context.source
                        }))
                    }),
                ])
            }),
        });
    }
}