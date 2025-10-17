import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { UnitsHealedThisPhaseWatcher } from '../../../stateWatchers/UnitsHealedThisPhaseWatcher';

export default class BarrissOffeeUnassumingApprentice extends NonLeaderUnitCard {
    private unitsHealedThisPhaseWatcher: UnitsHealedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '7924172103',
            internalName: 'barriss-offee#unassuming-apprentice'
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.unitsHealedThisPhaseWatcher = AbilityHelper.stateWatchers.unitsHealedThisPhase(registrar);
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Each friendly unit that was healed this phase gets +1/+0.',
            targetController: RelativePlayer.Self,
            matchTarget: (card) => card.isUnit() && this.unitsHealedThisPhaseWatcher.wasHealedThisPhase(card, card.inPlayId),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 }),
        });
    }
}
