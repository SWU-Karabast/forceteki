import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, RelativePlayer, WildcardRelativePlayer } from '../../../core/Constants';

export default class HunterForHire extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'hunter-for-hire-id',
            internalName: 'hunter-for-hire',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.addActionAbility({
            title: 'Take control of this unit',
            canBeTriggeredBy: WildcardRelativePlayer.Any,
            cost: AbilityHelper.costs.defeat({
                activePromptTitle: 'Defeat a friendly Credit token',
                cardTypeFilter: CardType.TokenCard,
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.isCreditToken()
            }),
            immediateEffect: AbilityHelper.immediateEffects.takeControlOfUnit((context) => ({
                newController: context.player,
                excludeLeaderUnit: false,
            }))
        });
    }
}