import type { IInPlayCard } from '../card/baseClasses/InPlayCard';
import type { ZoneName } from '../Constants';
import type Game from '../Game';
import type { IArenaZoneCardFilterProperties } from './ConcreteOrMetaArenaZone';
import { ConcreteOrMetaArenaZone } from './ConcreteOrMetaArenaZone';
import type { IAddRemoveZone } from './ZoneAbstract';


/**
 * Base class for the "concrete" arena zones - ground and space - which are not the meta-zone AllArenasZone
 */
export abstract class ConcreteArenaZone extends ConcreteOrMetaArenaZone implements IAddRemoveZone {
    public override readonly hiddenForPlayers: null;
    public abstract override readonly name: ZoneName;

    public constructor(owner: Game) {
        super(owner);

        this.hiddenForPlayers = null;
    }

    public override getCards(filter?: IArenaZoneCardFilterProperties): IInPlayCard[] {
        const filterFn = this.buildFilterFn(filter);

        let cards: IInPlayCard[] = this.cards;
        if (filter?.controller) {
            cards = cards.filter((card) => card.controller === filter.controller);
        }

        return cards.filter(filterFn);
    }
}
