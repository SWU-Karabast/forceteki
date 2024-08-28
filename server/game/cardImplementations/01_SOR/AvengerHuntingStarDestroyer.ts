import AbilityHelper from '../../AbilityHelper';
import { NonLeaderUnitCard } from '../../core/card/NonLeaderUnitCard';
import { CardType, RelativePlayer, WildcardCardType } from '../../core/Constants';

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
            targetResolver: {
                player: RelativePlayer.Opponent,
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            }
        });

        this.addAttackAbility({
            title: 'Choose a friendly non-leader unit to defeat',
            targetResolver: {
                player: RelativePlayer.Opponent,
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            }
        });
    }
}

AvengerHuntingStarDestroyer.implemented = true;