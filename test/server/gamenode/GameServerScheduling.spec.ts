import type { IToken } from '../../../server/gamenode/GameServer';
import { ServerTestHarness } from '../../helpers/server/ServerTestHarness';

/**
 * Covers the scheduler seam itself.
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
        await harness.clock.flushMicrotasksAsync();

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

    it('cancels every scheduled task on shutdown', async function () {
        expect(harness.clock.pendingTaskCount).toBeGreaterThan(0);

        await harness.shutdownAsync();

        expect(harness.clock.pendingTaskCount).toBe(0);
    });

    describe('error guarding', function () {
        it('does not let a throwing one-shot callback escape to the process', async function () {
            harness.clock.setTimeout(() => {
                throw new Error('boom');
            }, 1000, { message: 'test: throwing timeout' });

            // would be an unhandled exception without the scheduler's guard
            await harness.clock.advanceAsync(1000);

            expect(harness.clock.capturedErrors.length).toBe(1);
            expect(harness.clock.capturedErrors[0].context.message).toBe('test: throwing timeout');
        });

        it('keeps a repeating task running after a tick throws', async function () {
            let runCount = 0;

            harness.clock.setInterval(() => {
                runCount++;
                throw new Error('every tick fails');
            }, 1000, { message: 'test: throwing interval' });

            await harness.clock.advanceAsync(3000);

            expect(runCount).toBe(3);
            expect(harness.clock.capturedErrors.length).toBe(3);
        });

        it('surfaces swallowed errors so a spec cannot pass while background work fails', async function () {
            harness.clock.setTimeout(() => {
                throw new Error('boom');
            }, 1000, { message: 'test: throwing timeout' });
            await harness.clock.advanceAsync(1000);

            expect(() => harness.assertNoScheduledErrors()).toThrowError(/test: throwing timeout/);
        });

        it('reports no errors for a clean run', async function () {
            await harness.clock.advanceAsync(2 * 60 * 60 * 1000);

            expect(() => harness.assertNoScheduledErrors()).not.toThrow();
        });
    });
});
