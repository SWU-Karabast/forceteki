import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class TriDroidSuppressor extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6700679522',
            internalName: 'tridroid-suppressor',
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'Exhaust an enemy ground unit.',
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            }
        });
    }
}

TriDroidSuppressor.implemented = true;