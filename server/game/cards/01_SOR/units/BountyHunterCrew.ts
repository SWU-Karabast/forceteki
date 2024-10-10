import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, Location } from '../../../core/Constants';

export default class BountyHunterCrew extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '3684950815',
            internalName: 'bounty-hunter-crew'
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'Return an event from a discard pile',
            optional: true,
            targetResolver: {
                cardTypeFilter: CardType.Event,
                locationFilter: Location.Discard,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            }
        });
    }
}

BountyHunterCrew.implemented = true;
