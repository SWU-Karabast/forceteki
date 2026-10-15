import { logger } from '../../../server/logger';
import { RealScheduler } from '../../../server/utils/RealScheduler';

/**
 * Exercises the production scheduler with Jasmine controlling the timers, rather than substituting
 * TestScheduler or relying on wall-clock sleeps.
 */
describe('RealScheduler', function () {
    let scheduler: RealScheduler;

    beforeEach(function () {
        jasmine.clock().install();
        scheduler = new RealScheduler();
    });

    afterEach(function () {
        jasmine.clock().uninstall();
    });

    it('runs a one-shot callback', function () {
        const callback = jasmine.createSpy('callback');
        scheduler.setTimeout(callback, 10);

        jasmine.clock().tick(9);
        expect(callback).not.toHaveBeenCalled();

        jasmine.clock().tick(1);
        expect(callback).toHaveBeenCalledTimes(1);

        jasmine.clock().tick(30);
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('does not run a cancelled callback', function () {
        const callback = jasmine.createSpy('callback');
        scheduler.setTimeout(callback, 10).cancel();

        jasmine.clock().tick(30);

        expect(callback).not.toHaveBeenCalled();
    });

    it('stops a repeating callback when cancelled', function () {
        const callback = jasmine.createSpy('callback');
        const task = scheduler.setInterval(callback, 10);

        jasmine.clock().tick(30);
        expect(callback).toHaveBeenCalledTimes(3);
        task.cancel();

        jasmine.clock().tick(30);
        expect(callback).toHaveBeenCalledTimes(3);
    });

    describe('error guarding', function () {
        let errorSpy: jasmine.Spy;

        beforeEach(function () {
            errorSpy = spyOn(logger, 'error');
        });

        it('contains and reports a synchronous throw with its context', function () {
            const error = new Error('sync boom');
            scheduler.setTimeout(() => {
                throw error;
            }, 1, { message: 'RealScheduler spec: sync throw', metadata: { taskId: 'sync-task' } });

            jasmine.clock().tick(1);

            expect(errorSpy).toHaveBeenCalledOnceWith('RealScheduler spec: sync throw', {
                error: { message: error.message, stack: error.stack },
                taskId: 'sync-task',
            });
        });

        it('reports an error without an explicit context', function () {
            const error = new Error('boom');
            scheduler.setTimeout(() => {
                throw error;
            }, 1);

            jasmine.clock().tick(1);

            expect(errorSpy).toHaveBeenCalledOnceWith('Scheduler: error in scheduled callback', {
                error: { message: error.message, stack: error.stack },
            });
        });

        it('contains and reports a rejection from an async callback', async function () {
            const error = new Error('async boom');
            const callback = jasmine.createSpy<() => Promise<void>>('callback').and.callFake(async () => {
                await Promise.resolve();
                throw error;
            });
            scheduler.setTimeout(callback, 1, { message: 'RealScheduler spec: async rejection' });

            jasmine.clock().tick(1);
            await expectAsync(callback.calls.mostRecent().returnValue).toBeRejectedWith(error);

            expect(errorSpy).toHaveBeenCalledOnceWith('RealScheduler spec: async rejection', {
                error: { message: error.message, stack: error.stack },
            });
        });

        it('keeps a repeating task running after a tick throws', function () {
            const error = new Error('every tick fails');
            let ticks = 0;
            const task = scheduler.setInterval(() => {
                ticks++;
                throw error;
            }, 10, { message: 'RealScheduler spec: throwing interval' });

            jasmine.clock().tick(30);

            expect(ticks).toBe(3);
            expect(errorSpy).toHaveBeenCalledTimes(3);
            expect(errorSpy).toHaveBeenCalledWith('RealScheduler spec: throwing interval', {
                error: { message: error.message, stack: error.stack },
            });
            task.cancel();

            jasmine.clock().tick(30);
            expect(ticks).toBe(3);
            expect(errorSpy).toHaveBeenCalledTimes(3);
        });
    });
});
