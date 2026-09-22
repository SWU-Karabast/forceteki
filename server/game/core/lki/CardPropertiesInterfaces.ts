import type { CardType, Trait, ZoneName } from '../Constants';
import type { Player } from '../Player';
import type { CardRef } from './CardRef';

/**
 * A read-only view of a card's characteristics, as of the moment the view represents.
 *
 * For a live view that moment is *now*; for a captured view it is the instant the card left play.
 * Both satisfy the same interface, so call sites do not branch on which they hold — see
 * design/lki-redesign-decisions-and-insights.md (D-25, D-26).
 *
 * Location is a characteristic like any other (D-31): `zoneName` answers about the represented
 * moment, so a footprint of a defeated unit reports the arena it was in, not the discard pile it
 * now sits in.
 */
export interface ICardProperties {

    /** Reference to the incarnation this view describes. */
    readonly ref: CardRef;

    readonly title: string;
    readonly type: CardType;
    readonly controller: Player;
    readonly traits: ReadonlySet<Trait>;

    /** Resource cost, or `null` for cards that have no cost (bases, leaders, tokens). */
    readonly cost: number | null;

    /** The zone occupied at the represented moment. */
    readonly zoneName: ZoneName;

    hasSomeTrait(traits: Trait | Trait[]): boolean;

    isUnit(): this is IUnitProperties;
}

/**
 * Characteristics of a unit card, available whether or not it is in play.
 *
 * In-play-only characteristics (`power`, `upgrades`, …) are reachable only after narrowing with
 * {@link isInPlay}, which keeps `power` and `printedPower` distinct concepts (D-27, SC-17).
 *
 * Note `isInPlay` is declared here rather than on {@link ICardProperties}: declaring it on both the
 * base and the kind interfaces is a `TS2320` error, so narrowing must be written kind-first —
 * `isUnit() && isInPlay()` compiles, the reverse does not.
 */
export interface IUnitProperties extends ICardProperties {
    readonly printedPower: number;
    readonly printedHp: number;

    isInPlay(): this is IUnitPropertiesInPlay;
}

/** Characteristics that only exist for a unit that was in play at the represented moment. */
export interface IUnitPropertiesInPlay extends IUnitProperties {

    /** Power including all modifiers in effect at the represented moment. */
    readonly power: number;
    readonly hp: number;
    readonly damage: number;
    readonly exhausted: boolean;
    readonly upgrades: readonly CardRef[];
}
