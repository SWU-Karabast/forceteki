import type { Arena, Aspect, CardType, KeywordName, Trait, ZoneName } from '../Constants';
import type { Attack } from '../attack/Attack';
import type { Card } from '../card/Card';
import type { NumericKeywordName, Zone } from '../../Interfaces';
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

function asList<T>(items: T | T[] | Set<T>): T[] {
    if (items instanceof Set) {
        return [...items];
    }
    return Array.isArray(items) ? items : [items];
}

/**
 * Properties backed by a record: characteristics as they were when the card left play (D-37).
 *
 * Presence — where the card is, whether it is in play, attached, attacking or defending — is never
 * recorded. It reads the live card through the reference, so it always answers about now. If the card
 * has since become a new copy, the copy this view describes no longer exists anywhere: it is not in
 * play, attached, attacking, defending or a resource, whatever the new copy is doing (SWU 8.5.4).
 *
 * The record is immutable and shared between readers, but this view is not safe to retain, because
 * its presence reads go to the live card. Long-lived holders store the values they need (D-16).
 */
export class RecordedCardProperties implements ICardProperties {
    public constructor(
        public readonly ref: CardRef,
        protected readonly record: IRecordedCardState
    ) {}

    /** The physical card, wherever it is now, whichever copy of it that is. */
    protected get liveCard(): Card {
        return this.ref.getCardForEngine();
    }

    /** The live card while it is still the copy this view describes, otherwise `null`. */
    protected get currentCopy(): Card | null {
        return this.ref.isCurrent ? this.ref.getCardForEngine() : null;
    }

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

    // ----- presence: the live card (D-37)

    /** The zone the physical card is in now, which is the new copy's zone if it has become one. */
    public get zoneName(): ZoneName {
        return this.liveCard.zoneName;
    }

    /** As {@link zoneName}. */
    public get zone(): Zone | null {
        return this.liveCard.zone;
    }

    public isInPlay(): boolean {
        const card = this.currentCopy;
        return card != null && card.canBeInPlay() && card.isInPlay();
    }

    public isAttached(): boolean {
        const card = this.currentCopy;
        return card != null && card.canBeInPlay() && card.isAttached();
    }

    public isResource(): boolean {
        const card = this.currentCopy;
        return card != null && card.isResource();
    }

    // A card that has left play cannot be in an attack, and `Card` fails if asked outside an attackable
    // zone, so these check the zone first: presence answers, whatever has happened to the card.

    public isDefending(): boolean {
        const card = this.currentCopy;
        return card != null && card.canBeDamaged() && card.canHaveActiveAttack() && card.isDefending();
    }

    public get activeAttack(): Attack | null {
        const card = this.currentCopy;
        return card != null && card.canBeDamaged() && card.canHaveActiveAttack() ? card.activeAttack : null;
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

    public hasInPlayStats(): this is IUnitPropertiesInPlay {
        return this.record.wasInPlay;
    }

    public asInPlayStats(): IUnitPropertiesInPlay {
        Contract.assertTrue(
            this.record.wasInPlay,
            `Expected ${this.ref} to have been in play when it was recorded, but it was in ${this.record.zoneName}`
        );
        return this;
    }

    public isAttacking(): boolean {
        const card = this.currentCopy;
        return card != null && card.isUnit() && card.canHaveActiveAttack() && card.isAttacking();
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
            'which was not in play when it was recorded. Narrow with hasInPlayStats() first.'
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
