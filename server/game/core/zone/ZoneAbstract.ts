import type { Card } from '../card/Card';
import * as Contract from '../utils/Contract';
import type { Aspect, CardTypeFilter, KeywordName, ZoneName, MoveZoneDestination, Trait, WildcardZoneName, RelativePlayerFilter } from '../Constants';
import type Player from '../Player';
import type Game from '../Game';
import * as EnumHelpers from '../utils/EnumHelpers';

/**
 * Collection of filters for searching cards in a zone.
 * If a list of values is provided, cards are matched with OR logic (just have to match one).
 * If multiple filter properties are provided, cards are matched with AND logic (must match each filter).
 *
 * For example, `{ aspect: Aspect.Cunning, trait: [Trait.Rebel, Trait.Jedi] }` will match all Cunning cards
 * that are Rebel and / or Jedi.
 */
export interface IZoneCardFilterProperties {
    aspect?: Aspect | Aspect[];
    condition?: (card: Card) => boolean;
    keyword?: KeywordName | KeywordName[];
    trait?: Trait | Trait[];
    type?: CardTypeFilter | CardTypeFilter[];
    otherThan?: Card;
}

/** Interface for zones that use a basic add card / remove card API */
export interface IAddRemoveZone {
    addCard(card: Card, zone?: MoveZoneDestination): void;
    removeCard(card: Card): void;
}

/**
 * Base class for all Zone types. Defines some common properties and methods.
 */
export abstract class ZoneAbstract<TCard extends Card> {
    public readonly owner: Player | Game;

    /** Set of players that this zone is hidden for. If `null`, not hidden for any player. */
    public abstract readonly hiddenForPlayers: RelativePlayerFilter | null;
    public abstract readonly name: ZoneName | WildcardZoneName;

    /** Number of cards in the zone */
    public abstract get count(): number;

    public get cards(): TCard[] {
        return this.getCards();
    }

    public constructor(owner: Player | Game) {
        this.owner = owner;
    }

    /** Get the cards from this zone with an optional filter */
    public abstract getCards(filter?: IZoneCardFilterProperties): TCard[];

    /** Returns true if the zone has any cards that match the provided filter */
    public hasSomeCard(filter: IZoneCardFilterProperties): boolean {
        return this.getCards(filter).length > 0;
    }

    /** Returns true if the zone includes the specific card provided */
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

    protected checkZoneMatches(card: Card, zone: MoveZoneDestination | null) {
        Contract.assertTrue(!zone || zone === this.name, `Attempting to move ${card.internalName} to ${this} with incorrect zone parameter: ${zone}`);
    }

    public toString() {
        return ('game' in this.owner ? `${this.owner.name}:` : '') + this.name;
    }
}
