import type { IAbilityHelper } from '../../../AbilityHelper';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import { WildcardCardType, ZoneName } from '../../../core/Constants';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import type { UnitsDefeatedThisPhaseWatcher } from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';

export default class BrutalTraditions extends UpgradeCard {
    private unitsDefeatedThisPhaseWatcher: UnitsDefeatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '4843813137',
            internalName: 'brutal-traditions'
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.unitsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.unitsDefeatedThisPhase(registrar, this);
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'If an enemy unit was defeated this phase, play this upgrade from your discard pile',
            condition: (context) => this.unitsDefeatedThisPhaseWatcher.someDefeatedUnitControlledByPlayer(context.player.opponent),
            immediateEffect: AbilityHelper.immediateEffects.playCardFromOutOfPlay({ playAsType: WildcardCardType.Upgrade }),
            zoneFilter: ZoneName.Discard
        });
    }
}
