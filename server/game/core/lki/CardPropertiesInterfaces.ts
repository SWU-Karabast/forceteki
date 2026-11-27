import type { Arena, Aspect, CardType, KeywordName, Trait, ZoneName } from '../Constants';
import type { Attack } from '../attack/Attack';
import type { Player } from '../Player';
import type { NumericKeywordName, Zone } from '../../Interfaces';
import type { ICardReference } from './CardRef';

/** A keyword a card has, as plain data. `value` is set for the numeric keywords (Raid, Restore, …). */
export interface ICardKeyword {
    readonly name: KeywordName;
    readonly value: number | null;
}

// =================================================================================================
// Characteristics, shared by both views. Card code reaches these through a view, never through these
// types directly.

/** The characteristics every card has that are plain values. A record holds each of them. */
export interface ICardCharacteristicValues {
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
     * The arena the card was in at the view's moment, or `null` if it was in neither. On the last-known
     * view of a card that left play, that is the arena it left from, which makes this the location to
     * use for "in the same arena". A unit that was in play always has one: after `wasInPlay()` it is
     * never `null`.
     */
    readonly arena: Arena | null;
}

/** The characteristics every card has, with the questions about them. */
export interface ICardCharacteristics extends ICardCharacteristicValues {

    /** Reference to the copy this view describes. */
    readonly ref: ICardReference;

    /**
     * Whether the card has a cost, which narrows to `cost` and `printedCost`. Bases, and leaders that
     * never deploy as a unit, have none. Units and upgrades always have one, so their views have `cost`
     * without asking.
     */
    hasCost(): this is ICostCharacteristics;

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

/** What a card with a cost holds. */
export interface ICostCharacteristics {
    readonly cost: number;
    readonly printedCost: number;
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
    readonly upgrades: readonly ICardReference[];

    /** References to the units the card is guarding; see {@link IUnitInPlayCharacteristics.capturedUnits}. */
    readonly capturedUnits: readonly ICardReference[];
    isUpgraded(): boolean;
}

/** What a unit card holds, whether or not it is in play. */
export interface IUnitCharacteristics extends ICostCharacteristics {

    /** The unit's printed power. For its power with modifiers, narrow with the in-play guard first. */
    readonly printedPower: number;
    readonly printedHp: number;
    readonly defaultArena: Arena;
}

/**
 * What only a unit in play holds, at the view's moment. Reached by narrowing with each view's in-play
 * guard, which keeps `power` and `printedPower` distinct concepts (D-27, SC-17).
 */
export interface IUnitInPlayCharacteristics {

    /** Power including all modifiers in effect at the view's moment. */
    readonly power: number;
    readonly hp: number;
    readonly damage: number;
    readonly remainingHp: number;
    readonly exhausted: boolean;
    readonly upgrades: readonly ICardReference[];

    /**
     * References to the units the card is guarding. On a view backed by a record each names the
     * identity the unit had in captivity, which its rescue replaces with a new one when the guard
     * leaves play, so these are for counting and comparing; reading one through the getter fails as
     * an orphaned reference.
     */
    readonly capturedUnits: readonly ICardReference[];
    isUpgraded(): boolean;
    hasShield(): boolean;
    hasExperience(): boolean;
    hasWeakness(): boolean;
}

/** What an upgrade holds, whether or not it is attached. */
export interface IUpgradeCharacteristics extends ICostCharacteristics {
    readonly printedUpgradePower: number;
    readonly printedUpgradeHp: number;
}

/**
 * What only an upgrade in play holds: the card it is attached to, at the view's moment. An upgrade in
 * play is always attached. Reached by narrowing with each view's in-play guard, as a unit's stats are.
 */
export interface IUpgradeInPlayCharacteristics {

    /** The card the upgrade is attached to: a unit for most upgrades, or a base for a Fortify upgrade. */
    readonly parentCard: ICardReference;

    /** As {@link parentCard}, asserting that it is a unit (it is a base for a Fortify upgrade). */
    readonly parentUnit: ICardReference;

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
 *   characteristics and nothing else. Its in-play guard is `wasInPlay()` / `asInPlay()`.
 * - **The current view**, from `getCurrentProperties(cardOrRef)`: {@link ICurrentCardProperties}. Always
 *   now, never a record. It holds the same characteristics, and adds presence: whether the card is in
 *   play, where it is (`zoneName`, `zone`), and whether it is attached, a resource, attacking or
 *   defending. Its in-play guard is `isInPlay()` / `asInPlay()`.
 *
 * Presence exists only on the current view. Asked about a card that left play, "is it in play?" or
 * "where is it?" is a question about now, and a last-known view would answer it about the moment the
 * card left. So those reads do not compile here, and an author who needs one has to ask the current
 * view:
 *
 * ```ts
 * cardStates.getCurrentProperties(context.source).isInPlay()                           // did it survive?
 * cardStates.getLastKnownProperties(context.event.cardRef).asUnit().asInPlay().power  // its power as it left
 * ```
 *
 * ### Narrowing
 *
 * Two parallel families reach the kind-specific and in-play-only characteristics:
 *
 * - `isX()` (and `wasInPlay()`): a type guard, for when the card legitimately might not be that shape
 * - `asX()` (and `asInPlay()`): asserts and narrows, for when the ability requires that shape and
 *   anything else is a bug (D-14)
 *
 * ```ts
 * // the ability only makes sense for a unit that was in play, so assert
 * const power = cardStates.getLastKnownProperties(ref).asUnit().asInPlay().power;
 *
 * // zero is a legitimate answer here, so guard
 * const props = cardStates.getLastKnownProperties(ref);
 * const count = props.isUnit() && props.wasInPlay() ? props.upgrades.length : 0;
 * ```
 *
 * Card-valued relations (`upgrades`, `parentCard`, …) are {@link ICardReference}s: read them through
 * the getter in turn.
 */
export interface ILastKnownCardProperties extends ICardCharacteristics {
    isUnit(): this is ILastKnownUnitProperties;

    /** Narrows to a unit, failing if this does not describe one. */
    asUnit(): ILastKnownUnitProperties;

    isUpgrade(): this is ILastKnownUpgradeProperties;

    /** Narrows to an upgrade, failing if this does not describe one. */
    asUpgrade(): ILastKnownUpgradeProperties;

    isBase(): this is ILastKnownBaseProperties;
    canBeExhausted(): this is ILastKnownExhaustableProperties;
    canBeDamaged(): this is ILastKnownDamageableProperties;

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
export interface ILastKnownExhaustableProperties extends ILastKnownCardProperties, IExhaustableCharacteristics {}

/** A card that takes damage, on the last-known view. */
export interface ILastKnownDamageableProperties extends ILastKnownCardProperties, IDamageableCharacteristics {}

/** A base, on the last-known view. */
export interface ILastKnownBaseProperties extends ILastKnownDamageableProperties, IBaseCharacteristics {}

/**
 * A unit card on the last-known view, whether or not it was in play.
 *
 * In-play characteristics (`power`, `upgrades`, …) are reachable only after narrowing with
 * {@link wasInPlay} or {@link asInPlay}. A unit that left play during the current action was in play
 * when it left, so it has them.
 */
export interface ILastKnownUnitProperties extends ILastKnownCardProperties, IUnitCharacteristics {
    wasInPlay(): this is ILastKnownUnitInPlayProperties;

    /** Narrows to a unit that was in play at the represented moment, failing if it was not. */
    asInPlay(): ILastKnownUnitInPlayProperties;
}

/** A unit that was in play at the represented moment, on the last-known view. */
export interface ILastKnownUnitInPlayProperties extends ILastKnownUnitProperties, ILastKnownExhaustableProperties,
    ILastKnownDamageableProperties, IUnitInPlayCharacteristics {

    /** Redeclared because the bases disagree: the unit's guard narrows. */
    wasInPlay(): this is ILastKnownUnitInPlayProperties;
}

/**
 * An upgrade on the last-known view, whether or not it was attached. The card it was attached to is
 * reachable only after narrowing with {@link wasInPlay} or {@link asInPlay}.
 */
export interface ILastKnownUpgradeProperties extends ILastKnownCardProperties, IUpgradeCharacteristics {
    wasInPlay(): this is ILastKnownUpgradeInPlayProperties;

    /** Narrows to an upgrade that was in play, and so attached, failing if it was not. */
    asInPlay(): ILastKnownUpgradeInPlayProperties;
}

/** An upgrade that was in play, and so attached, at the represented moment, on the last-known view. */
export interface ILastKnownUpgradeInPlayProperties extends ILastKnownUpgradeProperties, IUpgradeInPlayCharacteristics {}

// =================================================================================================
// The current view

/**
 * The current view through a reference, which may name a copy of the card that no longer exists: the
 * card has since re-entered play or moved into a hidden zone, which makes it a new copy (SWU 8.5.4).
 *
 * Holds only what can be said about a copy that may be gone: whether it is in play, attached or a
 * resource, each of which a former copy answers with no. Everything else, where it is included, needs
 * {@link isSameCopy} or {@link asSameCopy} first, as a unit's stats need its in-play guard:
 *
 * ```ts
 * const now = cardStates.getCurrentProperties(context.event.cardRef);
 * if (now.isSameCopy() && now.zoneName === ZoneName.Discard) { … }
 * ```
 *
 * Asked about a `Card` rather than a reference, the getter returns the full
 * {@link ICurrentCardProperties} directly, because a card is always its own current copy.
 */
export interface ICurrentRefProperties {

    /** Reference to the copy this view describes. */
    readonly ref: ICardReference;

    /**
     * Whether the card is still the copy the reference names: it has not since re-entered play or moved
     * into a hidden zone. Narrows to the full current view.
     */
    isSameCopy(): this is ICurrentCardProperties;

    /** Narrows to the full current view, failing if the card has since become a new copy. */
    asSameCopy(): ICurrentCardProperties;

    /**
     * Whether the copy is in play now, as `Card.isInPlay()` answers it: in an arena, or attached to a
     * base. A base, and a leader in the base zone, answer false here, although the rules count them as
     * in play (SWU 4.9.1). A copy that no longer exists is not in play.
     */
    isInPlay(): boolean;

    /** Whether the copy is attached to another card now. A copy that no longer exists is not. */
    isAttached(): boolean;

    /** Whether the copy is in its controller's resource zone now. A copy that no longer exists is not. */
    isResource(): boolean;
}

/**
 * The current view of a card: the card as it is now, never last known information. See
 * {@link ILastKnownCardProperties} for the two views and when to use each.
 *
 * Every member answers as the card does, including where the card fails: reading an attack member of
 * a unit outside the arenas fails here, as on `Card`.
 *
 * Use it for presence, for a card found in a zone (a selector's candidate, D-38), and for the few
 * rulings that ask about a characteristic as it is now (register §F.1).
 */
export interface ICurrentCardProperties extends ICardCharacteristics, ICurrentRefProperties {
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

    /** The zone the card is in now. */
    readonly zoneName: ZoneName;

    /** The zone the card is in now. */
    readonly zone: Zone | null;
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
    isInPlay(): this is ICurrentUnitInPlayProperties;

    /** Narrows to a unit in play now, failing if it is not. */
    asInPlay(): ICurrentUnitInPlayProperties;

    /** Whether the unit is attacking now. Fails for a unit outside the arenas, as on `Card`. */
    isAttacking(): boolean;

    /** Whether the unit is defending now. Fails for a unit outside the arenas, as on `Card`. */
    isDefending(): boolean;

    /** The attack the unit is part of now, if any. Fails as {@link isDefending} does. */
    readonly activeAttack: Attack | null;
}

/** A unit in play now, on the current view. */
export interface ICurrentUnitInPlayProperties extends ICurrentUnitProperties, ICurrentExhaustableProperties,
    ICurrentDamageableProperties, IUnitInPlayCharacteristics {

    /** Redeclared because the bases disagree: the unit's guard narrows. */
    isInPlay(): this is ICurrentUnitInPlayProperties;
}

/**
 * An upgrade on the current view, whether or not it is attached. The card it is attached to is
 * reachable only after narrowing with {@link isInPlay} or {@link asInPlay}.
 */
export interface ICurrentUpgradeProperties extends ICurrentCardProperties, IUpgradeCharacteristics {
    isInPlay(): this is ICurrentUpgradeInPlayProperties;

    /** Narrows to an upgrade in play now, and so attached, failing if it is not. */
    asInPlay(): ICurrentUpgradeInPlayProperties;
}

/** An upgrade in play now, and so attached, on the current view. */
export interface ICurrentUpgradeInPlayProperties extends ICurrentUpgradeProperties, IUpgradeInPlayCharacteristics {}
