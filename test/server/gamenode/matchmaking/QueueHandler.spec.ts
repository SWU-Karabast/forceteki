import { CardPool, GamesToWinMode, MatchmakingCompetitivenessPreference, SwuGameFormat } from '../../../../server/game/core/Constants';
import { MatchmakingCompetitivenessPreferencePolicyKey } from '../../../../server/gamenode/GameNodeConfig';
import type { IQueueFormatKey, QueuedPlayer } from '../../../../server/gamenode/QueueHandler';
import { QueueHandler, QueuedPlayerState } from '../../../../server/gamenode/QueueHandler';
import Socket from '../../../../server/socket';
import { AnonymousUser } from '../../../../server/utils/user/User';
import { FakeIoSocket } from '../../../helpers/server/FakeIoSocket';
import { premierBestOfOne } from '../../../helpers/server/MatchConfigs';
import { buildTestConfig } from '../../../helpers/server/TestGameServer';
import { TestScheduler } from '../../../helpers/server/TestScheduler';

describe('QueueHandler matchmaking preferences', function () {
    const format: IQueueFormatKey = { ...premierBestOfOne };
    const config = buildTestConfig();
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
        matchmakingPreference?: MatchmakingCompetitivenessPreference,
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
            const competitive = addPlayer('competitive', MatchmakingCompetitivenessPreference.Competitive);
            await clock.advanceAsync(1);
            const casual = addPlayer('casual', MatchmakingCompetitivenessPreference.Casual);
            await clock.advanceAsync(1);
            const noPreference = addPlayer('no-preference', MatchmakingCompetitivenessPreference.NoPreference);
            await clock.advanceAsync(1);
            const samePreference = addPlayer('same-preference', MatchmakingCompetitivenessPreference.Competitive);
            await clock.advanceAsync(30_000);

            expect(queue.getNextMatchPair(format)).toEqual([competitive, samePreference]);
            expect(queue.findPlayer(competitive.user.getId())).toBeUndefined();
            expect(queue.findPlayer(samePreference.user.getId())).toBeUndefined();
            expect(queue.getNextMatchPair(format)).toEqual([casual, noPreference]);
        });

        it('prefers no preference over an older opposite-preference opponent', async function () {
            const competitive = addPlayer('competitive', MatchmakingCompetitivenessPreference.Competitive);
            await clock.advanceAsync(1);
            addPlayer('casual', MatchmakingCompetitivenessPreference.Casual);
            await clock.advanceAsync(1);
            const noPreference = addPlayer('no-preference', MatchmakingCompetitivenessPreference.NoPreference);
            await clock.advanceAsync(30_000);

            expect(queue.getNextMatchPair(format)).toEqual([competitive, noPreference]);
        });

        it('uses an opposite preference once both searches are unrestricted', async function () {
            const competitive = addPlayer('competitive', MatchmakingCompetitivenessPreference.Competitive);
            const casual = addPlayer('casual', MatchmakingCompetitivenessPreference.Casual);
            await clock.advanceAsync(30_000);

            expect(queue.getNextMatchPair(format)).toEqual([competitive, casual]);
        });

        it('prioritizes the oldest eligible player rather than a newer same-preference pair', async function () {
            const competitive = addPlayer('competitive', MatchmakingCompetitivenessPreference.Competitive);
            await clock.advanceAsync(1);
            const olderCasual = addPlayer('older-casual', MatchmakingCompetitivenessPreference.Casual);
            await clock.advanceAsync(1);
            addPlayer('newer-casual', MatchmakingCompetitivenessPreference.Casual);
            await clock.advanceAsync(30_000);

            expect(queue.getNextMatchPair(format)).toEqual([competitive, olderCasual]);
        });

        it('breaks ties within a preference tier by search age', async function () {
            const competitive = addPlayer('competitive', MatchmakingCompetitivenessPreference.Competitive);
            await clock.advanceAsync(1);
            const olderOpponent = addPlayer('older-opponent', MatchmakingCompetitivenessPreference.Competitive);
            await clock.advanceAsync(1);
            addPlayer('newer-opponent', MatchmakingCompetitivenessPreference.Competitive);

            expect(queue.getNextMatchPair(format)).toEqual([competitive, olderOpponent]);
        });

        it('preserves insertion order when search timestamps are equal', function () {
            const first = addPlayer('first', MatchmakingCompetitivenessPreference.Casual);
            const second = addPlayer('second', MatchmakingCompetitivenessPreference.Casual);
            addPlayer('third', MatchmakingCompetitivenessPreference.Casual);

            expect(queue.getNextMatchPair(format)).toEqual([first, second]);
        });

        it('uses oldest-first opponent selection for a no-preference player without favoring another no-preference player', async function () {
            const oldest = addPlayer('oldest', MatchmakingCompetitivenessPreference.NoPreference);
            await clock.advanceAsync(1);
            const casual = addPlayer('casual', MatchmakingCompetitivenessPreference.Casual);
            await clock.advanceAsync(1);
            addPlayer('no-preference', MatchmakingCompetitivenessPreference.NoPreference);
            await clock.advanceAsync(15_000);

            expect(queue.getNextMatchPair(format)).toEqual([oldest, casual]);
        });

        it('matches later eligible players when the oldest player has no eligible opponent', function () {
            const competitive = addPlayer('competitive', MatchmakingCompetitivenessPreference.Competitive);
            const casual1 = addPlayer('casual-1', MatchmakingCompetitivenessPreference.Casual);
            const casual2 = addPlayer('casual-2', MatchmakingCompetitivenessPreference.Casual);

            expect(queue.getNextMatchPair(format)).toEqual([casual1, casual2]);
            expect(queue.findPlayer(competitive.user.getId()).player).toBe(competitive);
        });

        it('skips a same-preference opponent blocked by rematch cooldown instead of overriding the cooldown', async function () {
            const searchStartedAt = clock.now() - 30_000;
            const competitive = addPlayer('competitive', MatchmakingCompetitivenessPreference.Competitive, searchStartedAt);
            addPlayer('previous-opponent', MatchmakingCompetitivenessPreference.Competitive, searchStartedAt);
            const noPreference = addPlayer('no-preference', MatchmakingCompetitivenessPreference.NoPreference, searchStartedAt);
            queue.setPreviousMatchEntry('competitive', 'previous-opponent', clock.now());
            await clock.advanceAsync(1_500);

            expect(queue.getNextMatchPair(format)).toEqual([competitive, noPreference]);
        });
    });

    describe('queue lifecycle', function () {
        it('defaults an omitted preference to no preference', function () {
            const legacy = addPlayer('legacy');
            const explicit = addPlayer('explicit', MatchmakingCompetitivenessPreference.NoPreference);

            expect(legacy.matchmakingPreference).toBe(MatchmakingCompetitivenessPreference.NoPreference);
            expect(queue.getNextMatchPair(format)).toEqual([legacy, explicit]);
        });

        it('keeps a disconnected player out of matching without losing the original search context', function () {
            const competitive = addPlayer('competitive', MatchmakingCompetitivenessPreference.Competitive);
            addPlayer('opponent', MatchmakingCompetitivenessPreference.Competitive);
            const socketId = competitive.socket.id;
            queue.disconnectPlayer('competitive', socketId);

            expect(queue.getNextMatchPair(format)).toBeNull();
            expect(queue.getNextMatchAvailableAt(format)).toBeNull();
            expect(queue.isWaitingForReconnection('competitive', socketId)).toBeTrue();
            expect(queue.findPlayer('competitive').player).toEqual(jasmine.objectContaining({
                state: QueuedPlayerState.WaitingForConnection,
                matchmakingPreference: MatchmakingCompetitivenessPreference.Competitive,
                searchStartedAt: competitive.searchStartedAt,
                socket: undefined,
            }));
        });

        it('retains oldest-player priority after a reconnect moves the entry to the end of the queue', async function () {
            const competitive = addPlayer('competitive', MatchmakingCompetitivenessPreference.Competitive);
            await clock.advanceAsync(5_000);
            const noPreference = addPlayer('no-preference', MatchmakingCompetitivenessPreference.NoPreference);
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
            const competitive = addPlayer('competitive', MatchmakingCompetitivenessPreference.Competitive);
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
            addPlayer('only-player', MatchmakingCompetitivenessPreference.Competitive);
            expect(queue.getNextMatchAvailableAt(format)).toBeNull();
            expect(queue.findReadyFormats()).toEqual([]);
        });

        it('finds the earliest mutually eligible deadline across all queued pairs', async function () {
            const competitive = addPlayer('competitive', MatchmakingCompetitivenessPreference.Competitive);
            await clock.advanceAsync(1_000);
            addPlayer('casual', MatchmakingCompetitivenessPreference.Casual);
            await clock.advanceAsync(1_000);
            addPlayer('no-preference', MatchmakingCompetitivenessPreference.NoPreference);

            expect(queue.getNextMatchAvailableAt(format)).toBe(competitive.searchStartedAt + 15_000);
            expect(queue.getNextMatchPair(format)).toBeNull();
        });

        it('takes the later of preference eligibility and rematch eligibility', function () {
            const competitive = addPlayer('competitive', MatchmakingCompetitivenessPreference.Competitive);
            addPlayer('no-preference', MatchmakingCompetitivenessPreference.NoPreference);
            queue.setPreviousMatchEntry('competitive', 'no-preference', clock.now() + 5_000);

            expect(queue.getNextMatchAvailableAt(format)).toBe(competitive.searchStartedAt + 20_000);
        });

        it('previews an expanded category before the exact shared preference and rematch deadline', async function () {
            const competitive = addPlayer('competitive', MatchmakingCompetitivenessPreference.Competitive);
            const noPreference = addPlayer('no-preference', MatchmakingCompetitivenessPreference.NoPreference);
            queue.setPreviousMatchEntry('competitive', 'no-preference', clock.now());

            expect(queue.getNextMatchAvailableAt(format)).toBe(competitive.searchStartedAt + 15_000);
            await clock.advanceAsync(13_499);
            expect(queue.getNextMatchPair(format)).toBeNull();
            await clock.advanceAsync(1);
            expect(queue.getNextMatchPair(format)).toBeNull();
            expect(competitive.preferencesPublishedAt[MatchmakingCompetitivenessPreference.NoPreference]).toBe(clock.now());
            await clock.advanceAsync(1_499);
            expect(queue.getNextMatchPair(format)).toBeNull();
            await clock.advanceAsync(1);
            expect(queue.getNextMatchPair(format)).toEqual([competitive, noPreference]);
        });

        it('starts the grace at publication rather than backdating it to an elapsed expansion deadline', async function () {
            const searchStartedAt = clock.now() - 30_000;
            const competitive = addPlayer('competitive', MatchmakingCompetitivenessPreference.Competitive, searchStartedAt);
            const casual = addPlayer('casual', MatchmakingCompetitivenessPreference.Casual, searchStartedAt);

            expect(queue.getNextMatchPair(format)).toBeNull();
            expect(competitive.preferencesPublishedAt[MatchmakingCompetitivenessPreference.Casual]).toBe(clock.now());
            expect(queue.getNextMatchAvailableAt(format)).toBe(clock.now() + 1_500);
            await clock.advanceAsync(1_499);
            expect(queue.getNextMatchPair(format)).toBeNull();
            await clock.advanceAsync(1);
            expect(queue.getNextMatchPair(format)).toEqual([competitive, casual]);
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
                const premier = addPlayer('premier', MatchmakingCompetitivenessPreference.Competitive);
                const otherPlayer = addPlayer('other-player', MatchmakingCompetitivenessPreference.Competitive, undefined, otherFormat.key);
                await clock.advanceAsync(30_000);

                expect(queue.getNextMatchPair(format)).toBeNull();
                expect(queue.getNextMatchPair(otherFormat.key)).toBeNull();
                expect(queue.findReadyFormats()).toEqual([]);

                const otherOpponent = addPlayer('other-opponent', MatchmakingCompetitivenessPreference.Competitive, undefined, otherFormat.key);
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
                    [MatchmakingCompetitivenessPreferencePolicyKey.SamePreferenceOnlyDurationMs]: 2_000,
                    [MatchmakingCompetitivenessPreferencePolicyKey.NoPreferenceDurationMs]: 3_000,
                },
            });
        });

        it('uses the configured first window rather than a hardcoded 15 seconds', async function () {
            const competitive = addPlayer('competitive', MatchmakingCompetitivenessPreference.Competitive);
            const noPreference = addPlayer('no-preference', MatchmakingCompetitivenessPreference.NoPreference);
            expect(queue.getNextMatchAvailableAt(format)).toBe(competitive.searchStartedAt + 2_000);

            await clock.advanceAsync(1_999);
            expect(queue.getNextMatchPair(format)).toBeNull();
            await clock.advanceAsync(1);
            expect(queue.getNextMatchPair(format)).toEqual([competitive, noPreference]);
        });

        it('adds both configured windows before admitting an opposite preference', async function () {
            const competitive = addPlayer('competitive', MatchmakingCompetitivenessPreference.Competitive);
            const casual = addPlayer('casual', MatchmakingCompetitivenessPreference.Casual);
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
                    [MatchmakingCompetitivenessPreferencePolicyKey.SamePreferenceOnlyDurationMs]: 0,
                    [MatchmakingCompetitivenessPreferencePolicyKey.NoPreferenceDurationMs]: 0,
                },
            });
            const competitive = addPlayer('competitive', MatchmakingCompetitivenessPreference.Competitive);
            const casual = addPlayer('casual', MatchmakingCompetitivenessPreference.Casual);

            expect(queue.getNextMatchPair(format)).toEqual([competitive, casual]);
        });
    });
});
