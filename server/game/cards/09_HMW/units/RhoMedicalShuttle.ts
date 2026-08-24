import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, WildcardCardType } from '../../../core/Constants';

export default class RhoMedicalShuttle extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'rho-medical-shuttle-id',
            internalName: 'rho-medical-shuttle',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Heal 1 damage from another unit or base',
            when: {
                whenPlayed: true,
                onAttack: true,
            },
            optional: true,
            targetResolver: {
                cardTypeFilter: [WildcardCardType.Unit, CardType.Base],
                cardCondition: (card, context) => card !== context.source,
                immediateEffect: abilityHelper.immediateEffects.heal({ amount: 1 })
            }
        });
    }
}