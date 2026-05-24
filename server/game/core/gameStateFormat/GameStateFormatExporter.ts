import type { ISetId } from '../../../game/Interfaces';
import type { Game } from '../Game';
import type { Player } from '../Player';
import type { Card } from '../card/Card';
import type { IBaseCard } from '../card/BaseCard';
import type { ILeaderCard } from '../card/propertyMixins/LeaderProperties';
import type { ILeaderUnitCard } from '../card/LeaderUnitCard';
import type { IUpgradeCard } from '../card/CardInterfaces';
import type { IUnitCard } from '../card/propertyMixins/UnitProperties';
import {
    TOKEN_NAMES,
    type ActionType,
    type CardId,
    type CardEntry,
    type CapturedEntry,
    type IActionSummary,
    type IExportedBaseState,
    type IExportedCardState,
    type IExportedGameState,
    type IExportedLeaderState,
    type IExportedPlayerState,
    type IGameHistory,
    type IGameHistoryAction,
    type IGameResult,
    type ResourceEntry,
    type UpgradeEntry,
} from './GameStateFormatTypes';

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Exports the current live game position to the portable `IExportedGameState`
 * format. The result is safe to `JSON.stringify` and can be re-imported (after
 * schema validation via `validateGameState`) to recreate the board position.
 *
 * `player1` in the output corresponds to `game.getPlayers()[0]` (the lobby
 * owner); `player2` corresponds to `game.getPlayers()[1]` (the opponent).
 */
export function exportGameState(game: Game): IExportedGameState {
    const [p1, p2] = game.getPlayers();
    const players: [Player, Player] = [p1, p2];
    return {
        phase: game.currentPhase ?? undefined,
        player1: exportPlayerState(p1, game, players),
        player2: exportPlayerState(p2, game, players),
    };
}

// ── Game history ──────────────────────────────────────────────────────────────

/** Creates a new, empty {@link IGameHistory} ready to receive entries. */
export function createGameHistory(): IGameHistory {
    return { entries: [] };
}

/**
 * Seals a finished history by attaching the game result.
 * Call once when the game ends (base destroyed, concede, or timeout).
 */
export function finalizeGameHistory(history: IGameHistory, result: IGameResult): void {
    history.result = result;
}

/**
 * Builds an {@link IActionSummary} from raw action-dispatch data.
 *
 * @param type         The action type (matches `ActionType` vocabulary).
 * @param game         The live game (used to resolve player order).
 * @param actingPlayer The player who took the action — omit for engine-driven
 *                     transitions such as `phaseStart`.
 * @param sourceCard   The primary card involved (played card, attacker, ability
 *                     source, resourced card). Omit when not applicable.
 * @param targetCard   The primary target card (upgrade target, defending unit or
 *                     base, ability target). Omit when not applicable.
 */
export function exportActionSummary(
    type: ActionType,
    game: Game,
    actingPlayer?: Player,
    sourceCard?: Card,
    targetCard?: Card,
): IActionSummary {
    const players = game.getPlayers() as [Player, Player];
    const summary: IActionSummary = { type };
    if (actingPlayer !== undefined) {
        summary.actingPlayer = playerNumber(actingPlayer, players);
    }
    if (sourceCard !== undefined) {
        summary.sourceCard = cardToId(sourceCard);
    }
    if (targetCard !== undefined) {
        summary.targetCard = cardToId(targetCard);
    }
    return summary;
}

/**
 * Snapshots the current live game position into an {@link IGameHistoryAction}.
 *
 * Internally calls {@link exportGameState} and augments the resulting state
 * with `round` and `actionNumber` fields (which are omitted from standalone
 * state exports but required in history entries).
 *
 * @param game   The live game to snapshot.
 * @param seq    Monotonically increasing sequence number across the game (1-based, caller-managed).
 * @param action The action that produced this state. Omit for the initial
 *               post-setup entry (seq 1).
 */
export function exportHistoryEntry(
    game: Game,
    seq: number,
    action?: IActionSummary,
): IGameHistoryAction {
    const state = exportGameState(game);
    // Augment with history-only fields (omitted in standalone resume payloads).
    state.round = game.roundNumber;
    if (game.actionNumber > 0) {
        state.actionNumber = game.actionNumber;
    }

    const entry: IGameHistoryAction = {
        seq,
        round: game.roundNumber,
        state,
    };
    if (action !== undefined) {
        entry.action = action;
    }
    return entry;
}

// ── Player ────────────────────────────────────────────────────────────────────

function exportPlayerState(player: Player, game: Game, players: [Player, Player]): IExportedPlayerState {
    // Leader and base are always present (every player always has one).
    const state: IExportedPlayerState = {
        leader: exportLeaderState(player.leader, players),
        base: exportBaseState(player.base),
    };

    // Hand — full list, never hidden
    if (player.handZone.cards.length > 0) {
        state.hand = player.handZone.cards.map(cardToId);
    }

    // Arenas — controlled by this player, excluding attached upgrades and the
    // deployed leader (which is serialised under `leader` above).
    const groundCards = game.groundArena
        .getCards({ controller: player })
        .filter((c) => !c.isAttached() && !c.isLeaderUnit());
    if (groundCards.length > 0) {
        state.groundArena = groundCards.map((c) => exportCardEntry(c, player, players));
    }

    const spaceCards = game.spaceArena
        .getCards({ controller: player })
        .filter((c) => !c.isAttached() && !c.isLeaderUnit());
    if (spaceCards.length > 0) {
        state.spaceArena = spaceCards.map((c) => exportCardEntry(c, player, players));
    }

    // Discard
    if (player.discardZone.count > 0) {
        state.discard = player.discardZone.cards.map(cardToId);
    }

    // Full deck, top → bottom order
    if (player.deckZone.cards.length > 0) {
        state.deck = player.deckZone.cards.map(cardToId);
    }

    // Resources
    if (player.resourceZone.count > 0) {
        state.resources = player.resourceZone.cards.map((c): ResourceEntry => {
            const id = cardToId(c);
            // Only emit the object form when the resource is exhausted;
            // a bare CardId implies ready.
            if (c.isUnit() && c.exhausted) {
                return { card: id, exhausted: true };
            }
            return id;
        });
    }

    // Initiative
    if (player.hasInitiative()) {
        state.hasInitiative = true;
    }

    // Force token
    if (player.hasTheForce) {
        state.hasForceToken = true;
    }

    // Credit tokens
    if (player.creditTokenCount > 0) {
        state.credits = player.creditTokenCount;
    }

    return state;
}

// ── Leader ────────────────────────────────────────────────────────────────────

function exportLeaderState(leader: ILeaderCard, players: [Player, Player]): CardId | IExportedLeaderState {
    const id = cardToId(leader as unknown as Card);
    const state: IExportedLeaderState = { card: id };

    if (leader.isLeaderUnit()) {
        state.deployed = true;
        exportDeployedLeaderState(leader, state, players);
    } else {
        if (leader.exhausted) {
            state.exhausted = true;
        }
        // Some leaders expose a "flip" mechanic without being deployed.
        // The `flipped` property is not part of a public interface, so we access it defensively.
        const flipped: boolean = (leader as any).flipped ?? false;
        if (flipped) {
            state.flipped = true;
        }
    }

    // Track whether the deploy epic action has been spent
    // TODO: expose epicActionSpent on ILeaderCard once the mixin decorator pattern supports getter overrides on composed types.
    const epicActionSpent: boolean =
        (leader as any).deployEpicActionLimit?.isAtMax((leader as unknown as Card).owner) ?? false;
    if (epicActionSpent) {
        state.epicActionSpent = true;
    }

    // Collapse to a bare CardId when there's nothing interesting to record
    // (e.g. un-deployed leader, no damage, no exhausted state).
    const extraKeys = Object.keys(state).filter((k) => k !== 'card');
    if (extraKeys.length === 0) {
        return id;
    }
    return state;
}

function exportDeployedLeaderState(leader: ILeaderUnitCard, state: IExportedLeaderState, players: [Player, Player]): void {
    if (leader.damage > 0) {
        state.damage = leader.damage;
    }
    if (leader.exhausted) {
        state.exhausted = true;
    }
    const upgrades = exportUpgrades(leader, players);
    if (upgrades.length > 0) {
        state.upgrades = upgrades;
    }
    const capturedUnits = exportCapturedUnits(leader, players);
    if (capturedUnits.length > 0) {
        state.capturedUnits = capturedUnits;
    }
}

// ── Base ──────────────────────────────────────────────────────────────────────

function exportBaseState(base: IBaseCard): CardId | IExportedBaseState {
    const id = cardToId(base as unknown as Card);
    const hasDamage = base.damage > 0;
    const epicActionSpent = base.epicActionSpent;

    if (!hasDamage && !epicActionSpent) {
        return id;
    }

    const state: IExportedBaseState = { card: id };
    if (hasDamage) {
        state.damage = base.damage;
    }
    if (epicActionSpent) {
        state.epicActionSpent = true;
    }
    return state;
}

// ── In-play cards ─────────────────────────────────────────────────────────────

function exportCardEntry(card: Card, controllingPlayer: Player, players: [Player, Player]): CardEntry {
    if (!card.isUnit()) {
        // Non-unit in-play cards (shouldn't normally appear in arena, but be safe)
        return cardToId(card);
    }

    const unit = card as IUnitCard;
    const hasDamage = unit.damage > 0;
    const isExhausted = unit.exhausted;
    const upgrades = exportUpgrades(unit, players);
    const capturedUnits = exportCapturedUnits(unit, players);
    const ownerDiffers = unit.owner !== controllingPlayer;

    if (!hasDamage && !isExhausted && upgrades.length === 0 && capturedUnits.length === 0 && !ownerDiffers) {
        return cardToId(card);
    }

    const state: IExportedCardState = { card: cardToId(card) };

    if (hasDamage) {
        state.damage = unit.damage;
    }
    if (isExhausted) {
        state.exhausted = true;
    }
    if (upgrades.length > 0) {
        state.upgrades = upgrades;
    }
    if (capturedUnits.length > 0) {
        state.capturedUnits = capturedUnits;
    }
    // `owner` records who originally owns the card when control has been
    // transferred (e.g. via a "take control" effect).
    if (ownerDiffers) {
        state.owner = playerNumber(unit.owner, players);
    }

    return state;
}

// ── Upgrades ──────────────────────────────────────────────────────────────────

function exportUpgrades(card: IUnitCard, players: [Player, Player]): UpgradeEntry[] {
    if (!card.isUpgraded()) {
        return [];
    }
    return card.upgrades.map((upgrade: IUpgradeCard): UpgradeEntry => {
        const upgradeCard = upgrade as unknown as Card;
        const id = cardToId(upgradeCard);
        const { owner, controller } = upgradeCard;
        // Emit owner/controller player numbers only when they differ from each
        // other (e.g. one player's upgrade attached to the other's unit).
        if (!owner || !controller || owner === controller) {
            return id;
        }
        return {
            card: id,
            owner: playerNumber(owner, players),
            controller: playerNumber(controller, players),
        };
    });
}

// ── Captured units ────────────────────────────────────────────────────────────

function exportCapturedUnits(card: IUnitCard | IBaseCard, players: [Player, Player]): CapturedEntry[] {
    if (!('capturedUnits' in card) || card.capturedUnits.length === 0) {
        return [];
    }
    return card.capturedUnits.map((captured): CapturedEntry => {
        const capturedCard = captured as unknown as Card;
        return {
            card: cardToId(capturedCard),
            owner: playerNumber(capturedCard.owner, players),
        };
    });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const TOKEN_NAME_SET = new Set<string>(TOKEN_NAMES);

/**
 * Returns the canonical `CardId` for a card instance.
 *
 * - Token cards have no set codes and are returned as their `internalName`
 *   slug (e.g. `"shield"`, `"clone-trooper"`).
 * - All other cards are returned as a formatted set-code string derived from
 *   `card.setId`, which reflects the specific printing used to build this
 *   card instance (e.g. `"SOR_001"`, `"ASH_209"`).
 */
function cardToId(card: Card): CardId {
    if (card.isToken()) {
        return card.internalName as CardId;
    }
    return formatSetId(card.setId);
}

/**
 * Formats an `ISetId` as the canonical set-code string.
 * Numbers are zero-padded to at least three digits: `{ set: "SOR", number: 1 }`
 * → `"SOR_001"`.
 */
function formatSetId(setId: ISetId): string {
    return `${setId.set}_${String(setId.number).padStart(3, '0')}`;
}

/**
 * Returns the player number (1 or 2) for a given player, based on the ordered
 * pair from `game.getPlayers()`. Player 1 is the lobby owner; player 2 is the
 * opponent.
 */
function playerNumber(player: Player, players: [Player, Player]): 1 | 2 {
    return player === players[0] ? 1 : 2;
}
