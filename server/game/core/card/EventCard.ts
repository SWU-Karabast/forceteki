import Player from '../Player';
import { Card } from './Card';
import { WithCost } from './propertyMixins/Cost';
import { CardType, Location } from '../Constants';
import Contract from '../utils/Contract';
import { PlayableOrDeployableCard } from './baseClasses/PlayableOrDeployableCard';

const EventCardParent = WithCost(PlayableOrDeployableCard);

export class EventCard extends EventCardParent {
    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);
        Contract.assertEqual(this.printedType, CardType.Event);

        // TODO EVENTS: add play event action to this._actions (see Unit.ts for reference)
    }

    public override isEvent() {
        return true;
    }

    protected override initializeForCurrentLocation(prevLocation: Location): void {
        super.initializeForCurrentLocation(prevLocation);

        // event cards can only be exhausted when resourced
        switch (this.location) {
            case Location.Resource:
                this.enableExhaust(true);
                break;

            default:
                this.enableExhaust(false);
                break;
        }
    }

    // TODO EVENTS: populate this with an addEventAbility() method (see Unit.ts for reference)
}
