import type { CardType, Trait, ZoneName } from '../Constants';
import type { Player } from '../Player';
import type { CardRef } from './CardRef';

/**
 * A read-only view of a card's characteristics, as of the moment the view represents.
 *
 * For a live view that moment is *now*; for a recorded view it is the instant the card left play.
 * Both satisfy the same interface, so call sites do not branch on which they hold — see
 * design/lki-redesign-decisions-and-insights.md (D-25, D-26).
 *
 * Location is a characteristic like any other (D-31): `zoneName` answers about the represented
 * moment, so the record for a defeated unit reports the arena it was in, not the discard pile it
 * now sits in.
 *
 * ### Narrowing
 *
 * Two parallel families reach the kind-specific and in-play-only characteristics:
 *
 * - `isX()` — a type guard, for when the card legitimately might not be that shape
 * - `asX()` — asserts and narrows, for when the ability requires that shape and anything else is a
 *   bug (D-14)
 *
 * ```ts
 * // the ability only makes sense for a unit that was in play, so assert
 * const power = cardStates.getLastKnownProperties(ref).asUnitCard().asInPlay().power;
 *
 * // zero is a legitimate answer here, so guard
 * const props = cardStates.getLastKnownProperties(ref);
 * const count = props.isUnitCard() && props.isInPlay() ? props.upgrades.length : 0;
 * ```
 */
export interface ICardProperties {

    /** Reference to the identity this view describes. */
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

    isUnitCard(): this is IUnitProperties;

    /** Narrows to a unit, failing if this does not describe one. */
    asUnitCard(): IUnitProperties;
}

/**
 * Characteristics of a unit card, available whether or not it was in play.
 *
 * In-play-only characteristics (`power`, `upgrades`, …) are reachable only after narrowing with
 * {@link isInPlay} or {@link asInPlay}, which keeps `power` and `printedPower` distinct concepts
 * (D-27, SC-17).
 *
 * Note both narrowing methods for the in-play axis are declared here rather than on
 * {@link ICardProperties}. That is partly forced — declaring `isInPlay` on both the base and the
 * kind interfaces is a `TS2320` error — and partly deliberate: it makes the kind-first ordering
 * structural, since `asInPlay()` simply does not exist until the kind is known (R7).
 */
export interface IUnitProperties extends ICardProperties {

    /** Units always have a cost, so this narrows the nullable base declaration. */
    readonly cost: number;

    readonly printedPower: number;
    readonly printedHp: number;

    isInPlay(): this is IUnitPropertiesInPlay;

    /** Narrows to a unit that was in play, failing if it was not. */
    asInPlay(): IUnitPropertiesInPlay;
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
