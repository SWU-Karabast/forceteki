import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, PlayType, WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';

export default class FriskVanguardLoudmouth extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '0514089787',
            internalName: 'frisk#vanguard-loudmouth',
        };
    }

    public override setupCardAbilities () {
        this.addPilotingAbility({
            type: AbilityType.Triggered,
            title: 'Defeat an upgrade that costs 2 or less',
            when: {
                onCardPlayed: (event, context) =>
                    event.card === context.source &&
                    event.playType === PlayType.Piloting
            },
            optional: true,
            targetResolver: {
                activePromptTitle: 'Choose an upgrade to defeat',
                controller: WildcardRelativePlayer.Any,
                cardTypeFilter: WildcardCardType.Upgrade,
                cardCondition: (card) => card.hasCost() && card.cost <= 2,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            }
        });
    }
}