import AbilityHelper from '../../AbilityHelper';
import Card from '../../core/card/Card';
import { CardType, RelativePlayer, TargetMode } from '../../core/Constants';
import Player from '../../core/Player';

export default class AvengerHuntingStarDestroyer extends Card {
    protected override getImplementationId() {
        return {
            id: '8240629990',
            internalName: 'avenger#hunting-star-destroyer'
        };
    }

    public override setupCardAbilities() {
        this.whenPlayedAbility({
            title: 'Choose a friendly non-leader unit to defeat',
            optional: false,
            targetResolver: {
                player: RelativePlayer.Opponent,
                controller: RelativePlayer.Opponent,
                cardType: CardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            }
        });

        this.attackAbility({
            title: 'Choose a friendly non-leader unit to defeat',
            optional: false,
            targetResolver: {
                player: RelativePlayer.Opponent,
                controller: RelativePlayer.Opponent,
                cardType: CardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            }
        });
    }
}

AvengerHuntingStarDestroyer.implemented = false;