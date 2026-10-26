import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class BenKenobiDontBeAfraid extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0072366270',
            internalName: 'ben-kenobi#dont-be-afraid',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Exhaust a unit with 3 or less power',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.isUnit() && card.getPower() <= 3,
                immediateEffect: abilityHelper.immediateEffects.exhaust()
            }
        });

        registrar.addOnAttackAbility({
            title: 'Heal 3 damage from another unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card !== context.source,
                immediateEffect: abilityHelper.immediateEffects.heal({ amount: 3 })
            }
        });
    }
}