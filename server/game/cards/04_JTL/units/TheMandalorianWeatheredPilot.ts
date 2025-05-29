import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, RelativePlayer, TargetMode, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class TheMandalorianWeatheredPilot extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6421006753',
            internalName: 'the-mandalorian#weathered-pilot',
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'Exhaust up to 2 ground units',
            targetResolver: {
                mode: TargetMode.UpTo,
                canChooseNoCards: true,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.GroundArena,
                numCards: 2,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            }
        });

        this.addPilotingAbility({
            type: AbilityType.Triggered,
            title: 'Exhaust an enemy unit in this arena',
            when: {
                whenPlayed: true,
            },
            targetResolver: {
                mode: TargetMode.Single,
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card.zoneName === context.source.parentCard.zoneName,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            }
        });
    }
}