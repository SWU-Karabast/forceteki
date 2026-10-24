import { SchedulerTaskScope } from '../../../server/utils/SchedulerTaskScope';
import { TestScheduler } from '../../helpers/server/TestScheduler';

describe('SchedulerTaskScope', function () {
    let clock: TestScheduler;
    let scope: SchedulerTaskScope;

    beforeEach(function () {
        clock = new TestScheduler();
        scope = new SchedulerTaskScope(clock);
    });

    afterEach(async function () {
        await scope.cancelAsync();
        clock.assertNoCapturedErrors();
        expect(clock.pendingTaskCount).toBe(0);
    });

    it('uses the underlying scheduler clock', async function () {
        await clock.advanceAsync(1_234);

        expect(scope.now()).toBe(clock.now());
        expect(scope.currentDate()).toEqual(clock.currentDate());
    });

    it('runs timers normally until their scope is cancelled', async function () {
        const oneShot = jasmine.createSpy('one-shot');
        const repeating = jasmine.createSpy('repeating');
        scope.setTimeout(oneShot, 10);
        scope.setInterval(repeating, 5);

        await clock.advanceAsync(10);
        expect(oneShot).toHaveBeenCalledTimes(1);
        expect(repeating).toHaveBeenCalledTimes(2);
        await scope.cancelAsync();
        await clock.advanceAsync(10);
        expect(oneShot).toHaveBeenCalledTimes(1);
        expect(repeating).toHaveBeenCalledTimes(2);
    });

    it('cancels pending timers without cancelling work registered directly on the underlying scheduler', async function () {
        const scoped = jasmine.createSpy('scoped');
        const unscoped = jasmine.createSpy('unscoped');
        scope.setTimeout(scoped, 10);
        scope.setInterval(scoped, 10);
        clock.setTimeout(unscoped, 10);

        await scope.cancelAsync();
        expect(clock.pendingTaskCount).toBe(1);
        await clock.advanceAsync(10);
        expect(scoped).not.toHaveBeenCalled();
        expect(unscoped).toHaveBeenCalledTimes(1);
    });

    it('allows a single timer to be cancelled without cancelling its scope', async function () {
        const cancelled = jasmine.createSpy('cancelled');
        const remaining = jasmine.createSpy('remaining');
        scope.setTimeout(cancelled, 10).cancel();
        scope.setTimeout(remaining, 10);

        await clock.advanceAsync(10);

        expect(cancelled).not.toHaveBeenCalled();
        expect(remaining).toHaveBeenCalledTimes(1);
    });

    it('does not start new timers or immediate work after cancellation', async function () {
        const callback = jasmine.createSpy('callback');
        await scope.cancelAsync();

        scope.setTimeout(callback, 10).cancel();
        scope.setInterval(callback, 10).cancel();
        await scope.runAsync(callback);
        await clock.advanceAsync(10);

        expect(clock.pendingTaskCount).toBe(0);
        expect(callback).not.toHaveBeenCalled();
    });

    it('waits for active work to finish while rejecting any timers it tries to start during shutdown', async function () {
        let resume: () => void;
        const paused = new Promise<void>((resolve) => resume = resolve);
        const lateTimer = jasmine.createSpy('late timer');
        let workFinished = false;
        const work = scope.runAsync(async () => {
            await paused;
            workFinished = true;
            scope.setTimeout(lateTimer, 10);
        });
        let cancellationFinished = false;
        const cancellation = scope.cancelAsync().then(() => cancellationFinished = true);

        try {
            await clock.settlePendingWorkAsync();
            expect(cancellationFinished).toBeFalse();
            expect(workFinished).toBeFalse();
        } finally {
            resume();
        }
        await work;
        await cancellation;
        await clock.advanceAsync(10);

        expect(cancellationFinished).toBeTrue();
        expect(workFinished).toBeTrue();
        expect(lateTimer).not.toHaveBeenCalled();
    });

    it('drains an async callback that was started by a timer', async function () {
        let resume: () => void;
        const paused = new Promise<void>((resolve) => resume = resolve);
        let callbackFinished = false;
        scope.setTimeout(async () => {
            await paused;
            callbackFinished = true;
        }, 1);
        await clock.advanceAsync(1);
        let cancellationFinished = false;
        const cancellation = scope.cancelAsync().then(() => cancellationFinished = true);

        try {
            await clock.settlePendingWorkAsync();
            expect(cancellationFinished).toBeFalse();
        } finally {
            resume();
        }
        await cancellation;

        expect(callbackFinished).toBeTrue();
        expect(cancellationFinished).toBeTrue();
    });

    it('retains the underlying scheduler error reporting and context', async function () {
        const error = new Error('timer failure');
        const context = { message: 'SchedulerTaskScope test: timer failure' };
        scope.setTimeout(() => {
            throw error;
        }, 1, context);

        await clock.advanceAsync(1);

        expect(clock.capturedErrors).toEqual([{ error, context }]);
        clock.clearCapturedErrors();
    });

    it('waits for every active task before reporting a failure during cancellation', async function () {
        const error = new Error('active task failed');
        let rejectWork: (error: Error) => void;
        let resumeOtherWork: () => void;
        const work = scope.runAsync(() => new Promise<void>((_resolve, reject) => rejectWork = reject));
        const otherWork = scope.runAsync(() => new Promise<void>((resolve) => resumeOtherWork = resolve));
        const workFailure = expectAsync(work).toBeRejectedWith(error);
        let cancellationFinished = false;
        const cancellation = scope.cancelAsync();
        const cancellationFailure = expectAsync(cancellation).toBeRejectedWith(error);
        cancellation.then(() => cancellationFinished = true, () => cancellationFinished = true);

        try {
            rejectWork(error);
            await clock.settlePendingWorkAsync();
            expect(cancellationFinished).toBeFalse();
        } finally {
            resumeOtherWork();
        }
        await otherWork;
        await workFailure;
        await cancellationFailure;

        expect(cancellationFinished).toBeTrue();
    });
});
