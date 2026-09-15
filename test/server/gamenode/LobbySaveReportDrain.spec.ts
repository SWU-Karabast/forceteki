/* global describe, it, expect, jasmine */
import { Lobby, MatchmakingType } from '../../../server/gamenode/Lobby';
import { CardPool, GameErrorSeverity, GamesToWinMode, SwuGameFormat } from '../../../server/game/core/Constants';
import { ReportType } from '../../../server/game/Interfaces';

/**
 * Whitebox coverage of `Lobby`'s pending save-report drain surface (P2-D, `submitReport` /
 * `finishReportSubmission` / `onArmedSaveFired` / `drainPendingSaveReports`), added per implementation
 * review finding `P2D-R0-10`: no lighter seam exists to exercise this control flow without a full
 * socket-driven `Game`, and TypeScript does not enforce `private` through bracket/index access
 * (`dot-notation` is not enabled in this repo's eslint config), so this constructs a real `Lobby` via its
 * public constructor with a stub `DiscordDispatcher` and stub sockets, and reaches private members by
 * name. Not a Jasmine `integration()` spec -- no `Game` is driven here at all, except via a stub.
 */
describe('Lobby pending save-report drain', function() {
    function buildLobby() {
        const discordDispatcher = jasmine.createSpyObj('discordDispatcher', ['formatReport', 'formatAndSendReportAsync', 'formatAndSendServerErrorAsync']);
        discordDispatcher.formatReport.and.returnValue({});
        discordDispatcher.formatAndSendReportAsync.and.resolveTo(true);
        discordDispatcher.formatAndSendServerErrorAsync.and.resolveTo(undefined);

        const lobby = new Lobby(
            'Test Lobby',
            MatchmakingType.PrivateLobby,
            SwuGameFormat.Open,
            GamesToWinMode.BestOfOne,
            CardPool.Unlimited,
            {} as any,
            {} as any,
            null as any,
            discordDispatcher
        );

        return { lobby: lobby as any, discordDispatcher };
    }

    function buildStubSocket(userId: string, username: string) {
        return {
            send: jasmine.createSpy('send'),
            user: { id: userId, getId: () => userId, getUsername: () => username },
        } as any;
    }

    function buildPendingReport(socket: any, overrides: Record<string, unknown> = {}) {
        return {
            socket,
            reportType: ReportType.BugReport,
            parsedDescription: 'it broke',
            playerReportType: null,
            screenResolution: null,
            viewport: null,
            gameState: { phase: 'action', player1: {}, player2: {} },
            gameMessages: [],
            chatMessages: undefined,
            opponent: { id: 'opponent-id', username: 'Opponent' },
            ...overrides,
        };
    }

    // Flushes the microtask queue enough times for the fire-and-forget `finishReportSubmission(...)
    // .catch(...)` chains started by `onArmedSaveFired`/`drainPendingSaveReports` to settle.
    async function flushAsync() {
        for (let i = 0; i < 4; i++) {
            await Promise.resolve();
        }
    }

    it('onArmedSaveCleared drains two pending entries and acks neither a second time', async function() {
        const { lobby, discordDispatcher } = buildLobby();
        const socket1 = buildStubSocket('u1', 'Alice');
        const socket2 = buildStubSocket('u2', 'Bob');

        lobby.pendingSaveReports.set('u1', buildPendingReport(socket1));
        lobby.pendingSaveReports.set('u2', buildPendingReport(socket2));

        const settings = lobby.buildGameSettings();
        settings.onArmedSaveCleared();
        await flushAsync();

        expect(lobby.pendingSaveReports.size).toBe(0);
        // Each pending report's client was already acked 'pending' at request time (not simulated here);
        // the drain itself (ackClient: false) must not send a second ack.
        expect(socket1.send).not.toHaveBeenCalled();
        expect(socket2.send).not.toHaveBeenCalled();
        expect(discordDispatcher.formatAndSendReportAsync).toHaveBeenCalledTimes(2);
    });

    it('onArmedSaveFired degrades to unavailable and never throws out of the callback when the save fails', async function() {
        const { lobby, discordDispatcher } = buildLobby();
        // A stub missing only getPlayers, so MatchSerializer.save(...) throws immediately while
        // finishReportSubmission's other, unrelated `this.game?.` reads still resolve normally.
        lobby.game = { snapshotManager: { gameStepsSinceLastUndo: 0 }, id: 'game-x', addAlert: () => { /* no-op */ } };
        const socket = buildStubSocket('u1', 'Alice');
        lobby.pendingSaveReports.set('u1', buildPendingReport(socket));

        const settings = lobby.buildGameSettings();
        expect(() => settings.onArmedSaveFired({ requestedAtActionNumber: 3, requestedAtPhase: 'action' })).not.toThrow();
        await flushAsync();

        expect(lobby.pendingSaveReports.size).toBe(0);
        expect(discordDispatcher.formatAndSendReportAsync).toHaveBeenCalledTimes(1);
    });

    it('onArmedSaveFired is a no-op when nothing is pending (never builds a save for nothing)', function() {
        const { lobby, discordDispatcher } = buildLobby();
        const saveGame = jasmine.createSpyObj('game', ['getPlayers']);
        lobby.game = saveGame;

        const settings = lobby.buildGameSettings();
        settings.onArmedSaveFired({ requestedAtActionNumber: 1, requestedAtPhase: 'action' });

        expect(saveGame.getPlayers).not.toHaveBeenCalled();
        expect(discordDispatcher.formatAndSendReportAsync).not.toHaveBeenCalled();
    });

    it('degrades (rather than refusing) a second save-requesting report while one is already pending, so its description is not lost', async function() {
        const { lobby, discordDispatcher } = buildLobby();
        const firstSocket = buildStubSocket('u1', 'Alice');
        lobby.pendingSaveReports.set('u1', buildPendingReport(firstSocket, { parsedDescription: 'first report' }));

        const secondSocket = buildStubSocket('u1', 'Alice');
        lobby.game = {
            captureGameState: () => ({ phase: 'action', player1: {}, player2: {} }),
            getPlayers: () => [{ id: 'u1', user: { username: 'Alice' } }, { id: 'opponent-id', user: { username: 'Opponent' } }],
            getLogMessages: () => [],
            snapshotManager: { gameStepsSinceLastUndo: 0 },
            id: 'game-1',
            addAlert: jasmine.createSpy('addAlert'),
            armedSave: { request: jasmine.createSpy('request') },
        };

        await lobby.submitReport(secondSocket, 'bugReport', 'second report, please do not lose me', null, true);

        // The original pending entry is untouched; the second request was degraded, not queued.
        expect(lobby.pendingSaveReports.size).toBe(1);
        expect(lobby.pendingSaveReports.get('u1').parsedDescription).toBe('first report');
        // requestSave() must never be consulted for a user id that already has a pending report.
        expect(lobby.game.armedSave.request).not.toHaveBeenCalled();

        expect(discordDispatcher.formatAndSendReportAsync).toHaveBeenCalledTimes(1);
        const [sentReport] = discordDispatcher.formatReport.calls.mostRecent().args;
        expect(sentReport).toBe('second report, please do not lose me');
        expect(secondSocket.send).toHaveBeenCalledOnceWith('bugReportResult', jasmine.objectContaining({ success: true, saveStatus: 'unavailable' }));
    });

    it('finishReportSubmission never rejects when the Discord post reports failure, and only acks when ackClient is true', async function() {
        const { lobby, discordDispatcher } = buildLobby();
        discordDispatcher.formatAndSendReportAsync.and.resolveTo(false);

        const ackedSocket = buildStubSocket('u1', 'Alice');
        await expectAsync(
            lobby.finishReportSubmission({ ...buildPendingReport(ackedSocket), savedMatch: null, saveStatus: 'unavailable', ackClient: true })
        ).toBeResolved();
        expect(ackedSocket.send).toHaveBeenCalledOnceWith('bugReportResult', jasmine.objectContaining({ success: false }));

        const deferredSocket = buildStubSocket('u2', 'Bob');
        await expectAsync(
            lobby.finishReportSubmission({ ...buildPendingReport(deferredSocket), savedMatch: null, saveStatus: 'unavailable', ackClient: false })
        ).toBeResolved();
        expect(deferredSocket.send).not.toHaveBeenCalled();
    });

    // P2D-I1-01's named falsifiers: `onLobbyMessage` has no command allowlist and dispatches by name to
    // `this[command](socket, ...args)`, so a client-emitted `lobby:onArmedSaveFired` /
    // `lobby:drainPendingSaveReports` calls these `private` handlers with the caller's own `Socket` bound
    // to the first parameter, never a real `IArmedSaveRequestInfo` / the literal `'unavailable'`. Both
    // must reject that shape rather than acting on it.
    describe('client-dispatch containment (P2D-I1-01)', function() {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const matchSerializer = require('../../../server/game/core/stateSerialization/MatchSerializer');

        // onLobbyMessage's first step is `updateUserLastActivity`, which requires the calling socket's
        // user to already be registered in `lobby.users` (else it throws, caught and logged by
        // onLobbyMessage itself, and the dispatched handler is never reached at all -- which would make
        // these assertions pass vacuously without ever exercising the shape guard being tested).
        function seatUser(lobby: any, socket: any) {
            // A separate, minimal wrapper socket for `sendLobbyState` (called after every dispatched
            // command) to read -- `connected: false` so it skips actually sending, without needing the
            // dispatch-time stub socket above to carry unrelated Socket.IO shape.
            lobby.users = [{ id: socket.user.id, username: socket.user.getUsername(), socket: { send: () => { /* no-op */ }, socket: { connected: false } }, state: 'connected' }];
        }

        it('a client-dispatched onArmedSaveFired does not build or ship a save', async function() {
            const { lobby } = buildLobby();
            const saveSpy = spyOn(matchSerializer, 'save');
            const socket = buildStubSocket('u1', 'Alice');
            seatUser(lobby, socket);
            lobby.pendingSaveReports.set('u1', buildPendingReport(socket));
            // `onPlayerAction` is read by `updateUserLastActivity`, which onLobbyMessage calls before
            // dispatching -- must be present or that call throws and the handler under test is never
            // reached at all, which would make this test pass vacuously.
            lobby.game = { getPlayers: () => [], onPlayerAction: () => { /* no-op */ } };

            // Mirrors exactly what onLobbyMessage does: `this[command](socket, ...args)`, with no
            // client-supplied args, so `trigger` is bound to `socket` itself.
            await lobby['onLobbyMessage'](socket, 'onArmedSaveFired');

            expect(saveSpy).not.toHaveBeenCalled();
            expect(lobby.pendingSaveReports.size).toBe(1);
            // Positive control (P2D-D1-01): proves onLobbyMessage actually reached and completed
            // dispatch -- updateUserLastActivity runs immediately before `this[command](socket, ...args)`
            // -- rather than the assertions above passing vacuously because updateUserLastActivity threw
            // and the handler under test was never entered.
            expect(lobby.userLastActivity.has('u1')).toBeTrue();
        });

        it('a client-dispatched drainPendingSaveReports does not discard a pending report', async function() {
            const { lobby } = buildLobby();
            const socket = buildStubSocket('u1', 'Alice');
            seatUser(lobby, socket);
            lobby.pendingSaveReports.set('u1', buildPendingReport(socket));

            await lobby['onLobbyMessage'](socket, 'drainPendingSaveReports');

            expect(lobby.pendingSaveReports.size).toBe(1);
            // Positive control (P2D-D1-01): see above.
            expect(lobby.userLastActivity.has('u1')).toBeTrue();
        });
    });

    // P2D-I1-02's regression coverage: the halt paths must clear `Game._armedSaveRequest`, not just
    // empty `pendingSaveReports`, or a later report's `??=` coalesces onto the stale trigger. Also covers
    // P2D-I1-04: without these cases, deleting the halt-path drain call sites leaves the suite green.
    describe('halt-path drain also clears the armed request (P2D-I1-02, P2D-I1-04)', function() {
        function buildHaltGame(socket: any) {
            return {
                getPlayers: () => [{ id: 'u1' }, { id: 'opponent-id' }],
                captureGameState: () => ({ phase: 'action', player1: {}, player2: {} }),
                getLogMessages: () => [],
                gameStepsSinceLastUndo: 0,
                // Required by finishReportSubmission's `this.game?.snapshotManager.gameStepsSinceLastUndo`
                // read (P2D-D1-02) -- without this, that read throws a TypeError before
                // formatAndSendReportAsync is ever called, the rejection is silently absorbed by
                // finishReportSubmission's own .catch, and the two halt-path tests below would pass
                // unchanged even if the drained report never shipped.
                snapshotManager: { gameStepsSinceLastUndo: 0 },
                id: 'game-halt',
                addMessage: () => { /* no-op */ },
                // finishReportSubmission's bug-report branch calls this.game?.addAlert(...) after a
                // successful Discord post; without it, now that snapshotManager lets the call reach that
                // far, the drain would throw a spurious TypeError (caught and merely logged) instead of
                // completing cleanly.
                addAlert: () => { /* no-op */ },
                armedSave: { clear: jasmine.createSpy('clear') },
            };
        }

        it('handleError\'s SevereHaltGame branch clears armedSave and drains pending reports', async function() {
            const { lobby, discordDispatcher } = buildLobby();
            const socket = buildStubSocket('u1', 'Alice');
            lobby.pendingSaveReports.set('u1', buildPendingReport(socket));
            const game = buildHaltGame(socket);
            lobby.game = game;

            expect(() => lobby.handleError(game, new Error('boom'), GameErrorSeverity.SevereHaltGame)).toThrow();
            await flushAsync();

            expect(game.armedSave.clear).toHaveBeenCalledTimes(1);
            expect(lobby.pendingSaveReports.size).toBe(0);
            // Proves the drained report actually reached Discord, not just that the map emptied
            // (P2D-D1-02).
            expect(discordDispatcher.formatAndSendReportAsync).toHaveBeenCalledTimes(1);
        });

        it('handleSerializationFailure clears armedSave and drains pending reports', async function() {
            const { lobby, discordDispatcher } = buildLobby();
            discordDispatcher.formatAndSendServerErrorAsync = jasmine.createSpy('formatAndSendServerErrorAsync').and.resolveTo(undefined);
            const socket = buildStubSocket('u1', 'Alice');
            lobby.pendingSaveReports.set('u1', buildPendingReport(socket));
            const game = buildHaltGame(socket);
            lobby.game = game;

            expect(() => lobby.handleSerializationFailure(game, new Error('serialization boom'))).toThrow();
            await flushAsync();

            expect(game.armedSave.clear).toHaveBeenCalledTimes(1);
            expect(lobby.pendingSaveReports.size).toBe(0);
            // Proves the drained report actually reached Discord, not just that the map emptied
            // (P2D-D1-02).
            expect(discordDispatcher.formatAndSendReportAsync).toHaveBeenCalledTimes(1);
        });
    });

    // P2D-I1-06: the disconnect clear condition (3/4) is the only one of the four with no direct test --
    // `ArmedSaveTrigger.spec.ts` covers phase-exit, game-end and rollback via a real `Game`, but this
    // condition lives on `Lobby.setUserDisconnected`, which needs a `Lobby`, not just a `Game`.
    it('setUserDisconnected clears an armed request for the disconnecting player (P2D-I1-06)', function() {
        const { lobby } = buildLobby();
        const clear = jasmine.createSpy('clear');
        lobby.game = { armedSave: { clear } };
        lobby.users = [{ id: 'u1', username: 'Alice', socket: { id: 'sock-1' }, state: 'connected' }] as any;

        lobby.setUserDisconnected('u1', 'sock-1');

        expect(clear).toHaveBeenCalledTimes(1);
    });

    it('setUserDisconnected does not clear when the socket id does not match (stale/superseded socket)', function() {
        const { lobby } = buildLobby();
        const clear = jasmine.createSpy('clear');
        lobby.game = { armedSave: { clear } };
        lobby.users = [{ id: 'u1', username: 'Alice', socket: { id: 'sock-current' }, state: 'connected' }] as any;

        lobby.setUserDisconnected('u1', 'sock-stale');

        expect(clear).not.toHaveBeenCalled();
    });
});
