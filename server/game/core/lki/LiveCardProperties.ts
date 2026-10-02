import type { CardType, Trait, ZoneName } from '../Constants';
import type { Card } from '../card/Card';
import type { IUnitCard } from '../card/propertyMixins/UnitProperties';
import type { Player } from '../Player';
import { Contract } from '../utils/Contract';
import type { CardRef } from './CardRef';
import type { ICardProperties, IUnitProperties, IUnitPropertiesInPlay } from './CardPropertiesInterfaces';

/**
 * Properties backed by the live card: every read passes through, so the view can never be stale.
 *
 * Used whenever no record exists for the reference, which is the overwhelmingly common case.
 * Reads are lazy, so a predicate that only looks at one characteristic pays only for that one.
 *
 * Must not be retained beyond the current evaluation — it holds a card pointer, so storing it in
 * tracked state would break undo (D-23). Long-lived holders store recorded values instead (D-16).
 */
export class LiveCardProperties implements ICardProperties {
    public constructor(
        public readonly ref: CardRef,
        protected readonly card: Card
    ) {}

    public get title(): string {
        return this.card.title;
    }

    public get type(): CardType {
        return this.card.type;
    }

    public get controller(): Player {
        return this.card.controller;
    }

    public get traits(): ReadonlySet<Trait> {
        return this.card.traits;
    }

    public get cost(): number | null {
        return this.card.hasCost() ? this.card.cost : null;
    }

    public get zoneName(): ZoneName {
        return this.card.zoneName;
    }

    public hasSomeTrait(traits: Trait | Trait[]): boolean {
        return this.card.hasSomeTrait(traits);
    }

    public isUnitCard(): this is IUnitProperties {
        return false;
    }

    public asUnitCard(): IUnitProperties {
        return Contract.fail(`Expected ${this.ref} to be a unit, but it is a ${this.card.type}`);
    }
}

/** Live properties for a unit card. In-play characteristics are gated behind {@link isInPlay}. */
export class LiveUnitProperties extends LiveCardProperties implements IUnitPropertiesInPlay {
    protected declare readonly card: IUnitCard;

    public constructor(ref: CardRef, card: IUnitCard) {
        super(ref, card);
    }

    public override isUnitCard(): this is IUnitProperties {
        return true;
    }

    public override asUnitCard(): IUnitProperties {
        return this;
    }

    public isInPlay(): this is IUnitPropertiesInPlay {
        return this.card.isInPlay();
    }

    public asInPlay(): IUnitPropertiesInPlay {
        Contract.assertTrue(this.card.isInPlay(), `Expected ${this.ref} to be in play, but it is in ${this.card.zoneName}`);
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

    public get power(): number {
        this.assertInPlay('power');
        return this.card.getPower();
    }

    public get hp(): number {
        this.assertInPlay('hp');
        return this.card.getHp();
    }

    public get damage(): number {
        this.assertInPlay('damage');
        return this.card.damage;
    }

    public get exhausted(): boolean {
        this.assertInPlay('exhausted');
        return this.card.exhausted;
    }

    public get upgrades(): readonly CardRef[] {
        this.assertInPlay('upgrades');
        return this.card.upgrades.map((upgrade) => this.card.game.lkiRegistry.getIdentity(upgrade));
    }

    /**
     * Runtime backstop for the compile-time guarantee in {@link IUnitProperties.isInPlay}. Only
     * reachable from code that bypassed the type system (for example through an untyped `event`).
     */
    private assertInPlay(property: string): void {
        Contract.assertTrue(
            this.card.isInPlay(),
            `Attempting to read in-play property '${property}' from ${this.ref}, which is not in play. ` +
            'Narrow with isInPlay() first, or read the printed value instead.'
        );
    }
}
