import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { DamageDealtThisPhaseWatcher } from '../../../stateWatchers/DamageDealtThisPhaseWatcher';

export default class TheGreatMothersWithStrangeMagicks extends NonLeaderUnitCard {
    private damageDealtThisPhaseWatcher: DamageDealtThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: 'the-great-mothers#with-strange-magicks-id',
            internalName: 'the-great-mothers#with-strange-magicks',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.damageDealtThisPhaseWatcher = AbilityHelper.stateWatchers.damageDealtThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenAttackEndsAbility({
            title: 'If this unit dealt combat damage to 1 or more non-leader units, defeat those units',
            attackerMustSurvive: true,
            immediateEffect: AbilityHelper.immediateEffects.conditional((context) => {
                const damagedNonLeaderUnits = this.damageDealtThisPhaseWatcher.getNonLeaderUnitsDealtCombatDamageByUnitThisAttack(context.source, context);

                return {
                    condition: () => damagedNonLeaderUnits.length > 0,
                    onTrue: AbilityHelper.immediateEffects.defeat({
                        target: damagedNonLeaderUnits
                    })
                };
            })
        });
    }
}
