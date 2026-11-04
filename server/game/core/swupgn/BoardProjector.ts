import type { Attrs, Board, Entity } from '@swupgn/format';
import type { Attack } from '../attack/Attack';
import type { Card } from '../card/Card';
import type { Game } from '../Game';
import type { Player } from '../Player';
import { PhaseName, ZoneName } from '../Constants';
import { EnumHelpers } from '../utils/EnumHelpers';
import type { AudienceTracker, LookFilter } from './AudienceTracker';
import type { SwuPgnWriterState } from './SwuPgnWriterState';
import type { ICardAudiences, SeatOf } from './projectCards';
import { cardAudience, parentOf, projectCardEntity, projectCards, projectedCardId, seatAmong, zoneOfEntity } from './projectCards';
import { abilityUsesOf, projectEffects } from './projectEffects';
import { countSwuPgnWriterStats, swuPgnWriterStats } from './SwuPgnWriterStats';

/** A card's entity as the last projection that read the card wrote it, with what decides whether it can be reused. */
interface ICachedCard {
    readonly key: string;
    readonly id: number;
    readonly zone: string;
    readonly entity: Entity;

    /** The card that held it then: when either changes, so may the other. */
    readonly parent: Card | null;
}

/**
 * Projects the live game into an SWU-PGN board: the full state after one decision.
 * Attributes that do not apply are omitted, never written as null (W-36).
 *
 * `project()` re-reads only the cards marked dirty since the last projection and reuses the cached entities of the
 * rest; `projectFull()` re-reads every card and is the oracle the dirty path is checked against. The cache is plain
 * memory, not rollback state: `invalidate()` drops it after a rollback or a baseline restart.
 *
 * A card is re-read when:
 * - it was marked dirty (it changed zone, it was shown, or a resolved event named it), or it holds or is held by
 *   such a card, now or at its last projection,
 * - its zone changed, or it is a deck card someone is looking at (its key and entity id change only when it enters a
 *   deck, which marks it, or on a rollback or baseline restart, which invalidate the cache),
 * - it is in play and the ongoing-effect engine changed what it applies since the last projection,
 * - it is a resource and resources were exhausted or readied in bulk,
 * - the phase or round changed, or the cache was invalidated: then every card is.
 *
 * `g`, `p1`, `p2` and the effect entities are always re-projected: they are cheap.
 *
 * Only the cards that have entities, and the marked ones, are visited (`cardsToVisit`): a deck card nobody sees is
 * never touched. A projection that reads every card walks `game.allCards` and rebuilds the cache. `lastChanged` names
 * the entities written anew or removed since the board the writer last committed, so it diffs only those.
 */
export class BoardProjector {
    private readonly cache = new Map<Card, ICachedCard>();
    private readonly dirty = new Set<Card>();
    private resourcesDirty = false;
    private rereadAll = true;
    private lastPhase: PhaseName | null = null;
    private lastRound = -1;
    private lastEffectChange = -1;
    private lastAttack: Attack | null = null;
    private lastAttackCards: readonly Card[] = [];
    private readonly reread = new Set<Card>();
    private changed: Set<string> | null = null;
    private committed = false;
    private visitedCount = 0;
    private lastEffectIds: string[] = [];

    /** Each card's index in `game.allCards`, the order a projection reads new cards in (so ids are assigned as in `projectFull`). */
    private readonly cardOrder = new Map<Card, number>();

    public constructor(
        private readonly game: Game,
        private readonly state: SwuPgnWriterState,
        private readonly audiences: AudienceTracker
    ) {}

    /** The cards the last `project()` read rather than reused (for specs). */
    public get lastReread(): ReadonlySet<Card> {
        return this.reread;
    }

    /**
     * The entity ids the projections since the last `commit()` wrote anew or removed: every other entity on the last
     * board is the object the committed board held. Null when one of them read every card (the first one, or after a
     * phase or round change or an invalidation): then any entity may have changed.
     */
    public get lastChanged(): ReadonlySet<string> | null {
        return this.changed;
    }

    /**
     * The last projected board is now the board the records describe (the writer's `prev`): the next projection's
     * `lastChanged` starts again from it. Without a commit (a flush that failed, or a spec's own projection) the
     * changes keep adding up, so they stay relative to the board last committed.
     */
    public commit(): void {
        this.committed = true;
    }

    /** The cards the last `project()` visited: the cards with entities and the ones marked, never a deck card nobody sees. */
    public get lastVisitedCount(): number {
        return this.visitedCount;
    }

    /** The card's entity may have changed: read it at the next projection. */
    public markDirty(card: Card): void {
        this.dirty.add(card);
    }

    /** Resources were exhausted or readied in bulk (paying a cost, readying N): read every resource at the next projection. */
    public markResourcesDirty(): void {
        this.resourcesDirty = true;
    }

    /** Forgets every cached entity: the next projection reads every card. */
    public invalidate(): void {
        this.cache.clear();
        this.changed = null;
        this.committed = false;
        this.dirty.clear();
        this.resourcesDirty = false;
        this.rereadAll = true;
    }

    /** `ending` selects the looks that end with this board: their deck cards are left out. */
    public project(ending: LookFilter | null = null): Board {
        const players = this.game.getPlayers();
        const seatOf: SeatOf = (player) => seatAmong(players, player);
        const audiences = this.cardAudiences(ending);

        const phase = this.game.currentPhase ?? null;
        const round = this.game.roundNumber;
        const effectChange = this.game.ongoingEffectEngine.changeCount;
        const all = this.rereadAll || phase !== this.lastPhase || round !== this.lastRound;
        const effectsChanged = effectChange !== this.lastEffectChange;
        this.markAttackChange();

        const entities = this.seatAndGameEntities(players, seatOf);
        if (this.committed) {
            this.changed = new Set<string>();
            this.committed = false;
        }
        if (all) {
            this.changed = null;
        }
        const changed = this.changed;
        for (const fixed of ['g', 'p1', 'p2']) {
            changed?.add(fixed);
        }
        this.reread.clear();
        let cards: Iterable<Card>;
        if (all) {
            // every card is read and the cache rebuilt, so an entry for a card no longer in the game does not linger
            this.cache.clear();
            const allCards = this.game.allCards;
            this.rememberCardOrder(allCards);
            cards = allCards;
        } else {
            const visit = this.cardsToVisit(audiences);
            this.spreadDirtyToParentsAndChildren(visit);
            this.markResourceRowChange();
            cards = this.inProjectionOrder(visit);
        }

        let visited = 0;
        for (const card of cards) {
            visited++;
            const cached = this.cache.get(card);
            const zone = zoneOfEntity(card, audiences);
            if (zone === null) {
                if (cached !== undefined) {
                    this.cache.delete(card);
                    changed?.add(String(cached.id));
                }
                continue;
            }
            // a clean cached card keeps its key and id: only a deck entry (which marks it) or a rollback or baseline
            // restart (which invalidate the cache) changes them
            if (
                !all && cached !== undefined && cached.zone === zone && zone !== 'deck' && !this.dirty.has(card) &&
                !(effectsChanged && isInPlay(card)) && !(this.resourcesDirty && zone === 'resource')
            ) {
                entities[String(cached.id)] = cached.entity;
                if (countSwuPgnWriterStats) {
                    swuPgnWriterStats.cardsReused++;
                }
                continue;
            }
            const key = this.state.cardKey(card);
            // projected before its own id is taken, as `projectCards` does, so a new parent's id comes first in both paths
            const entity = projectCardEntity(card, zone, this.state, seatOf, (c) => abilityUsesOf(c, players), audiences);
            const id = this.state.entityIdFor(key);
            if (changed !== null) {
                changed.add(String(id));
                if (cached !== undefined && cached.id !== id) {
                    changed.add(String(cached.id));
                }
            }
            this.cache.set(card, { key, id, zone, entity, parent: parentOf(card)?.card ?? null });
            this.reread.add(card);
            entities[String(id)] = entity;
            if (countSwuPgnWriterStats) {
                swuPgnWriterStats.cardsRead++;
            }
        }

        this.dirty.clear();
        this.resourcesDirty = false;
        this.rereadAll = false;
        this.lastPhase = phase;
        this.lastRound = round;
        this.lastEffectChange = effectChange;
        this.visitedCount = visited;
        if (countSwuPgnWriterStats && !all) {
            swuPgnWriterStats.cardsVisited += visited;
        }

        const effectIds = this.addEffects(entities, seatOf, audiences);
        if (changed !== null) {
            for (const id of this.lastEffectIds) {
                changed.add(id);
            }
            for (const id of effectIds) {
                changed.add(id);
            }
        }
        this.lastEffectIds = effectIds;
        return { seq: null, entities };
    }

    /** `project()` reading every card, with no cache: the oracle. It neither reads nor changes the cache. */
    public projectFull(ending: LookFilter | null = null): Board {
        const players = this.game.getPlayers();
        const seatOf: SeatOf = (player) => seatAmong(players, player);
        const audiences = this.cardAudiences(ending);
        const entities = this.seatAndGameEntities(players, seatOf);
        projectCards(this.game.allCards, this.state, seatOf, (card) => abilityUsesOf(card, players), audiences, entities);
        this.addEffects(entities, seatOf, audiences);
        return { seq: null, entities };
    }

    private cardAudiences(ending: LookFilter | null): ICardAudiences {
        return {
            audienceFor: (card, zone, owner) => this.audiences.audienceFor(card, zone, owner),
            viewedDeckCards: new Set(this.audiences.viewedDeckCards(ending))
        };
    }

    private seatAndGameEntities(players: readonly Player[], seatOf: SeatOf): Board['entities'] {
        return {
            g: this.projectGame(seatOf),
            p1: this.projectSeat(players[0]),
            p2: this.projectSeat(players[1])
        };
    }

    /** Adds the effect entities to `entities` and returns their ids. */
    private addEffects(entities: Board['entities'], seatOf: SeatOf, audiences: ICardAudiences): string[] {
        const effects = projectEffects(
            this.game,
            this.state,
            seatOf,
            (card) => projectedCardId(card, this.state, entities),
            (card) => cardAudience(card, seatOf, audiences)
        );
        Object.assign(entities, effects);
        return Object.keys(effects);
    }

    /**
     * The cards a projection that reuses entities must visit: every card with an entity (it may lose it, or have
     * changed), every card marked dirty (it may have gained one: it entered a zone or was shown), and the deck cards
     * someone is looking at. A deck card with no entity is not visited: it can gain one only by leaving the deck, or by
     * being looked at, both of which mark it.
     */
    private cardsToVisit(audiences: ICardAudiences): Set<Card> {
        const visit = new Set<Card>(this.cache.keys());
        for (const card of this.dirty) {
            visit.add(card);
        }
        for (const card of audiences.viewedDeckCards) {
            visit.add(card);
        }
        return visit;
    }

    /**
     * The cards in `game.allCards` order when one of them gets an entity id now, so the ids are taken in the order
     * `projectFull` (and the projection before 8c) takes them; in any order otherwise, since then no id is taken.
     */
    private inProjectionOrder(visit: Set<Card>): Iterable<Card> {
        let takesId = false;
        for (const card of visit) {
            const cached = this.cache.get(card);
            if (cached === undefined || this.dirty.has(card)) {
                const key = this.state.cardKey(card);
                if (!this.state.hasEntity(key) || (cached !== undefined && cached.key !== key)) {
                    takesId = true;
                    break;
                }
            }
        }
        if (!takesId) {
            return visit;
        }
        let missing = false;
        for (const card of visit) {
            if (!this.cardOrder.has(card)) {
                missing = true; // a token created since the order was taken
                break;
            }
        }
        if (missing) {
            this.rememberCardOrder(this.game.allCards);
        }
        return [...visit].sort((a, b) => this.cardOrder.get(a) - this.cardOrder.get(b));
    }

    private rememberCardOrder(cards: readonly Card[]): void {
        this.cardOrder.clear();
        cards.forEach((card, i) => this.cardOrder.set(card, i));
    }

    /**
     * An attack began or ended: its attacker and targets are read again. Their stats change with no event naming them
     * (Raid counts only while attacking, `isAttacking()` reads the attack).
     */
    private markAttackChange(): void {
        const attack: Attack | null = this.game.currentAttack ?? null;
        if (attack === this.lastAttack) {
            return;
        }
        const cards: Card[] = attack ? [attack.attacker, ...attack.getAllTargets()] : [];
        for (const card of [...this.lastAttackCards, ...cards]) {
            this.dirty.add(card);
        }
        this.lastAttack = attack;
        this.lastAttackCards = cards;
    }

    /**
     * A card entered or left the resource row: the engine moves the exhausted state between the resources (a ready
     * resource that leaves hands its state to another), so every resource is read again.
     */
    private markResourceRowChange(): void {
        if (this.resourcesDirty) {
            return;
        }
        for (const card of this.dirty) {
            if (card.zoneName === ZoneName.Resource || this.cache.get(card)?.zone === 'resource') {
                this.resourcesDirty = true;
                return;
            }
        }
    }

    /**
     * Marks dirty every card that holds or is held by a dirty card, now or at its last projection, until no more change:
     * an upgrade changes its unit's stats, and a unit that moves takes its upgrades and captives with it.
     */
    private spreadDirtyToParentsAndChildren(visit: Set<Card>): void {
        if (this.dirty.size === 0) {
            return;
        }
        // a card that holds or is held by another is in play or captured, so it has an entity or was marked: it is visited
        let grew = true;
        while (grew) {
            grew = false;
            for (const card of visit) {
                const cached = this.cache.get(card);
                const old = cached?.parent ?? null;
                // a token removed from the game has no zone, and no parent now
                const inGame = card.zone != null;
                if (old === null && (!inGame || !canHaveParent(card))) {
                    continue;
                }
                const parent = inGame ? parentOf(card)?.card ?? null : null;
                if (this.dirty.has(card)) {
                    for (const holder of [parent, old]) {
                        if (holder !== null && !this.dirty.has(holder)) {
                            this.dirty.add(holder);
                            grew = true;
                            visit.add(holder); // a Set visits what is added while it is iterated
                        }
                    }
                } else if ((parent !== null && this.dirty.has(parent)) || (old !== null && this.dirty.has(old))) {
                    this.dirty.add(card);
                    grew = true;
                }
            }
        }
    }

    private projectGame(seatOf: SeatOf): Entity {
        const game = this.game;
        const a: Attrs = {
            round: game.roundNumber,
            phase: game.currentPhase ?? PhaseName.Setup
        };

        const active = game.currentPhase === PhaseName.Action ? seatOf(game.actionPhaseActivePlayer) : null;
        if (active !== null) {
            a.active = active;
        }

        const initiative = seatOf(game.initiativePlayer);
        if (initiative !== null) {
            a.initiative = initiative;
        }
        a.initiativeTaken = game.isInitiativeClaimed;

        if (game.isEnded) {
            const winners = game.winnerNames.map((name) => seatOf(game.getPlayerByName(name)));
            a.result = winners.length === 1 && winners[0] !== null ? `p${winners[0]}` : 'draw';
        }
        return { a };
    }

    private projectSeat(player: Player | undefined): Entity {
        const a: Attrs = {};
        if (player) {
            a.deckCount = player.drawDeck.length;
            a.handCount = player.hand.length;
            if (player.creditTokenCount > 0) {
                a.credits = player.creditTokenCount;
            }
            if (player.hasTheForce) {
                a.force = true;
            }
        }
        return { a };
    }
}

/**
 * In an arena or the base zone: the cards an ongoing-effect change makes the projection read again. This assumes that
 * what `attributesOf` writes for a card in hand, discard, the resource row, a capture zone or set aside (identity only:
 * kind, aspects, cost, name, exhausted for a resource) does not change with ongoing effects while the card stays
 * there (an effect such as Clone's printed-attribute override takes hold as the card enters play, which marks it).
 * The full-suite oracle found no exception. Should one appear, widen this, or the cache keeps the old value.
 */
function isInPlay(card: Card): boolean {
    return EnumHelpers.isArena(card.zoneName) || card.zoneName === ZoneName.Base;
}

/** In an arena (an upgrade, a pilot, a token on a unit) or a capture zone: a card another card can hold. */
function canHaveParent(card: Card): boolean {
    return EnumHelpers.isArena(card.zoneName) || card.zoneName === ZoneName.Capture;
}
