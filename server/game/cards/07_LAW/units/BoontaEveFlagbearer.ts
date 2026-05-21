import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { AttacksThisPhaseWatcher } from '../../../stateWatchers/AttacksThisPhaseWatcher';

export default class BoontaEveFlagbearer extends NonLeaderUnitCard {
    private attacksThisPhaseWatcher: AttacksThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '4976768529',
            internalName: 'boonta-eve-flagbearer',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper) {
        this.attacksThisPhaseWatcher = AbilityHelper.stateWatchers.attacksThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Heal 2 damage from your base',
            when: {
                onAttackDeclared: (event, context) => event.attack.attackingPlayer === context.player,
            },
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: () => this.attacksThisPhaseWatcher.getCurrentValue().length === 1,
                onTrue: abilityHelper.immediateEffects.heal((context) => ({ amount: 2, target: context.player.base }))
            })
        });
    }
}