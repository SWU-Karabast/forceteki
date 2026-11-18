import type { IToken } from '../../../../server/gamenode/GameServer';
import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';
import type { ServerTestHarness } from '../../../helpers/server/ServerTestHarness';

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
    serverIntegration(function (contextRef) {
        let harness: ServerTestHarness;
        beforeEach(function () {
            harness = contextRef.harness;
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

            it('drops an entry a failed refresh left without a token, without stopping the cleanup', async function () {
                harness.server.swuStatsTokenMapping.set('failed-refresh-user', null);
                harness.server.swuBaseTokenMapping.set('failed-refresh-user', null);
                harness.server.swuBaseTokenMapping.set('expired-user', buildToken(60));

                await harness.clock.advanceAsync(60 * 60 * 1000);

                expect(harness.server.swuStatsTokenMapping.has('failed-refresh-user')).toBe(false);
                expect(harness.server.swuBaseTokenMapping.has('failed-refresh-user')).toBe(false);
                expect(harness.server.swuBaseTokenMapping.has('expired-user')).toBe(false);
                expect(harness.server.swuStatsTokenMapping.has('valid-user')).toBe(true);
            });

            it('drops expired SWUBase tokens as well', async function () {
                harness.server.swuBaseTokenMapping.set('expired-user', buildToken(60));
                harness.server.swuBaseTokenMapping.set('valid-user', buildToken(24 * 60 * 60));

                await harness.clock.advanceAsync(60 * 60 * 1000);

                expect(harness.server.swuBaseTokenMapping.has('expired-user')).toBe(false);
                expect(harness.server.swuBaseTokenMapping.has('valid-user')).toBe(true);
            });

            it('lets the scheduler report a failure, rather than swallowing it', async function () {
                spyOn(harness.server.swuStatsHandler, 'isTokenValid').and.throwError('token check failed');

                await harness.clock.advanceAsync(60 * 60 * 1000);

                expect(() => harness.assertNoScheduledErrors()).toThrowError(/error during token cleanup/);
                harness.clock.clearCapturedErrors();
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

        it('cancels a pending disconnect grace timer on shutdown', async function () {
            const { owner } = await harness.createLobbyWithGuestAsync();
            const before = harness.clock.pendingTaskCount;
            await owner.disconnectTransportAsync();
            const withGraceTimer = harness.clock.pendingTaskCount;

            await harness.shutdownAsync();

            expect(withGraceTimer).toBe(before + 1);
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

    describe('with action timers on', function () {
        serverIntegration(function (contextRef) {
            it('cancels a live game\'s action timers on shutdown', async function () {
                const { harness } = contextRef;
                const before = harness.clock.pendingTaskCount;
                await harness.startLiveGameAsync();
                const duringGame = harness.clock.pendingTaskCount;

                await harness.shutdownAsync();

                expect(duringGame).toBeGreaterThan(before);
                expect(harness.clock.pendingTaskCount).toBe(0);
            });
        }, { config: { actionTimersEnabled: true } });
    });
});
