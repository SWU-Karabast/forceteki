import type { ISerializedMessage } from '../game/Interfaces';
import { ChatObjectType } from '../game/core/Constants';

/** How a spectator sees one of the players: by seat, never by account. */
export interface ISpectatorSeat {

    /** Stands in for the player's account id everywhere it appears. */
    id: string;

    /** Stands in for the player's username. */
    name: string;
}

/** The parts of a game a {@link SpectatorView} reads: its players, in seat order. */
export interface ISpectatedGame {
    getPlayers(): readonly { id: string; name: string }[];
}

/**
 * What a spectator is sent, built from what the players are sent. A spectator sees each player by seat ("Player 1",
 * "Player 2"), never by name, user id or cosmetics, so that nobody can link a game they watched to an account.
 *
 * The Lobby sends a spectator nothing that has not been through here, and the state captures record the spectator's
 * state through here too, so the captures stay the record of what a spectator receives.
 *
 * Every value is copied, never changed in place: the game's messages are shared with the players' states.
 */
export class SpectatorView {
    private readonly seatsByPlayerId = new Map<string, ISpectatorSeat>();
    private readonly seatsByName = new Map<string, ISpectatorSeat>();

    private constructor(players: readonly { id: string; name: string }[]) {
        players.forEach((player, index) => {
            const seat = SpectatorView.seatAt(index);
            this.seatsByPlayerId.set(player.id, seat);

            // TODO: the game records its winners only by name, so when both players share a name `winners` can't tell
            // them apart. Keeping the first seat matches how the Lobby credits that win (`recordGameResult`); map
            // winners by id once the engine records them that way (#3219)
            if (!this.seatsByName.has(player.name)) {
                this.seatsByName.set(player.name, seat);
            }
        });
    }

    /** The seat of the player at `index` (from 0) in the order the game lists its players. */
    public static seatAt(index: number): ISpectatorSeat {
        return { id: `player-${index + 1}`, name: `Player ${index + 1}` };
    }

    /**
     * The view of `game`, with seats in the order the game lists its players (the order the client numbers them in).
     * Between games, the view of the last game still seats its players, so the score is told by the same seats.
     */
    public static of(game: ISpectatedGame): SpectatorView {
        return new SpectatorView(game.getPlayers());
    }

    /** A `gamestate` for a spectator, from `Game.getState` for that spectator. */
    public gameState(state: Record<string, any>): Record<string, any> {
        const projected = this.withSeatIds(state) as Record<string, any>;

        for (const [playerId, seat] of this.seatsByPlayerId) {
            const player = projected.players?.[seat.id];
            if (player && state.players?.[playerId]) {
                player.name = seat.name;
                player.user = { id: seat.id, username: seat.name };
            }
        }

        if (Array.isArray(state.winners)) {
            projected.winners = state.winners.map((name: string) => this.seatsByName.get(name)?.name ?? name);
        }

        return projected;
    }

    /** Game log entries for a spectator, as `retransmitGameMessages` sends them. */
    public messages(messages: readonly ISerializedMessage[]): ISerializedMessage[] {
        return this.withSeatIds(messages) as ISerializedMessage[];
    }

    /**
     * A `lobbystate` for a spectator, from `Lobby.getLobbyState` with no user. A spectator takes no part in the lobby
     * (no decks, no lobby chat, no settings, no rematch), so it is sent only the facts its client reads while
     * watching: whether a game is on and what kind of game it is, and the score so far, by seat. Anything added to
     * the lobby state reaches a spectator only once it is added here.
     */
    public lobbyState(lobbyState: Record<string, any>): Record<string, unknown> {
        return {
            id: lobbyState.id,
            gameOngoing: lobbyState.gameOngoing,
            gameType: lobbyState.gameType,
            gameFormat: lobbyState.gameFormat,
            cardPool: lobbyState.cardPool,
            isPrivate: lobbyState.isPrivate,
            winHistory: this.winHistory(lobbyState.winHistory),
            settings: { allowSpectators: lobbyState.settings?.allowSpectators },

            // the client reads these without checking they are there, so they are sent, empty
            users: [],
            gameChat: { messages: [], typingState: {} },
        };
    }

    /** A lobby's `winHistory` with the players by seat: ids as seat ids, and `playerNames` naming each seat. */
    private winHistory(winHistory: Record<string, any> | undefined): Record<string, any> | undefined {
        if (!winHistory) {
            return winHistory;
        }

        const projected = this.withSeatIds(winHistory) as Record<string, any>;
        if (projected.playerNames) {
            const seatsById = new Map([...this.seatsByPlayerId.values()].map((seat) => [seat.id, seat]));
            projected.playerNames = Object.fromEntries(
                Object.keys(projected.playerNames)
                    .filter((seatId) => seatsById.has(seatId))
                    .map((seatId) => [seatId, seatsById.get(seatId).name])
            );
        }
        return projected;
    }

    /**
     * A copy of `value` with every account id, as a value or as a key, replaced by its seat's id, and each player
     * named in a message (a `player` or `playerChat` part) named by seat. Account ids are UUIDs, so a value that
     * equals one is that id.
     */
    private withSeatIds(value: unknown): unknown {
        if (typeof value === 'string') {
            return this.seatsByPlayerId.get(value)?.id ?? value;
        }
        if (Array.isArray(value)) {
            return value.map((item) => this.withSeatIds(item));
        }
        if (value === null || typeof value !== 'object' || value instanceof Date) {
            return value;
        }

        const copy: Record<string, unknown> = {};
        for (const [key, item] of Object.entries(value)) {
            copy[this.seatsByPlayerId.get(key)?.id ?? key] = this.withSeatIds(item);
        }

        const namedPlayerSeat = SpectatorView.isPlayerPart(value) ? this.seatsByPlayerId.get(value.id) : undefined;
        if (namedPlayerSeat) {
            copy.name = namedPlayerSeat.name;
        }

        return copy;
    }

    private static isPlayerPart(value: object): value is { id: string; type: ChatObjectType } {
        const type = (value as { type?: unknown }).type;
        return (type === ChatObjectType.Player || type === ChatObjectType.PlayerChat) && typeof (value as { id?: unknown }).id === 'string';
    }
}
