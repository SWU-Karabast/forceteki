import Player from '../Player';
import { EpicAction } from './propertyMixins/EpicAction';
import { Hp } from './propertyMixins/Hp';
import { NewCard } from './NewCard';
import { Exhaust } from './propertyMixins/Exhaust';
import { Cost } from './propertyMixins/Cost';
import { CardType, Location } from '../Constants';
import Contract from '../utils/Contract';

const EventCardParent = Cost(Exhaust(NewCard));

export class EventCard extends EventCardParent {
    public constructor(
        owner: Player,
        cardData: any
    ) {
        super(owner, cardData);
        Contract.assertTrue(this.printedTypes.has(CardType.Event));

        // TODO EVENTS: add play event action to this._actions (see Unit.ts for reference)
    }

    public override isEvent() {
        return true;
    }

    protected override initializeForCurrentLocation(prevLocation: Location): void {
        super.initializeForCurrentLocation(prevLocation);

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