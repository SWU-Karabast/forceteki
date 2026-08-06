import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { AttacksThisPhaseWatcher } from '../../../stateWatchers/AttacksThisPhaseWatcher';

export default class GreefKargaIntroductionsAreInOrder extends NonLeaderUnitCard {
    private attacksThisPhaseWatcher: AttacksThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '4885389871',
            internalName: 'greef-karga#introductions-are-in-order',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.attacksThisPhaseWatcher = AbilityHelper.stateWatchers.attacksThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Create a Mandalorian token',
            cost: [AbilityHelper.costs.abilityActivationResourceCost(1), AbilityHelper.costs.exhaustSelf()],
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => this.attacksThisPhaseWatcher.someUnitAttackedControlledByPlayer({ controller: context.player.opponent, filter: (entry) => entry.targets.includes(context.player.base) }),
                onTrue: AbilityHelper.immediateEffects.createMandalorian()
            })
        });
    }
}