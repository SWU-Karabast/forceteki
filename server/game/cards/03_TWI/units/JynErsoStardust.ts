import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { UnitsDefeatedThisPhaseWatcher } from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';

export default class JynErsoStardust extends NonLeaderUnitCard {
    private unitsDefeatedThisPhaseWatcher: UnitsDefeatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '7099699830',
            internalName: 'jyn-erso#stardust'
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar): void {
        this.unitsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.unitsDefeatedThisPhase(registrar, this);
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'While an enemy unit has been defeated this phase, this unit gets +1/+0 and gains Saboteur',
            condition: (context) => this.unitsDefeatedThisPhaseWatcher.someDefeatedUnitControlledByPlayer(context.source.controller.opponent),
            ongoingEffect: [
                AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 }),
                AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Saboteur)
            ]
        });
    }
}

