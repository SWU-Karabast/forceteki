import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';

export default class ColonelYularenThisIsWhyWePlan extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'colonel-yularen#this-is-why-we-plan-id',
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
            then: (thenContext) => ({
                title: 'Attack with a unit that costs less',
                optional: true,
                thenCondition: (thenContext) => thenContext.target,
                initiateAttack: {
                    attackerCondition: (card) => card.isUnit() && card.cost < thenContext.target.cost,
                }
            })
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar) {
        registrar.addTriggeredAbility({
            title: 'Attack with another unit that costs 4 or less',
            optional: true,
            when: {
                onAttackCompleted: (event, context) => event.attack.attacker === context.source
            },
            initiateAttack: {
                attackerCondition: (card) => card.isUnit() && card.cost < 5,
            }
        });
    }
}