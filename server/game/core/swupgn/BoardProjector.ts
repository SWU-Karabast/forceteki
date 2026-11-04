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
 * - its key, entity id or zone changed, or it is a deck card someone is looking at,
 * - it is in play and the ongoing-effect engine changed what it applies since the last projection,
 * - it is a resource and resources were exhausted or readied in bulk,
 * - the phase or round changed, or the cache was invalidated: then every card is.
 *
 * `g`, `p1`, `p2` and the effect entities are always re-projected: they are cheap.
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

    public constructor(
        private readonly game: Game,
        private readonly state: SwuPgnWriterState,
        private readonly audiences: AudienceTracker
    ) {}

    /** The cards the last `project()` read rather than reused (for specs). */
    public get lastReread(): ReadonlySet<Card> {
        return this.reread;
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
        if (!all) {
            this.spreadDirtyToParentsAndChildren();
            this.markResourceRowChange();
        }

        const entities = this.seatAndGameEntities(players, seatOf);
        this.reread.clear();
        for (const card of this.game.allCards) {
            const zone = zoneOfEntity(card, audiences);
            if (zone === null) {
                this.cache.delete(card);
                continue;
            }
            const key = this.state.cardKey(card);
            const cached = this.cache.get(card);
            if (
                !all && cached !== undefined && cached.key === key && cached.zone === zone && zone !== 'deck' &&
                !this.dirty.has(card) && !(effectsChanged && isInPlay(card)) && !(this.resourcesDirty && zone === 'resource') &&
                this.state.hasEntity(key) && this.state.entityIdFor(key) === cached.id
            ) {
                entities[String(cached.id)] = cached.entity;
                if (countSwuPgnWriterStats) {
                    swuPgnWriterStats.cardsReused++;
                }
                continue;
            }
            // projected before its own id is taken, as `projectCards` does, so a new parent's id comes first in both paths
            const entity = projectCardEntity(card, zone, this.state, seatOf, (c) => abilityUsesOf(c, players), audiences);
            const id = this.state.entityIdFor(key);
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

        this.addEffects(entities, seatOf, audiences);
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

    private addEffects(entities: Board['entities'], seatOf: SeatOf, audiences: ICardAudiences): void {
        Object.assign(entities, projectEffects(
            this.game,
            this.state,
            seatOf,
            (card) => projectedCardId(card, this.state, entities),
            (card) => cardAudience(card, seatOf, audiences)
        ));
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
    private spreadDirtyToParentsAndChildren(): void {
        if (this.dirty.size === 0) {
            return;
        }
        let grew = true;
        while (grew) {
            grew = false;
            for (const card of this.game.allCards) {
                const cached = this.cache.get(card);
                const old = cached?.parent ?? null;
                if (old === null && !canHaveParent(card)) {
                    continue;
                }
                const parent = parentOf(card)?.card ?? null;
                if (this.dirty.has(card)) {
                    for (const holder of [parent, old]) {
                        if (holder !== null && !this.dirty.has(holder)) {
                            this.dirty.add(holder);
                            grew = true;
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

/** In an arena or the base zone: what ongoing effects change. */
function isInPlay(card: Card): boolean {
    return EnumHelpers.isArena(card.zoneName) || card.zoneName === ZoneName.Base;
}

/** In an arena (an upgrade, a pilot, a token on a unit) or a capture zone: a card another card can hold. */
function canHaveParent(card: Card): boolean {
    return EnumHelpers.isArena(card.zoneName) || card.zoneName === ZoneName.Capture;
}
