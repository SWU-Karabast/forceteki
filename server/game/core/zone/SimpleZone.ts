import type { Card } from '../card/Card';
import * as Contract from '../utils/Contract';
import type { Aspect, CardTypeFilter, KeywordName, MoveZoneDestination, Trait } from '../Constants';
import type { GameObjectRef, IGameObjectBaseState } from '../GameObjectBase';
import { ZoneAbstract } from './ZoneAbstract';

export interface ISimpleZoneState<TCard extends Card> extends IGameObjectBaseState {
    cards: GameObjectRef<TCard>[];
}

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

export interface IZoneState<TCard extends Card> extends IGameObjectBaseState {
    cards: GameObjectRef<TCard>[];
}

/**
 * Base class for all Zones that contain a list of Cards. Defines some common properties and methods.
 */
export abstract class SimpleZone<TCard extends Card, TState extends IZoneState<TCard> = IZoneState<TCard>> extends ZoneAbstract<TCard, TState> {
    /** Number of cards in the zone */
    public override get count(): number {
        return this.state.cards.length;
    }

    public override get cards(): TCard[] {
        return this.state.cards.map((x) => this.game.gameObjectManager.get(x));
        return this.state.cards.map((x) => this.game.gameObjectManager.get(x));
    }

    protected override setupDefaultState() {
        super.setupDefaultState();
        this.state.cards = [];
    }

    /** Get the cards from this zone with an optional filter */
    public getCards(filter?: IZoneCardFilterProperties): TCard[] {
        return this.cards.filter(this.buildFilterFn(filter));
    }

    public addCard(card: TCard) {
        Contract.assertFalse(this.cards.includes(card), `Attempting to add card ${card.internalName} to ${this} twice`);

        this.state.cards.push(card.getRef());
        this.state.cards.push(card.getRef());
    }

    public removeCard(card: Card) {
        const cardIdx = this.cards.indexOf(card as TCard);

        Contract.assertFalse(cardIdx === -1, `Attempting to remove card ${card.internalName} from ${this} but it is not there. Its current zone is ${card.zone}.`);

        this.state.cards.splice(cardIdx, 1);
    }

    public override toString() {
        return ('game' in this.owner ? `${this.owner.name}:` : '') + this.name;
    }
}
