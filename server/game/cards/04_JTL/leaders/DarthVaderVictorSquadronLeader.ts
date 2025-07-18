import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { AbilityType, Trait, DeployType, WildcardZoneName } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { AttacksThisPhaseWatcher } from '../../../stateWatchers/AttacksThisPhaseWatcher';

export default class DarthVaderVictorSquadronLeader extends LeaderUnitCard {
    private attacksThisPhaseWatcher: AttacksThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '7661383869',
            internalName: 'darth-vader#victor-squadron-leader',
        };
    }

    protected override setupStateWatchers (registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.attacksThisPhaseWatcher = AbilityHelper.stateWatchers.attacksThisPhase(registrar, this);
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addPilotDeploy();

        registrar.addActionAbility({
            title: 'Create a TIE Fighter Token',
            cost: AbilityHelper.costs.exhaustSelf(),
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => this.attacksThisPhaseWatcher.someUnitAttackedControlledByPlayer({
                    controller: context.player,
                    filter: (attack) => context.source !== attack.attacker && attack.attacker.hasSomeTrait(Trait.Vehicle) && !attack.attacker.isTokenUnit()
                }),
                onTrue: AbilityHelper.immediateEffects.createTieFighter(),
            })
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addPilotingAbility({
            title: 'Create 2 TIE Fighter Tokens',
            type: AbilityType.Triggered,
            when: {
                onLeaderDeployed: (event, context) => event.card === context.source && event.type === DeployType.LeaderUpgrade
            },
            zoneFilter: WildcardZoneName.AnyArena,
            immediateEffect: AbilityHelper.immediateEffects.createTieFighter({ amount: 2 })
        });
    }
}