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
 * The characteristics both views of a card hold, each answering about the view's moment. Card code
 * reaches these through {@link ICardProperties} or {@link ICurrentCardProperties}, never through this
 * type.
 */
export interface ICardCharacteristics {

    /** Reference to the identity this view describes. */
    readonly ref: CardRef;

    readonly title: string;
    readonly subtitle: string | null;
    readonly type: CardType;
    readonly controller: Player;
    readonly owner: Player;
    readonly traits: ReadonlySet<Trait>;
    readonly aspects: readonly Aspect[];
    readonly keywords: readonly ICardKeyword[];
    readonly unique: boolean;

    /**
     * Resource cost, or `null` for cards that have no cost: bases, and leaders that never deploy as a
     * unit. Mind the `null`: `null <= 3` is true, where reading `cost` from such a card is `undefined`.
     * Ask {@link hasCost} first when the card might be one of these.
     */
    readonly cost: number | null;

    /** Printed cost, or `null` for cards that have no cost. */
    readonly printedCost: number | null;

    /**
     * The arena the card was in at the view's moment, or `null` if it was in neither. On the last-known
     * view of a card that left play, that is the arena it left from, which makes this the location to
     * use for "in the same arena".
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

    // ----- kind checks that do not narrow (the narrowing ones are declared on each view)

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
}

/** What a card with a ready or exhausted state holds: units, upgrades, leaders and resources. */
export interface IExhaustableCharacteristics {
    readonly exhausted: boolean;
}

/** What a card that takes damage holds: units and bases. */
export interface IDamageableCharacteristics {
    readonly damage: number;
    readonly hp: number;
    readonly remainingHp: number;
}

/** What a base holds. */
export interface IBaseCharacteristics {
    readonly upgrades: readonly CardRef[];

    /** References to the units the card is guarding; see {@link IUnitInPlayCharacteristics.capturedUnits}. */
    readonly capturedUnits: readonly CardRef[];
    isUpgraded(): boolean;
}

/** What a unit card holds, whether or not it is in play. */
export interface IUnitCharacteristics {

    /** Units always have a cost, so this narrows the nullable base declaration. */
    readonly cost: number;

    readonly printedPower: number;
    readonly printedHp: number;
    readonly defaultArena: Arena;
}

/**
 * What only a unit in play holds, at the view's moment. Reached by narrowing with each view's in-play
 * guard, which keeps `power` and `printedPower` distinct concepts (D-27, SC-17).
 */
export interface IUnitInPlayCharacteristics {
    readonly cost: number;

    /** Power including all modifiers in effect at the view's moment. */
    readonly power: number;
    readonly hp: number;
    readonly damage: number;
    readonly remainingHp: number;
    readonly exhausted: boolean;
    readonly upgrades: readonly CardRef[];

    /**
     * References to the units the card is guarding. On a view backed by a record each names the
     * identity the unit had in captivity, which its rescue replaces with a new one when the guard
     * leaves play, so these are for counting and comparing; reading one through the getter fails as
     * an orphaned reference.
     */
    readonly capturedUnits: readonly CardRef[];
    isUpgraded(): boolean;
    hasShield(): boolean;
    hasExperience(): boolean;
    hasWeakness(): boolean;
}

/** What an upgrade holds. */
export interface IUpgradeCharacteristics {
    readonly printedUpgradePower: number;
    readonly printedUpgradeHp: number;

    /** The card the upgrade is attached to, at the view's moment. */
    readonly parentCard: CardRef;

    /** As {@link parentCard}, asserting that it is a unit (it is a base for a Fortify upgrade). */
    readonly parentUnit: CardRef;

    /** Who controlled the parent card at the view's moment. */
    readonly parentCardController: Player;
}

// =================================================================================================
// The last-known view

/**
 * The last-known view of a card: its characteristics as of the moment the reference represents.
 *
 * A card can be read at two moments, and each view answers about exactly one of them. The call that
 * returns a view names its moment, so a reader can see which one every line reads (D-37):
 *
 * - **The last-known view**, from `getLastKnownProperties(ref)`: this type. For a card that left play
 *   during the current action, the moment is the instant it left, and the view answers from the record
 *   written then: last known information (SWU 8.11). Otherwise the moment is now. It holds the card's
 *   characteristics and nothing else. Its in-play guard is {@link wasInPlay}.
 * - **The current view**, from `getCurrentProperties(ref)`: {@link ICurrentCardProperties}. Always now,
 *   never a record. It holds the same characteristics, and adds presence: whether the card is in play
 *   (`isInPlay()`), where it is (`zoneName`, `zone`), and whether it is attached, a resource, attacking
 *   or defending.
 *
 * Presence exists only on the current view. Asked about a card that left play, "is it in play?" or
 * "where is it?" is a question about now, and a last-known view would answer it about the moment the
 * card left. So those reads do not compile here, and an author who needs one has to ask the current
 * view:
 *
 * ```ts
 * cardStates.getCurrentProperties(context.source).isInPlay()                              // did it survive?
 * cardStates.getLastKnownProperties(context.event.cardRef).asUnit().asWasInPlay().power  // its power as it left
 * ```
 *
 * ### Narrowing
 *
 * Two parallel families reach the kind-specific and in-play-only characteristics:
 *
 * - `isX()` (and `wasInPlay()`): a type guard, for when the card legitimately might not be that shape
 * - `asX()` (and `asWasInPlay()`): asserts and narrows, for when the ability requires that shape and
 *   anything else is a bug (D-14)
 *
 * ```ts
 * // the ability only makes sense for a unit that was in play, so assert
 * const power = cardStates.getLastKnownProperties(ref).asUnit().asWasInPlay().power;
 *
 * // zero is a legitimate answer here, so guard
 * const props = cardStates.getLastKnownProperties(ref);
 * const count = props.isUnit() && props.wasInPlay() ? props.upgrades.length : 0;
 * ```
 *
 * Card-valued relations (`upgrades`, `parentCard`, …) are {@link CardRef}s: read them through the
 * getter in turn.
 */
export interface ICardProperties extends ICardCharacteristics {
    isUnit(): this is IUnitProperties;

    /** Narrows to a unit, failing if this does not describe one. */
    asUnit(): IUnitProperties;

    isUpgrade(): this is IUpgradeProperties;

    /** Narrows to an upgrade, failing if this does not describe one. */
    asUpgrade(): IUpgradeProperties;

    isBase(): this is IBaseProperties;
    canBeExhausted(): this is IExhaustableProperties;
    canBeDamaged(): this is IDamageableProperties;

    /**
     * Whether the card was in play at the moment the reference represents: in an arena, or attached to
     * a base. A card that left play during the current action was in play when it left, so this is true
     * for it. It does not say whether the card is still in play; ask the current view's `isInPlay()`.
     *
     * A base, and a leader in the base zone, answer false, as `Card.isInPlay()` does, although the
     * rules count them as in play (SWU 4.9.1).
     */
    wasInPlay(): boolean;
}

/** A card with a ready or exhausted state, on the last-known view. */
export interface IExhaustableProperties extends ICardProperties, IExhaustableCharacteristics {}

/** A card that takes damage, on the last-known view. */
export interface IDamageableProperties extends ICardProperties, IDamageableCharacteristics {}

/** A base, on the last-known view. */
export interface IBaseProperties extends IDamageableProperties, IBaseCharacteristics {}

/**
 * A unit card on the last-known view, whether or not it was in play.
 *
 * In-play characteristics (`power`, `upgrades`, …) are reachable only after narrowing with
 * {@link wasInPlay} or {@link asWasInPlay}. A unit that left play during the current action was in
 * play when it left, so it has them.
 */
export interface IUnitProperties extends ICardProperties, IUnitCharacteristics {

    /** Redeclared because the bases disagree: units always have a cost. */
    readonly cost: number;

    wasInPlay(): this is IUnitPropertiesInPlay;

    /** Narrows to a unit that was in play at the represented moment, failing if it was not. */
    asWasInPlay(): IUnitPropertiesInPlay;
}

/** A unit that was in play at the represented moment, on the last-known view. */
export interface IUnitPropertiesInPlay extends IUnitProperties, IExhaustableProperties, IDamageableProperties, IUnitInPlayCharacteristics {

    /** Redeclared because the bases disagree: units always have a cost. */
    readonly cost: number;

    /** Redeclared because the bases disagree: the unit's guard narrows. */
    wasInPlay(): this is IUnitPropertiesInPlay;
}

/** An upgrade, on the last-known view. */
export interface IUpgradeProperties extends ICardProperties, IUpgradeCharacteristics {}

// =================================================================================================
// The current view

/**
 * The current view of a card: the card as it is now, never last known information. See
 * {@link ICardProperties} for the two views and when to use each.
 *
 * Every member answers as the card does, including where the card fails: reading an attack member of
 * a unit outside the arenas fails here, as on `Card`. Through a reference to a copy that no longer
 * exists (the card has since re-entered play, or moved into a hidden zone), the view answers that the
 * copy is nowhere: not in play, not in an arena, not attached, not a resource and in no attack (SWU
 * 8.5.4). Its other members, `zoneName` and `zone` among them, describe the physical card as it is now.
 *
 * Use it for presence, for a card found in a zone (a selector's candidate, D-38), and for the few
 * rulings that ask about a characteristic as it is now (register §F.1).
 */
export interface ICurrentCardProperties extends ICardCharacteristics {
    isUnit(): this is ICurrentUnitProperties;

    /** Narrows to a unit, failing if this does not describe one. */
    asUnit(): ICurrentUnitProperties;

    isUpgrade(): this is ICurrentUpgradeProperties;

    /** Narrows to an upgrade, failing if this does not describe one. */
    asUpgrade(): ICurrentUpgradeProperties;

    isBase(): this is ICurrentBaseProperties;
    canBeExhausted(): this is ICurrentExhaustableProperties;
    canBeDamaged(): this is ICurrentDamageableProperties;

    // ----- presence

    /** The zone the physical card is in now. */
    readonly zoneName: ZoneName;

    /** The zone the physical card is in now. */
    readonly zone: Zone | null;

    /**
     * Whether the card is in play now, as `Card.isInPlay()` answers it: in an arena, or attached to a
     * base. A base, and a leader in the base zone, answer false here, although the rules count them as
     * in play (SWU 4.9.1).
     */
    isInPlay(): boolean;

    /** Whether the card is attached to another card now. */
    isAttached(): boolean;

    /** Whether the card is in its controller's resource zone now. */
    isResource(): boolean;
}

/** A card with a ready or exhausted state, on the current view. */
export interface ICurrentExhaustableProperties extends ICurrentCardProperties, IExhaustableCharacteristics {}

/** A card that takes damage, on the current view. */
export interface ICurrentDamageableProperties extends ICurrentCardProperties, IDamageableCharacteristics {

    /** Whether the card is defending in an attack now. Fails for a card outside the arenas and base zone, as on `Card`. */
    isDefending(): boolean;

    /** The attack the card is part of now, if any. Fails as {@link isDefending} does. */
    readonly activeAttack: Attack | null;
}

/** A base, on the current view. */
export interface ICurrentBaseProperties extends ICurrentDamageableProperties, IBaseCharacteristics {}

/**
 * A unit card on the current view, whether or not it is in play.
 *
 * In-play characteristics (`power`, `upgrades`, …) are reachable only after narrowing with
 * {@link isInPlay} or {@link asInPlay}.
 */
export interface ICurrentUnitProperties extends ICurrentCardProperties, IUnitCharacteristics {

    /** Redeclared because the bases disagree: units always have a cost. */
    readonly cost: number;

    isInPlay(): this is ICurrentUnitPropertiesInPlay;

    /** Narrows to a unit in play now, failing if it is not. */
    asInPlay(): ICurrentUnitPropertiesInPlay;

    /** Whether the unit is attacking now. Fails for a unit outside the arenas, as on `Card`. */
    isAttacking(): boolean;

    /** Whether the unit is defending now. Fails for a unit outside the arenas, as on `Card`. */
    isDefending(): boolean;

    /** The attack the unit is part of now, if any. Fails as {@link isDefending} does. */
    readonly activeAttack: Attack | null;
}

/** A unit in play now, on the current view. */
export interface ICurrentUnitPropertiesInPlay extends ICurrentUnitProperties, ICurrentExhaustableProperties, ICurrentDamageableProperties, IUnitInPlayCharacteristics {

    /** Redeclared because the bases disagree: units always have a cost. */
    readonly cost: number;

    /** Redeclared because the bases disagree: the unit's guard narrows. */
    isInPlay(): this is ICurrentUnitPropertiesInPlay;
}

/** An upgrade, on the current view. */
export interface ICurrentUpgradeProperties extends ICurrentCardProperties, IUpgradeCharacteristics {}
