import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class PiratedStarfighter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6028207223',
            internalName: 'pirated-starfighter'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Return a friendly non-leader unit to its owner\'s hand',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            }
        });
    }
}

PiratedStarfighter.implemented = true;
