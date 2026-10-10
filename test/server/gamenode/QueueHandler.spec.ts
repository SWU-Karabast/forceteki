import { CardPool, GamesToWinMode, MatchmakingPreference, SwuGameFormat } from '../../../server/game/core/Constants';
import type { IGameNodeConfig } from '../../../server/gamenode/GameNodeConfig';
import { MatchmakingPreferencePolicyKey } from '../../../server/gamenode/GameNodeConfig';
import type { IQueueFormatKey, QueuedPlayer } from '../../../server/gamenode/QueueHandler';
import { QueueHandler, QueuedPlayerState } from '../../../server/gamenode/QueueHandler';
import Socket from '../../../server/socket';
import { AnonymousUser } from '../../../server/utils/user/User';
import { FakeIoSocket } from '../../helpers/server/FakeIoSocket';
import { TestScheduler } from '../../helpers/server/TestScheduler';

describe('QueueHandler matchmaking preferences', function () {
    const format: IQueueFormatKey = {
        format: SwuGameFormat.Premier,
        cardPool: CardPool.Current,
        gamesToWinMode: GamesToWinMode.BestOfOne,
    };
    const config: IGameNodeConfig = {
        allowAnonymousSpectators: false,
        allowAnonymousBestOfThree: false,
        enforceRematchCooldown: true,
        actionTimersEnabled: false,
        clientBaseUrl: 'http://localhost:3000',
        metricsLoggingEnabled: false,
    };
    let clock: TestScheduler;
    let queue: QueueHandler;

    beforeEach(function () {
        clock = new TestScheduler();
        queue = new QueueHandler(clock, config);
    });

    afterEach(function () {
        queue.shutdown();
        clock.assertNoCapturedErrors();
        expect(clock.pendingTaskCount).toBe(0);
    });

    function addPlayer(
        id: string,
        matchmakingPreference?: MatchmakingPreference,
        searchStartedAt?: number,
        queueFormat = format
    ): QueuedPlayer {
        const user = new AnonymousUser(id);
        const socket = new FakeIoSocket({ query: {} });
        socket.data.user = user;
        queue.addPlayer(queueFormat, {
            user,
            socket: new Socket(socket),
            deck: { metadata: { name: 'Queue test deck', author: 'server-test' } },
            matchmakingPreference,
            searchStartedAt,
        });
        return queue.findPlayer(id).player;
    }

    describe('partner selection', function () {
        it('prefers the same preference over older no-preference and opposite-preference opponents', async function () {
            const competitive = addPlayer('competitive', MatchmakingPreference.CompetitiveTesting);
            await clock.advanceAsync(1);
            const casual = addPlayer('casual', MatchmakingPreference.CasualBrewing);
            await clock.advanceAsync(1);
            const noPreference = addPlayer('no-preference', MatchmakingPreference.NoPreference);
            await clock.advanceAsync(1);
            const samePreference = addPlayer('same-preference', MatchmakingPreference.CompetitiveTesting);
            await clock.advanceAsync(30_000);

            expect(queue.getNextMatchPair(format)).toEqual([competitive, samePreference]);
            expect(queue.findPlayer(competitive.user.getId())).toBeUndefined();
            expect(queue.findPlayer(samePreference.user.getId())).toBeUndefined();
            expect(queue.getNextMatchPair(format)).toEqual([casual, noPreference]);
        });

        it('prefers no preference over an older opposite-preference opponent', async function () {
            const competitive = addPlayer('competitive', MatchmakingPreference.CompetitiveTesting);
            await clock.advanceAsync(1);
            addPlayer('casual', MatchmakingPreference.CasualBrewing);
            await clock.advanceAsync(1);
            const noPreference = addPlayer('no-preference', MatchmakingPreference.NoPreference);
            await clock.advanceAsync(30_000);

            expect(queue.getNextMatchPair(format)).toEqual([competitive, noPreference]);
        });

        it('uses an opposite preference once both searches are unrestricted', async function () {
            const competitive = addPlayer('competitive', MatchmakingPreference.CompetitiveTesting);
            const casual = addPlayer('casual', MatchmakingPreference.CasualBrewing);
            await clock.advanceAsync(30_000);

            expect(queue.getNextMatchPair(format)).toEqual([competitive, casual]);
        });

        it('prioritizes the oldest eligible player rather than a newer same-preference pair', async function () {
            const competitive = addPlayer('competitive', MatchmakingPreference.CompetitiveTesting);
            await clock.advanceAsync(1);
            const olderCasual = addPlayer('older-casual', MatchmakingPreference.CasualBrewing);
            await clock.advanceAsync(1);
            addPlayer('newer-casual', MatchmakingPreference.CasualBrewing);
            await clock.advanceAsync(30_000);

            expect(queue.getNextMatchPair(format)).toEqual([competitive, olderCasual]);
        });

        it('breaks ties within a preference tier by search age', async function () {
            const competitive = addPlayer('competitive', MatchmakingPreference.CompetitiveTesting);
            await clock.advanceAsync(1);
            const olderOpponent = addPlayer('older-opponent', MatchmakingPreference.CompetitiveTesting);
            await clock.advanceAsync(1);
            addPlayer('newer-opponent', MatchmakingPreference.CompetitiveTesting);

            expect(queue.getNextMatchPair(format)).toEqual([competitive, olderOpponent]);
        });

        it('preserves insertion order when search timestamps are equal', function () {
            const first = addPlayer('first', MatchmakingPreference.CasualBrewing);
            const second = addPlayer('second', MatchmakingPreference.CasualBrewing);
            addPlayer('third', MatchmakingPreference.CasualBrewing);

            expect(queue.getNextMatchPair(format)).toEqual([first, second]);
        });

        it('uses oldest-first opponent selection for a no-preference player without favoring another no-preference player', async function () {
            const oldest = addPlayer('oldest', MatchmakingPreference.NoPreference);
            await clock.advanceAsync(1);
            const casual = addPlayer('casual', MatchmakingPreference.CasualBrewing);
            await clock.advanceAsync(1);
            addPlayer('no-preference', MatchmakingPreference.NoPreference);
            await clock.advanceAsync(15_000);

            expect(queue.getNextMatchPair(format)).toEqual([oldest, casual]);
        });

        it('matches later eligible players when the oldest player has no eligible opponent', function () {
            const competitive = addPlayer('competitive', MatchmakingPreference.CompetitiveTesting);
            const casual1 = addPlayer('casual-1', MatchmakingPreference.CasualBrewing);
            const casual2 = addPlayer('casual-2', MatchmakingPreference.CasualBrewing);

            expect(queue.getNextMatchPair(format)).toEqual([casual1, casual2]);
            expect(queue.findPlayer(competitive.user.getId()).player).toBe(competitive);
        });

        it('skips a same-preference opponent blocked by rematch cooldown instead of overriding the cooldown', function () {
            const searchStartedAt = clock.now() - 30_000;
            const competitive = addPlayer('competitive', MatchmakingPreference.CompetitiveTesting, searchStartedAt);
            addPlayer('previous-opponent', MatchmakingPreference.CompetitiveTesting, searchStartedAt);
            const noPreference = addPlayer('no-preference', MatchmakingPreference.NoPreference, searchStartedAt);
            queue.setPreviousMatchEntry('competitive', 'previous-opponent', clock.now());

            expect(queue.getNextMatchPair(format)).toEqual([competitive, noPreference]);
        });
    });

    describe('queue lifecycle', function () {
        it('defaults an omitted preference to no preference', function () {
            const legacy = addPlayer('legacy');
            const explicit = addPlayer('explicit', MatchmakingPreference.NoPreference);

            expect(legacy.matchmakingPreference).toBe(MatchmakingPreference.NoPreference);
            expect(queue.getNextMatchPair(format)).toEqual([legacy, explicit]);
        });

        it('keeps a disconnected player out of matching without losing the original search context', function () {
            const competitive = addPlayer('competitive', MatchmakingPreference.CompetitiveTesting);
            addPlayer('opponent', MatchmakingPreference.CompetitiveTesting);
            const socketId = competitive.socket.id;
            queue.disconnectPlayer('competitive', socketId);

            expect(queue.getNextMatchPair(format)).toBeNull();
            expect(queue.getNextMatchAvailableAt(format)).toBeNull();
            expect(queue.isWaitingForReconnection('competitive', socketId)).toBeTrue();
            expect(queue.findPlayer('competitive').player).toEqual(jasmine.objectContaining({
                state: QueuedPlayerState.WaitingForConnection,
                matchmakingPreference: MatchmakingPreference.CompetitiveTesting,
                searchStartedAt: competitive.searchStartedAt,
                socket: undefined,
            }));
        });

        it('retains oldest-player priority after a reconnect moves the entry to the end of the queue', async function () {
            const competitive = addPlayer('competitive', MatchmakingPreference.CompetitiveTesting);
            await clock.advanceAsync(5_000);
            const noPreference = addPlayer('no-preference', MatchmakingPreference.NoPreference);
            queue.disconnectPlayer('competitive', competitive.socket.id);
            const replacementSocket = new FakeIoSocket({ query: {} });
            replacementSocket.data.user = competitive.user;
            queue.connectPlayer('competitive', new Socket(replacementSocket));
            await clock.advanceAsync(10_000);

            const reconnected = queue.findPlayer('competitive').player;
            expect(reconnected.searchStartedAt).toBe(competitive.searchStartedAt);
            expect(queue.getNextMatchPair(format)).toEqual([reconnected, noPreference]);
        });

        it('ignores a stale disconnect for a replaced socket', function () {
            const competitive = addPlayer('competitive', MatchmakingPreference.CompetitiveTesting);
            const oldSocketId = competitive.socket.id;
            const replacementSocket = new FakeIoSocket({ query: {} });
            replacementSocket.data.user = competitive.user;
            queue.connectPlayer('competitive', new Socket(replacementSocket));
            queue.disconnectPlayer('competitive', oldSocketId);

            expect(queue.isConnected('competitive', replacementSocket.id)).toBeTrue();
            expect(queue.isWaitingForReconnection('competitive', oldSocketId)).toBeFalse();
        });
    });

    describe('retry deadlines', function () {
        it('has no match deadline for an empty queue or a lone player', function () {
            expect(queue.getNextMatchAvailableAt(format)).toBeNull();
            addPlayer('only-player', MatchmakingPreference.CompetitiveTesting);
            expect(queue.getNextMatchAvailableAt(format)).toBeNull();
            expect(queue.findReadyFormats()).toEqual([]);
        });

        it('finds the earliest mutually eligible deadline across all queued pairs', async function () {
            const competitive = addPlayer('competitive', MatchmakingPreference.CompetitiveTesting);
            await clock.advanceAsync(1_000);
            addPlayer('casual', MatchmakingPreference.CasualBrewing);
            await clock.advanceAsync(1_000);
            addPlayer('no-preference', MatchmakingPreference.NoPreference);

            expect(queue.getNextMatchAvailableAt(format)).toBe(competitive.searchStartedAt + 15_000);
            expect(queue.getNextMatchPair(format)).toBeNull();
        });

        it('takes the later of preference eligibility and rematch eligibility', function () {
            const competitive = addPlayer('competitive', MatchmakingPreference.CompetitiveTesting);
            addPlayer('no-preference', MatchmakingPreference.NoPreference);
            queue.setPreviousMatchEntry('competitive', 'no-preference', clock.now() + 5_000);

            expect(queue.getNextMatchAvailableAt(format)).toBe(competitive.searchStartedAt + 20_000);
        });

        it('admits a pair at the exact shared preference and rematch deadline', async function () {
            const competitive = addPlayer('competitive', MatchmakingPreference.CompetitiveTesting);
            const noPreference = addPlayer('no-preference', MatchmakingPreference.NoPreference);
            queue.setPreviousMatchEntry('competitive', 'no-preference', clock.now());

            expect(queue.getNextMatchAvailableAt(format)).toBe(competitive.searchStartedAt + 15_000);
            await clock.advanceAsync(14_999);
            expect(queue.getNextMatchPair(format)).toBeNull();
            await clock.advanceAsync(1);
            expect(queue.getNextMatchPair(format)).toEqual([competitive, noPreference]);
        });
    });

    describe('hard queue boundaries', function () {
        const otherFormats: { description: string; key: IQueueFormatKey }[] = [
            { description: 'game format', key: { ...format, format: SwuGameFormat.Eternal } },
            { description: 'card pool', key: { ...format, cardPool: CardPool.NextSet } },
            { description: 'best-of-one/best-of-three', key: { ...format, gamesToWinMode: GamesToWinMode.BestOfThree } },
        ];

        for (const otherFormat of otherFormats) {
            it(`never crosses the ${otherFormat.description} boundary after preference restrictions expire`, async function () {
                const premier = addPlayer('premier', MatchmakingPreference.CompetitiveTesting);
                const otherPlayer = addPlayer('other-player', MatchmakingPreference.CompetitiveTesting, undefined, otherFormat.key);
                await clock.advanceAsync(30_000);

                expect(queue.getNextMatchPair(format)).toBeNull();
                expect(queue.getNextMatchPair(otherFormat.key)).toBeNull();
                expect(queue.findReadyFormats()).toEqual([]);

                const otherOpponent = addPlayer('other-opponent', MatchmakingPreference.CompetitiveTesting, undefined, otherFormat.key);
                expect(queue.findReadyFormats()).toEqual([otherFormat.key]);
                expect(queue.getNextMatchPair(otherFormat.key)).toEqual([otherPlayer, otherOpponent]);
                expect(queue.findPlayer('premier').player).toBe(premier);
            });
        }
    });

    describe('configured durations', function () {
        beforeEach(function () {
            queue.shutdown();
            queue = new QueueHandler(clock, {
                ...config,
                matchmakingPreferencePolicy: {
                    [MatchmakingPreferencePolicyKey.SamePreferenceOnlyDurationMs]: 2_000,
                    [MatchmakingPreferencePolicyKey.NoPreferenceDurationMs]: 3_000,
                },
            });
        });

        it('uses the configured first window rather than a hardcoded 15 seconds', async function () {
            const competitive = addPlayer('competitive', MatchmakingPreference.CompetitiveTesting);
            const noPreference = addPlayer('no-preference', MatchmakingPreference.NoPreference);
            expect(queue.getNextMatchAvailableAt(format)).toBe(competitive.searchStartedAt + 2_000);

            await clock.advanceAsync(1_999);
            expect(queue.getNextMatchPair(format)).toBeNull();
            await clock.advanceAsync(1);
            expect(queue.getNextMatchPair(format)).toEqual([competitive, noPreference]);
        });

        it('adds both configured windows before admitting an opposite preference', async function () {
            const competitive = addPlayer('competitive', MatchmakingPreference.CompetitiveTesting);
            const casual = addPlayer('casual', MatchmakingPreference.CasualBrewing);
            expect(queue.getNextMatchAvailableAt(format)).toBe(competitive.searchStartedAt + 5_000);

            await clock.advanceAsync(4_999);
            expect(queue.getNextMatchPair(format)).toBeNull();
            await clock.advanceAsync(1);
            expect(queue.getNextMatchPair(format)).toEqual([competitive, casual]);
        });

        it('allows opposite preferences immediately when both windows are zero', function () {
            queue.shutdown();
            queue = new QueueHandler(clock, {
                ...config,
                matchmakingPreferencePolicy: {
                    [MatchmakingPreferencePolicyKey.SamePreferenceOnlyDurationMs]: 0,
                    [MatchmakingPreferencePolicyKey.NoPreferenceDurationMs]: 0,
                },
            });
            const competitive = addPlayer('competitive', MatchmakingPreference.CompetitiveTesting);
            const casual = addPlayer('casual', MatchmakingPreference.CasualBrewing);

            expect(queue.getNextMatchPair(format)).toEqual([competitive, casual]);
        });
    });
});
