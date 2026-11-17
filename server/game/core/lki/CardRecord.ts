import type { Arena, Aspect, CardType, Trait } from '../Constants';
import { ZoneName } from '../Constants';
import type { Card } from '../card/Card';
import type { NumericKeywordName } from '../../Interfaces';
import type { Player } from '../Player';
import { EnumHelpers } from '../utils/EnumHelpers';
import type { CardRef } from './CardRef';
import type { ICardKeyword } from './CardPropertiesInterfaces';

/** The kind checks a record answers, each as the card answered it at the moment of recording. */
export const recordedKindChecks = [
    'isUnit', 'isUpgrade', 'isBase', 'canBeExhausted', 'canBeDamaged', 'canBeInPlay', 'isEvent', 'isLeader',
    'isLeaderUnit', 'isNonLeaderUnit', 'isToken', 'isTokenUnit', 'isTokenUpgrade', 'isShield', 'isExperience',
    'isAdvantage', 'isWeakness', 'isCreditToken', 'isForceToken'
] as const;

export type RecordedKindCheck = typeof recordedKindChecks[number];

/**
 * The characteristics recorded for one identity of a card, at the moment it left play or moved from a
 * visible zone into a hidden one. Frozen once written and never mutated (D-17).
 *
 * Holds every characteristic the properties interface exposes (D-36), so a card that has opted in can
 * never ask for a characteristic that was not recorded. Members marked optional are only present when
 * the card had them at that moment: a unit's in-play stats only if it was in play, an upgrade's parent
 * only if it was attached. Presence (where the card is, whether it is in play, attached or attacking)
 * is never recorded, because it is always read from the live card (D-37).
 */
export interface IRecordedCardState {
    readonly title: string;
    readonly subtitle: string | null;
    readonly type: CardType;
    readonly controller: Player;
    readonly owner: Player;
    readonly traits: ReadonlySet<Trait>;
    readonly aspects: readonly Aspect[];
    readonly keywords: readonly ICardKeyword[];
    readonly numericKeywordTotals: ReadonlyMap<NumericKeywordName, number>;
    readonly unique: boolean;
    readonly cost: number | null;
    readonly printedCost: number | null;

    /** The zone the card was recorded in, which is where it left from. */
    readonly zoneName: ZoneName;

    /** True if the card was in play when this was recorded, which gates the in-play stats below. */
    readonly wasInPlay: boolean;

    readonly checks: Readonly<Record<RecordedKindCheck, boolean>>;

    readonly exhausted?: boolean;
    readonly damage?: number;
    readonly hp?: number;
    readonly remainingHp?: number;

    // units
    readonly printedPower?: number;
    readonly printedHp?: number;
    readonly defaultArena?: Arena;
    readonly power?: number;
    readonly upgrades?: readonly CardRef[];
    readonly capturedUnits?: readonly CardRef[];
    readonly hasShield?: boolean;
    readonly hasExperience?: boolean;
    readonly hasWeakness?: boolean;

    // upgrades
    readonly printedUpgradePower?: number;
    readonly printedUpgradeHp?: number;
    readonly parentCard?: CardRef;
    readonly parentUnit?: CardRef;
    readonly parentCardController?: Player;
}

/** The members of a record that hold a single value, for reading them generically. */
export type RecordedField = Exclude<keyof IRecordedCardState, 'checks'>;

type Writable<T> = { -readonly [K in keyof T]: T[K] };

/**
 * Reads a zone-gated member, returning `undefined` where the card's zone disables it.
 *
 * Only the engine's own zone assertions are swallowed. Anything else is a real failure and is rethrown.
 */
function readIfEnabled<T>(read: () => T): T | undefined {
    try {
        return read();
    } catch (error) {
        if (error instanceof Error && error.message.startsWith('Contract assertion failure')) {
            return undefined;
        }
        throw error;
    }
}

function freezeKeywords(card: Card): readonly ICardKeyword[] {
    return Object.freeze(card.keywords.map((keyword) => Object.freeze({
        name: keyword.name,
        value: keyword.hasNumericValue() ? keyword.value : null
    })));
}

function numericKeywordTotals(card: Card): ReadonlyMap<NumericKeywordName, number> {
    const totals = new Map<NumericKeywordName, number>();
    if (!card.canBeExhausted()) {
        return totals;
    }
    for (const keyword of card.keywords) {
        if (keyword.hasNumericValue() && !totals.has(keyword.name)) {
            const total = card.getNumericKeywordTotal(keyword.name);
            if (total != null) {
                totals.set(keyword.name, total);
            }
        }
    }
    return totals;
}

function readKindChecks(card: Card): Readonly<Record<RecordedKindCheck, boolean>> {
    const entries = recordedKindChecks.map((check) => [check, (card[check] as () => boolean).call(card)]);
    return Object.freeze(Object.fromEntries(entries) as Record<RecordedKindCheck, boolean>);
}

/**
 * Builds the record for `card` as it is right now.
 *
 * @param getIdentity resolves a related card to its interned reference
 */
export function buildCardRecord(card: Card, getIdentity: (card: Card) => CardRef): IRecordedCardState {
    const wasInPlay = EnumHelpers.isArena(card.zoneName) ||
      (card.zoneName === ZoneName.Base && card.isUpgrade());

    const record: Writable<IRecordedCardState> = {
        title: card.title,
        subtitle: card.subtitle ?? null,
        type: card.type,
        controller: card.controller,
        owner: card.owner,
        // Copy the collections: the record must not hand out anything a caller could mutate for every
        // other reader (D-17).
        traits: new Set(card.traits),
        aspects: Object.freeze([...card.aspects]),
        keywords: freezeKeywords(card),
        numericKeywordTotals: numericKeywordTotals(card),
        unique: card.unique,
        cost: card.hasCost() ? card.cost : null,
        printedCost: card.hasCost() ? card.printedCost : null,
        zoneName: card.zoneName,
        wasInPlay,
        checks: readKindChecks(card)
    };

    if (card.canBeExhausted()) {
        record.exhausted = readIfEnabled(() => card.exhausted);
    }

    if (card.isUnit()) {
        record.printedPower = card.getPrintedPower();
        record.printedHp = card.getPrintedHp();
        record.defaultArena = card.defaultArena;

        if (wasInPlay) {
            const upgrades = card.isAttached() ? [] : card.upgrades;
            record.power = card.getPower();
            record.hp = card.getHp();
            record.damage = card.damage;
            record.remainingHp = card.remainingHp;
            record.upgrades = Object.freeze(upgrades.map(getIdentity));
            record.capturedUnits = Object.freeze(card.capturedUnits.map(getIdentity));
            record.hasShield = upgrades.some((upgrade) => upgrade.isShield());
            record.hasExperience = upgrades.some((upgrade) => upgrade.isExperience());
            record.hasWeakness = upgrades.some((upgrade) => upgrade.isWeakness());
        }
    }

    if (card.isUpgrade()) {
        record.printedUpgradePower = card.printedUpgradePower;
        record.printedUpgradeHp = card.printedUpgradeHp;

        if (wasInPlay && card.isAttached()) {
            const parent = card.parentCard;
            record.parentCard = getIdentity(parent);
            record.parentCardController = parent.controller;
            if (parent.isUnit()) {
                record.parentUnit = getIdentity(parent);
            }
        }
    }

    return Object.freeze(record);
}
