import type { Arena, Aspect, CardType, KeywordName, Trait } from '../Constants';
import type { NumericKeywordName } from '../../Interfaces';
import type { Player } from '../Player';
import { Contract } from '../utils/Contract';
import type { CardRef, ICardReference } from './CardRef';
import type {
    ICardKeyword,
    ICostCharacteristics,
    ILastKnownBaseProperties,
    ILastKnownDamageableProperties,
    ILastKnownExhaustableProperties,
    ILastKnownUnitInPlayProperties,
    ILastKnownUnitProperties,
    ILastKnownUpgradeInPlayProperties,
    ILastKnownUpgradeProperties
} from './CardPropertiesInterfaces';
import type { IRecordedCardState, RecordedGroup } from './CardRecord';
import { notOfKind, refusePresence } from './ViewHelpers';

function asList<T>(items: T | T[] | Set<T>): T[] {
    if (items instanceof Set) {
        return [...items];
    }
    return Array.isArray(items) ? items : [items];
}

/**
 * The last-known view of a card that left play during the current action: its characteristics as they
 * were at that instant, from the record written then (D-37).
 *
 * Holds the characteristics of every kind of card; the view interfaces decide which of them a caller can
 * reach. A record holds only what the card had when it left: a unit's in-play stats only if it was in
 * play, an upgrade's parent only if it was attached. Asking for anything else fails and names the zone
 * the card left from.
 *
 * Has no presence members (D-37); see {@link refusePresence}. The record is immutable and shared between
 * readers. Long-lived holders store the values they need rather than this view (D-16).
 */
export class LastKnownFromRecord implements ILastKnownUnitInPlayProperties, ILastKnownUpgradeInPlayProperties, ILastKnownBaseProperties {
    public constructor(
        public readonly ref: CardRef,
        private readonly record: IRecordedCardState
    ) {}

    // ----- characteristics

    public get title(): string {
        return this.record.title;
    }

    public get subtitle(): string | null {
        return this.record.subtitle;
    }

    public get type(): CardType {
        return this.record.type;
    }

    public get controller(): Player {
        return this.record.controller;
    }

    public get owner(): Player {
        return this.record.owner;
    }

    public get traits(): ReadonlySet<Trait> {
        // A copy, because a Set cannot be frozen and the record is shared between readers (D-17).
        return new Set(this.record.traits);
    }

    public get aspects(): readonly Aspect[] {
        return this.record.aspects;
    }

    public get keywords(): readonly ICardKeyword[] {
        return this.record.keywords;
    }

    public get unique(): boolean {
        return this.record.unique;
    }

    public get arena(): Arena | null {
        return this.record.arena;
    }

    public hasCost(): this is ICostCharacteristics {
        return this.record.cost != null;
    }

    public get cost(): number {
        return this.group('cost', 'cost').cost;
    }

    public get printedCost(): number {
        return this.group('cost', 'printedCost').printedCost;
    }

    public hasSomeTrait(traits: Trait | Trait[] | Set<Trait>): boolean {
        return asList(traits).some((trait) => this.record.traits.includes(trait));
    }

    public hasEveryTrait(traits: Trait[] | Set<Trait>): boolean {
        return asList(traits).every((trait) => this.record.traits.includes(trait));
    }

    public hasSomeAspect(aspects: Aspect | Aspect[] | Set<Aspect>): boolean {
        return asList(aspects).some((aspect) => this.record.aspects.includes(aspect));
    }

    public hasEveryAspect(aspects: Aspect[] | Set<Aspect>): boolean {
        return asList(aspects).every((aspect) => this.record.aspects.includes(aspect));
    }

    public hasSomeKeyword(keywords: KeywordName | KeywordName[] | Set<KeywordName>): boolean {
        return asList(keywords).some((name) => this.record.keywords.some((keyword) => keyword.name === name));
    }

    public getNumericKeywordTotal(keywordName: NumericKeywordName): number | null {
        return this.record.numericKeywordTotals[keywordName] ?? null;
    }

    // ----- kind checks, as the card answered them when it was recorded

    public isUnit(): this is ILastKnownUnitProperties {
        return this.record.checks.isUnit;
    }

    public asUnit(): ILastKnownUnitProperties {
        Contract.assertTrue(this.record.checks.isUnit, notOfKind(this.ref, 'a unit', this.record.type));
        return this;
    }

    public isUpgrade(): this is ILastKnownUpgradeProperties {
        return this.record.checks.isUpgrade;
    }

    public asUpgrade(): ILastKnownUpgradeProperties {
        Contract.assertTrue(this.record.checks.isUpgrade, notOfKind(this.ref, 'an upgrade', this.record.type));
        return this;
    }

    public isBase(): this is ILastKnownBaseProperties {
        return this.record.checks.isBase;
    }

    public canBeExhausted(): this is ILastKnownExhaustableProperties {
        return this.record.checks.canBeExhausted;
    }

    public canBeDamaged(): this is ILastKnownDamageableProperties {
        return this.record.checks.canBeDamaged;
    }

    public canBeInPlay(): boolean {
        return this.record.checks.canBeInPlay;
    }

    public isEvent(): boolean {
        return this.record.checks.isEvent;
    }

    public isLeader(): boolean {
        return this.record.checks.isLeader;
    }

    public isLeaderUnit(): boolean {
        return this.record.checks.isLeaderUnit;
    }

    public isNonLeaderUnit(): boolean {
        return this.record.checks.isNonLeaderUnit;
    }

    public isToken(): boolean {
        return this.record.checks.isToken;
    }

    public isTokenUnit(): boolean {
        return this.record.checks.isTokenUnit;
    }

    public isTokenUpgrade(): boolean {
        return this.record.checks.isTokenUpgrade;
    }

    public isShield(): boolean {
        return this.record.checks.isShield;
    }

    public isExperience(): boolean {
        return this.record.checks.isExperience;
    }

    public isAdvantage(): boolean {
        return this.record.checks.isAdvantage;
    }

    public isWeakness(): boolean {
        return this.record.checks.isWeakness;
    }

    public isCreditToken(): boolean {
        return this.record.checks.isCreditToken;
    }

    public isForceToken(): boolean {
        return this.record.checks.isForceToken;
    }

    // ----- the in-play guard, as the card answered when it was recorded

    /** Narrows a unit or an upgrade to its in-play members, through their interfaces. */
    public wasInPlay(): this is ILastKnownUnitInPlayProperties & ILastKnownUpgradeInPlayProperties {
        return this.record.wasInPlay;
    }

    public asInPlay(): ILastKnownUnitInPlayProperties & ILastKnownUpgradeInPlayProperties {
        Contract.assertTrue(
            this.record.wasInPlay,
            () => `Expected ${this.ref} to have been in play when it was recorded, but it was in ${this.record.zoneName}`
        );
        return this;
    }

    // ----- a card with a ready or exhausted state

    public get exhausted(): boolean {
        return this.group('exhaustable', 'exhausted').exhausted;
    }

    // ----- a unit, and its in-play stats

    public get printedPower(): number {
        return this.group('unit', 'printedPower').printedPower;
    }

    public get printedHp(): number {
        return this.group('unit', 'printedHp').printedHp;
    }

    public get defaultArena(): Arena {
        return this.group('unit', 'defaultArena').defaultArena;
    }

    public get power(): number {
        return this.inPlayGroup('unitInPlay', 'power').power;
    }

    public get hp(): number {
        return this.inPlayGroup('unitInPlay', 'hp').hp;
    }

    public get damage(): number {
        return this.inPlayGroup('unitInPlay', 'damage').damage;
    }

    public get remainingHp(): number {
        return this.inPlayGroup('unitInPlay', 'remainingHp').remainingHp;
    }

    public get upgrades(): readonly ICardReference[] {
        return this.inPlayGroup('unitInPlay', 'upgrades').upgrades;
    }

    public get capturedUnits(): readonly ICardReference[] {
        return this.inPlayGroup('unitInPlay', 'capturedUnits').capturedUnits;
    }

    public isUpgraded(): boolean {
        return this.inPlayGroup('unitInPlay', 'isUpgraded').isUpgraded;
    }

    public hasShield(): boolean {
        return this.inPlayGroup('unitInPlay', 'hasShield').hasShield;
    }

    public hasExperience(): boolean {
        return this.inPlayGroup('unitInPlay', 'hasExperience').hasExperience;
    }

    public hasWeakness(): boolean {
        return this.inPlayGroup('unitInPlay', 'hasWeakness').hasWeakness;
    }

    // ----- an upgrade, and the card it was attached to

    public get printedUpgradePower(): number {
        return this.group('upgrade', 'printedUpgradePower').printedUpgradePower;
    }

    public get printedUpgradeHp(): number {
        return this.group('upgrade', 'printedUpgradeHp').printedUpgradeHp;
    }

    public get parentCard(): ICardReference {
        return this.inPlayGroup('upgradeInPlay', 'parentCard').parentCard;
    }

    public get parentUnit(): ICardReference {
        const parentUnit = this.inPlayGroup('upgradeInPlay', 'parentUnit').parentUnit;
        Contract.assertNotNullLike(
            parentUnit,
            `${this.ref} was attached to a base, not a unit, when it was recorded. Read parentCard instead.`
        );
        return parentUnit;
    }

    public get parentCardController(): Player {
        return this.inPlayGroup('upgradeInPlay', 'parentCardController').parentCardController;
    }

    /**
     * A group of the record, failing if the card did not have those characteristics when it was recorded:
     * asking for one is a programming error, and fails loudly (D-14).
     */
    private group<TGroup extends RecordedGroup>(group: TGroup, member: string): NonNullable<IRecordedCardState[TGroup]> {
        const values = this.record[group];
        Contract.assertNotNullLike(
            values,
            `Property '${member}' was not recorded for ${this.ref}, because the card did not have it when it left ` +
            `${this.record.zoneName}.`
        );
        return values;
    }

    /** As {@link group}, for in-play stats, with a message that names the guard. */
    private inPlayGroup<TGroup extends 'unitInPlay' | 'upgradeInPlay'>(group: TGroup, member: string): NonNullable<IRecordedCardState[TGroup]> {
        Contract.assertTrue(
            this.record.wasInPlay,
            () => `Attempting to read in-play property '${member}' from the record for ${this.ref}, ` +
              'which was not in play when it was recorded. Narrow with wasInPlay() first.'
        );
        return this.group(group, member);
    }
}

refusePresence(LastKnownFromRecord);
