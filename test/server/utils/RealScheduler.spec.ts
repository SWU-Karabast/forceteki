import { RealScheduler } from '../../../server/utils/RealScheduler';

/**
 * Covers the production scheduler against real Node timers.
 *
 * The rest of the suite runs on `TestScheduler`, so without these the claim that production is "safe
 * by construction" would rest entirely on a fake. Delays are kept tiny so the specs stay fast.
 */
describe('RealScheduler', function () {
    let scheduler: RealScheduler;

    beforeEach(function () {
        scheduler = new RealScheduler();
    });

    function waitMs(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    it('runs a one-shot callback', async function () {
        let ran = false;
        scheduler.setTimeout(() => (ran = true), 1);

        await waitMs(30);

        expect(ran).toBe(true);
    });

    it('does not run a cancelled callback', async function () {
        let ran = false;
        scheduler.setTimeout(() => (ran = true), 5).cancel();

        await waitMs(30);

        expect(ran).toBe(false);
    });

    it('stops a repeating callback when cancelled', async function () {
        let ticks = 0;
        const task = scheduler.setInterval(() => ticks++, 1);

        await waitMs(30);
        task.cancel();
        const ticksAtCancel = ticks;
        await waitMs(30);

        expect(ticksAtCancel).toBeGreaterThan(0);
        expect(ticks).toBe(ticksAtCancel);
    });

    describe('error guarding', function () {
        // These are the reason the guard exists: an escaping error from a timer callback reaches the
        // process-level handler and terminates the node. If the guard regresses, the spec process
        // dies outright rather than reporting a failure.
        it('contains a synchronous throw', async function () {
            scheduler.setTimeout(() => {
                throw new Error('sync boom');
            }, 1, { message: 'RealScheduler spec: sync throw' });

            await waitMs(30);

            expect(true).toBe(true);
        });

        it('contains a rejection from an async callback', async function () {
            scheduler.setTimeout(async () => {
                await Promise.resolve();
                throw new Error('async boom');
            }, 1, { message: 'RealScheduler spec: async rejection' });

            await waitMs(30);

            expect(true).toBe(true);
        });

        it('keeps a repeating task running after a tick throws', async function () {
            let ticks = 0;
            const task = scheduler.setInterval(() => {
                ticks++;
                throw new Error('every tick fails');
            }, 1, { message: 'RealScheduler spec: throwing interval' });

            await waitMs(40);
            task.cancel();

            expect(ticks).toBeGreaterThan(1);
        });
    });
});
