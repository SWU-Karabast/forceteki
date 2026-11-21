import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { AttacksThisPhaseWatcher } from '../../../stateWatchers/AttacksThisPhaseWatcher';

export default class KyloRenRelentless extends NonLeaderUnitCard {
    private attacksThisPhaseWatcher: AttacksThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '5671275617',
            internalName: 'kylo-ren#relentless',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, abilityHelper: IAbilityHelper): void {
        this.attacksThisPhaseWatcher = abilityHelper.stateWatchers.attacksThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Ready this unit',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) =>
                    this.attacksThisPhaseWatcher.getAttackersInPlay((entry) => entry.attacker === context.source).length === 1,
                onTrue: abilityHelper.immediateEffects.ready((context) => ({ target: context.source }))
            })
        });
    }
}