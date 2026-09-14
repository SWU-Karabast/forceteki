import type { Arena } from '../Constants';
import { ZoneName } from '../Constants';
import type { Card } from '../card/Card';
import type { InPlayCard } from '../card/baseClasses/InPlayCard';
import type { IAttackableCard, ICardWithUpgrades } from '../card/CardInterfaces';
import type { Player } from '../Player';
import {
    StateInjectionError,
    assertStagingZoneMatches,
    attachUpgrade,
    captureCard,
    generateToken,
    isTokenCardName,
    isTokenUnitName,
    isTokenUpgradeName,
    moveAllNonBaseZonesToStaging,
    setArenaUnits,
    setBaseStatus,
    setCreditTokenCount,
    setDeck,
    setDiscard,
    setHand,
    setHasTheForce,
    setLeaderStatus,
    setOutsideTheGame,
    setResources,
} from './GameStateInjector';
import type { IArenaUnitEntry, IResourceEntry } from './GameStateInjector';
import { LoadedPositionIndex } from './LoadedPositionIndex';
import { MatchLoadError } from './MatchLoadError';
import type { ISavedAttachedCard, ISavedMatch, ISavedPlayer, SavedParentRefZone } from './SavedMatchInterfaces';

/**
 * Injects `saved`'s board position into a freshly-driven `game`, as four explicit **across-all-seats**
 * phases rather than a per-seat loop. A per-seat loop is wrong in two directions, both reachable: an
 * attachment owned by a not-yet-staged seat is still in that seat's deck when the first seat needs it, and
 * an attachment owned by the first seat but hosted by the second is still sitting in the first seat's
 * staging zone when a per-seat assertion runs. This mirrors what `test/helpers/GameStateBuilder.js` does
 * for the same reason.
 *
 * Every attached card this module places keeps its resolved owner as its controller (`attachUpgrade`/
 * `captureCard` never change controller) -- `LoadedPositionIndex.resolveRef`'s nested-match rule depends on
 * that coincidence, see its own doc comment.
 */

/** A per-seat pool of not-yet-placed cards, built from `outsideTheGame` after staging. Claims are first-unclaimed-by-name, matching {@link module:GameStateInjector.assertStagingZoneMatches}'s counted-membership contract. */
class SeatPool {
    private readonly byName = new Map<string, Card[]>();

    public constructor(cards: readonly Card[]) {
        for (const card of cards) {
            const bucket = this.byName.get(card.internalName) ?? [];
            bucket.push(card);
            this.byName.set(card.internalName, bucket);
        }
    }

    public claim(internalName: string): Card | null {
        const bucket = this.byName.get(internalName);
        if (bucket == null || bucket.length === 0) {
            return null;
        }
        return bucket.shift();
    }
}

interface IInjectionContext {
    saved: ISavedMatch;
    playerBySeat: ReadonlyMap<string, Player>;
    pools: ReadonlyMap<string, SeatPool>;
    index: LoadedPositionIndex;
}

/** Resolves `internalName` to a `Card`, claiming from `ownerSeat`'s pool or generating a fresh token. Never generates a second copy of `the-force`: that card is always already in its owner's pool (`Player.initialiseAsync` creates exactly one). */
function resolveCard(context: IInjectionContext, ownerSeat: string, internalName: string): Card {
    const pool = context.pools.get(ownerSeat);
    const claimed = pool?.claim(internalName);
    if (claimed != null) {
        return claimed;
    }

    if (internalName === 'the-force') {
        // Never generate a second Force token: `Player.initialiseAsync` creates exactly one, and it is
        // always already in its owner's pool. Reaching here means the document's Force-token position
        // could not be resolved -- a document integrity problem, not a "generate a fresh one" case.
        throw new MatchLoadError(`Could not resolve seat "${ownerSeat}"'s Force token: it is not in the unclaimed card pool.`);
    }

    if (isTokenUnitName(internalName) || isTokenUpgradeName(internalName) || isTokenCardName(internalName)) {
        return generateToken(context.playerBySeat.get(ownerSeat), internalName);
    }

    throw new MatchLoadError(`No unclaimed card named "${internalName}" is available in seat "${ownerSeat}"'s decklist pool (resolution shortfall).`);
}

function resolveAttachedCards(
    context: IInjectionContext,
    attached: readonly ISavedAttachedCard[],
    parentSeat: string,
    parentZone: SavedParentRefZone,
    parentOrdinal: number,
    list: 'upgrades' | 'capturedCards',
    controllerSeat: string
): Card[] {
    return attached.map((entry) => {
        const ownerSeat = entry.ownerSeat ?? controllerSeat;
        const card = resolveCard(context, ownerSeat, entry.card);
        context.index.recordNested(parentSeat, parentZone, parentOrdinal, list, entry.card, ownerSeat, card);
        return card;
    });
}

function injectArenaZone(context: IInjectionContext, player: Player, seat: string, arena: Arena, savedEntries: ISavedPlayer['groundArena']): void {
    // `ZoneName.GroundArena`/`ZoneName.SpaceArena`'s own string values ('groundArena'/'spaceArena') are
    // exactly the document's `SavedArrayRefZone`/`SavedParentRefZone` labels for these zones.
    const zoneName = arena as unknown as 'groundArena' | 'spaceArena';

    const entries: IArenaUnitEntry[] = savedEntries.map((saved, ordinal) => {
        const ownerSeat = saved.ownerSeat ?? seat;
        const card = resolveCard(context, ownerSeat, saved.card);
        context.index.recordTopLevel(seat, zoneName, ordinal, card);

        const upgrades = resolveAttachedCards(context, saved.upgrades, seat, zoneName, ordinal, 'upgrades', seat);
        const capturedUnits = resolveAttachedCards(context, saved.capturedCards, seat, zoneName, ordinal, 'capturedCards', seat);

        return {
            card,
            controller: saved.ownerSeat != null ? context.playerBySeat.get(seat) : undefined,
            exhausted: saved.exhausted,
            damage: saved.damage,
            upgrades: upgrades as unknown as InPlayCard[],
            capturedUnits,
        };
    });

    setArenaUnits(player, arena, entries);
}

/**
 * Injects `saved`'s board position into `game`'s players (identified by `playerBySeat`, in the same seat
 * labels the document uses), returning the position index every later restore pass resolves refs against.
 */
export function injectPositions(saved: ISavedMatch, playerBySeat: ReadonlyMap<string, Player>): LoadedPositionIndex {
    const index = new LoadedPositionIndex();

    try {
        // --- Phase A: stage every seat, before any placement. ---
        for (const player of playerBySeat.values()) {
            moveAllNonBaseZonesToStaging(player);
        }

        const pools = new Map<string, SeatPool>();
        for (const savedPlayer of saved.players) {
            const player = playerBySeat.get(savedPlayer.seat);
            pools.set(savedPlayer.seat, new SeatPool(player.outsideTheGameZone.cards));
        }

        const context: IInjectionContext = { saved, playerBySeat, pools, index };

        // --- Phase B: resolve and place, across all seats, in the proven order. ---

        // resources
        for (const savedPlayer of saved.players) {
            const player = playerBySeat.get(savedPlayer.seat);
            const entries: IResourceEntry[] = savedPlayer.resources.map((saved_, ordinal) => {
                const ownerSeat = saved_.ownerSeat ?? savedPlayer.seat;
                const card = resolveCard(context, ownerSeat, saved_.card);
                index.recordTopLevel(savedPlayer.seat, 'resources', ordinal, card);
                return {
                    card: card as unknown as IResourceEntry['card'],
                    exhausted: saved_.exhausted,
                    controller: saved_.ownerSeat != null ? playerBySeat.get(savedPlayer.seat) : undefined,
                };
            });
            setResources(player, [...entries].reverse());
        }

        // arenas (ground then space, per seat)
        for (const savedPlayer of saved.players) {
            const player = playerBySeat.get(savedPlayer.seat);
            injectArenaZone(context, player, savedPlayer.seat, ZoneName.GroundArena, savedPlayer.groundArena);
        }
        for (const savedPlayer of saved.players) {
            const player = playerBySeat.get(savedPlayer.seat);
            injectArenaZone(context, player, savedPlayer.seat, ZoneName.SpaceArena, savedPlayer.spaceArena);
        }

        // hand
        for (const savedPlayer of saved.players) {
            const player = playerBySeat.get(savedPlayer.seat);
            const cards = savedPlayer.hand.map((name, ordinal) => {
                const card = resolveCard(context, savedPlayer.seat, name);
                index.recordTopLevel(savedPlayer.seat, 'hand', ordinal, card);
                return card;
            });
            setHand(player, cards);
        }

        // discard
        for (const savedPlayer of saved.players) {
            const player = playerBySeat.get(savedPlayer.seat);
            const cards = savedPlayer.discard.map((name, ordinal) => {
                const card = resolveCard(context, savedPlayer.seat, name);
                index.recordTopLevel(savedPlayer.seat, 'discard', ordinal, card);
                return card;
            });
            setDiscard(player, [...cards].reverse());
        }

        // leader
        for (const savedPlayer of saved.players) {
            const player = playerBySeat.get(savedPlayer.seat);
            const leader = player.deckLeader;
            index.recordTopLevel(savedPlayer.seat, 'leader', 0, leader as unknown as Card);

            setLeaderStatus(player, {
                deployed: savedPlayer.leader.deployed,
                exhausted: savedPlayer.leader.exhausted,
                damage: savedPlayer.leader.deployed ? savedPlayer.leader.damage : undefined,
                onStartingSide: savedPlayer.leader.onStartingSide,
            });

            const upgrades = resolveAttachedCards(context, savedPlayer.leader.upgrades, savedPlayer.seat, 'leader', 0, 'upgrades', savedPlayer.seat);
            const capturedCards = resolveAttachedCards(context, savedPlayer.leader.capturedCards, savedPlayer.seat, 'leader', 0, 'capturedCards', savedPlayer.seat);
            for (const upgrade of upgrades) {
                attachUpgrade(upgrade as unknown as InPlayCard, leader as unknown as ICardWithUpgrades);
            }
            for (const captured of capturedCards) {
                captureCard(captured, leader as unknown as IAttackableCard);
            }
        }

        // base
        for (const savedPlayer of saved.players) {
            const player = playerBySeat.get(savedPlayer.seat);
            const base = player.base;
            index.recordTopLevel(savedPlayer.seat, 'base', 0, base as unknown as Card);

            setBaseStatus(player, { damage: savedPlayer.base.damage });

            const upgrades = resolveAttachedCards(context, savedPlayer.base.upgrades, savedPlayer.seat, 'base', 0, 'upgrades', savedPlayer.seat);
            const capturedCards = resolveAttachedCards(context, savedPlayer.base.capturedCards, savedPlayer.seat, 'base', 0, 'capturedCards', savedPlayer.seat);
            for (const upgrade of upgrades) {
                attachUpgrade(upgrade as unknown as InPlayCard, base as unknown as ICardWithUpgrades);
            }
            for (const captured of capturedCards) {
                captureCard(captured, base as unknown as IAttackableCard);
            }
        }

        // deck
        for (const savedPlayer of saved.players) {
            const player = playerBySeat.get(savedPlayer.seat);
            const cards = savedPlayer.deck.map((name, ordinal) => {
                const card = resolveCard(context, savedPlayer.seat, name);
                index.recordTopLevel(savedPlayer.seat, 'deck', ordinal, card);
                return card;
            });
            setDeck(player, cards);
        }

        // --- Phase C: base-zone tokens, across all seats. ---
        for (const savedPlayer of saved.players) {
            const player = playerBySeat.get(savedPlayer.seat);
            if (savedPlayer.hasTheForce) {
                setHasTheForce(player, true);
                if (player.baseZone.forceToken != null) {
                    index.recordTopLevel(savedPlayer.seat, 'forceToken', 0, player.baseZone.forceToken as unknown as Card);
                }
            }
        }
        for (const savedPlayer of saved.players) {
            const player = playerBySeat.get(savedPlayer.seat);
            setCreditTokenCount(player, savedPlayer.creditTokens);
            player.baseZone.credits.forEach((credit, ordinal) => index.recordTopLevel(savedPlayer.seat, 'creditTokens', ordinal, credit as unknown as Card));
        }

        // --- Phase D: staging order and assertion, across all seats, last of all. ---
        for (const savedPlayer of saved.players) {
            const player = playerBySeat.get(savedPlayer.seat);
            const cards = savedPlayer.outsideTheGame.map((name, ordinal) => {
                const card = resolveCard(context, savedPlayer.seat, name);
                index.recordTopLevel(savedPlayer.seat, 'outsideTheGame', ordinal, card);
                return card;
            });
            setOutsideTheGame(player, cards);
        }
        for (const savedPlayer of saved.players) {
            const player = playerBySeat.get(savedPlayer.seat);
            assertStagingZoneMatches(player, savedPlayer.outsideTheGame);
        }

        return index;
    } catch (error) {
        if (error instanceof StateInjectionError) {
            throw new MatchLoadError(`Failed to inject the saved board position: ${error.message}`, { cause: error });
        }
        throw error;
    }
}
