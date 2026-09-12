import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';

export default class ChewbaccaRelentlessRebel extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'chewbacca#relentless-rebel-id',
            internalName: 'chewbacca#relentless-rebel',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.addActionAbility({
            title: 'Attack with a unit, even if it\'s exhausted. It can\'t attack bases for this attack',
            cost: [abilityHelper.costs.abilityActivationResourceCost(2), abilityHelper.costs.exhaustSelf()],
            initiateAttack: {
                targetCondition: (target) => !target.isBase(),
                allowExhaustedAttacker: true,
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.addActionAbility({
            title: 'Attack with a unit, even if it\'s exhausted. It can\'t attack bases for this attack',
            limit: abilityHelper.limit.perRound(1),
            initiateAttack: {
                targetCondition: (target) => !target.isBase(),
                allowExhaustedAttacker: true,
            }
        });
    }
}
