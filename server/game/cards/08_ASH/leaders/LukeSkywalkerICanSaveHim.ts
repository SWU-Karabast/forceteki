import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import * as AttackHelpers from '../../../core/attack/AttackHelpers';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { UnitsDefeatedThisPhaseWatcher } from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';

export default class LukeSkywalkerICanSaveHim extends LeaderUnitCard {
    private unitsDefeatedThisPhaseWatcher: UnitsDefeatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: 'luke-skywalker#i-can-save-him-id',
            internalName: 'luke-skywalker#i-can-save-him',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, abilityHelper: IAbilityHelper): void {
        this.unitsDefeatedThisPhaseWatcher = abilityHelper.stateWatchers.unitsDefeatedThisPhase();
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.addTriggeredAbility({
            title: 'Exhaust Luke Skywalker to heal 1 damage from that unit',
            contextTitle: (context) => `Exhaust ${context.source.title} to heal 1 damage from ${context.event.attack.attacker.title}`,
            when: {
                onAttackEnd: (event, context) =>
                    event.attack.attacker.controller === context.player
            },
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) =>
                    AttackHelpers.attackerSurvived(context.event.attack, this.unitsDefeatedThisPhaseWatcher),
                onTrue: abilityHelper.immediateEffects.exhaust(),
            }),
            ifYouDo: (ifYouDoContext) => ({
                title: `Heal 1 damage from ${ifYouDoContext.event.attack.attacker.title}`,
                immediateEffect: abilityHelper.immediateEffects.heal({ amount: 1, target: ifYouDoContext.event.attack.attacker })
            })
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.addTriggeredAbility({
            title: 'Heal 2 damage from that unit or from your base',
            contextTitle: (context) => `Heal 2 damage from ${context.event.attack.attacker.title} or from your base`,
            when: {
                onAttackEnd: (event, context) =>
                    event.attack.attacker.controller === context.player,
            },
            targetResolver: {
                cardCondition: (card, context) => card === context.player.base || card === context.event.attack.attacker,
                immediateEffect: abilityHelper.immediateEffects.heal({ amount: 2 })
            }
        });
    }
}
