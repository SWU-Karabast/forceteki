import type { Trait, ZoneName } from '../Constants';
import type { Card } from '../card/Card';
import type { NumericKeywordName } from '../../Interfaces';
import type { CardRef } from './CardRef';
import type {
    ICardCharacteristicValues,
    ICostCharacteristics,
    IExhaustableCharacteristics,
    ILastKnownCardProperties,
    IUnitCharacteristics,
    IUnitInPlayCharacteristics,
    IUpgradeCharacteristics,
    IUpgradeInPlayCharacteristics
} from './CardPropertiesInterfaces';
import { LastKnownFromCard } from './LastKnownFromCard';

/** A group of characteristics as a record holds them: each member's value, with a method as its result. */
export type Recorded<T> = { readonly [K in keyof T]: T[K] extends () => infer TResult ? TResult : T[K] };

type ZeroArgBooleanMethods<T> = { [K in keyof T]: T[K] extends () => boolean ? K : never }[keyof T];

/** The kind checks a record answers (`isUnit()`, `isLeader()`, …), each as the card answered it as it left. */
export type RecordedKindCheck = Exclude<ZeroArgBooleanMethods<ILastKnownCardProperties>, 'wasInPlay' | 'hasCost'>;

/**
 * Every kind check, by name. Typed by the interface, so a kind check added to the last-known view fails to
 * compile here until it is recorded.
 */
const recordedKindChecks: Readonly<Record<RecordedKindCheck, true>> = Object.freeze({
    isUnit: true, isUpgrade: true, isBase: true, canBeExhausted: true, canBeDamaged: true, canBeInPlay: true,
    isEvent: true, isLeader: true, isLeaderUnit: true, isNonLeaderUnit: true, isToken: true, isTokenUnit: true,
    isTokenUpgrade: true, isShield: true, isExperience: true, isAdvantage: true, isWeakness: true,
    isCreditToken: true, isForceToken: true
});

/**
 * The characteristics recorded for one identity of a card, at the moment it left play or moved from a
 * visible zone into a hidden one. Frozen once written and never mutated (D-17).
 *
 * Holds every characteristic the last-known view exposes (D-36), in groups typed by the characteristic
 * interfaces: a characteristic added to an interface fails to compile in {@link buildCardRecord} until it
 * is recorded. A group is present only when the card had those characteristics as it left: a unit's
 * in-play stats only if it was in play, an upgrade's parent only if it was attached. Presence (where the
 * card is, whether it is in play, attached or attacking) is never recorded: only the current view answers
 * it, from the live card (D-37).
 */
export interface IRecordedCardState extends Recorded<Omit<ICardCharacteristicValues, 'traits'>> {

    /** A frozen array rather than the view's set, because a `Set` cannot be frozen (D-17). */
    readonly traits: readonly Trait[];
    readonly numericKeywordTotals: Readonly<Partial<Record<NumericKeywordName, number>>>;
    readonly checks: Readonly<Record<RecordedKindCheck, boolean>>;

    /** The zone the card was recorded in, which is where it left from. */
    readonly zoneName: ZoneName;

    /** Whether the card was in play when this was recorded, which gates the in-play groups. */
    readonly wasInPlay: boolean;

    readonly cost?: Recorded<ICostCharacteristics>;
    readonly exhaustable?: Recorded<IExhaustableCharacteristics>;
    readonly unit?: Recorded<Omit<IUnitCharacteristics, keyof ICostCharacteristics>>;
    readonly unitInPlay?: Recorded<IUnitInPlayCharacteristics>;
    readonly upgrade?: Recorded<Omit<IUpgradeCharacteristics, keyof ICostCharacteristics>>;

    /** `parentUnit` is `null` for a Fortify upgrade, whose parent is a base. */
    readonly upgradeInPlay?: Recorded<IUpgradeInPlayCharacteristics>;
}

/** The groups of a record, each present only when the card had those characteristics as it left. */
export type RecordedGroup = 'cost' | 'exhaustable' | 'unit' | 'unitInPlay' | 'upgrade' | 'upgradeInPlay';

function numericKeywordTotals(view: LastKnownFromCard): Readonly<Partial<Record<NumericKeywordName, number>>> {
    const totals: Partial<Record<NumericKeywordName, number>> = {};
    for (const keyword of view.keywords) {
        // A keyword with a numeric value is a numeric keyword.
        const name = keyword.name as NumericKeywordName;
        if (keyword.value != null && totals[name] === undefined) {
            const total = view.getNumericKeywordTotal(name);
            if (total != null) {
                totals[name] = total;
            }
        }
    }
    return Object.freeze(totals);
}

function kindChecks(view: LastKnownFromCard): Readonly<Record<RecordedKindCheck, boolean>> {
    const entries = Object.keys(recordedKindChecks).map((check) => [check, view[check as RecordedKindCheck]()]);
    return Object.freeze(Object.fromEntries(entries) as Record<RecordedKindCheck, boolean>);
}

/**
 * Builds the record for `card` as it is right now, by reading it through a last-known view: the record
 * then answers exactly what that view answered at the moment of recording.
 */
export function buildCardRecord(card: Card, ref: CardRef): IRecordedCardState {
    const view = new LastKnownFromCard(ref, card);
    const wasInPlay = view.wasInPlay();

    return Object.freeze({
        title: view.title,
        subtitle: view.subtitle,
        type: view.type,
        controller: view.controller,
        owner: view.owner,
        traits: Object.freeze([...view.traits]),
        aspects: Object.freeze([...view.aspects]),
        keywords: Object.freeze(view.keywords.map((keyword) => Object.freeze(keyword))),
        unique: view.unique,
        arena: view.arena,
        numericKeywordTotals: numericKeywordTotals(view),
        checks: kindChecks(view),
        zoneName: card.zoneName,
        wasInPlay,

        cost: view.hasCost()
            ? Object.freeze({ cost: view.cost, printedCost: view.printedCost })
            : undefined,

        // A card of a kind that can be exhausted has no exhausted state in some zones (a unit in the discard
        // pile, an upgrade attached to a unit), so ask the zone first rather than read and fail.
        exhaustable: card.canBeExhausted() && card.isExhaustedEnabledForZone()
            ? Object.freeze({ exhausted: view.exhausted })
            : undefined,

        unit: view.isUnit()
            ? Object.freeze({ printedPower: view.printedPower, printedHp: view.printedHp, defaultArena: view.defaultArena })
            : undefined,

        unitInPlay: view.isUnit() && wasInPlay
            ? Object.freeze({
                power: view.power,
                hp: view.hp,
                damage: view.damage,
                remainingHp: view.remainingHp,
                exhausted: view.exhausted,
                upgrades: Object.freeze(view.upgrades),
                capturedUnits: Object.freeze(view.capturedUnits),
                isUpgraded: view.isUpgraded(),
                hasShield: view.hasShield(),
                hasExperience: view.hasExperience(),
                hasWeakness: view.hasWeakness()
            })
            : undefined,

        upgrade: view.isUpgrade()
            ? Object.freeze({ printedUpgradePower: view.printedUpgradePower, printedUpgradeHp: view.printedUpgradeHp })
            : undefined,

        upgradeInPlay: card.isUpgrade() && wasInPlay
            ? Object.freeze({
                parentCard: view.parentCard,
                parentUnit: card.parentCard.isUnit() ? view.parentUnit : null,
                parentCardController: view.parentCardController
            })
            : undefined
    });
}
