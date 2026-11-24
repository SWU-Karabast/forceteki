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

    /** The view of `game`, with seats in the order the game lists its players (the order the client numbers them in). */
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
