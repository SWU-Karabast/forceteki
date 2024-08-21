import AbilityHelper from '../../AbilityHelper';
import { NonLeaderUnitCard } from '../../core/card/NonLeaderUnitCard';
import { CardType, RelativePlayer, TargetMode, WildcardCardType } from '../../core/Constants';
import Player from '../../core/Player';

export default class AvengerHuntingStarDestroyer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8240629990',
            internalName: 'avenger#hunting-star-destroyer'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Choose a friendly non-leader unit to defeat',
            optional: false,
            targetResolver: {
                player: RelativePlayer.Opponent,
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            }
        });

        this.addAttackAbility({
            title: 'Choose a friendly non-leader unit to defeat',
            optional: false,
            targetResolver: {
                player: RelativePlayer.Opponent,
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            }
        });
    }
}

AvengerHuntingStarDestroyer.implemented = false;