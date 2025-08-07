import type { IInPlayCard } from '../card/baseClasses/InPlayCard';
import type { ZoneName } from '../Constants';
import { WildcardZoneName } from '../Constants';
import type Game from '../Game';
import type { ConcreteArenaZone } from './ConcreteArenaZone';
import type { IArenaZoneCardFilterProperties } from './ConcreteOrMetaArenaZone';
import { ConcreteOrMetaArenaZone } from './ConcreteOrMetaArenaZone';
import type { GroundArenaZone } from './GroundArenaZone';
import type { SpaceArenaZone } from './SpaceArenaZone';

export interface IAllArenasZoneCardFilterProperties extends IArenaZoneCardFilterProperties {
    arena?: ZoneName.SpaceArena | ZoneName.GroundArena | WildcardZoneName.AnyArena;
}

// used for player.getArenaCards, declared here since that file is still JS
export type IAllArenasForPlayerCardFilterProperties = Omit<IAllArenasZoneCardFilterProperties, 'controller'>;
export type IAllArenasSpecificTypeCardFilterProperties = Omit<IAllArenasZoneCardFilterProperties, 'type'>;
export type IAllArenasForPlayerSpecificTypeCardFilterProperties = Omit<IAllArenasForPlayerCardFilterProperties, 'type'>;

/**
 * This is a meta-zone that allows doing operations across both the ground arena and space arena as one.
 * Can't add or remove cards but all accessor operations are supported.
 */
export class AllArenasZone extends ConcreteOrMetaArenaZone {
    public declare readonly hiddenForPlayers: null;
    public override readonly name: WildcardZoneName.AnyArena;

    private groundArena: GroundArenaZone;
    private spaceArena: SpaceArenaZone;

    private get arenas(): ConcreteArenaZone[] {
        return [this.groundArena, this.spaceArena];
    }

    public override get cards(): IInPlayCard[] {
        return this.arenas.flatMap((arena) => arena.cards);
    }

    public override get count() {
        let cardCount = 0;
        this.arenas.forEach((arena) => cardCount += arena.count);
        return cardCount;
    }

    public constructor(owner: Game, groundArena: GroundArenaZone, spaceArena: SpaceArenaZone) {
        super(owner);

        this.hiddenForPlayers = null;
        this.name = WildcardZoneName.AnyArena;

        this.groundArena = groundArena;
        this.spaceArena = spaceArena;
    }

    public override getCards(filter?: IAllArenasZoneCardFilterProperties): IInPlayCard[] {
        let cards: IInPlayCard[] = [];

        for (const arena of this.arenas) {
            if (!filter?.arena || filter.arena === WildcardZoneName.AnyArena || filter.arena === arena.name) {
                cards = cards.concat(arena.getCards(filter));
            }
        }

        return cards;
    }

    public override hasSomeCard(filter: IAllArenasZoneCardFilterProperties): boolean {
        return super.hasSomeCard(filter);
    }
}
