import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Location, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class BrightHopeTheLastTransport extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6253392993',
            internalName: 'bright-hope#the-last-transport'
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'Return a friendly non-leader ground unit to its owner\'s hand',
            optional: true,
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                locationFilter: Location.GroundArena,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            },
            ifYouDo: {
                title: 'Draw a card',
                immediateEffect: AbilityHelper.immediateEffects.draw()
            }
        });
    }
}

BrightHopeTheLastTransport.implemented = true;
