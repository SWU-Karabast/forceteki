import { execFileSync } from 'child_process';

import type { Game } from '../Game';
import type { Player } from '../Player';
import { EventName, GameEndReason, PhaseName, ZoneName } from '../Constants';
import { SwuPgn } from './SwuPgn';
import { buildHeader, SwuPgnRecorder } from './SwuPgnRecorder';
import type { HeaderContext, SwuPgnResolver } from './SwuPgnRecorder';
import { SwuPgnWriter } from './SwuPgnWriter';
import { render } from '../../../../swupgn/src/render';
import type { CardIndexRecord, CardInstanceState, DeckRecord, PlayerState, ReducedState, Seat, SwuPgnDocument } from '../../../../swupgn/src/types';

/**
 * Read one engine value, falling back if the accessor throws.
 *
 * Engine card accessors are not plain properties: `damage`, `exhausted` and `remainingHp`
 * run `assertPropertyEnabledForZone` and throw when the card is in a zone where the
 * property doesn't apply. Optional chaining does not help — it guards a null card, not a
 * throwing getter. A keyframe is worth more slightly degraded than absent, so every engine
 * read in the projection goes through here.
 */
function read<T>(get: () => T, fallback: T): T {
    try {
        const value = get();
        return value === undefined ? fallback : value;
    } catch {
        return fallback;
    }
}

/** A seat with nothing on the board — used only when a seat can't be resolved at all. */
function emptyPlayerState(seat: Seat): PlayerState {
    return {
        seat, baseHp: 0, baseMaxHp: 30, handSize: 0, hand: [], resourcesReady: 0,
        resourcesExhausted: 0, credits: 0, hasForce: false, discard: [], cards: [],
    };
}

/**
 * Owns the SWU-PGN/1.0 (single-file, event-sourced) generation for a Game: it holds the
 * event recorder, the stable card-id/deck-order bookkeeping, and the omniscient board →
 * 1.1 projections, and assembles the one self-contained `.swupgn` (header + decks + setup +
 * events) the 1.1 reader parses/validates/folds/renders.
 *
 * This is a stateful delegate, not a free-standing module: it reads live engine state through
 * a back-reference to its Game (all via public Game members). Game retains only the cache and
 * the three lifecycle callsites (record game-end, generate, rollback) and delegates the rest.
 */
export class SwuPgnGameAdapter {
    private readonly game: Game;
    private readonly recorder: SwuPgnRecorder;

    /** Stable SET#NUM[:copy] id per engine card instance uuid (1.1 path). */
    private readonly cardIdByUuid = new Map<string, string>();

    /** Count of distinct instances seen per base id, for assigning :N copy suffixes (1.1 path). */
    private readonly copyCountByBase = new Map<string, number>();

    /** Initial post-shuffle / pre-draw deck order for both seats, captured once at setup. */
    private initialDeckOrder?: { p1: string[]; p2: string[] };

    /** Tracks which seats have had their initial deck order captured (first OnDeckShuffled). */
    private readonly deckOrderCaptured = new Set<string>();

    public constructor(game: Game) {
        this.game = game;
        this.recorder = new SwuPgnRecorder(game, this.buildSwuPgnResolver());
        this.registerSwuPgnSetupCapture();
    }

    // ── Public lifecycle interface (the only surface Game touches) ───────────────

    /** The underlying recorder (exposed for undo-retention tests that inspect the raw stream). */
    public getRecorder(): SwuPgnRecorder {
        return this.recorder;
    }

    /** Record the GAME_END event for the finished game. */
    public recordGameEnd(winnerSeat: Seat | 'Draw', reasonCode: GameEndReason | undefined): void {
        this.recorder.addGameEndRecord(winnerSeat, this.gameEndReasonString(reasonCode));
    }

    /** Assemble and serialize the single 1.0 `.swupgn` file. */
    public generateFile(): string {
        const doc: SwuPgnDocument = {
            header: buildHeader(this.swuPgnHeaderContext()),
            story: [],
            decks: this.buildSwuPgnDecks(),
            cards: this.buildSwuPgnCardIndex(),
            setup: this.recorder.getSetup(),
            events: this.recorder.getEvents(),
            annotations: [],
        };
        // The story is derived from the finished document, so it is generated last and read
        // back by the same renderer a consumer would use — there is one narrative, not two.
        doc.story = render(doc).split('\n');
        return new SwuPgnWriter().write(doc);
    }

    /**
     * Build the `%%% CARDS` index: every card id the file mentions, with its display name.
     *
     * This is what makes the artifact self-describing. Every id is collected from the records
     * actually written (not from the decks, which miss tokens and the opponent's revealed
     * cards), so the index covers exactly what a reader will encounter.
     */
    private buildSwuPgnCardIndex(): CardIndexRecord[] {
        const entries = new Map<string, CardIndexRecord>();
        for (const [uuid, id] of this.cardIdByUuid) {
            const base = id.replace(/:\d+$/, '');
            if (entries.has(base)) {
                continue;
            }
            const card = read<any>(() => this.game.getFromUuidUnsafe(uuid as any), null);
            const title = read<string>(() => card?.title, '');
            const subtitle = read<string | null>(() => card?.subtitle, null);
            if (!title) {
                continue;
            }
            // `kind` lets a client classify a card from its id alone — in particular which
            // `TOKEN:` ids are upgrades (never in an arena) and which are units.
            const kind = read<'unit' | 'upgrade' | undefined>(
                () => (card?.isUpgrade?.() ? 'upgrade' : card?.isUnit?.() ? 'unit' : undefined),
                undefined
            );
            entries.set(base, {
                id: base,
                name: subtitle ? `${title}, ${subtitle}` : title,
                ...(kind ? { kind } : {}),
            });
        }
        return [...entries.values()].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    }

    /** Roll the recorded stream back in lockstep with the game on undo. */
    public rollbackTo(restoredSnapshotId: number | null): void {
        this.recorder.rollbackTo(restoredSnapshotId);
    }

    // ── Resolver + setup capture ────────────────────────────────────────────────

    /**
     * Build the four-member resolver the SwuPgnRecorder needs. All members read live
     * engine state at call time but never close over real identities: card ids are the
     * salted-free stable SET#NUM scheme and players are anonymized seats.
     */
    private buildSwuPgnResolver(): SwuPgnResolver {
        return {
            cardId: (uuid: string) => this.swuPgnCardId(uuid),
            seat: (playerId: string) => this.swuPgnSeat(playerId),
            reducedState: (round: number) => this.buildSwuPgnReducedState(round),
            deckOrder: () => this.swuPgnDeckOrder(),
        };
    }

    /**
     * Register the one-time initial-deck-order capture. The setup phase shuffles each
     * player's deck and *then* draws the opening hand in the same step (see
     * SetupPhase.drawStartingHands), so OnDeckShuffled fires post-shuffle but pre-draw —
     * exactly the order the 1.1 SETUP INIT record wants. We capture each seat's deck
     * order the first time that seat shuffles, then emit recordInit() once both are
     * captured (before any draw mutates the deck).
     */
    private registerSwuPgnSetupCapture(): void {
        this.game.on(EventName.OnDeckShuffled, (event: any) => {
            try {
                const player: Player | undefined = event?.player ?? event?.card?.owner;
                if (!player || this.deckOrderCaptured.has(player.id)) {
                    return;
                }
                this.deckOrderCaptured.add(player.id);
                const order = this.captureDeckOrderFor(player);
                const seat = this.swuPgnSeat(player.id);
                if (!this.initialDeckOrder) {
                    this.initialDeckOrder = { p1: [], p2: [] };
                }
                if (seat === 1) {
                    this.initialDeckOrder.p1 = order;
                } else {
                    this.initialDeckOrder.p2 = order;
                }
                // Emit INIT once both seats have been captured (recordInit reads deckOrder()).
                const players = this.game.getPlayers();
                if (players.length >= 2 && players.every((p) => this.deckOrderCaptured.has(p.id))) {
                    this.recorder.recordInit();
                }
            } catch {
                // Never let recording capture crash gameplay.
            }
        });
    }

    /** Stable-id list of a player's current deck-zone order (top → bottom). */
    private captureDeckOrderFor(player: Player): string[] {
        try {
            const deckZone: any = (player as any).deckZone;
            const cards: any[] = deckZone?.deck ?? deckZone?.cards ?? [];
            return cards
                .map((c: any) => (c?.uuid != null ? this.swuPgnCardId(c.uuid) : 'unknown'))
                .filter((id: string) => id !== 'unknown');
        } catch {
            return [];
        }
    }

    /** Initial post-shuffle deck order for the SETUP INIT record. Empty arrays until captured. */
    private swuPgnDeckOrder(): { p1: string[]; p2: string[] } {
        return this.initialDeckOrder ?? { p1: [], p2: [] };
    }

    // ── Identity ────────────────────────────────────────────────────────────────

    /**
     * Stable SET#NUM[:copy] id for an engine card *instance* uuid: the printed id
     * (set#number) is the base, and the
     * first instance keeps the bare base while subsequent instances of the same printed
     * id get a `:N` copy suffix. Deterministic and stable within a single game (memoized
     * by uuid). Returns 'unknown' when no instance/printed identity is resolvable.
     */
    private swuPgnCardId(uuid: string): string {
        const cached = this.cardIdByUuid.get(uuid);
        if (cached != null) {
            return cached;
        }

        // Resolve the card instance from its uuid via the game's object registry.
        // A card's uuid is its GameObjectId; getFromUuidUnsafe resolves it back.
        let card: any;
        try {
            card = this.game.getFromUuidUnsafe(uuid as any) ?? null;
        } catch {
            card = null;
        }
        if (!card) {
            return 'unknown';
        }

        let base: string;
        try {
            if (typeof card.isToken === 'function' && card.isToken()) {
                // Tokens have a real numeric card id (the key the card map and the token image
                // pipeline use) but a setId with no number, so they need their own format.
                base = SwuPgn.formatTokenId(
                    card.internalName ?? card.title ?? card.name ?? 'unknown',
                    card.cardData?.id ?? null
                );
            } else if (card.setId) {
                base = SwuPgn.formatSetId(card.setId.set, card.setId.number);
            } else {
                base = card.title ?? card.name ?? 'unknown';
            }
        } catch {
            base = card.title ?? card.name ?? 'unknown';
        }

        if (base === 'unknown') {
            return base;
        }

        const copyNumber = (this.copyCountByBase.get(base) ?? 0) + 1;
        this.copyCountByBase.set(base, copyNumber);
        const id = copyNumber === 1 ? base : `${base}:${copyNumber}`;
        this.cardIdByUuid.set(uuid, id);
        return id;
    }

    /** Seat-2's player id, cached once both players are seated (see swuPgnSeat). */
    private cachedPlayer2Id?: string;

    /**
     * Map an engine player id → Seat (players[0] → 1, players[1] → 2).
     *
     * This is on the per-event hot path (most recorder handlers resolve a seat), and runs in every
     * game on a shared server. `Game.getPlayers()` allocates via `Object.values(...).filter(...)` on
     * every call, so we cache seat-2's id the first time both players are present and compare ids
     * directly thereafter — turning the per-event cost from two array allocations into one string
     * compare. The mapping is fixed for the life of a game, so the cache never needs invalidation.
     */
    private swuPgnSeat(playerId: string): Seat {
        if (this.cachedPlayer2Id === undefined) {
            const players = this.game.getPlayers();
            if (players.length < 2) {
                // Pre-setup: both seats not assigned yet; resolve live without caching.
                return players[1] && players[1].id === playerId ? 2 : 1;
            }
            this.cachedPlayer2Id = players[1].id;
        }
        return playerId === this.cachedPlayer2Id ? 2 : 1;
    }

    // ── Omniscient board → 1.1 projections ──────────────────────────────────────

    /**
     * Project the live, omniscient engine board into a FRESH 1.1 ReducedState keyframe.
     * Reads engine card/player objects directly (rather than the UI-shaped getState
     * summary) so per-card fields map faithfully. Contains NO real usernames/ids: card
     * ids use the stable scheme and players are anonymized to seats.
     */
    private buildSwuPgnReducedState(round: number): ReducedState {
        const phaseVocab = (phase: string): ReducedState['phase'] => {
            switch (phase) {
                case PhaseName.Action: return 'action';
                case PhaseName.Regroup: return 'regroup';
                default: return 'setup';
            }
        };

        const players = this.game.getPlayers();
        const state: ReducedState = {
            round,
            phase: phaseVocab(this.game.currentPhase as unknown as string),
            initiative: null,
            players: {},
        };

        try {
            const initPlayer = this.game.initiativePlayer;
            if (initPlayer) {
                state.initiative = this.swuPgnSeat(initPlayer.id);
            }
        } catch {
            state.initiative = null;
        }

        // A keyframe REPLACES the reader's whole running state (spec §13), so a keyframe
        // missing a seat silently ERASES that player's board. Both seats are therefore
        // emitted unconditionally, keyed by seat rather than by iterating getPlayers(), and
        // every field inside is read defensively (see `read`) so that one unreadable card
        // degrades a single field instead of deleting a whole player.
        for (const seat of [1, 2] as Seat[]) {
            const player = players.find((p) => this.swuPgnSeat(p.id) === seat);
            state.players[seat] = player
                ? this.buildSwuPgnPlayerState(player, seat)
                : emptyPlayerState(seat);
        }

        return state;
    }

    /**
     * Project a single player's omniscient state into a fresh 1.1 PlayerState.
     *
     * EVERY read here goes through `read()`. That is not defensive noise: engine card
     * accessors such as `damage`, `exhausted` and `remainingHp` call
     * `assertPropertyEnabledForZone` and THROW when the card is in a zone where the property
     * does not apply (Card.ts `buildPropertyDisabledForZoneStr`). A single such card used to
     * throw straight out of this method and cost the caller the entire seat, which is how
     * keyframes ended up carrying one player or none. A field that can't be read degrades to
     * its resting value; the seat is always produced.
     */
    private buildSwuPgnPlayerState(player: any, seat: Seat): PlayerState {
        const cardIds = (cards: any[]): string[] => cards
            .map((c: any) => read(() => (c?.uuid != null ? this.swuPgnCardId(c.uuid) : 'unknown'), 'unknown'))
            .filter((id: string) => id !== 'unknown');

        const base = read(() => player.base, null);
        const handCards = read<any[]>(() => player.hand ?? [], []);
        const discardCards = read<any[]>(() => player.getCardsInZone?.(ZoneName.Discard) ?? [], []);

        const cards: CardInstanceState[] = [];
        for (const zone of [ZoneName.GroundArena, ZoneName.SpaceArena]) {
            const inZone = read<any[]>(() => (player.getCardsInZone?.(zone) ?? []) as any[], []);
            for (const card of inZone) {
                cards.push(this.buildSwuPgnCardInstance(card, zone === ZoneName.GroundArena ? 'ground' : 'space'));
            }
        }

        return {
            seat,
            baseHp: read(() => base?.remainingHp ?? 0, 0),
            baseMaxHp: read(() => base?.getPrintedHp?.() ?? 30, 30),
            handSize: handCards.length,
            hand: cardIds(handCards),
            resourcesReady: read(() => player.readyResourceCount ?? 0, 0),
            resourcesExhausted: read(() => player.exhaustedResourceCount ?? 0, 0),
            credits: read(() => player.creditTokenCount ?? 0, 0),
            hasForce: read(() => player.hasTheForce ?? false, false),
            discard: cardIds(discardCards),
            cards,
        };
    }

    /** Project a single in-play card into a fresh 1.1 CardInstanceState. */
    private buildSwuPgnCardInstance(card: any, zone: string): CardInstanceState {
        const upgrades = read<any[]>(() => (card.upgrades ?? []) as any[], []);
        let shields = 0;
        let experience = 0;
        const statusTokens: Record<string, number> = {};
        const plainUpgrades: string[] = [];

        for (const upgrade of upgrades) {
            try {
                if (typeof upgrade.isShield === 'function' && upgrade.isShield()) {
                    shields++;
                } else if (typeof upgrade.isExperience === 'function' && upgrade.isExperience()) {
                    experience++;
                } else if (typeof upgrade.isAdvantage === 'function' && upgrade.isAdvantage()) {
                    statusTokens['advantage'] = (statusTokens['advantage'] ?? 0) + 1;
                } else if (upgrade?.uuid != null) {
                    plainUpgrades.push(this.swuPgnCardId(upgrade.uuid));
                }
            } catch {
                // Skip an upgrade we can't classify.
            }
        }

        return {
            // `damage` and `exhausted` throw for a card in a zone where they don't apply,
            // so both are read defensively — see buildSwuPgnPlayerState.
            id: read(() => (card?.uuid != null ? this.swuPgnCardId(card.uuid) : 'unknown'), 'unknown'),
            zone,
            damage: read(() => card?.damage ?? 0, 0),
            exhausted: read(() => card?.exhausted ?? false, false),
            upgrades: plainUpgrades,
            shields,
            experience,
            statusTokens,
        };
    }

    // ── Header + decks ──────────────────────────────────────────────────────────

    /** Map the game-end outcome to the 1.1 Result enum (P1/P2/Draw/Incomplete). */
    private swuPgnResult(player1: Player): 'P1' | 'P2' | 'Draw' | 'Incomplete' {
        if (this.game.winnerNames.length === 0) {
            return 'Incomplete';
        }
        if (this.game.winnerNames.length > 1) {
            return 'Draw';
        }
        return this.game.winnerNames[0] === player1.name ? 'P1' : 'P2';
    }

    /**
     * Distinct card-set provenance string (e.g. "SOR,SHD"). Best-effort: derived from the
     * set codes present in the card map's set-code index. Falls back to 'unknown'.
     */
    private swuPgnCardPool(): string {
        try {
            const setCodeMap = this.game.cardDataGetter?.setCodeMap;
            if (setCodeMap && setCodeMap.size > 0) {
                const sets = new Set<string>();
                for (const setCode of setCodeMap.keys()) {
                    const setPart = String(setCode).split('_')[0];
                    if (setPart) {
                        sets.add(setPart.toUpperCase());
                    }
                }
                if (sets.size > 0) {
                    return Array.from(sets).sort()
                        .join(',');
                }
            }
        } catch {
            // fall through
        }
        return 'unknown';
    }

    /** Resolved once per process: engine version resolution shells out to git at most one time. */
    private static cachedEngineVersion?: string;

    /**
     * Engine provenance string for the SWU-PGN header, e.g. `forceteki@0.1.0` or
     * `forceteki@a1b2c3d`.
     *
     * This has to name the BUILD, not a placeholder: without it you cannot tell which build
     * produced a bad replay, which is the position a real bug hunt lands in. Resolution order:
     * an explicit deploy-time override, the package version (npm sets this when run via a
     * script), then the git SHA of the working tree. `forceteki@unknown` is a last resort that
     * means "provenance unavailable", and a reader should treat a file carrying it as
     * untraceable rather than as coming from some known build.
     */
    /**
     * Resolve the engine version ahead of time, so the `git` subprocess below never runs on a
     * game-end path. `execFileSync` blocks the whole event loop, and this process runs many
     * concurrent games: without this, the first game to end after a restart stalls every other
     * game for up to the 2s timeout. Call once at server startup; safe to call more than once.
     */
    public static warmEngineVersion(): void {
        SwuPgnGameAdapter.engineVersion();
    }

    private static engineVersion(): string {
        if (SwuPgnGameAdapter.cachedEngineVersion == null) {
            const version = process.env.FORCETEKI_VERSION ??
              process.env.npm_package_version ??
              SwuPgnGameAdapter.gitSha();
            SwuPgnGameAdapter.cachedEngineVersion = version ? `forceteki@${version}` : 'forceteki@unknown';
        }
        return SwuPgnGameAdapter.cachedEngineVersion;
    }

    /** Short git SHA of the working tree, or undefined when git or the repo isn't available. */
    private static gitSha(): string | undefined {
        try {
            const sha = execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
                cwd: __dirname, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 2000,
            }).trim();
            return sha || undefined;
        } catch {
            return undefined;   // deployed without .git, or no git binary
        }
    }

    /** Maps a GameEndReason to a human-readable string for PGN output. */
    private gameEndReasonString(reasonCode: GameEndReason | undefined): string {
        switch (reasonCode) {
            case GameEndReason.Concede:
                return 'Concession';
            case GameEndReason.PlayerLeft:
                return 'Disconnection';
            case GameEndReason.GameRules:
                return 'Base Destroyed';
            case GameEndReason.Timeout:
                return 'Timeout';
            default:
                return 'Unknown';
        }
    }

    /** Build the 1.1 HeaderContext (provenance + identities). */
    private swuPgnHeaderContext(): HeaderContext {
        const players = this.game.getPlayers();
        const player1 = players[0];
        const player2 = players[1];

        const leaderId = (p: Player) => SwuPgn.formatSetId(p.deckLeader.setId.set, p.deckLeader.setId.number);
        const baseId = (p: Player) => SwuPgn.formatSetId(p.base.setId.set, p.base.setId.number);

        return {
            gameId: this.game.id,
            date: new Date().toISOString(),
            format: this.game.gameMode,
            cardPool: this.swuPgnCardPool(),
            engineVersion: SwuPgnGameAdapter.engineVersion(),
            // Every Game now seeds its RNG explicitly (see Game's constructor), so this is the
            // real seed the game ran on. The sentinel remains only for a Game constructed by a
            // harness that replaces the generator: Seed is a required tag and must be non-empty.
            seed: this.game.randomSeed ?? 'unseeded',
            perspective: null,
            rounds: this.game.roundNumber,
            result: this.swuPgnResult(player1),
            reason: this.gameEndReasonString(this.game.gameEndReason),
            p1: { username: player1.user.username, leader: leaderId(player1), base: baseId(player1) },
            p2: { username: player2.user.username, leader: leaderId(player2), base: baseId(player2) },
        };
    }

    /** Port buildPlayerDecklist to the 1.1 DeckRecord shape (stable SET#NUM ids). */
    private buildSwuPgnDecks(): DeckRecord[] {
        const records: DeckRecord[] = [];
        const players = this.game.getPlayers();
        for (let i = 0; i < players.length; i++) {
            const player = players[i];
            const seat: Seat = i === 0 ? 1 : 2;
            const leader = SwuPgn.formatSetId(player.deckLeader.setId.set, player.deckLeader.setId.number);
            const base = SwuPgn.formatSetId(player.base.setId.set, player.base.setId.number);

            const toEntries = (entries: { id: string; count: number }[]): [string, number][] =>
                entries
                    .filter((e) => e.count > 0)
                    .map((e) => {
                        const parts = e.id.split('_');
                        const id = parts.length === 2 ? SwuPgn.formatSetId(parts[0], Number(parts[1])) : e.id;
                        return [id, e.count] as [string, number];
                    });

            let deck: [string, number][] = [];
            let sideboard: [string, number][] | undefined;
            const lobbyDeck = player.lobbyDeck;
            if (lobbyDeck) {
                const decklistData = lobbyDeck.getDecklist();
                deck = toEntries(decklistData.deck);
                if (decklistData.sideboard && decklistData.sideboard.length > 0) {
                    sideboard = toEntries(decklistData.sideboard);
                }
            } else {
                // Fallback: count non-leader/base/token cards in allCards by printed id.
                const counts = new Map<string, number>();
                for (const card of player.allCards) {
                    if (card.isLeader() || card.isBase() || card.isToken()) {
                        continue;
                    }
                    const id = SwuPgn.formatSetId(card.setId.set, card.setId.number);
                    counts.set(id, (counts.get(id) ?? 0) + 1);
                }
                deck = Array.from(counts.entries());
            }

            const record: DeckRecord = { p: seat, leader, base, deck };
            if (sideboard) {
                record.sideboard = sideboard;
            }
            records.push(record);
        }
        return records;
    }
}
