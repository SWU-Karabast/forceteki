import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { UnitsDefeatedThisPhaseWatcher } from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';

export default class HoundsToothHuntersApproach extends NonLeaderUnitCard {
    private unitsDefeatedThisPhaseWatcher: UnitsDefeatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: 'hounds-tooth#hunters-approach-id',
            internalName: 'hounds-tooth#hunters-approach',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.unitsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.unitsDefeatedThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackCompletedAbility({
            title: 'If this unit survived, you may defeat a unit with less power than this unit',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) =>
                    !this.unitsDefeatedThisPhaseWatcher.wasDefeatedThisPhase(context.event.attack.attacker, context.event.attack.attackerInPlayId),
                onTrue: abilityHelper.immediateEffects.selectCard({
                    activePromptTitle: (context) => `Defeat a unit with less than ${context.source.getPower()} power`,
                    cardCondition: (card, context) => card.isUnit() && card.getPower() < context.source.getPower(),
                    optional: true,
                    immediateEffect: abilityHelper.immediateEffects.defeat()
                }),
            })
        });
    }
}
