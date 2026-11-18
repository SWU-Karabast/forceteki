import type { Arena, Aspect, CardType, KeywordName, Trait } from '../Constants';
import type { NumericKeywordName } from '../../Interfaces';
import type { Player } from '../Player';
import { Contract } from '../utils/Contract';
import { EnumHelpers } from '../utils/EnumHelpers';
import type { CardRef } from './CardRef';
import type {
    IBaseProperties,
    ICardKeyword,
    ICardProperties,
    IDamageableProperties,
    IExhaustableProperties,
    IUnitProperties,
    IUnitPropertiesInPlay,
    IUpgradeProperties
} from './CardPropertiesInterfaces';
import type { IRecordedCardState, RecordedField } from './CardRecord';
import { presenceNotOnLastKnownView } from './LiveCardProperties';

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
 * Holds characteristics only. Presence (where the card is now, whether it is in play, attached,
 * attacking or defending) is asked of the current view, and the members below that would answer it
 * fail, for code that got past the types.
 *
 * The record is immutable and shared between readers. Long-lived holders store the values they need
 * rather than this view (D-16).
 */
export class RecordedCardProperties implements ICardProperties {
    public constructor(
        public readonly ref: CardRef,
        protected readonly record: IRecordedCardState
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

    public get cost(): number | null {
        return this.record.cost;
    }

    public get printedCost(): number | null {
        return this.record.printedCost;
    }

    public get arena(): Arena | null {
        const zoneName = this.record.zoneName;
        return EnumHelpers.isArena(zoneName) ? zoneName : null;
    }

    public hasCost(): boolean {
        return this.record.cost != null;
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

    public isUnit(): this is IUnitProperties {
        return false;
    }

    public asUnit(): IUnitProperties {
        return Contract.fail(`Expected ${this.ref} to be a unit, but it is a ${this.record.type}`);
    }

    public isUpgrade(): this is IUpgradeProperties {
        return false;
    }

    public asUpgrade(): IUpgradeProperties {
        return Contract.fail(`Expected ${this.ref} to be an upgrade, but it is a ${this.record.type}`);
    }

    public isBase(): this is IBaseProperties {
        return this.record.checks.isBase;
    }

    public canBeExhausted(): this is IExhaustableProperties {
        return this.record.checks.canBeExhausted;
    }

    public canBeDamaged(): this is IDamageableProperties {
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

    public wasInPlay(): boolean {
        return this.record.wasInPlay;
    }

    // ----- presence is not on this view: these fail, for code that got past the types

    public get zoneName(): never {
        return Contract.fail(presenceNotOnLastKnownView(this.ref, 'zoneName'));
    }

    public get zone(): never {
        return Contract.fail(presenceNotOnLastKnownView(this.ref, 'zone'));
    }

    public isInPlay(): never {
        return Contract.fail(presenceNotOnLastKnownView(this.ref, 'isInPlay'));
    }

    public isAttached(): never {
        return Contract.fail(presenceNotOnLastKnownView(this.ref, 'isAttached'));
    }

    public isResource(): never {
        return Contract.fail(presenceNotOnLastKnownView(this.ref, 'isResource'));
    }

    public isAttacking(): never {
        return Contract.fail(presenceNotOnLastKnownView(this.ref, 'isAttacking'));
    }

    public isDefending(): never {
        return Contract.fail(presenceNotOnLastKnownView(this.ref, 'isDefending'));
    }

    public get activeAttack(): never {
        return Contract.fail(presenceNotOnLastKnownView(this.ref, 'activeAttack'));
    }

    // ----- members reached by narrowing with canBeExhausted(), canBeDamaged() or isBase()

    public get exhausted(): boolean {
        return this.read('exhausted');
    }

    public get damage(): number {
        return this.read('damage');
    }

    public get hp(): number {
        return this.read('hp');
    }

    public get remainingHp(): number {
        return this.read('remainingHp');
    }

    public get upgrades(): readonly CardRef[] {
        return this.read('upgrades');
    }

    public get capturedUnits(): readonly CardRef[] {
        return this.read('capturedUnits');
    }

    public isUpgraded(): boolean {
        return this.read('upgrades').length > 0;
    }

    /**
     * Records hold every characteristic the interface exposes (D-36), but some only exist in certain
     * states: a unit's stats only in play, an upgrade's parent only while attached. Asking for one the
     * card did not have when it was recorded is a programming error, and fails loudly (D-14).
     */
    protected read<TKey extends RecordedField>(field: TKey): NonNullable<IRecordedCardState[TKey]> {
        const value = this.record[field];
        Contract.assertNotNullLike(
            value,
            `Property '${String(field)}' was not recorded for ${this.ref}, because the card did not have it ` +
            `when it left ${this.record.zoneName}.`
        );
        return value as NonNullable<IRecordedCardState[TKey]>;
    }
}

/** Recorded properties for a unit card. */
export class RecordedUnitProperties extends RecordedCardProperties implements IUnitPropertiesInPlay {
    public override isUnit(): this is IUnitProperties {
        return true;
    }

    public override asUnit(): IUnitProperties {
        return this;
    }

    public override get cost(): number {
        return this.read('cost');
    }

    public get printedPower(): number {
        return this.read('printedPower');
    }

    public get printedHp(): number {
        return this.read('printedHp');
    }

    public get defaultArena(): Arena {
        return this.read('defaultArena');
    }

    public override wasInPlay(): this is IUnitPropertiesInPlay {
        return this.record.wasInPlay;
    }

    public asWasInPlay(): IUnitPropertiesInPlay {
        Contract.assertTrue(
            this.record.wasInPlay,
            `Expected ${this.ref} to have been in play when it was recorded, but it was in ${this.record.zoneName}`
        );
        return this;
    }

    public get power(): number {
        this.assertWasInPlay('power');
        return this.read('power');
    }

    public override get hp(): number {
        this.assertWasInPlay('hp');
        return this.read('hp');
    }

    public override get damage(): number {
        this.assertWasInPlay('damage');
        return this.read('damage');
    }

    public override get remainingHp(): number {
        this.assertWasInPlay('remainingHp');
        return this.read('remainingHp');
    }

    public override get upgrades(): readonly CardRef[] {
        this.assertWasInPlay('upgrades');
        return this.read('upgrades');
    }

    public override get capturedUnits(): readonly CardRef[] {
        this.assertWasInPlay('capturedUnits');
        return this.read('capturedUnits');
    }

    public override isUpgraded(): boolean {
        this.assertWasInPlay('isUpgraded');
        return this.read('upgrades').length > 0;
    }

    public hasShield(): boolean {
        this.assertWasInPlay('hasShield');
        return this.read('hasShield');
    }

    public hasExperience(): boolean {
        this.assertWasInPlay('hasExperience');
        return this.read('hasExperience');
    }

    public hasWeakness(): boolean {
        this.assertWasInPlay('hasWeakness');
        return this.read('hasWeakness');
    }

    private assertWasInPlay(property: string): void {
        Contract.assertTrue(
            this.record.wasInPlay,
            `Attempting to read in-play property '${property}' from the record for ${this.ref}, ` +
            'which was not in play when it was recorded. Narrow with wasInPlay() first.'
        );
    }
}

/** Recorded properties for an upgrade. */
export class RecordedUpgradeProperties extends RecordedCardProperties implements IUpgradeProperties {
    public override isUpgrade(): this is IUpgradeProperties {
        return true;
    }

    public override asUpgrade(): IUpgradeProperties {
        return this;
    }

    public get printedUpgradePower(): number {
        return this.read('printedUpgradePower');
    }

    public get printedUpgradeHp(): number {
        return this.read('printedUpgradeHp');
    }

    public get parentCard(): CardRef {
        return this.read('parentCard');
    }

    public get parentUnit(): CardRef {
        Contract.assertFalse(
            this.record.parentCard != null && this.record.parentUnit == null,
            `${this.ref} was attached to a base, not a unit, when it was recorded. Read parentCard instead.`
        );
        return this.read('parentUnit');
    }

    public get parentCardController(): Player {
        return this.read('parentCardController');
    }
}
