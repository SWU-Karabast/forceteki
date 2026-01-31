import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { AttacksThisPhaseWatcher } from '../../../stateWatchers/AttacksThisPhaseWatcher';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';

export default class AnakinsPodracerSoWizard extends NonLeaderUnitCard {
    private AttacksThisPhaseWatcher: AttacksThisPhaseWatcher;
    protected override getImplementationId() {
        return {
            id: '2642298072',
            internalName: 'anakins-podracer#so-wizard',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper) {
        this.AttacksThisPhaseWatcher = AbilityHelper.stateWatchers.attacksThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While attacking, if no other units have attacked this phase, this unit deals combat damage before the defender.',
            condition: (context) =>
                !this.AttacksThisPhaseWatcher.someUnitAttackedControlledByPlayer({ controller: context.player, filter: (attack) => context.source !== attack.attacker }) &&
                !this.AttacksThisPhaseWatcher.someUnitAttackedControlledByPlayer({ controller: context.player.opponent }),
            ongoingEffect: AbilityHelper.ongoingEffects.dealsDamageBeforeDefender(),
        });
    }
}