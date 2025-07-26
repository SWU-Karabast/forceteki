import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, WildcardCardType } from '../../../core/Constants';

export default class ImperialDeckOfficer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9508246309',
            internalName: 'imperial-deck-officer',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Heal 2 damage from a Villainy unit',
            cost: abilityHelper.costs.exhaustSelf(),
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.hasSomeAspect(Aspect.Villainy),
                immediateEffect: abilityHelper.immediateEffects.heal({ amount: 2 })
            }
        });
    }
}