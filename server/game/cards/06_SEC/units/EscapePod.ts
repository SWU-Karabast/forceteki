import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

export default class EscapePod extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6732294734',
            internalName: 'escape-pod',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Capture a friendly non-Vehicle, non-leader unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.isNonLeaderUnit() && !card.hasSomeTrait(Trait.Vehicle),
                immediateEffect: abilityHelper.immediateEffects.capture()
            }
        });
    }
}
