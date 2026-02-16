import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { AttacksThisPhaseWatcher } from '../../../stateWatchers/AttacksThisPhaseWatcher';
import type { UnitsDefeatedThisPhaseWatcher } from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';

export default class AnakinSkywalkerPrescientPodracer extends NonLeaderUnitCard {
    private unitsDefeatedThisPhaseWatcher: UnitsDefeatedThisPhaseWatcher;
    private attacksThisPhaseWatcher: AttacksThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '3261109271',
            internalName: 'anakin-skywalker#prescient-podracer',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.unitsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.unitsDefeatedThisPhase();
        this.attacksThisPhaseWatcher = AbilityHelper.stateWatchers.attacksThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.addTriggeredAbility({
            title: 'Return that unit to its owner\'s hand to heal 2 damage from your base',
            contextTitle: (context) => this.buildContextTitle(context),
            optional: true,
            when: {
                onAttackCompleted: (event, context) =>
                    this.friendlyUnitSurvivedAttack(event) &&
                    this.noOtherUnitsHaveAttackedThisPhase(event) &&
                    event.attack.attacker.controller === context.source.controller
            },
            immediateEffect: AbilityHelper.immediateEffects.returnToHand((context) => ({
                target: context.event.attack.attacker
            })),
            ifYouDo: (ifYouDoContext) => ({
                title: 'Heal 2 damage from your base',
                immediateEffect: AbilityHelper.immediateEffects.heal({
                    amount: 2,
                    target: ifYouDoContext.player.base
                })
            })
        });
    }

    private noOtherUnitsHaveAttackedThisPhase(event): boolean {
        return this.attacksThisPhaseWatcher.getAttackers((attackEvent) =>
            attackEvent.attacker !== event.attack.attacker ||
            attackEvent.attackerInPlayId !== event.attack.attackerInPlayId
        ).length === 0;
    }

    private friendlyUnitSurvivedAttack(event): boolean {
        return !this.unitsDefeatedThisPhaseWatcher.wasDefeatedThisPhase(event.attack.attacker, event.attack.attackerInPlayId);
    }

    private buildContextTitle(context): string {
        const attacker = context.event.attack.attacker;
        const ownerText = attacker.owner === context.player ? 'your' : `${attacker.owner.name}'s`;
        return `Return ${attacker.title} to ${ownerText} hand to heal 2 damage from your base`;
    }
}