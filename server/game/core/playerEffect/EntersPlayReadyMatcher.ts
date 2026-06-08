import type { AbilityContext } from '../ability/AbilityContext';
import type { AbilityLimit } from '../ability/AbilityLimit';
import type { Card } from '../card/Card';
import type { CardTypeFilter } from '../Constants';
import { EntryType, WildcardCardType } from '../Constants';
import type { Game } from '../Game';
import { GameObjectBase, type IGameObjectBaseState } from '../GameObjectBase';
import { type GameObjectId, registerState, stateRef } from '../GameObjectUtils';
import type { Player } from '../Player';
import { EnumHelpers } from '../utils/EnumHelpers';

export interface IEntersPlayReadyMatcherProperties {

    /** Card types the matcher considers. Defaults to any unit. */
    cardTypeFilter?: CardTypeFilter | CardTypeFilter[];

    /**
     * Which entry paths the matcher applies to. Defaults to `[EntryType.Played]`
     * so cards saying "the next unit you play..." don't accidentally fire on
     * tokens being created (CR 3.7.2 — tokens are created, not played) or on
     * rescue / other ability-driven put-into-play paths.
     */
    entryType?: EntryType | EntryType[];

    /** Additional predicate the entering card must satisfy. */
    match?: (card: Card, context: AbilityContext) => boolean;

    /** Use limit. Defaults to unlimited (typically scoped by an outer phase duration). */
    limit?: AbilityLimit;
}

export interface IEntersPlayReadyMatcherState extends IGameObjectBaseState {
    sourceCard: GameObjectId<Card> | null;
    sourcePlayer: GameObjectId<Player>;
}

/**
 * Player-scoped matcher that grants the "enters play ready" status to the next
 * unit a player plays that satisfies the configured filter / predicate. Modeled
 * directly on `CostAdjuster` — same `cardTypeFilter` + `match` + `limit` shape.
 *
 * The matcher is consulted by `PutIntoPlaySystem` at entry time (before the card
 * has finished entering play), so any triggers on the played card see it already
 * in the ready state — there is no separate trigger that competes for ordering
 * against the played card's own When Played / Ambush abilities.
 */
@registerState()
export class EntersPlayReadyMatcher extends GameObjectBase {
    private readonly cardTypeFilter: CardTypeFilter | CardTypeFilter[];
    private readonly entryTypes: EntryType[];
    private readonly match?: (card: Card, context: AbilityContext) => boolean;
    protected readonly limit?: AbilityLimit;

    @stateRef()
    protected accessor sourceCard: Card | null;

    @stateRef()
    protected accessor sourcePlayer: Player;

    public constructor(
        game: Game,
        sourcePlayerOrCard: Card | Player,
        properties: IEntersPlayReadyMatcherProperties
    ) {
        super(game);

        if (sourcePlayerOrCard.isCard()) {
            this.sourceCard = sourcePlayerOrCard;
            this.sourcePlayer = sourcePlayerOrCard.controller;
        } else {
            this.sourceCard = null;
            this.sourcePlayer = sourcePlayerOrCard;
        }

        this.cardTypeFilter = properties.cardTypeFilter ?? WildcardCardType.Unit;
        this.entryTypes = properties.entryType == null
            ? [EntryType.Played]
            : Array.isArray(properties.entryType) ? properties.entryType : [properties.entryType];
        this.match = properties.match;
        this.limit = properties.limit;
        if (this.limit) {
            this.limit.registerEvents();
        }
    }

    public canApplyTo(card: Card, context: AbilityContext, entryType: EntryType): boolean {
        if (this.limit && this.limit.isAtMax(this.sourcePlayer)) {
            return false;
        }
        if (!this.entryTypes.includes(entryType)) {
            return false;
        }
        if (!EnumHelpers.cardTypeMatches(card.type, this.cardTypeFilter)) {
            return false;
        }
        if (this.match && !this.match(card, context)) {
            return false;
        }
        return true;
    }

    public applyTo(_card: Card, _context: AbilityContext): void {
        if (this.limit) {
            this.limit.increment(this.sourcePlayer);
        }
    }
}
