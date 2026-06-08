import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { DamageDealtThisPhaseWatcher } from '../../../stateWatchers/DamageDealtThisPhaseWatcher';

export default class VanesSnubFighterBrashAndProud extends NonLeaderUnitCard {
    private damageDealtThisPhaseWatcher: DamageDealtThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '3024525867',
            internalName: 'vanes-snub-fighter#brash-and-proud',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.damageDealtThisPhaseWatcher = AbilityHelper.stateWatchers.damageDealtThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'If it dealt combat damage to a base, give an Advantage token to this unit',
            contextTitle: (context) => `If it dealt combat damage to a base, give an Advantage token to ${context.source}`,
            when: {
                onAttackEnd: (event, context) =>
                    event.attack.attackingPlayer === context.player &&
                    this.damageDealtThisPhaseWatcher.unitHasDealtCombatDamageToBaseThisAttack(event.attack.attacker, context)
            },
            immediateEffect: AbilityHelper.immediateEffects.giveAdvantage((context) => ({ target: context.source })),
        });
    }
}