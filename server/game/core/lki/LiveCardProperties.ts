import type { Arena, Aspect, CardType, KeywordName, Trait, ZoneName } from '../Constants';
import type { Attack } from '../attack/Attack';
import type { Card } from '../card/Card';
import type { IUpgradeCard } from '../card/CardInterfaces';
import type { IUnitCard } from '../card/propertyMixins/UnitProperties';
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

/**
 * Properties backed by the live card: every read passes through, so the view can never be stale.
 *
 * Used whenever no record exists for the reference, which is the overwhelmingly common case, and by
 * every read of presence (D-37). Reads are lazy, so a predicate that only looks at one characteristic
 * pays only for that one. Each read behaves exactly as reading the card directly would, including
 * the card's own failure when a member does not apply in its zone, which is what keeps rewriting a
 * card's reads through the getter free of behavior changes (D-35).
 *
 * Must not be retained beyond the current evaluation — it holds a card pointer, so storing it in
 * tracked state would break undo (D-23). Long-lived holders store recorded values instead (D-16).
 */
export class LiveCardProperties implements ICardProperties {
    public constructor(
        public readonly ref: CardRef,
        protected readonly card: Card
    ) {}

    // ----- characteristics

    public get title(): string {
        return this.card.title;
    }

    public get subtitle(): string | null {
        return this.card.subtitle ?? null;
    }

    public get type(): CardType {
        return this.card.type;
    }

    public get controller(): Player {
        return this.card.controller;
    }

    public get owner(): Player {
        return this.card.owner;
    }

    public get traits(): ReadonlySet<Trait> {
        return this.card.traits;
    }

    public get aspects(): readonly Aspect[] {
        return this.card.aspects;
    }

    public get keywords(): readonly ICardKeyword[] {
        return this.card.keywords.map((keyword) => ({
            name: keyword.name,
            value: keyword.hasNumericValue() ? keyword.value : null
        }));
    }

    public get unique(): boolean {
        return this.card.unique;
    }

    public get cost(): number | null {
        return this.card.hasCost() ? this.card.cost : null;
    }

    public get printedCost(): number | null {
        return this.card.hasCost() ? this.card.printedCost : null;
    }

    public get arena(): Arena | null {
        const zoneName = this.card.zoneName;
        return EnumHelpers.isArena(zoneName) ? zoneName : null;
    }

    public hasCost(): boolean {
        return this.card.hasCost();
    }

    public hasSomeTrait(traits: Trait | Trait[] | Set<Trait>): boolean {
        return this.card.hasSomeTrait(traits);
    }

    public hasEveryTrait(traits: Trait[] | Set<Trait>): boolean {
        return this.card.hasEveryTrait(traits);
    }

    public hasSomeAspect(aspects: Aspect | Aspect[] | Set<Aspect>): boolean {
        return this.card.hasSomeAspect(aspects);
    }

    public hasEveryAspect(aspects: Aspect[] | Set<Aspect>): boolean {
        return this.card.hasEveryAspect(aspects);
    }

    public hasSomeKeyword(keywords: KeywordName | KeywordName[] | Set<KeywordName>): boolean {
        return this.card.hasSomeKeyword(keywords);
    }

    public getNumericKeywordTotal(keywordName: NumericKeywordName): number | null {
        return this.card.canBeExhausted() ? this.card.getNumericKeywordTotal(keywordName) : null;
    }

    // ----- kind checks

    public isUnit(): this is IUnitProperties {
        return false;
    }

    public asUnit(): IUnitProperties {
        return Contract.fail(`Expected ${this.ref} to be a unit, but it is a ${this.card.type}`);
    }

    public isUpgrade(): this is IUpgradeProperties {
        return false;
    }

    public asUpgrade(): IUpgradeProperties {
        return Contract.fail(`Expected ${this.ref} to be an upgrade, but it is a ${this.card.type}`);
    }

    public isBase(): this is IBaseProperties {
        return this.card.isBase();
    }

    public canBeExhausted(): this is IExhaustableProperties {
        return this.card.canBeExhausted();
    }

    public canBeDamaged(): this is IDamageableProperties {
        return this.card.canBeDamaged();
    }

    public canBeInPlay(): boolean {
        return this.card.canBeInPlay();
    }

    public isEvent(): boolean {
        return this.card.isEvent();
    }

    public isLeader(): boolean {
        return this.card.isLeader();
    }

    public isLeaderUnit(): boolean {
        return this.card.isLeaderUnit();
    }

    public isNonLeaderUnit(): boolean {
        return this.card.isNonLeaderUnit();
    }

    public isToken(): boolean {
        return this.card.isToken();
    }

    public isTokenUnit(): boolean {
        return this.card.isTokenUnit();
    }

    public isTokenUpgrade(): boolean {
        return this.card.isTokenUpgrade();
    }

    public isShield(): boolean {
        return this.card.isShield();
    }

    public isExperience(): boolean {
        return this.card.isExperience();
    }

    public isAdvantage(): boolean {
        return this.card.isAdvantage();
    }

    public isWeakness(): boolean {
        return this.card.isWeakness();
    }

    public isCreditToken(): boolean {
        return this.card.isCreditToken();
    }

    public isForceToken(): boolean {
        return this.card.isForceToken();
    }

    // ----- presence

    public get zoneName(): ZoneName {
        return this.card.zoneName;
    }

    public get zone(): Zone | null {
        return this.card.zone;
    }

    public isInPlay(): boolean {
        return this.card.canBeInPlay() && this.card.isInPlay();
    }

    public isAttached(): boolean {
        return this.card.canBeInPlay() && this.card.isAttached();
    }

    public isResource(): boolean {
        return this.card.isResource();
    }

    // ----- members reached by narrowing with canBeExhausted(), canBeDamaged() or isBase()

    public get exhausted(): boolean {
        const card = this.card;
        Contract.assertTrue(card.canBeExhausted(), `${this.ref} cannot be exhausted`);
        return card.exhausted;
    }

    public get damage(): number {
        const card = this.card;
        Contract.assertTrue(card.canBeDamaged(), `${this.ref} cannot be damaged`);
        return card.damage;
    }

    public get hp(): number {
        const card = this.card;
        Contract.assertTrue(card.canBeDamaged(), `${this.ref} cannot be damaged`);
        return card.getHp();
    }

    public get remainingHp(): number {
        const card = this.card;
        Contract.assertTrue(card.canBeDamaged(), `${this.ref} cannot be damaged`);
        return card.remainingHp;
    }

    public isDefending(): boolean {
        const card = this.card;
        Contract.assertTrue(card.canBeDamaged(), `${this.ref} cannot be damaged`);
        return card.isDefending();
    }

    public get activeAttack(): Attack | null {
        const card = this.card;
        Contract.assertTrue(card.canBeDamaged(), `${this.ref} cannot be damaged`);
        return card.activeAttack;
    }

    public get upgrades(): readonly CardRef[] {
        const card = this.card;
        Contract.assertTrue(card.isBase(), `${this.ref} is not a base`);
        return card.upgrades.map((upgrade) => this.identityOf(upgrade));
    }

    public get capturedUnits(): readonly CardRef[] {
        const card = this.card;
        Contract.assertTrue(card.isBase(), `${this.ref} is not a base`);
        return card.capturedUnits.map((captured) => this.identityOf(captured));
    }

    public isUpgraded(): boolean {
        const card = this.card;
        Contract.assertTrue(card.isBase(), `${this.ref} is not a base`);
        return card.isUpgraded();
    }

    protected identityOf(card: Card): CardRef {
        return this.card.game.lkiRegistry.getIdentity(card);
    }
}

/** Live properties for a unit card. In-play characteristics are gated behind {@link hasInPlayStats}. */
export class LiveUnitProperties extends LiveCardProperties implements IUnitPropertiesInPlay {
    protected declare readonly card: IUnitCard;

    public constructor(ref: CardRef, card: IUnitCard) {
        super(ref, card);
    }

    public override isUnit(): this is IUnitProperties {
        return true;
    }

    public override asUnit(): IUnitProperties {
        return this;
    }

    public override get cost(): number {
        return this.card.cost;
    }

    public get printedPower(): number {
        return this.card.getPrintedPower();
    }

    public get printedHp(): number {
        return this.card.getPrintedHp();
    }

    public get defaultArena(): Arena {
        return this.card.defaultArena;
    }

    public hasInPlayStats(): this is IUnitPropertiesInPlay {
        return this.card.isInPlay();
    }

    public asInPlayStats(): IUnitPropertiesInPlay {
        Contract.assertTrue(this.card.isInPlay(), `Expected ${this.ref} to be in play, but it is in ${this.card.zoneName}`);
        return this;
    }

    public isAttacking(): boolean {
        return this.card.isAttacking();
    }

    public override isDefending(): boolean {
        return this.card.isDefending();
    }

    public override get activeAttack(): Attack | null {
        return this.card.activeAttack;
    }

    public get power(): number {
        this.assertInPlay('power');
        return this.card.getPower();
    }

    public override get hp(): number {
        this.assertInPlay('hp');
        return this.card.getHp();
    }

    public override get damage(): number {
        this.assertInPlay('damage');
        return this.card.damage;
    }

    public override get remainingHp(): number {
        this.assertInPlay('remainingHp');
        return this.card.remainingHp;
    }

    public override get upgrades(): readonly CardRef[] {
        this.assertInPlay('upgrades');
        return this.card.upgrades.map((upgrade) => this.identityOf(upgrade));
    }

    public override get capturedUnits(): readonly CardRef[] {
        this.assertInPlay('capturedUnits');
        return this.card.capturedUnits.map((captured) => this.identityOf(captured));
    }

    public override isUpgraded(): boolean {
        this.assertInPlay('isUpgraded');
        return this.card.isUpgraded();
    }

    public hasShield(): boolean {
        this.assertInPlay('hasShield');
        return this.card.hasShield();
    }

    public hasExperience(): boolean {
        this.assertInPlay('hasExperience');
        return this.card.hasExperience();
    }

    public hasWeakness(): boolean {
        this.assertInPlay('hasWeakness');
        return this.card.hasWeakness();
    }

    /**
     * Runtime backstop for the compile-time guarantee in {@link IUnitProperties.hasInPlayStats}. Only
     * reachable from code that bypassed the type system (for example through an untyped `event`).
     * The card itself would fail on each of these too; this only gives a clearer message.
     *
     * Not applied to `exhausted`, because a unit card in the resource zone is legitimately exhausted or
     * ready, and reading that through `canBeExhausted()` must work as it does on the card.
     */
    private assertInPlay(property: string): void {
        Contract.assertTrue(
            this.card.isInPlay(),
            `Attempting to read in-play property '${property}' from ${this.ref}, which is not in play. ` +
            'Narrow with hasInPlayStats() first, or read the printed value instead.'
        );
    }
}

/** Live properties for an upgrade. */
export class LiveUpgradeProperties extends LiveCardProperties implements IUpgradeProperties {
    protected declare readonly card: IUpgradeCard;

    public constructor(ref: CardRef, card: IUpgradeCard) {
        super(ref, card);
    }

    public override isUpgrade(): this is IUpgradeProperties {
        return true;
    }

    public override asUpgrade(): IUpgradeProperties {
        return this;
    }

    public get printedUpgradePower(): number {
        return this.card.printedUpgradePower;
    }

    public get printedUpgradeHp(): number {
        return this.card.printedUpgradeHp;
    }

    public get parentCard(): CardRef {
        return this.identityOf(this.card.parentCard);
    }

    public get parentUnit(): CardRef {
        return this.identityOf(this.card.parentUnit);
    }

    public get parentCardController(): Player {
        return this.card.parentCard.controller;
    }
}
