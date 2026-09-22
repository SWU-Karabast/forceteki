import type { CardType, Trait, ZoneName } from '../Constants';
import { Contract } from '../utils/Contract';
import type { CardRef } from './CardRef';
import type { ICardProperties, IUnitProperties, IUnitPropertiesInPlay } from './CardPropertiesInterfaces';
import type { Player } from '../Player';

/** The characteristics a footprint stores. Frozen at capture time and never mutated (D-17). */
export interface ICapturedCardState {
    readonly title: string;
    readonly type: CardType;
    readonly controller: Player;
    readonly traits: ReadonlySet<Trait>;
    readonly cost: number | null;
    readonly zoneName: ZoneName;

    /** True if the card was in play at capture time, which gates the unit fields below. */
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
 * Properties backed by a footprint: values captured at the moment the card left play.
 *
 * Immutable once minted, so it is safe to retain and safe to share between readers. This is the
 * variant that long-lived holders (state watchers, delayed effects, phase-long ongoing effects)
 * must store rather than holding a reference (D-16, D-26).
 */
export class CapturedCardProperties implements ICardProperties {
    public constructor(
        public readonly ref: CardRef,
        protected readonly state: ICapturedCardState
    ) {}

    public get title(): string {
        return this.state.title;
    }

    public get type(): CardType {
        return this.state.type;
    }

    public get controller(): Player {
        return this.state.controller;
    }

    public get traits(): ReadonlySet<Trait> {
        return this.state.traits;
    }

    public get cost(): number | null {
        return this.state.cost;
    }

    public get zoneName(): ZoneName {
        return this.state.zoneName;
    }

    public hasSomeTrait(traits: Trait | Trait[]): boolean {
        const toCheck = Array.isArray(traits) ? traits : [traits];
        return toCheck.some((trait) => this.state.traits.has(trait));
    }

    public isUnit(): this is IUnitProperties {
        return this.state.isUnit;
    }
}

/** Captured properties for a unit card. */
export class CapturedUnitProperties extends CapturedCardProperties implements IUnitPropertiesInPlay {
    public isInPlay(): this is IUnitPropertiesInPlay {
        return this.state.wasInPlay;
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
     * Footprints capture an enumerated field set (D-13), so a field that was never captured is a
     * programming error rather than a missing value, and must fail loudly (D-14).
     */
    private read<TKey extends keyof ICapturedCardState>(field: TKey): NonNullable<ICapturedCardState[TKey]> {
        const value = this.state[field];
        Contract.assertNotNullLike(
            value,
            `Property '${String(field)}' was not captured in the footprint for ${this.ref}. ` +
            'Add it to the captured field set if an ability legitimately needs it.'
        );
        return value as NonNullable<ICapturedCardState[TKey]>;
    }

    private assertWasInPlay(property: string): void {
        Contract.assertTrue(
            this.state.wasInPlay,
            `Attempting to read in-play property '${property}' from the footprint for ${this.ref}, ` +
            'which was not in play when it was captured. Narrow with isInPlay() first.'
        );
    }
}
