import type { Arena, Aspect, CardType, KeywordName, Trait, ZoneName } from '../Constants';
import type { Attack } from '../attack/Attack';
import type { Player } from '../Player';
import type { NumericKeywordName, Zone } from '../../Interfaces';
import type { CardRef } from './CardRef';

/** A keyword a card has, as plain data. `value` is set for the numeric keywords (Raid, Restore, …). */
export interface ICardKeyword {
    readonly name: KeywordName;
    readonly value: number | null;
}

/**
 * A read-only view of a card's characteristics, as of the moment the view represents.
 *
 * For a live view that moment is *now*; for a recorded view it is the instant the card left play.
 * Both satisfy the same interface, so call sites do not branch on which they hold — see
 * long-term-project-docs/lki-redesign-decisions-and-insights.md (D-25, D-26).
 *
 * ### What answers about which moment (D-37)
 *
 * - **Characteristics** answer about the represented moment: title, type, traits, aspects, keywords,
 *   cost, controller, the kind checks (`isUnit()`, `isLeader()`, …), and the in-play stats a unit had.
 *   On a recorded view these are last known information.
 * - **Presence** always answers about now, on every view: whether the card is in play (`isInPlay()`),
 *   where it is (`zoneName`, `zone`), whether it is attached, attacking or defending. A recorded view
 *   reads these from the live card.
 * - **`arena`** is the one location that is a characteristic: the arena the card is in, or was in
 *   when it left play. "In the same arena" means this.
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
 * const power = cardStates.getLastKnownProperties(ref).asUnit().asInPlayStats().power;
 *
 * // zero is a legitimate answer here, so guard
 * const props = cardStates.getLastKnownProperties(ref);
 * const count = props.isUnit() && props.hasInPlayStats() ? props.upgrades.length : 0;
 * ```
 *
 * Card-valued relations (`upgrades`, `parentCard`, …) are {@link CardRef}s: read them through the
 * getter in turn.
 */
export interface ICardProperties {

    /** Reference to the identity this view describes. */
    readonly ref: CardRef;

    // ----- characteristics

    readonly title: string;
    readonly subtitle: string | null;
    readonly type: CardType;
    readonly controller: Player;
    readonly owner: Player;
    readonly traits: ReadonlySet<Trait>;
    readonly aspects: readonly Aspect[];
    readonly keywords: readonly ICardKeyword[];
    readonly unique: boolean;

    /** Resource cost, or `null` for cards that have no cost (bases, leaders, tokens). */
    readonly cost: number | null;

    /** Printed cost, or `null` for cards that have no cost. */
    readonly printedCost: number | null;

    /**
     * The arena the card is in, or was in when it left play; `null` if it was in neither. This is
     * the location to use for "in the same arena", because it survives the card being defeated.
     */
    readonly arena: Arena | null;

    hasCost(): boolean;
    hasSomeTrait(traits: Trait | Trait[] | Set<Trait>): boolean;
    hasEveryTrait(traits: Trait[] | Set<Trait>): boolean;
    hasSomeAspect(aspects: Aspect | Aspect[] | Set<Aspect>): boolean;
    hasEveryAspect(aspects: Aspect[] | Set<Aspect>): boolean;
    hasSomeKeyword(keywords: KeywordName | KeywordName[] | Set<KeywordName>): boolean;

    /** Total of a numeric keyword's values (Raid 2 and Raid 1 make 3), or `null` if the card has none. */
    getNumericKeywordTotal(keywordName: NumericKeywordName): number | null;

    // ----- kind checks (characteristics)

    isUnit(): this is IUnitProperties;

    /** Narrows to a unit, failing if this does not describe one. */
    asUnit(): IUnitProperties;

    isUpgrade(): this is IUpgradeProperties;

    /** Narrows to an upgrade, failing if this does not describe one. */
    asUpgrade(): IUpgradeProperties;

    isBase(): this is IBaseProperties;
    canBeExhausted(): this is IExhaustableProperties;
    canBeDamaged(): this is IDamageableProperties;
    canBeInPlay(): boolean;
    isEvent(): boolean;
    isLeader(): boolean;
    isLeaderUnit(): boolean;
    isNonLeaderUnit(): boolean;
    isToken(): boolean;
    isTokenUnit(): boolean;
    isTokenUpgrade(): boolean;
    isShield(): boolean;
    isExperience(): boolean;
    isAdvantage(): boolean;
    isWeakness(): boolean;
    isCreditToken(): boolean;
    isForceToken(): boolean;

    // ----- presence: always now (D-37)

    /** The zone the card is in now. */
    readonly zoneName: ZoneName;

    /** The zone the card is in now. */
    readonly zone: Zone | null;

    /** Whether the card is in play now. */
    isInPlay(): boolean;

    /** Whether the card is attached to another card now. */
    isAttached(): boolean;

    /** Whether the card is in its controller's resource zone now. */
    isResource(): boolean;
}

/** A card with a ready or exhausted state: units, upgrades, leaders and resources. */
export interface IExhaustableProperties extends ICardProperties {
    readonly exhausted: boolean;
}

/** A card that takes damage: units and bases. */
export interface IDamageableProperties extends ICardProperties {
    readonly damage: number;
    readonly hp: number;
    readonly remainingHp: number;

    /** Presence: whether the card is defending in an attack now. */
    isDefending(): boolean;

    /** Presence: the attack the card is part of now, if any. */
    readonly activeAttack: Attack | null;
}

/** Characteristics of a base. */
export interface IBaseProperties extends IDamageableProperties {
    readonly upgrades: readonly CardRef[];
    readonly capturedUnits: readonly CardRef[];
    isUpgraded(): boolean;
}

/**
 * Characteristics of a unit card, available whether or not it was in play.
 *
 * In-play-only characteristics (`power`, `upgrades`, …) are reachable only after narrowing with
 * {@link hasInPlayStats} or {@link asInPlayStats}, which keeps `power` and `printedPower` distinct
 * concepts (D-27, SC-17). The guard asks about the represented moment: a recorded view of a unit that
 * left play has in-play stats, even though `isInPlay()` is now false.
 */
export interface IUnitProperties extends ICardProperties {

    /** Units always have a cost, so this narrows the nullable base declaration. */
    readonly cost: number;

    readonly printedPower: number;
    readonly printedHp: number;
    readonly defaultArena: Arena;

    hasInPlayStats(): this is IUnitPropertiesInPlay;

    /** Narrows to a unit with in-play stats at the represented moment, failing if it had none. */
    asInPlayStats(): IUnitPropertiesInPlay;

    /** Presence: whether the unit is attacking now. */
    isAttacking(): boolean;

    /** Presence: whether the unit is defending now. */
    isDefending(): boolean;

    /** Presence: the attack the unit is part of now, if any. */
    readonly activeAttack: Attack | null;
}

/** Characteristics that only exist for a unit that was in play at the represented moment. */
export interface IUnitPropertiesInPlay extends IUnitProperties, IExhaustableProperties, IDamageableProperties {

    /** Redeclared because the bases disagree: units always have a cost. */
    readonly cost: number;

    /** Power including all modifiers in effect at the represented moment. */
    readonly power: number;
    readonly hp: number;
    readonly damage: number;
    readonly remainingHp: number;
    readonly exhausted: boolean;
    readonly upgrades: readonly CardRef[];
    readonly capturedUnits: readonly CardRef[];
    isUpgraded(): boolean;
    hasShield(): boolean;
    hasExperience(): boolean;
    hasWeakness(): boolean;
}

/** Characteristics of an upgrade. */
export interface IUpgradeProperties extends ICardProperties {
    readonly printedUpgradePower: number;
    readonly printedUpgradeHp: number;

    /** The card the upgrade is attached to, at the represented moment. */
    readonly parentCard: CardRef;

    /** As {@link parentCard}, asserting that it is a unit (it is a base for a Fortify upgrade). */
    readonly parentUnit: CardRef;

    /** Who controlled the parent card at the represented moment. */
    readonly parentCardController: Player;
}
