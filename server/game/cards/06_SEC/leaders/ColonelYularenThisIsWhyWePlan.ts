import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';

export default class ColonelYularenThisIsWhyWePlan extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2334944054',
            internalName: 'colonel-yularen#this-is-why-we-plan',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Attack with a unit',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                immediateEffect: AbilityHelper.immediateEffects.attack()
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Attack with a unit that costs less',
                optional: true,
                initiateAttack: {
                    attackerCondition: (card) => card.isUnit() && card.cost < ifYouDoContext.target.cost,
                }
            })
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar) {
        registrar.addOnAttackCompletedAbility({
            title: 'Attack with another unit that costs 4 or less',
            optional: true,
            initiateAttack: {
                attackerCondition: (card) => card.isUnit() && card.cost <= 4,
            }
        });
    }
}