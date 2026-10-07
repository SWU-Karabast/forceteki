import type { IToken } from '../../../server/gamenode/GameServer';
import { CardPool, GamesToWinMode, SwuGameFormat } from '../../../server/game/core/Constants';
import { ServerTestHarness } from '../../helpers/server/ServerTestHarness';
import { TestScheduler } from '../../helpers/server/TestScheduler';

/**
 * Covers the scheduler seam.
 *
 * Before timers were injected, recurring server work had to be switched off for tests to run at all
 * - a background task registered against Node's timers keeps the process alive and cannot be driven
 * forward on demand. These specs assert the opposite property: the tasks stay registered and are
 * driven by a virtual clock, so they are observable rather than disabled, and teardown releases
 * them.
 */
describe('GameServer scheduling', function () {
    let harness: ServerTestHarness;

    beforeEach(async function () {
        harness = await ServerTestHarness.createAsync();
    });

    afterEach(async function () {
        await harness.shutdownAsync();
    });

    function buildToken(timeToLiveSeconds: number): IToken {
        return {
            accessToken: 'access',
            refreshToken: 'refresh',
            creationDateTime: new Date(),
            timeToLiveSeconds,
        };
    }

    it('keeps recurring background tasks registered rather than disabling them for tests', function () {
        expect(harness.clock.pendingTaskCount).toBeGreaterThan(0);
    });

    it('does not let real time drive scheduled work', async function () {
        const before = harness.clock.now();

        // no clock advance, so nothing should come due no matter how many turns of the event loop pass
        await harness.clock.settlePendingWorkAsync();

        expect(harness.clock.now()).toBe(before);
        expect(harness.clock.pendingTaskCount).toBeGreaterThan(0);
    });

    describe('the hourly token cleanup', function () {
        // A TTL shorter than the handler's 5 minute expiry buffer is already invalid; a long TTL is
        // comfortably valid. Both are judged against real time, so only the scheduling is virtual.
        beforeEach(function () {
            harness.server.swuStatsTokenMapping.set('expired-user', buildToken(60));
            harness.server.swuStatsTokenMapping.set('valid-user', buildToken(24 * 60 * 60));
        });

        it('leaves tokens alone until an hour has passed', async function () {
            await harness.clock.advanceAsync(59 * 60 * 1000);

            expect(harness.server.swuStatsTokenMapping.has('expired-user')).toBe(true);
            expect(harness.server.swuStatsTokenMapping.has('valid-user')).toBe(true);
        });

        it('drops expired tokens once an hour has passed', async function () {
            await harness.clock.advanceAsync(60 * 60 * 1000);

            expect(harness.server.swuStatsTokenMapping.has('expired-user')).toBe(false);
            expect(harness.server.swuStatsTokenMapping.has('valid-user')).toBe(true);
        });

        it('repeats every hour rather than running only once', async function () {
            await harness.clock.advanceAsync(60 * 60 * 1000);
            expect(harness.server.swuStatsTokenMapping.has('expired-user')).toBe(false);

            harness.server.swuStatsTokenMapping.set('later-expired-user', buildToken(60));
            await harness.clock.advanceAsync(60 * 60 * 1000);

            expect(harness.server.swuStatsTokenMapping.has('later-expired-user')).toBe(false);
            expect(harness.server.swuStatsTokenMapping.has('valid-user')).toBe(true);
        });
    });

    describe('the stale game cleanup', function () {
        const minutes = (count: number) => count * 60 * 1000;

        async function startGameAsync() {
            const response = await harness.api
                .post('/api/start-test-game')
                .send({ filename: 'testGameTemplate.json' });
            expect(response.status).withContext(JSON.stringify(response.body))
                .toBe(200);
        }

        async function countOngoingGamesAsync(): Promise<number> {
            const response = await harness.api.get('/api/ongoing-games');
            return response.body.numberOfOngoingGames;
        }

        it('removes a game nobody has done anything in for two hours', async function () {
            await startGameAsync();
            expect(await countOngoingGamesAsync()).toBe(1);

            await harness.clock.advanceAsync(minutes(120));

            expect(await countOngoingGamesAsync()).toBe(0);
        });

        it('keeps a game that has been idle for less than two hours', async function () {
            await startGameAsync();

            await harness.clock.advanceAsync(minutes(90));

            expect(await countOngoingGamesAsync()).toBe(1);
        });

        it('counts the time from the last player activity, not from the start of the game', async function () {
            await startGameAsync();
            await harness.clock.advanceAsync(minutes(90));

            // what any game action by a player does
            const lobby = harness.server['lobbies'].get(harness.server['userLobbyMap'].get('exe66').lobbyId);
            lobby['updateUserLastActivity']('exe66');
            await harness.clock.advanceAsync(minutes(90));

            expect(await countOngoingGamesAsync()).toBe(1);
        });

        it('leaves lobbies without a game alone', async function () {
            const lobbyName = harness.uniqueLobbyName();
            const created = await harness.api
                .post('/api/create-lobby')
                .send({
                    user: harness.anonymousUser(),
                    deck: harness.decklists.validDecklist(),
                    lobbyName,
                    format: SwuGameFormat.Premier,
                    cardPool: CardPool.Current,
                    gamesToWinMode: GamesToWinMode.BestOfOne,
                    isPrivate: false,
                });
            expect(created.status).toBe(200);

            await harness.clock.advanceAsync(minutes(180));

            const lobbies = await harness.api.get('/api/available-lobbies');
            expect(lobbies.body.some((lobby) => lobby.name === lobbyName)).toBe(true);
        });
    });

    it('cancels every scheduled task on shutdown', async function () {
        expect(harness.clock.pendingTaskCount).toBeGreaterThan(0);

        await harness.shutdownAsync();

        expect(harness.clock.pendingTaskCount).toBe(0);
    });

    it('fails a spec whose background work threw, rather than passing silently', async function () {
        harness.clock.setTimeout(() => {
            throw new Error('boom');
        }, 1000, { message: 'test: throwing timeout' });

        await harness.clock.advanceAsync(1000);

        expect(() => harness.assertNoScheduledErrors()).toThrowError(/test: throwing timeout/);

        // acknowledged, so teardown's own check does not fail this spec
        harness.clock.clearCapturedErrors();
    });
});

/**
 * Behaviour of the virtual clock itself, exercised directly rather than through a server.
 *
 * These deliberately provoke failures and edge cases, which is cleaner to do against a scheduler the
 * spec owns than against the one driving a live server's background work.
 */
describe('TestScheduler', function () {
    let clock: TestScheduler;

    beforeEach(function () {
        clock = new TestScheduler();
    });

    describe('error guarding', function () {
        it('does not let a throwing one-shot callback escape', async function () {
            clock.setTimeout(() => {
                throw new Error('boom');
            }, 1000, { message: 'throwing timeout' });

            await clock.advanceAsync(1000);

            expect(clock.capturedErrors.length).toBe(1);
            expect(clock.capturedErrors[0].context.message).toBe('throwing timeout');
        });

        it('captures a rejection from an async callback', async function () {
            // an unguarded rejection here is an unhandled rejection, which terminates the process
            clock.setTimeout(async () => {
                await Promise.resolve();
                throw new Error('async boom');
            }, 1000, { message: 'rejecting timeout' });

            await clock.advanceAsync(1000);

            expect(clock.capturedErrors.length).toBe(1);
            expect(clock.capturedErrors[0].context.message).toBe('rejecting timeout');
        });

        it('keeps a repeating task running after a tick throws', async function () {
            let runCount = 0;

            clock.setInterval(() => {
                runCount++;
                throw new Error('every tick fails');
            }, 1000, { message: 'throwing interval' });

            await clock.advanceAsync(3000);

            expect(runCount).toBe(3);
            expect(clock.capturedErrors.length).toBe(3);
        });
    });

    describe('virtual clock safety', function () {
        it('settles async work that awaits a macrotask before returning', async function () {
            let settled = false;

            clock.setTimeout(() => {
                void (async () => {
                    await new Promise((resolve) => setImmediate(resolve));
                    settled = true;
                })();
            }, 1000);

            await clock.advanceAsync(1000);

            expect(settled).toBe(true);
        });

        it('clamps a non-positive interval instead of looping forever', async function () {
            let ticks = 0;
            const task = clock.setInterval(() => ticks++, 0);

            // an unclamped interval never advances past its own due time, so this would never return
            await clock.advanceAsync(5);
            task.cancel();

            expect(ticks).toBe(5);
        });

        it('never moves the clock backwards for a negative delay', async function () {
            const start = clock.now();
            let firedAt: number | null = null;

            clock.setTimeout(() => (firedAt = clock.now()), -5000);
            await clock.advanceAsync(1000);

            expect(firedAt).not.toBeNull();
            expect(firedAt).toBeGreaterThanOrEqual(start);
        });

        it('fails loudly rather than hanging if a task outpaces the clock', async function () {
            clock.setInterval(() => {
                clock.setTimeout(() => undefined, 1);
            }, 1);

            await expectAsync(clock.advanceAsync(10_000_000)).toBeRejectedWithError(/reschedules itself/);
        });

        it('runs due tasks in time order', async function () {
            const order: string[] = [];

            clock.setTimeout(() => order.push('third'), 300);
            clock.setTimeout(() => order.push('first'), 100);
            clock.setTimeout(() => order.push('second'), 200);

            await clock.advanceAsync(500);

            expect(order).toEqual(['first', 'second', 'third']);
        });

        it('does not run a task cancelled by an earlier one', async function () {
            let ran = false;

            const later = clock.setTimeout(() => (ran = true), 200);
            clock.setTimeout(() => later.cancel(), 100);

            await clock.advanceAsync(500);

            expect(ran).toBe(false);
            expect(clock.pendingTaskCount).toBe(0);
        });
    });
});
