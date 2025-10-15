import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class BlueAceColorfulRacer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'blue-ace#colorful-racer-id',
            internalName: 'blue-ace#colorful-racer',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Ready an exhausted enemy unit',
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.isUnit() && card.exhausted,
                immediateEffect: abilityHelper.immediateEffects.ready()
            }
        });
    }
}
