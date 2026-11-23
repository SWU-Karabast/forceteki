import { SimpleActionTimer } from '../../../../server/game/core/actionTimer/SimpleActionTimer';
import { TestScheduler } from '../../../helpers/server/TestScheduler';

/**
 * Adding time to a timer (`addTimeMs`), which the end of a round uses to give main time back: a timer that is not
 * counting down gets none, and one that is keeps running or paused with its handlers moved to the new time left.
 * `ByoyomiTimer` and `RoundEndMainTime` cover the grant itself.
 */
describe('SimpleActionTimer adding time', function () {
    let clock: TestScheduler;
    let expiries: number;

    function newTimer(): SimpleActionTimer {
        const timer = new SimpleActionTimer(60, clock, { message: 'test timer' });
        timer.addSpecificTimeHandler(0, () => expiries++);
        return timer;
    }

    beforeEach(function () {
        clock = new TestScheduler();
        expiries = 0;
    });

    it('adds nothing to a timer that was never started, or was stopped', function () {
        const neverStarted = newTimer();
        const stopped = newTimer();
        stopped.start();
        stopped.stop();

        expect(neverStarted.addTimeMs(10_000)).toBe(0);
        expect(stopped.addTimeMs(10_000)).toBe(0);
        expect(neverStarted.timeRemainingMs).toBeNull();
        expect(stopped.timeRemainingMs).toBeNull();
    });

    it('refuses a negative time', function () {
        const timer = newTimer();
        timer.start();

        expect(() => timer.addTimeMs(-1)).toThrowError(/non-negative/);
    });

    it('extends a paused timer, which stays paused and runs out that much later once resumed', async function () {
        const timer = newTimer();
        timer.start();
        await clock.advanceAsync(50_000);
        timer.pause();

        expect(timer.addTimeMs(10_000)).toBe(10_000);

        expect(timer.isPaused).toBeTrue();
        expect(timer.timeRemainingMs).toBe(20_000);
        timer.resume();
        await clock.advanceToDeadlineAsync(20_000, {
            justBefore: () => {
                expect(expiries).toBe(0);
            },
            atDeadline: () => {
                expect(expiries).toBe(1);
            },
        });
    });

    it('extends a running timer, moving its handlers so it runs out that much later, once', async function () {
        const timer = newTimer();
        timer.start();
        await clock.advanceAsync(50_000);

        expect(timer.addTimeMs(10_000)).toBe(10_000);

        expect(timer.isRunning).toBeTrue();
        await clock.advanceToDeadlineAsync(20_000, {
            justBefore: () => {
                expect(expiries).toBe(0);
            },
            atDeadline: () => {
                expect(expiries).toBe(1);
            },
        });
        await clock.advanceAsync(30_000);
        expect(expiries).withContext('the original handler was cancelled')
            .toBe(1);
    });
});
