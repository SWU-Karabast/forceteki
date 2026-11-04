import type { Seat } from '@swupgn/format';
import type { Card } from '../card/Card';
import type { GameEndReason } from '../Constants';
import { GameObjectBase } from '../GameObjectBase';
import { registerState, statePrimitive, stateValue } from '../GameObjectUtils';

/**
 * Rollback-safe state for the SWU-PGN writer: entity ids, card generations, audiences and record counters.
 * It is an engine game object so that undo restores it with the rest of the game.
 */
/** A deck card someone is looking at: a temporary deck entity (W-24) until the look ends. */
export interface ISwuPgnLook {

    /** Seats that saw the card during this look. */
    readonly seats: readonly Seat[];

    /** The seq of the step the look is shown at: the next step to be written when the card was seen. */
    readonly seenAtSeq: number;
}

@registerState()
export class SwuPgnWriterState extends GameObjectBase {
    @stateValue() private accessor entityIds = new Map<string, number>();
    @stateValue() private accessor generations = new Map<string, number>();
    @stateValue() private accessor audiences = new Map<string, Seat[]>();
    @stateValue() private accessor looks = new Map<string, ISwuPgnLook>();
    @statePrimitive() private accessor nextId = 1;

    /** Number of records written so far. */
    @statePrimitive() public accessor recordsLength = 0;

    /** The next seq to write; the first step is 0 (W-38). */
    @statePrimitive() public accessor stepSeq = 0;

    @statePrimitive() public accessor inSetup = true;

    /** How the game ended, as of the first `endGame` (the `Reason` tag); null while it has not. An undo past game end clears it. */
    @statePrimitive() public accessor gameEndReason: GameEndReason | null = null;

    /**
     * True from a written (or skipped no-op) step until the game next continues after input. A snapshot taken
     * while it holds was taken at that step, so a rollback to it must not write the step again.
     */
    @statePrimitive() public accessor atStep = false;

    // Nothing references this object, so the snapshot system must be told to keep it.
    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    public override get alwaysTrackState(): boolean {
        return true;
    }

    /** Back to a new game's state: no ids, generations or audiences, nothing written. */
    public reset(): void {
        this.entityIds = new Map<string, number>();
        this.generations = new Map<string, number>();
        this.audiences = new Map<string, Seat[]>();
        this.looks = new Map<string, ISwuPgnLook>();
        this.nextId = 1;
        this.recordsLength = 0;
        this.stepSeq = 0;
        this.inSetup = true;
        this.atStep = false;
        this.gameEndReason = null;
    }

    /** Entity id for a key; assigned on first sight and never reused (W-21). */
    public entityIdFor(key: string): number {
        let id = this.entityIds.get(key);
        if (id === undefined) {
            id = this.nextId;
            this.nextId = id + 1;
            this.entityIds.set(key, id);
        }
        return id;
    }

    public hasEntity(key: string): boolean {
        return this.entityIds.has(key);
    }

    /** Forget the key's entity; its id is retired, so the key gets a fresh one if it comes back. */
    public retire(key: string): void {
        this.entityIds.delete(key);
        this.audiences.delete(key);
        this.looks.delete(key);
    }

    /** Records that `seats` see the deck card with this key now; a card seen again is shown at the next step again. */
    public addLook(key: string, seats: Seat[] | 'all'): void {
        const seen = new Set<Seat>(this.looks.get(key)?.seats ?? []);
        for (const seat of seats === 'all' ? [1, 2] as Seat[] : seats) {
            seen.add(seat);
        }
        this.looks.set(key, { seats: [...seen].sort((a, b) => a - b), seenAtSeq: this.stepSeq });
    }

    public lookAt(key: string): ISwuPgnLook | undefined {
        return this.looks.get(key);
    }

    public hasLooks(): boolean {
        return this.looks.size > 0;
    }

    public lookKeys(): string[] {
        return [...this.looks.keys()];
    }

    /** Ends the look without retiring the key: the card left the deck and stays the same entity. */
    public endLook(key: string): void {
        this.looks.delete(key);
    }

    public cardKey(card: Card): string {
        return `${card.uuid}#${this.generations.get(card.uuid) ?? 0}`;
    }

    /** Called each time the card enters a deck, so the card becomes a new entity. */
    public bumpGeneration(card: Card): void {
        this.generations.set(card.uuid, (this.generations.get(card.uuid) ?? 0) + 1);
    }

    public audienceOf(key: string): Seat[] {
        return [...(this.audiences.get(key) ?? [])];
    }

    /** Union only: an audience never narrows. */
    public widen(key: string, seats: Seat[] | 'all'): void {
        const widened = new Set<Seat>(this.audiences.get(key) ?? []);
        for (const seat of seats === 'all' ? [1, 2] as Seat[] : seats) {
            widened.add(seat);
        }
        this.audiences.set(key, [...widened].sort((a, b) => a - b));
    }
}
