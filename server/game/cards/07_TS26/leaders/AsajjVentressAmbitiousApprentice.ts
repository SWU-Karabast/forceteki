import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { AttacksThisPhaseWatcher } from '../../../stateWatchers/AttacksThisPhaseWatcher';

export default class AsajjVentressAmbitiousApprentice extends LeaderUnitCard {
    private attacksThisPhaseWatcher: AttacksThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '0284286472',
            internalName: 'asajj-ventress#ambitious-apprentice',
        };
    }

    protected override setupStateWatchers (registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.attacksThisPhaseWatcher = AbilityHelper.stateWatchers.attacksThisPhase();
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Attack with a token unit. It gets +1/+0 for this attack.',
            cost: [abilityHelper.costs.exhaustSelf()],
            initiateAttack: {
                attackerCondition: (card) => card.isTokenUnit(),
                attackerLastingEffects: {
                    effect: abilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 }),
                }
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While you\'ve attacked with a token unit this phase, this unit gets +2/+0.',
            condition: (context) => this.attacksThisPhaseWatcher.someUnitAttackedControlledByPlayer({ controller: context.player, filter: (e) => e.attacker.isTokenUnit() }),
            ongoingEffect: abilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
        });
    }
}
