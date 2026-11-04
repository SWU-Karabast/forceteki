import type { Board, SwuPgnFile, SwuRecord } from '@swupgn/format';
import { apply, cloneBoard, emptyBoard, serialize } from '@swupgn/format';
import type { View } from '@swupgn/format/writer';
import { redact } from '@swupgn/format/writer';
import { SWUPGN_PROJECTION_CHECK } from '../../../env';
import { logger } from '../../../logger';
import type { Card } from '../card/Card';
import type { GameEndReason, ZoneName } from '../Constants';
import { EventName, PhaseName } from '../Constants';
import type { GameEvent } from '../event/GameEvent';
import type { Game } from '../Game';
import type { UiPrompt } from '../gameSteps/prompts/UiPrompt';
import type { Player } from '../Player';
import type { LookFilter } from './AudienceTracker';
import { AudienceTracker } from './AudienceTracker';
import { BoardProjector } from './BoardProjector';
import { diffBoards } from './diffBoards';
import { buildFullFile } from './FileAssembler';
import type { ISwuPgnWriterHooks } from './ISwuPgnWriterHooks';
import { SwuPgnEvents } from './SwuPgnEvents';
import { SwuPgnWriterState } from './SwuPgnWriterState';
import { countSwuPgnWriterStats, swuPgnWriterStats } from './SwuPgnWriterStats';

/**
 * When the writer projects between decision points (W-37). `'flush'` is the default; `'decision'` (decision points
 * only) and `'event'` (after every event window, the upper bound) exist for the CPU benchmark. `'off'` builds no writer.
 */
export type SwuPgnWriterMode = 'off' | 'decision' | 'flush' | 'event';

/** Which file `fileFor` writes: the `full` file, a seat's `perspective` file, or the `public` file. */
export type SwuPgnFileView = 'full' | View;

/** Every look ends: the look or search is over, or its deck was shuffled (W-24). */
const allLooks: LookFilter = () => true;

/**
 * Events after which a mid-resolution board must be written: something appeared, or a hidden card was seen (W-37),
 * each with the looks that end at that flush (null: none).
 * OnLookMoveDeckCardsTopOrBottom is not listed: that system raises no GameEvent, so it has no `:postResolve`; its
 * flush point is the writer-only `SwuPgnEvents.DeckCardsViewed` emit, which ends no look.
 */
const flushEvents: ReadonlyMap<EventName, LookFilter | null> = new Map([
    [EventName.OnCardsDrawn, null],
    [EventName.OnTokensCreated, null],
    [EventName.OnDeckShuffled, allLooks],
    [EventName.OnDeckSearch, allLooks],
    [EventName.OnLookAtCard, allLooks],
    [EventName.OnCardRevealed, null]
]);

const maxLoggedErrors = 5;

/** Events that exhaust or ready resources by count, naming no card: every resource is read again. */
const bulkResourceEvents: ReadonlySet<string> = new Set([EventName.OnExhaustResources, EventName.OnReadyResources]);

function isCardValue(value: unknown): value is Card {
    return typeof value === 'object' && value !== null && typeof (value as { isCard?: unknown }).isCard === 'function' && (value as Card).isCard();
}

/**
 * Writes the SWU-PGN records of a game: at each decision point (each pause of `Game.continue()`) and at the flush
 * points it projects the board, appends `diff(previous, next)`, and at a decision point writes a `step`.
 *
 * Its undo-sensitive state lives in a `SwuPgnWriterState` game object, which a rollback restores; the records are then
 * cut back to the length that state holds and the step being decided is written again (W-42).
 */
export class SwuPgnWriter implements ISwuPgnWriterHooks {
    private readonly state: SwuPgnWriterState;
    private readonly audiences: AudienceTracker;
    private readonly projector: BoardProjector;
    private readonly _records: SwuRecord[] = [];

    /** The board the records describe, as of the last successful flush. */
    private prev: Board = emptyBoard();
    private _undos = 0;
    private _errors = 0;

    /** The prompt, and the players it was waiting for, at the last step: a decision point that finds both unchanged with nothing new is a no-op click. */
    private lastPrompt: UiPrompt | null | undefined = undefined;
    private lastPromptPlayers: readonly Player[] = [];

    /**
     * Checks every flush's dirty projection against the full one (`SWUPGN_PROJECTION_CHECK=1`; specs may set it). A
     * mismatch counts as a writer error, is logged once with the first differing entity, and the full board is written.
     */
    public checkProjections: boolean = SWUPGN_PROJECTION_CHECK;
    private mismatchLogged = false;
    private diffMismatchLogged = false;
    private _dirtyDiffsChecked = 0;

    public constructor(
        private readonly game: Game,
        mode: Exclude<SwuPgnWriterMode, 'off'>
    ) {
        this.state = new SwuPgnWriterState(game);
        this.audiences = new AudienceTracker(game, this.state, (card) => this.projector.markDirty(card));
        // the tracker listens first, so a flush on the same event sees the cards it widened
        this.audiences.register();
        this.projector = new BoardProjector(game, this.state, this.audiences);
        this.state.onRestored = () => this.projector.invalidate();
        // the dirty marks come from `onEventResolved`, which the event window calls before any listener runs
        this.registerFlushPoints(mode);
        if (countSwuPgnWriterStats) {
            swuPgnWriterStats.writers++;
        }
    }

    public get records(): readonly SwuRecord[] {
        return this._records;
    }

    /** Rollbacks taken so far (the `Undos` header tag). Not rollback state, on purpose. */
    public get undos(): number {
        return this._undos;
    }

    /** Failures caught so far, the writer's and its audience tracker's (the `WriterErrors` header tag). */
    public get errors(): number {
        return this._errors + this.audiences.errors;
    }

    /**
     * The board was changed outside the engine's events (the test harness sets damage, moves cards, exhausts): the
     * next projection reads every card.
     */
    public onBoardChangedOutsideEngine(): void {
        this.projector.invalidate();
    }

    /** Flushes whose diff over the changed entities was checked against the full diff (`checkProjections`; for specs). */
    public get dirtyDiffsChecked(): number {
        return this._dirtyDiffsChecked;
    }

    /** The projector the writer flushes with (for specs: its cached and full projections). */
    public get boardProjector(): BoardProjector {
        return this.projector;
    }

    /** The board the records describe: `apply(records)` gives it. */
    public currentBoard(): Board {
        const board = cloneBoard(this.prev);
        board.seq = this.lastStepSeq();
        return board;
    }

    /** Projects the board and appends the records that turn the previous board into it. Ends no look. Never throws. */
    public flush(): void {
        this.flushEnding(null);
    }

    /** The game paused for a decision (end of `Game.continue()`). */
    public onDecisionPoint(): void {
        this.decide(false);
    }

    /**
     * The game ended (`Game.endGame`, after the winners are set): project `g.result` and write the step, even when the
     * decision point looks unchanged or the game is still in setup, so the file ends on a step that holds the result
     * (W-11, W-40). A game that ends in setup gets step 0 here, holding the final board.
     * The reason is captured now: a later `endGame` call changes `Game.gameEndReason` but not the result.
     */
    public onGameEnded(): void {
        this.guard('game end', () => {
            this.state.gameEndReason = this.game.gameEndReason ?? null;
        });
        this.decide(false, true);
    }

    /** How the game ended, as of its first end; null while it has not ended (or an undo took the end back). */
    public get gameEndReason(): GameEndReason | null {
        return this.state.gameEndReason;
    }

    /** The `full` file of the records written so far: header, DECKS, CARDS and RECORDS. */
    public fullFile(): SwuPgnFile {
        return buildFullFile(this.game, this);
    }

    /** One view of the file in canonical form: the `full` file, or what `redact` yields from it for a seat or the public (W-46). */
    public fileFor(view: SwuPgnFileView): string {
        const full = this.fullFile();
        return serialize(view === 'full' ? full : redact(full, view));
    }

    /** `Game.continue()` is about to run the pipeline after input: the game is no longer at the last step. */
    public onContinue(): void {
        this.guard('continue', () => {
            this.state.atStep = false;
        });
    }

    /**
     * The game was rolled back: the snapshot restored the writer state. Cut the records back to the length it holds,
     * and decide the restored decision point again, which writes its step again when the snapshot was taken before it.
     */
    public onRolledBack(): void {
        this.guard('rollback', () => {
            this.projector.invalidate();
            this.resyncAfterRestore();
            this._undos++;
            this.lastPrompt = undefined;
            this.lastPromptPlayers = [];
        });
        this.decide(true);
    }

    /** A card was put into a deck: it becomes a new entity if it comes back (W-22). */
    public onCardEnteredDeck(card: Card): void {
        this.guard('deck entry', () => {
            this.projector.markDirty(card);
            this.state.bumpGeneration(card);
        });
    }

    public onCardEnteredZone(card: Card, zoneName: ZoneName): void {
        this.guard('zone entry', () => {
            this.projector.markDirty(card);
            this.audiences.onCardEnteredZone(card, zoneName);
        });
    }

    public onAbilityLimitChanged(card: Card): void {
        this.guard('ability limit', () => this.projector.markDirty(card));
    }

    /**
     * Starts the records again from the current board, as if the game began here: used by the test harness, which
     * builds its board with no decision point between the changes. Writes step 0 unless the game is still in setup.
     */
    public restartBaseline(): void {
        this._records.length = 0;
        this.state.reset();
        this.audiences.reset();
        this.projector.invalidate();
        this.mismatchLogged = false;
        this.diffMismatchLogged = false;
        this.prev = emptyBoard();
        this._undos = 0;
        this._errors = 0;
        this.lastPrompt = undefined;
        this.lastPromptPlayers = [];
        this.decide(false);
    }

    /**
     * `flush()`, where the looks `ending` selects end with this board: their deck cards are left out of it, and once
     * the records are written they go back unseen. A failed flush keeps `prev` and ends no look, so the retry sees them.
     */
    private flushEnding(ending: LookFilter | null): void {
        let flushed = false;
        try {
            this.resyncAfterRestore();
            const dirty = this.projector.project(ending);
            const next = this.checkProjections ? this.checkedAgainstFull(dirty, ending) : dirty;
            // a board the check replaced with the full one shares no objects with the cache: diff all of it
            const changed = next === dirty ? this.projector.lastChanged : null;
            const records = this.checkProjections && changed !== null
                ? this.checkedDiff(next, changed)
                : diffBoards(this.prev, next, changed);
            if (countSwuPgnWriterStats) {
                swuPgnWriterStats.projections++;
                if (changed === null) {
                    swuPgnWriterStats.fullDiffs++;
                } else {
                    swuPgnWriterStats.entitiesDiffed += changed.size;
                }
                if (records.length > 0) {
                    swuPgnWriterStats.flushes++;
                }
            }
            for (const record of records) {
                this._records.push(record);
            }
            this.prev = next;
            this.projector.commit();
            this.state.recordsLength = this._records.length;
            flushed = true;
        } catch (error) {
            this.reportError('flush', error);
        }
        if (flushed && ending !== null) {
            this.guard('end of looks', () => this.audiences.endLooks(ending));
        }
    }

    /** `force` writes the step even at an unchanged decision point or in setup (the game end). */
    private decide(afterRollback: boolean, force = false): void {
        // a look shown at an earlier step ends now: it is visible at exactly the step of its prompt
        const seq = this.state.stepSeq;
        this.flushEnding((look) => look.seenAtSeq < seq);
        this.guard('step', () => {
            const phase = this.game.currentPhase;
            if (!force && this.state.inSetup && (phase === PhaseName.Setup || phase == null)) {
                return; // W-39: step 0 comes after setup
            }

            const prompt = this.game.getCurrentOpenPrompt() ?? null;
            const players = prompt ? this.game.getPlayers().filter((player) => prompt.activeCondition(player)) : [];
            const last = this._records[this._records.length - 1];
            const nothingNew = last !== undefined && last.t === 'step';
            // after a rollback the prompt objects are new: the restored state says whether its snapshot was taken at a step
            const samePrompt = afterRollback
                ? this.state.atStep
                : prompt === this.lastPrompt && players.length === this.lastPromptPlayers.length &&
                  players.every((player, i) => player === this.lastPromptPlayers[i]);

            if (force || !(nothingNew && samePrompt)) {
                const seq = this.state.stepSeq;
                this._records.push({ t: 'step', seq });
                this.state.stepSeq = seq + 1;
                if (countSwuPgnWriterStats) {
                    swuPgnWriterStats.steps++;
                }
                this.state.recordsLength = this._records.length;
            }

            this.lastPrompt = prompt;
            this.lastPromptPlayers = players;
            this.state.atStep = true;
            this.state.inSetup = false;
        });
    }

    /** After a snapshot restore the state holds fewer records than were written: cut them back and rebuild the board. */
    private resyncAfterRestore(): void {
        if (this.state.recordsLength > this._records.length) {
            // a state can only hold fewer records than were written: count the impossible case, keep the records
            const held = this.state.recordsLength;
            this.state.recordsLength = this._records.length;
            this.reportError('resync', new Error(`SWU-PGN: writer state holds ${held} records but only ${this._records.length} were written`));
        } else if (this.state.recordsLength < this._records.length) {
            this._records.length = this.state.recordsLength;
            this.prev = apply(this._records);
            // the rebuilt board shares no objects with the projection cache
            this.projector.invalidate();
        }
    }

    private lastStepSeq(): number | null {
        for (let i = this._records.length - 1; i >= 0; i--) {
            const record = this._records[i];
            if (record.t === 'step') {
                return record.seq;
            }
        }
        return null;
    }

    /**
     * The dirty projection checked against the full one: the full board when they differ, after counting the error and
     * dropping the cache, so one missed dirty source is not counted again at every later flush.
     */
    private checkedAgainstFull(dirty: Board, ending: LookFilter | null): Board {
        const full = this.projector.projectFull(ending);
        const difference = firstDifference(dirty, full);
        if (difference === null) {
            return dirty;
        }
        this._errors++;
        if (!this.mismatchLogged) {
            this.mismatchLogged = true;
            logger.error('SWU-PGN: writer dirty projection differs from the full projection', { ...difference, lobbyId: this.game.lobbyId });
        }
        this.projector.invalidate();
        return full;
    }

    /**
     * The diff over the changed entities checked against the full diff of the same boards: the full one's records when
     * they differ, after counting the error (logged once).
     */
    private checkedDiff(next: Board, changed: ReadonlySet<string>): SwuRecord[] {
        const full = diffBoards(this.prev, next);
        const dirty = diffBoards(this.prev, next, changed);
        this._dirtyDiffsChecked++;
        if (sameValue(dirty, full)) {
            return dirty;
        }
        this._errors++;
        if (!this.diffMismatchLogged) {
            this.diffMismatchLogged = true;
            logger.error('SWU-PGN: writer diff over the changed entities differs from the full diff', { dirty, full, lobbyId: this.game.lobbyId });
        }
        return full;
    }

    /**
     * An event's handler has run (`EventWindow.resolveEvents`, before the event's own emit): every card it names, and the
     * card whose ability raised it, is marked dirty. This is the point every resolved event passes, ahead of the unique
     * rule check (a prompt, so a decision point) and of resolving the game state (which can end the game, so a flush).
     */
    public onEventResolved(event: GameEvent): void {
        try {
            this.markEventCards(event);
        } catch (error) {
            this.reportError('dirty marking', error);
        }
    }

    private markEventCards(event: GameEvent): void {
        if (bulkResourceEvents.has(event.name)) {
            this.projector.markResourcesDirty();
        }
        const source: unknown = event.context?.source;
        if (isCardValue(source)) {
            this.projector.markDirty(source);
        }
        // own enumerable values, as Object.values gives them, without building the array
        for (const key in event) {
            const value: unknown = Reflect.get(event, key);
            if (typeof value !== 'object' || value === null) {
                continue;
            }
            if (Array.isArray(value)) {
                for (const item of value as unknown[]) {
                    if (isCardValue(item)) {
                        this.projector.markDirty(item);
                    }
                }
            } else if (isCardValue(value)) {
                this.projector.markDirty(value);
            }
        }
    }

    private registerFlushPoints(mode: Exclude<SwuPgnWriterMode, 'off'>): void {
        if (mode === 'decision') {
            return;
        }
        const names = mode === 'event' ? Object.values(EventName) : [...flushEvents.keys()];
        for (const name of names) {
            const ending = flushEvents.get(name) ?? null;
            this.game.on(name + ':postResolve', () => this.flushEnding(ending));
        }
        // a plain writer-only emit, with no `:postResolve`: the look-move prompt opens after it, so no look ends
        this.game.on(SwuPgnEvents.DeckCardsViewed, () => this.flush());
    }

    /** Runs `fn`, counting and logging (capped) any failure: the writer never breaks the game. */
    private guard(what: string, fn: () => void): void {
        try {
            fn();
        } catch (error) {
            this.reportError(what, error);
        }
    }

    private reportError(what: string, error: unknown): void {
        this._errors++;
        if (this._errors <= maxLoggedErrors) {
            logger.error(`SWU-PGN: writer ${what} failed`, { error, lobbyId: this.game.lobbyId });
        }
    }
}

/** The first entity two boards disagree on, both sides of it; null when the boards are the same. */
function firstDifference(dirty: Board, full: Board): { entity: string; dirty: unknown; full: unknown } | null {
    const ids = new Set([...Object.keys(dirty.entities), ...Object.keys(full.entities)]);
    for (const id of ids) {
        if (!sameValue(dirty.entities[id], full.entities[id])) {
            return { entity: id, dirty: dirty.entities[id], full: full.entities[id] };
        }
    }
    return null;
}

/** Deep equality of JSON-shaped values; key order does not matter. */
function sameValue(a: unknown, b: unknown): boolean {
    if (a === b) {
        return true;
    }
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null || Array.isArray(a) !== Array.isArray(b)) {
        return false;
    }
    if (Array.isArray(a) && Array.isArray(b)) {
        return a.length === b.length && a.every((item, i) => sameValue(item, b[i]));
    }
    const left = a as Record<string, unknown>;
    const right = b as Record<string, unknown>;
    const keys = Object.keys(left);
    return keys.length === Object.keys(right).length && keys.every((key) => key in right && sameValue(left[key], right[key]));
}
