import { ByoyomiTimer } from '../../../../server/game/core/actionTimer/ByoyomiTimer';
import { actionTimerLimits } from '../../../helpers/server/ActionTimerLimits';
import { TestScheduler } from '../../../helpers/server/TestScheduler';

const { turnTimeMs, mainTimeMs } = actionTimerLimits;

/**
 * The two readings the timeout draw rule takes of the opponent's timer, at the unit level: whether they are on the clock
 * (`isCountingDown`) and how long they have until they time out (`msUntilTimeout`). The rule's other cases are pinned on
 * the wire in `ActionTimer`. These are not: in a game without cards, both players' timers always start together, so an
 * opponent is never still in their turn time when the other player runs out, and a stopped timer whose main time has run
 * out is reached only after an undo past the end of a game.
 */
describe('ByoyomiTimer', function () {
    let clock: TestScheduler;
    let timeouts: number;

    function newTimer(): ByoyomiTimer {
        return new ByoyomiTimer({ name: 'player' }, { scheduler: clock, id: 'game' }, () => timeouts++, () => undefined);
    }

    beforeEach(function () {
        clock = new TestScheduler();
        timeouts = 0;
    });

    it('counts the turn time left as well as the main time left until the player times out', async function () {
        const timer = newTimer();
        timer.start();

        await clock.advanceAsync(5_000);
        expect(timer.msUntilTimeout).withContext('in the turn time')
            .toBe(turnTimeMs - 5_000 + mainTimeMs);

        await clock.advanceAsync(turnTimeMs - 5_000 + 30_000);
        expect(timer.msUntilTimeout).withContext('in the main time')
            .toBe(mainTimeMs - 30_000);
    });

    it('is on the clock while running, in either time, and not while paused or stopped', async function () {
        const timer = newTimer();
        timer.start();
        expect(timer.isCountingDown).withContext('in the turn time')
            .toBeTrue();

        timer.pause();
        expect(timer.isCountingDown).withContext('paused')
            .toBeFalse();

        timer.resume();
        await clock.advanceAsync(turnTimeMs);
        expect(timer.isCountingDown).withContext('in the main time')
            .toBeTrue();

        timer.stop();
        expect(timer.isCountingDown).withContext('stopped')
            .toBeFalse();
    });

    it('is on the clock at the very moment it runs out, so two timers running out together each see the other counting', async function () {
        const timers = new Map<string, ByoyomiTimer>();
        const seen: string[] = [];
        for (const [name, other] of [['first', 'second'], ['second', 'first']]) {
            const onTimeout = () => {
                const otherTimer = timers.get(other);
                seen.push(`${name} sees ${other} ${otherTimer.isCountingDown ? 'counting' : 'stopped'}, ${otherTimer.msUntilTimeout} ms left`);
            };
            timers.set(name, new ByoyomiTimer({ name }, { scheduler: clock, id: 'game' }, onTimeout, () => undefined));
        }
        timers.forEach((timer) => timer.start());

        await clock.advanceAsync(turnTimeMs + mainTimeMs);

        expect(seen).toEqual(['first sees second counting, 0 ms left', 'second sees first counting, 0 ms left']);
    });

    it('is off the clock once stopped after running out, until it is started again', async function () {
        const timer = newTimer();
        timer.start();
        await clock.advanceAsync(turnTimeMs + mainTimeMs);
        expect(timeouts).toBe(1);

        timer.stop();

        expect(timer.isCountingDown).toBeFalse();
        expect(timer.msUntilTimeout).toBe(0);
        expect(timer.mainTimeRemainingSeconds).withContext('no main time left')
            .toBe(0);
    });
});
