import { Card } from '../card/Card';
import * as Contract from '../utils/Contract';
import { Aspect, CardTypeFilter, KeywordName, Location, MoveLocation, RelativePlayer, Trait, WildcardCardType, WildcardLocation } from '../Constants';
import type Player from '../Player';
import type Game from '../Game';
import * as EnumHelpers from '../utils/EnumHelpers';

export interface IZoneCardFilterProperties {
    aspect?: Aspect | Aspect[];
    condition?: (card: Card) => boolean;
    keyword?: KeywordName | KeywordName[];
    trait?: Trait | Trait[];
    type?: CardTypeFilter | CardTypeFilter[];
    otherThan?: Card;
}

export interface IAddRemoveZone {
    addCard(card: Card, location?: MoveLocation): void;
    removeCard(card: Card): void;
}

export abstract class ZoneAbstract<TCard extends Card> {
    public readonly owner: Player | Game;

    public abstract readonly hiddenForPlayers: RelativePlayer | null;
    public abstract readonly name: Location | WildcardLocation;

    public abstract get count(): number;

    public get cards(): TCard[] {
        return this.getCards();
    }

    public constructor(owner: Player | Game) {
        this.owner = owner;
    }

    public abstract getCards(filter?: IZoneCardFilterProperties): TCard[];

    public hasSomeCard(filter: IZoneCardFilterProperties): boolean {
        return this.getCards(filter).length > 0;
    }

    public hasCard(card: Card): boolean {
        const cardCount = this.cards.filter((zoneCard: TCard) => zoneCard === card).length;

        Contract.assertFalse(cardCount > 1, `Found ${cardCount} duplicates of ${card.internalName} in ${this.name}`);

        return cardCount === 1;
    }

    /** Constructs a filtering handler based on the provided filter properties */
    protected buildFilterFn(filter?: IZoneCardFilterProperties): (card: Card) => boolean {
        if (!filter) {
            return () => true;
        }

        return (card: Card) =>
            (!filter.aspect || card.hasSomeAspect(filter.aspect)) &&
            (!filter.keyword || card.hasSomeKeyword(filter.keyword)) &&
            (!filter.trait || card.hasSomeTrait(filter.trait)) &&
            (!filter.type || EnumHelpers.cardTypeMatches(card.type, filter.type)) &&
            (!filter.otherThan || card !== filter.otherThan) &&
            (!filter.condition || filter.condition(card));
    }

    protected checkLocationMatches(card: Card, location: MoveLocation | null) {
        Contract.assertTrue(!location || location === this.name, `Attempting to move ${card.internalName} to ${this} with incorrect location parameter: ${location}`);
    }

    public toString() {
        return ('game' in this.owner ? `${this.owner.name}:` : '') + this.name;
    }
}
