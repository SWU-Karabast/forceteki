import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class CovertOperative extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: 'covert-operative-id',
            internalName: 'covert-operative',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'This unit captures an enemy non-leader unit that costs 2 or less',
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                controller: RelativePlayer.Opponent,
                cardCondition: (card) => card.isUnit() && card.cost <= 2,
                immediateEffect: abilityHelper.immediateEffects.capture()
            }
        });
    }
}