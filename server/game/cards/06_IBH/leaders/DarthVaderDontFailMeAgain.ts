import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class DarthVaderDontFailMeAgain extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9389694773',
            internalName: 'darth-vader#dont-fail-me-again'
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Deal 1 damage to a base',
            cost: [abilityHelper.costs.abilityActivationResourceCost(1), abilityHelper.costs.exhaustSelf()],
            targetResolver: {
                zoneFilter: ZoneName.Base,
                immediateEffect: abilityHelper.immediateEffects.damage({ amount: 1 })
            },
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Deal 2 damage to a base',
            targetResolver: {
                zoneFilter: ZoneName.Base,
                immediateEffect: abilityHelper.immediateEffects.damage({ amount: 2 })
            },
        });
    }
}
