import type { Arena, Aspect, CardType, KeywordName, Trait } from '../Constants';
import type { Card } from '../card/Card';
import type { IBaseCard } from '../card/BaseCard';
import type { IUpgradeCard } from '../card/CardInterfaces';
import type { IPlayableOrDeployableCard } from '../card/baseClasses/PlayableOrDeployableCard';
import type { ICardWithDamageProperty } from '../card/propertyMixins/Damage';
import type { IUnitCard } from '../card/propertyMixins/UnitProperties';
import type { NumericKeywordName } from '../../Interfaces';
import type { Player } from '../Player';
import { Contract } from '../utils/Contract';
import { EnumHelpers } from '../utils/EnumHelpers';
import type { CardRef } from './CardRef';
import type { ICardKeyword, ICostCharacteristics } from './CardPropertiesInterfaces';

/**
 * The reads both views backed by the live card share: {@link LastKnownFromCard}, the last-known view of
 * a card with no record, and {@link CurrentFromCard}, the current view of a card's current copy. Every
 * read passes through to the card, so a view can never be stale.
 *
 * Holds the characteristics of every kind of card, a unit's power and an upgrade's parent alike. The
 * view interfaces decide which of them a caller can reach, and a read that does not apply to the card's
 * kind fails with a message saying so. Each read otherwise behaves exactly as reading the card directly
 * would, including the card's own failure when a member does not apply in its zone, which is what keeps
 * rewriting a card's reads through the getter free of behavior changes (D-35).
 *
 * Reads are lazy, so a predicate that only looks at one characteristic pays only for that one. Must not
 * be retained beyond the current evaluation: it holds a card pointer, so storing it in tracked state
 * would break undo (D-23). Long-lived holders store the values they need instead (D-16).
 */
export abstract class ViewFromCard {
    public constructor(
        public readonly ref: CardRef,
        protected readonly card: Card
    ) {}

    /** The view's in-play guard, for failure messages: `wasInPlay()` or `isInPlay()`. */
    protected abstract get inPlayGuardName(): string;

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

    public get arena(): Arena | null {
        const zoneName = this.card.zoneName;
        return EnumHelpers.isArena(zoneName) ? zoneName : null;
    }

    public hasCost(): this is ICostCharacteristics {
        return this.card.hasCost();
    }

    public get cost(): number {
        const card = this.card;
        Contract.assertTrue(card.hasCost(), () => `'cost' does not apply to ${this.ref}, which has no cost. Check hasCost() first`);
        return card.cost;
    }

    public get printedCost(): number {
        const card = this.card;
        Contract.assertTrue(card.hasCost(), () => `'printedCost' does not apply to ${this.ref}, which has no cost. Check hasCost() first`);
        return card.printedCost;
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

    // ----- kind checks that do not narrow (each view declares the narrowing ones with its own types)

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

    // ----- a card with a ready or exhausted state

    public get exhausted(): boolean {
        return this.exhaustableCard('exhausted').exhausted;
    }

    // ----- a card that takes damage: a unit's are in-play stats, a base's are not

    public get damage(): number {
        return this.damageableCard('damage').damage;
    }

    public get hp(): number {
        return this.damageableCard('hp').getHp();
    }

    public get remainingHp(): number {
        return this.damageableCard('remainingHp').remainingHp;
    }

    // ----- a unit in play, or a base

    public get upgrades(): readonly CardRef[] {
        return this.cardWithUpgrades('upgrades').upgrades.map((upgrade) => this.identityOf(upgrade));
    }

    public get capturedUnits(): readonly CardRef[] {
        return this.cardWithUpgrades('capturedUnits').capturedUnits.map((captured) => this.identityOf(captured));
    }

    public isUpgraded(): boolean {
        return this.cardWithUpgrades('isUpgraded').isUpgraded();
    }

    // ----- a unit

    public get printedPower(): number {
        return this.unitCard('printedPower').getPrintedPower();
    }

    public get printedHp(): number {
        return this.unitCard('printedHp').getPrintedHp();
    }

    public get defaultArena(): Arena {
        return this.unitCard('defaultArena').defaultArena;
    }

    public get power(): number {
        return this.unitCardInPlay('power').getPower();
    }

    public hasShield(): boolean {
        return this.unitCardInPlay('hasShield').hasShield();
    }

    public hasExperience(): boolean {
        return this.unitCardInPlay('hasExperience').hasExperience();
    }

    public hasWeakness(): boolean {
        return this.unitCardInPlay('hasWeakness').hasWeakness();
    }

    // ----- an upgrade, and the card it is attached to while it is in play

    public get printedUpgradePower(): number {
        return this.upgradeCard('printedUpgradePower').printedUpgradePower;
    }

    public get printedUpgradeHp(): number {
        return this.upgradeCard('printedUpgradeHp').printedUpgradeHp;
    }

    public get parentCard(): CardRef {
        return this.identityOf(this.upgradeCardInPlay('parentCard').parentCard);
    }

    public get parentUnit(): CardRef {
        return this.identityOf(this.upgradeCardInPlay('parentUnit').parentUnit);
    }

    public get parentCardController(): Player {
        return this.upgradeCardInPlay('parentCardController').parentCard.controller;
    }

    // ----- the card, narrowed to the kind a member needs

    /** Whether the card is in play now. For both card-backed views that is the view's moment. */
    protected isInPlayNow(): boolean {
        return this.card.canBeInPlay() && this.card.isInPlay();
    }

    protected identityOf(card: Card): CardRef {
        return this.card.game.lkiRegistry.getIdentity(card);
    }

    protected unitCard(member: string): IUnitCard {
        const card = this.card;
        Contract.assertTrue(card.isUnit(), () => `'${member}' applies only to a unit, and ${this.ref} is a ${card.type}`);
        return card;
    }

    /**
     * Runtime backstop for the compile-time guarantee of the in-play guards. Only reachable from code
     * that bypassed the type system (for example through an untyped `event`). The card itself would fail
     * on each of these too; this only gives a clearer message.
     */
    protected unitCardInPlay(member: string): IUnitCard {
        const card = this.unitCard(member);
        this.assertInPlay(member);
        return card;
    }

    protected upgradeCard(member: string): IUpgradeCard {
        const card = this.card;
        Contract.assertTrue(card.isUpgrade(), () => `'${member}' applies only to an upgrade, and ${this.ref} is a ${card.type}`);
        return card;
    }

    /** As {@link unitCardInPlay}: an upgrade in play is attached, and only then has a parent. */
    protected upgradeCardInPlay(member: string): IUpgradeCard {
        const card = this.upgradeCard(member);
        this.assertInPlay(member);
        return card;
    }

    /**
     * Not limited to cards in play, because a unit card in the resource zone is legitimately exhausted or
     * ready, and reading that through `canBeExhausted()` must work as it does on the card.
     */
    protected exhaustableCard(member: string): IPlayableOrDeployableCard {
        const card = this.card;
        Contract.assertTrue(card.canBeExhausted(), () => `'${member}' does not apply to ${this.ref}, which cannot be exhausted`);
        return card;
    }

    /** A unit's damage and HP are in-play stats; a base's are always there. */
    protected damageableCard(member: string): ICardWithDamageProperty {
        const card = this.card;
        Contract.assertTrue(card.canBeDamaged(), () => `'${member}' does not apply to ${this.ref}, which cannot be damaged`);
        if (card.isUnit()) {
            this.assertInPlay(member);
        }
        return card;
    }

    /** A unit's upgrades and captured units are in-play stats; a base's are always there. */
    protected cardWithUpgrades(member: string): IUnitCard | IBaseCard {
        const card = this.card;
        if (card.isBase()) {
            return card;
        }
        Contract.assertTrue(card.isUnit(), () => `'${member}' applies only to a unit or a base, and ${this.ref} is a ${card.type}`);
        return this.unitCardInPlay(member);
    }

    private assertInPlay(member: string): void {
        Contract.assertTrue(
            this.isInPlayNow(),
            () => `Attempting to read in-play property '${member}' from ${this.ref}, which is not in play. ` +
              `Narrow with ${this.inPlayGuardName} first, or read the printed value instead.`
        );
    }
}
