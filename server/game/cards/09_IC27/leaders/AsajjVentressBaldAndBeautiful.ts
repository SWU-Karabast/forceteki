import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { TargetMode } from '../../../core/Constants';

export default class AsajjVentressBaldAndBeautiful extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4854582613',
            internalName: 'asajj-ventress#bald-and-beautiful',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Attack with a unit. After completing this attack, if the attacker survived, you may ready a resource.',
            cost: [abilityHelper.costs.exhaustSelf()],
            targetResolver: {
                immediateEffect: abilityHelper.immediateEffects.attack()
            },
            then: () => ({
                title: 'Ready a resource',
                optional: true,
                thenCondition: (context) => context.target?.isInPlay() &&
                  context.game.getPlayers().some((player) => player.exhaustedResourceCount > 0),
                targetResolver: {
                    activePromptTitle: 'Choose a player to ready a resource',
                    mode: TargetMode.Player,
                    immediateEffect: abilityHelper.immediateEffects.readyResources({ amount: 1 })
                }
            })
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Ready a resource',
            optional: true,
            targetResolver: {
                mode: TargetMode.Player,
                immediateEffect: abilityHelper.immediateEffects.readyResources({ amount: 1 })
            }
        });
    }
}
