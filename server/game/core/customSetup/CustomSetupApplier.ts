import type { Game } from '../Game';
import type { Player } from '../Player';
import type { Card } from '../card/Card';
import type { InPlayCard } from '../card/baseClasses/InPlayCard';
import type { LeaderUnitCard } from '../card/LeaderUnitCard';
import { DeployType, DeckZoneDestination, ZoneName } from '../Constants';
import { Contract } from '../utils/Contract';
import type { SimpleZone } from '../zone/SimpleZone';
import {
    type CardEntry,
    type IBaseSpec,
    type ICustomSetupPlayerState,
    type ICustomSetupState,
    type ICustomSetupValidationError,
    type ILeaderSpec,
    type ResourceEntry,
    CustomSetupValidationFailure,
    isTokenUpgradeName,
} from './CustomSetupTypes';

/**
 * Applies a custom setup state to a freshly-initialised game. Must be called
 * after `Player.initialiseAsync` has hydrated each player's deck zone but
 * before the game pipeline begins running phases. The caller is responsible
 * for skipping the SetupPhase pipeline.
 *
 * Mirrors the post-startGame portion of GameStateBuilder.setupGameStateAsync
 * (forceteki/test/helpers/GameStateBuilder.js) but talks to Game/Player/Card
 * directly instead of going through the test PlayerInteractionWrapper, and
 * makes no assumption that decks were synthesized — every named card must
 * already exist in the player's loaded deck.
 */
export class CustomSetupApplier {
    public static apply(game: Game, setup: ICustomSetupState): void {
        const errors: ICustomSetupValidationError[] = [];

        const players = game.getPlayers();
        Contract.assertTrue(players.length === 2, 'Custom setup requires exactly two players');

        const owner = players[0];
        const opponent = players[1];

        const ownerCtx = new PlayerSetupContext(game, owner, 'player1', errors);
        const opponentCtx = new PlayerSetupContext(game, opponent, 'player2', errors);

        if (setup.player1?.hasInitiative) {
            game.initiativePlayer = owner;
        } else if (setup.player2?.hasInitiative) {
            game.initiativePlayer = opponent;
        }

        // Both players' action windows are pre-prompted so the action phase
        // begins immediately without an extra "First action" UI step.
        owner.promptedActionWindows.action = true;
        opponent.promptedActionWindows.action = true;

        // Clear all non-base zones for both players first so cross-player
        // upgrade attachments and shared zone moves don't trip over each other.
        ownerCtx.moveAllNonBaseZonesToOutside();
        opponentCtx.moveAllNonBaseZonesToOutside();

        ownerCtx.applyState(setup.player1 ?? {});
        opponentCtx.applyState(setup.player2 ?? {});

        if (errors.length > 0) {
            throw new CustomSetupValidationFailure(errors);
        }

        game.resolveGameState(true);
    }
}

/**
 * Per-player helper that mutates one Player's state. All errors are pushed to
 * the shared `errors` array; we don't throw mid-apply so that the user sees
 * every problem at once when they validate JSON in the lobby.
 */
class PlayerSetupContext {
    public constructor(
        private readonly game: Game,
        private readonly player: Player,
        private readonly path: string,
        private readonly errors: ICustomSetupValidationError[],
    ) {}

    public applyState(state: ICustomSetupPlayerState): void {
        this.applyLeader(state.leader);
        this.applyBase(state.base);

        // Order matters: resources/discard/hand consume cards from outsideTheGame
        // (the staging zone we just dumped everything into), and arenas pull
        // upgrades from outsideTheGame too. Deck must be set last so any
        // remaining requested cards aren't accidentally claimed by an earlier
        // step.
        this.applyResources(state.resources);
        this.applyArena(state.groundArena, ZoneName.GroundArena);
        this.applyArena(state.spaceArena, ZoneName.SpaceArena);
        this.applyHand(state.hand);
        this.applyDiscard(state.discard);
        this.applyDeck(state.deck);

        this.applyForceToken(state.hasForceToken);
        this.applyCredits(state.credits);
    }

    public moveAllNonBaseZonesToOutside(): void {
        const arenaCards = this.player.getArenaCards();
        const resourceCards = this.player.resourceZone.clearCards();
        const discardCards = this.player.discardZone.clearCards();
        const handCards = this.player.handZone.clearCards();
        const deckCards = this.player.deckZone.clearDeck();

        // Arena zones are shared across both players, so we can't bulk-clear
        // them — we have to remove this player's cards individually. The cast
        // is safe because getArenaCards only returns cards in arena zones,
        // which all extend SimpleZone.
        for (const card of arenaCards) {
            (card.zone as unknown as SimpleZone).removeCard(card);
        }

        const outside = this.player.outsideTheGameZone;
        const allCards: Card[] = [...arenaCards, ...resourceCards, ...discardCards, ...handCards, ...deckCards];
        for (const card of allCards) {
            // Direct zone assignment, bypassing moveTo, so we don't fire
            // leave-zone effects during the wipe.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (card as any).zone = outside;
        }
        outside.addCards(allCards);
    }

    private applyLeader(leader: string | ILeaderSpec | undefined): void {
        if (leader === undefined) {
            return;
        }
        const spec: ILeaderSpec = typeof leader === 'string' ? { card: leader } : leader;
        const leaderCard = this.player.leader as LeaderUnitCard;

        if (spec.card !== undefined && spec.card !== leaderCard.internalName) {
            this.errors.push({
                path: `${this.path}.leader.card`,
                message: `Leader '${spec.card}' does not match the player's deck leader '${leaderCard.internalName}'`,
            });
            return;
        }

        if ('flipped' in spec && spec.flipped) {
            // Some leaders are double-sided; the test wrapper guards behind a typeof check.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const flip = (leaderCard as any).flipLeader;
            if (typeof flip === 'function') {
                flip.call(leaderCard);
            } else {
                this.errors.push({ path: `${this.path}.leader.flipped`, message: 'This leader cannot be flipped' });
            }
        }

        if (spec.deployed) {
            try {
                leaderCard.deploy({ type: DeployType.LeaderUnit });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const deployAbility = leaderCard.getActionAbilities().find((ability: any) => ability.getTitle().includes('Deploy'));
                if (deployAbility?.limit) {
                    deployAbility.limit.increment(this.player);
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (leaderCard as any).damage = spec.damage ?? 0;
                if (spec.exhausted) {
                    leaderCard.exhaust();
                } else {
                    leaderCard.ready();
                }
                if (spec.upgrades) {
                    this.attachUpgrades(`${this.path}.leader`, leaderCard, spec.upgrades);
                }
            } catch (err) {
                this.errors.push({ path: `${this.path}.leader`, message: `Failed to deploy leader: ${(err as Error).message}` });
            }
        } else {
            if (leaderCard.deployed) {
                leaderCard.undeploy();
            }
            if (spec.exhausted) {
                leaderCard.exhaust();
            } else {
                leaderCard.ready();
            }
        }
    }

    private applyBase(base: string | IBaseSpec | undefined): void {
        if (base === undefined) {
            return;
        }
        const spec: IBaseSpec = typeof base === 'string' ? { card: base } : base;
        if (spec.card !== undefined && spec.card !== this.player.base.internalName) {
            this.errors.push({
                path: `${this.path}.base.card`,
                message: `Base '${spec.card}' does not match the player's deck base '${this.player.base.internalName}'`,
            });
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.player.base as any).damage = spec.damage ?? 0;
    }

    private applyResources(resources: number | ResourceEntry[] | undefined): void {
        if (resources === undefined) {
            return;
        }
        if (typeof resources === 'number') {
            for (let i = 0; i < resources; i++) {
                const card = this.takeFromOutside(() => true);
                if (!card) {
                    this.errors.push({ path: `${this.path}.resources`, message: `Not enough cards in deck to fill ${resources} resources` });
                    return;
                }
                card.moveTo(ZoneName.Resource);
            }
            return;
        }
        // Reverse so first-listed ends up on top (matches test framework).
        [...resources].reverse().forEach((entry, idx) => {
            const realIdx = resources.length - 1 - idx;
            const name = typeof entry === 'string' ? entry : entry.card;
            const card = this.takeFromOutside((c) => c.internalName === name);
            if (!card) {
                this.errors.push({ path: `${this.path}.resources[${realIdx}]`, message: `Card '${name}' is not available to place as a resource` });
                return;
            }
            card.moveTo(ZoneName.Resource);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (card as any).exhausted = typeof entry === 'string' ? false : !!entry.exhausted;
        });
    }

    private applyArena(arena: CardEntry[] | undefined, arenaZone: ZoneName.GroundArena | ZoneName.SpaceArena): void {
        if (arena === undefined) {
            return;
        }
        arena.forEach((entry, i) => {
            const spec = typeof entry === 'string' ? { card: entry } : entry;
            const card = this.takeFromOutside((c) => c.internalName === spec.card);
            if (!card) {
                this.errors.push({ path: `${this.path}.${arenaZone}[${i}]`, message: `Card '${spec.card}' is not available to place in ${arenaZone}` });
                return;
            }
            if (!card.isUnit()) {
                this.errors.push({ path: `${this.path}.${arenaZone}[${i}]`, message: `Card '${spec.card}' is not a unit` });
                return;
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((card as any).defaultArena !== arenaZone) {
                this.errors.push({ path: `${this.path}.${arenaZone}[${i}]`, message: `Card '${spec.card}' belongs in a different arena` });
                return;
            }
            card.moveTo(arenaZone);
            if (spec.exhausted) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (card as any).exhaust();
            } else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (card as any).ready();
            }
            if (spec.damage !== undefined) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (card as any).damage = spec.damage;
            }
            if (spec.upgrades) {
                this.attachUpgrades(`${this.path}.${arenaZone}[${i}]`, card as unknown as InPlayCard, spec.upgrades);
            }
        });
    }

    private applyHand(hand: string[] | undefined): void {
        if (hand === undefined) {
            return;
        }
        hand.forEach((name, i) => {
            const card = this.takeFromOutside((c) => c.internalName === name);
            if (!card) {
                this.errors.push({ path: `${this.path}.hand[${i}]`, message: `Card '${name}' is not available to place in hand` });
                return;
            }
            card.moveTo(ZoneName.Hand);
        });
    }

    private applyDiscard(discard: string[] | undefined): void {
        if (discard === undefined) {
            return;
        }
        // Reverse so first-listed ends up on top of the discard pile.
        [...discard].reverse().forEach((name, idx) => {
            const realIdx = discard.length - 1 - idx;
            const card = this.takeFromOutside((c) => c.internalName === name);
            if (!card) {
                this.errors.push({ path: `${this.path}.discard[${realIdx}]`, message: `Card '${name}' is not available to place in discard` });
                return;
            }
            card.moveTo(ZoneName.Discard);
        });
    }

    private applyDeck(deck: string[] | undefined): void {
        if (deck === undefined) {
            // Default: every card still in outsideTheGame goes back into the deck (preserving original order).
            const remaining = [...this.player.outsideTheGameZone.cards].filter((c) => this.isPlayableDeckCard(c));
            for (const card of remaining) {
                card.moveTo(DeckZoneDestination.DeckBottom);
            }
            return;
        }
        // Specified deck: place named cards in order on top, leave the rest outside (effectively removed).
        [...deck].reverse().forEach((name, idx) => {
            const realIdx = deck.length - 1 - idx;
            const card = this.takeFromOutside((c) => c.internalName === name);
            if (!card) {
                this.errors.push({ path: `${this.path}.deck[${realIdx}]`, message: `Card '${name}' is not available to place in deck` });
                return;
            }
            card.moveTo(DeckZoneDestination.DeckTop);
        });
    }

    private applyForceToken(hasForce: boolean | undefined): void {
        if (hasForce === undefined) {
            return;
        }
        if (hasForce && !this.player.hasTheForce) {
            const forceTokens = this.player.outsideTheGameZone.getCards({
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                condition: (card: any) => typeof card.isForceToken === 'function' && card.isForceToken(),
            });
            if (forceTokens.length === 0) {
                this.errors.push({ path: `${this.path}.hasForceToken`, message: 'No Force token available for this player' });
                return;
            }
            forceTokens[0].moveTo(ZoneName.Base);
        } else if (!hasForce && this.player.hasTheForce) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const forceToken = (this.player.baseZone as any)?.forceToken;
            if (forceToken) {
                forceToken.moveTo(ZoneName.OutsideTheGame);
            }
        }
    }

    private applyCredits(credits: number | undefined): void {
        if (credits === undefined) {
            return;
        }
        const current = this.player.creditTokenCount;
        if (credits === current) {
            return;
        }
        if (credits < current) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const tokens = (this.player.baseZone as any)?.credits?.slice(0, current - credits) ?? [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            for (const token of tokens) {
                token.moveTo(ZoneName.OutsideTheGame);
            }
            return;
        }
        const toAdd = credits - current;
        for (let i = 0; i < toAdd; i++) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const token = this.game.generateToken(this.player, 'credit' as any);
            token.moveTo(ZoneName.Base);
        }
    }

    private attachUpgrades(parentPath: string, target: InPlayCard, upgrades: CardEntry[]): void {
        upgrades.forEach((u, i) => {
            const upgradePath = `${parentPath}.upgrades[${i}]`;
            const name = typeof u === 'string' ? u : u.card;

            let upgradeCard: InPlayCard | undefined;
            if (isTokenUpgradeName(name)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                upgradeCard = this.game.generateToken(this.player, name as any) as InPlayCard;
            } else {
                upgradeCard = this.takeFromOutside((c) => c.internalName === name) as InPlayCard | undefined;
            }
            if (!upgradeCard) {
                this.errors.push({ path: upgradePath, message: `Upgrade '${name}' is not available` });
                return;
            }
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (upgradeCard as any).attachTo(target);
            } catch (err) {
                this.errors.push({ path: upgradePath, message: `Failed to attach '${name}': ${(err as Error).message}` });
            }
        });
    }

    /**
     * Pulls one card matching `predicate` from the outside-the-game staging
     * zone and returns it (still in outsideTheGame at this point — the caller
     * moves it to the desired destination via `card.moveTo`).
     */
    private takeFromOutside(predicate: (card: Card) => boolean): Card | undefined {
        const candidates = this.player.outsideTheGameZone.cards;
        return candidates.find((c) => this.isPlayableDeckCard(c) && predicate(c));
    }

    private isPlayableDeckCard(card: Card): boolean {
        // Filter out tokens (force, credit) that share outsideTheGame with deck cards during setup.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isToken = typeof (card as any).isToken === 'function' && (card as any).isToken();
        return !isToken;
    }
}
