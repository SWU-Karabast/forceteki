import { Card } from '../card/Card';
import * as Contract from '../utils/Contract';
import { Aspect, CardTypeFilter, KeywordName, Location, RelativePlayer, Trait, WildcardCardType } from '../Constants';
import Player from '../Player';
import Game from '../Game';
import * as EnumHelpers from '../utils/EnumHelpers';

export interface ICardFilterProperties {
    aspect?: Aspect | Aspect[];
    condition?: (card: Card) => boolean;
    keyword?: KeywordName | KeywordName[];
    trait?: Trait | Trait[];
    type?: CardTypeFilter | CardTypeFilter[];
    otherThan?: Card;
}

export abstract class ZoneAbstract<TCard extends Card> {
    public readonly owner: Player | Game;

    public abstract readonly hiddenForPlayers: RelativePlayer | null;
    public abstract readonly name: Location;

    public abstract get count(): number;

    public get cards(): TCard[] {
        return this.getCards();
    }

    public constructor(owner: Player | Game) {
        this.owner = owner;
    }

    public abstract getCards(filter?: ICardFilterProperties): TCard[];

    public hasSomeCardMatching(filter: ICardFilterProperties): boolean {
        return this.getCards(filter).length > 0;
    }

    public hasCard(card: Card): boolean {
        const cardCount = this.cards.filter((zoneCard: TCard) => zoneCard === card).length;

        Contract.assertFalse(cardCount > 1, `Found ${cardCount} duplicates of ${card.internalName} in ${this.name}`);

        return cardCount === 1;
    }

    /** Constructs a filtering handler based on the provided filter properties */
    protected buildFilterFn(filter?: ICardFilterProperties): (card: Card) => boolean {
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

    public toString() {
        return (this.owner instanceof Player ? `${this.owner.name}:` : '') + this.name;
    }
}
