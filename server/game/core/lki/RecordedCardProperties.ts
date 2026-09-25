import type { CardType, Trait, ZoneName } from '../Constants';
import { Contract } from '../utils/Contract';
import type { CardRef } from './CardRef';
import type { ICardProperties, IUnitProperties, IUnitPropertiesInPlay } from './CardPropertiesInterfaces';
import type { Player } from '../Player';

/**
 * The characteristics recorded for one identity of a card, taken at the moment it left play.
 * Frozen once written and never mutated (D-17).
 */
export interface IRecordedCardState {
    readonly title: string;
    readonly type: CardType;
    readonly controller: Player;
    readonly traits: ReadonlySet<Trait>;
    readonly cost: number | null;
    readonly zoneName: ZoneName;

    /** True if the card was in play when this was recorded, which gates the unit fields below. */
    readonly wasInPlay: boolean;

    readonly isUnit: boolean;
    readonly printedPower?: number;
    readonly printedHp?: number;
    readonly power?: number;
    readonly hp?: number;
    readonly damage?: number;
    readonly exhausted?: boolean;
    readonly upgrades?: readonly CardRef[];
}

/**
 * Properties backed by a recorded state: values as they were when the card left play.
 *
 * Immutable, so it is safe to retain and safe to share between readers. This is the variant that
 * long-lived holders (state watchers, delayed effects, phase-long ongoing effects) must store
 * rather than holding a reference (D-16, D-26).
 */
export class RecordedCardProperties implements ICardProperties {
    public constructor(
        public readonly ref: CardRef,
        protected readonly record: IRecordedCardState
    ) {}

    public get title(): string {
        return this.record.title;
    }

    public get type(): CardType {
        return this.record.type;
    }

    public get controller(): Player {
        return this.record.controller;
    }

    public get traits(): ReadonlySet<Trait> {
        return this.record.traits;
    }

    public get cost(): number | null {
        return this.record.cost;
    }

    public get zoneName(): ZoneName {
        return this.record.zoneName;
    }

    public hasSomeTrait(traits: Trait | Trait[]): boolean {
        const toCheck = Array.isArray(traits) ? traits : [traits];
        return toCheck.some((trait) => this.record.traits.has(trait));
    }

    public isUnitCard(): this is IUnitProperties {
        return this.record.isUnit;
    }

    public asUnitCard(): IUnitProperties {
        return Contract.fail(`Expected ${this.ref} to be a unit, but it is a ${this.record.type}`);
    }
}

/** Recorded properties for a unit card. */
export class RecordedUnitProperties extends RecordedCardProperties implements IUnitPropertiesInPlay {
    public override asUnitCard(): IUnitProperties {
        return this;
    }

    public isInPlay(): this is IUnitPropertiesInPlay {
        return this.record.wasInPlay;
    }

    public asInPlay(): IUnitPropertiesInPlay {
        Contract.assertTrue(
            this.record.wasInPlay,
            `Expected ${this.ref} to have been in play when it was recorded, but it was in ${this.record.zoneName}`
        );
        return this;
    }

    public override get cost(): number {
        const { cost } = this.record;
        Contract.assertNotNullLike(cost, `Expected ${this.ref} to have a cost`);
        return cost;
    }

    public get printedPower(): number {
        return this.read('printedPower');
    }

    public get printedHp(): number {
        return this.read('printedHp');
    }

    public get power(): number {
        this.assertWasInPlay('power');
        return this.read('power');
    }

    public get hp(): number {
        this.assertWasInPlay('hp');
        return this.read('hp');
    }

    public get damage(): number {
        this.assertWasInPlay('damage');
        return this.read('damage');
    }

    public get exhausted(): boolean {
        this.assertWasInPlay('exhausted');
        return this.read('exhausted');
    }

    public get upgrades(): readonly CardRef[] {
        this.assertWasInPlay('upgrades');
        return this.read('upgrades');
    }

    /**
     * Records hold an enumerated field set (D-13), so a field that was never recorded is a
     * programming error rather than a missing value, and must fail loudly (D-14).
     */
    private read<TKey extends keyof IRecordedCardState>(field: TKey): NonNullable<IRecordedCardState[TKey]> {
        const value = this.record[field];
        Contract.assertNotNullLike(
            value,
            `Property '${String(field)}' was not recorded for ${this.ref}. ` +
            'Add it to the recorded field set if an ability legitimately needs it.'
        );
        return value as NonNullable<IRecordedCardState[TKey]>;
    }

    private assertWasInPlay(property: string): void {
        Contract.assertTrue(
            this.record.wasInPlay,
            `Attempting to read in-play property '${property}' from the record for ${this.ref}, ` +
            'which was not in play when it was recorded. Narrow with isInPlay() first.'
        );
    }
}
