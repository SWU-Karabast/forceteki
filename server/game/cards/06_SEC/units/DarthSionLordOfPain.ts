import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { UnitsDefeatedThisPhaseWatcher } from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';

export default class DarthSionLordOfPain extends NonLeaderUnitCard {
    private unitsDefeatedThisPhaseWatcher: UnitsDefeatedThisPhaseWatcher;
    protected override getImplementationId() {
        return {
            id: '3182035434',
            internalName: 'darth-sion#lord-of-pain',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.unitsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.unitsDefeatedThisPhase(registrar);
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give an experience token to Darth Sion for each enemy unit defeated this phase',
            immediateEffect: AbilityHelper.immediateEffects.giveExperience((context) => ({
                amount: this.unitsDefeatedThisPhaseWatcher.getDefeatedUnitsControlledByPlayerNew(context.player.opponent).length,
                target: context.source
            })),
        });
        registrar.addWhenDefeatedAbility({
            title: 'Return Darth Sion to his owner\'s hand',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.event.lastKnownInformation.power >= 7,
                onTrue: AbilityHelper.immediateEffects.returnToHand(),
            }),
        });
    }
}