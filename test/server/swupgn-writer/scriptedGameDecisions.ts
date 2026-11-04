import fs from 'fs';
import type { Game } from '../../../server/game/core/Game';

/**
 * The decision log of the scripted games, for workload L of the SWU-PGN writer benchmark
 * (`test/server/gamenode/lobby/SwuPgnLobbyBenchmark.spec.ts`): each game's setup and seed, and every player decision it
 * made, as the game command the client would send over its socket. The scripted games choose adaptively from the
 * integration harness's view of the game, which a Lobby game driven through sockets does not have, so the decisions are
 * taken once here and replayed there: the same games, the same commands.
 *
 * Written when `SWUPGN_DECISION_LOG` names a file (`ScriptedGames.spec.ts`); the benchmark script sets it.
 */
export interface IScriptedGameDecision {

    /** The seat that sends it: 1 for the first player, 2 for the second. */
    seat: 1 | 2;

    /** The `game` socket command (`Lobby.onGameMessage`): a `Game` method, called with the sender's id first. */
    command: string;

    /** The arguments after the player id. */
    args: unknown[];

    /** The sender's prompt uuid when it was sent: any argument equal to it is the current prompt's uuid on replay. */
    promptUuid: string;

    /**
     * Set on the answer to the coin flip's prompt (who starts with initiative), which the flip gives to a random seat
     * before the game is seeded: the seat the answer gave initiative to. A replay answers from whichever seat won its
     * own flip, choosing the same seat.
     */
    initiativeSeat?: 1 | 2;
}

/** The title of the coin flip's prompt (`SetupPhase.chooseFirstPlayer`). */
export const coinFlipPromptTitle = 'You won the flip';

export interface IScriptedGameLog {
    setup: SwuSetupTestOptions;
    seed: string;
    decisions: IScriptedGameDecision[];

    /** The number of chat log messages at the end: a replay that made the same game ends with as many. */
    messages: number;

    /** The final board in counts, from the first seat's game state: a replay that made the same game ends on the same one. */
    fingerprint?: IScriptedGameFingerprint;
}

/** Per seat: base damage and the size of each zone; with the phase and the winners. */
export interface IScriptedGameFingerprint {
    phase: string;
    winners: string[];
    seats: { baseDamage: number; deck: number; hand: number; discard: number; resources: number; ground: number; space: number }[];
}

interface IFingerprintedPlayerState {
    base?: { damage?: number };
    numCardsInDeck?: number;
    cardPiles?: Record<string, unknown[] | undefined>;
}

/**
 * The fingerprint of a game state as `Game.getState` builds it for a client (or as the client received it), with the
 * seats' player ids in seat order. Winners are given by seat, since the two runs name their players differently.
 */
export function fingerprintOf(
    state: { phase?: string; winners?: readonly string[]; players?: Record<string, IFingerprintedPlayerState> },
    playerIds: readonly string[],
    playerNames: readonly string[]
): IScriptedGameFingerprint {
    const count = (player: IFingerprintedPlayerState, pile: string) => player.cardPiles?.[pile]?.length ?? 0;
    return {
        phase: state.phase ?? '',
        winners: (state.winners ?? []).map((name) => `seat ${playerNames.indexOf(name) + 1}`),
        seats: playerIds.map((id) => {
            const player = state.players?.[id] ?? {};
            return {
                baseDamage: player.base?.damage ?? 0,
                deck: player.numCardsInDeck ?? 0,
                hand: count(player, 'hand'),
                discard: count(player, 'discard'),
                resources: count(player, 'resources'),
                ground: count(player, 'groundArena'),
                space: count(player, 'spaceArena')
            };
        })
    };
}

/** The fingerprint of a finished scripted game, read through the first seat's game state. */
export function fingerprintOfGame(game: Game): IScriptedGameFingerprint {
    const players = game.getPlayers();
    return fingerprintOf(game.getState(players[0].id), players.map((player) => player.id), players.map((player) => player.name));
}

/**
 * The `Game` methods the scripted games' harness calls, each one a `game` socket command a client sends (and the Lobby
 * allows: `Lobby.allowedGameCommands`).
 */
const recordedCommands = ['cardClicked', 'menuButton', 'perCardMenuButton', 'statefulPromptResults', 'concede'];

type GameCommand = (playerId: string, ...args: unknown[]) => unknown;

/** Records every player decision made on `game` into `log.decisions`, from now on. */
export function recordDecisions(game: Game, log: IScriptedGameLog): void {
    const [first, second] = game.getPlayers();
    for (const command of recordedCommands) {
        const method: GameCommand = Reflect.get(game, command);
        Reflect.set(game, command, (playerId: string, ...args: unknown[]) => {
            if (playerId !== first.id && playerId !== second.id) {
                throw new Error(`scripted game decision log: ${command} from ${playerId}, who is no player`);
            }
            const seat = playerId === first.id ? 1 : 2;
            const prompt = game.getPlayerById(playerId).currentPrompt();
            const decision: IScriptedGameDecision = { seat, command, args: JSON.parse(JSON.stringify(args)), promptUuid: prompt.promptUuid };
            if (command === 'menuButton' && (prompt.menuTitle ?? '').startsWith(coinFlipPromptTitle)) {
                // the handler menu's choices are 'Yourself' (0) and 'Opponent' (1)
                decision.initiativeSeat = String(args[0]) === '0' ? seat : (seat === 1 ? 2 : 1);
            }
            log.decisions.push(decision);
            return method.call(game, playerId, ...args);
        });
    }
}

/** Writes the logs to `SWUPGN_DECISION_LOG`, when it is set. */
export function writeDecisionLogs(logs: Record<string, IScriptedGameLog>): void {
    const file = process.env.SWUPGN_DECISION_LOG;
    if (file) {
        fs.writeFileSync(file, JSON.stringify(logs));
    }
}
