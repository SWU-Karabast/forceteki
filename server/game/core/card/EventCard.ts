import Player from '../Player';
import { EpicAction } from './propertyMixins/EpicAction';
import { Hp } from './propertyMixins/Hp';
import { NewCard } from './NewCard';
import { Exhaust } from './propertyMixins/Exhaust';
import { Cost } from './propertyMixins/Cost';

const EventCardParent = Cost(Exhaust(NewCard));

// TODO EVENTS: populate this with an addEventAbility() method (see EpicAction for reference)
export class EventCard extends EventCardParent {
}