import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class DoctorHemlockEmotionHasNoPlaceHere extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'doctor-hemlock#emotion-has-no-place-here-id',
            internalName: 'doctor-hemlock#emotion-has-no-place-here',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Give a Weakness token to a unit without a Weakness token on it',
            cost: [
                AbilityHelper.costs.abilityActivationResourceCost(1),
                AbilityHelper.costs.exhaustSelf()
            ],
            targetResolver: {
                cardCondition: (card) => card.isUnit() && !card.hasWeakness(),
                immediateEffect: AbilityHelper.immediateEffects.giveWeakness()
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Give a Weakness token to a unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.giveWeakness()
            }
        });
    }
}