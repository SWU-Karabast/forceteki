import type { ParsedUrlQuery } from 'node:querystring';

import type { IRawGameSocket, SocketData } from '../../../server/gamenode/GameServer';

/** An outbound emit the fake socket recorded, as the client side would have observed it. */
export interface IFakeEmittedEvent {
    event: string;
    args: any[];

    /**
     * If the emit included a trailing function argument (an acknowledgement request), this is it,
     * with the ack-callback argument itself removed from {@link args}. A real client only triggers
     * the server's ack callback if it explicitly invokes the function its own listener receives -
     * most of this codebase's listeners do not, so the harness defaults to leaving acks unfired and
     * a test opts in explicitly via {@link FakeIoSocket.ackEvent} when it wants to simulate a client
     * that does.
     */
    ack?: (...args: any[]) => void;
}

let nextFakeSocketId = 1;

/**
 * An in-process stand-in for a socket.io `Socket`, implementing just the surface the game node
 * depends on ({@link IRawGameSocket}, which is also everything `server/socket.js`'s `Socket` wrapper
 * needs). Used to run the real authentication and connection-handling code
 * (`GameServer.authenticateSocketAsync` / `handleSocketConnectionAsync` / `onConnectionAsync`, and
 * everything `Lobby` registers on the socket afterwards) without a real network connection.
 *
 * Two independent directions of traffic are modelled:
 *
 * - **Inbound** (client -> server): production code calls {@link on} to register a handler for an
 *   event sent by the client (`'game'`, `'lobby'`, `'disconnect'`, `'manualDisconnect'`, `'requeue'`).
 *   A test drives this traffic with {@link simulateClientEmit}, which looks up and invokes whatever
 *   was registered - exactly as a real socket.io socket would dispatch an incoming packet to the
 *   handler the server code registered.
 *
 * - **Outbound** (server -> client): production code calls {@link emit} to send data to the client.
 *   Rather than really transmitting anything, this just records the call in {@link emittedEvents} for
 *   a test (via `TestClient`'s inbox) to read back.
 */
export class FakeIoSocket implements IRawGameSocket {
    public readonly id: string;
    public data: SocketData = {};
    public handshake: { auth: { token?: string }; query: ParsedUrlQuery };

    private _connected = true;
    private readonly inboundListeners = new Map<string, ((...args: any[]) => void)[]>();
    private readonly joinedRooms = new Set<string>();
    private readonly _emittedEvents: IFakeEmittedEvent[] = [];
    private pendingDisconnectDispatch: Promise<void> | null = null;

    public constructor(handshake: { auth?: { token?: string }; query: ParsedUrlQuery }) {
        this.id = `fake-socket-${nextFakeSocketId++}`;
        this.handshake = { auth: handshake.auth ?? {}, query: handshake.query };
    }

    public get connected(): boolean {
        return this._connected;
    }

    /** Every outbound emit recorded so far, in order. */
    public get emittedEvents(): readonly IFakeEmittedEvent[] {
        return this._emittedEvents;
    }

    public emit(event: string, ...args: any[]): boolean {
        if (!this._connected) {
            return false;
        }

        let ack: ((...ackArgs: any[]) => void) | undefined;
        if (args.length > 0 && typeof args[args.length - 1] === 'function') {
            ack = args.pop();
        }

        this._emittedEvents.push({ event, args, ack });
        return true;
    }

    public on(event: string, listener: (...args: any[]) => void): this {
        if (!this.inboundListeners.has(event)) {
            this.inboundListeners.set(event, []);
        }
        this.inboundListeners.get(event).push(listener);
        return this;
    }

    public removeAllListeners(event?: string): this {
        if (event === undefined) {
            this.inboundListeners.clear();
        } else {
            this.inboundListeners.delete(event);
        }
        return this;
    }

    public eventNames(): (string | symbol)[] {
        return Array.from(this.inboundListeners.keys()).filter((event) => this.inboundListeners.get(event).length > 0);
    }

    public join(room: string): any {
        this.joinedRooms.add(room);
    }

    public leave(room: string): any {
        this.joinedRooms.delete(room);
    }

    public disconnect(_close?: boolean): this {
        if (!this._connected) {
            return this;
        }

        this._connected = false;

        // real socket.io's `.disconnect()` is synchronous too; the dispatch this triggers for any
        // registered 'disconnect' listener (e.g. `GameServer.onSocketDisconnected`) is captured so a
        // test can await it deterministically via `waitForDisconnectHandlingAsync` rather than
        // guessing how many microtask turns it needs.
        this.pendingDisconnectDispatch = this.simulateClientEmit('disconnect', 'server namespace disconnect');
        return this;
    }

    /** Resolves once the async dispatch triggered by the most recent {@link disconnect} has settled. */
    public async waitForDisconnectHandlingAsync(): Promise<void> {
        await (this.pendingDisconnectDispatch ?? Promise.resolve());
    }

    /**
     * Simulates the client sending `event` with `args`, dispatching to every handler production code
     * registered via {@link on}. This is how a test drives inbound traffic - e.g. a `TestClient`
     * sending a lobby command calls `fakeSocket.simulateClientEmit('lobby', 'sendChatMessage', 'hi')`,
     * which invokes the handler `Lobby.addLobbyUserAsync` registered for the `'lobby'` event.
     *
     * Real socket.io handler registration can be asynchronous (`Socket.registerEvent` in
     * `server/socket.js` wraps the callback in an `async` function), so any listener's returned
     * promise is awaited here - a test that awaits this method sees the handler's effects settled.
     */
    public async simulateClientEmit(event: string, ...args: any[]): Promise<void> {
        const listeners = this.inboundListeners.get(event) ?? [];
        for (const listener of listeners) {
            await listener(...args);
        }
    }

    /**
     * Fires the acknowledgement callback for the most recent emit of `event` that included one and
     * has not already been acked, as if a client had explicitly called back. Throws if there is none,
     * since a test that asks for this almost always wants to know the ack was actually there to fire.
     */
    public ackEvent(event: string, ...ackArgs: any[]): void {
        for (let i = this._emittedEvents.length - 1; i >= 0; i--) {
            const emitted = this._emittedEvents[i];
            if (emitted.event === event && emitted.ack) {
                const ack = emitted.ack;
                emitted.ack = undefined;
                ack(...ackArgs);
                return;
            }
        }

        throw new Error(`FakeIoSocket: no un-acked emit of '${event}' found to acknowledge`);
    }
}
