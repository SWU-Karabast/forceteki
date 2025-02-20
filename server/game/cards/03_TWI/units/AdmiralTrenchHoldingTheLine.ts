import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, TargetMode, WildcardCardType, ZoneName } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { UnitsDefeatedThisPhaseWatcher } from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';

export default class AdmiralTrenchHoldingTheLine extends NonLeaderUnitCard {
    private unitsDefeatedThisPhaseWatcher: UnitsDefeatedThisPhaseWatcher;

    protected override getImplementationId () {
        return {
            id: '7013591351',
            internalName: 'admiral-trench#holding-the-line'
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar): void {
        this.unitsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.unitsDefeatedThisPhase(registrar, this);
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'Return up to 3 units that were defeated this phase from your discard pile to your hand.',
            targetResolver: {
                mode: TargetMode.UpTo,
                numCards: 3,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.Discard,
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.isUnit() && this.unitsDefeatedThisPhaseWatcher.wasDefeatedThisPhase(card),
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            }
        });
    }
}

