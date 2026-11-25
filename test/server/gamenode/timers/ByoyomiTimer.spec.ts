import { ByoyomiTimer } from '../../../../server/game/core/actionTimer/ByoyomiTimer';
import type { PlayerTimeRemainingStatus } from '../../../../server/game/core/actionTimer/IActionTimer';
import { actionTimerLimits } from '../../../helpers/server/ActionTimerLimits';
import { TestScheduler } from '../../../helpers/server/TestScheduler';

const { turnTimeMs, mainTimeMs, roundEndGrantMs, warningSeconds, drawMarginMs } = actionTimerLimits;

/**
 * A player's byoyomi timer at the unit level: the two readings the timeout draw rule takes of the opponent's timer, whether
 * they are on the clock (`isCountingDown`) and how long they have until they time out (`msUntilTimeout`); the draw rule
 * itself; and the main time given back at the end of a round.
 */
describe('ByoyomiTimer', function () {
    let clock: TestScheduler;
    let timeouts: number;

    function newTimer(onMainTimerWarning?: (status: PlayerTimeRemainingStatus) => void): ByoyomiTimer {
        return new ByoyomiTimer({ name: 'player' }, { scheduler: clock, id: 'game' }, () => timeouts++, () => undefined, onMainTimerWarning);
    }

    /** Spends a whole turn time and then `mainSpentMs` of main time, and stops the timer, keeping the main time left. */
    async function spendAndStopAsync(timer: ByoyomiTimer, mainSpentMs: number): Promise<void> {
        timer.start();
        await clock.advanceAsync(turnTimeMs + mainSpentMs);
        timer.stop();
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

    /**
     * The timeout draw rule: when a player runs out, whether their opponent's timer is close enough to running out too
     * that the game is a draw, with two timers on one clock. `ActionTimer` has the same cases on the wire, through the
     * setup's resource step, the one prompt that runs both players' timers at once.
     */
    describe('the timeout draw rule', function () {
        /** A timer for the player who runs out, which records the rule's verdict on `opponent` when it does. */
        function runningOutAgainst(opponent: () => ByoyomiTimer, verdicts: boolean[]): ByoyomiTimer {
            return new ByoyomiTimer({ name: 'player' }, { scheduler: clock, id: 'game' }, () => verdicts.push(ByoyomiTimer.isTimeoutDraw(opponent())), () => undefined);
        }

        it('is a draw when the opponent is on the clock with no more than the draw margin left', async function () {
            const verdicts: boolean[] = [];
            const opponent = newTimer();
            const player = runningOutAgainst(() => opponent, verdicts);
            // the player starts the margin behind, so the opponent has exactly the margin left when the player runs out
            await spendAndStopAsync(player, drawMarginMs);

            player.start();
            opponent.start();
            await clock.advanceAsync(turnTimeMs + mainTimeMs - drawMarginMs);

            expect(verdicts).toEqual([true]);
        });

        it('is not a draw when the opponent on the clock has more than the draw margin left', async function () {
            const verdicts: boolean[] = [];
            const opponent = newTimer();
            const player = runningOutAgainst(() => opponent, verdicts);
            await spendAndStopAsync(player, drawMarginMs + 1);

            player.start();
            opponent.start();
            await clock.advanceAsync(turnTimeMs + mainTimeMs - drawMarginMs - 1);

            expect(verdicts).toEqual([false]);
        });

        it('is a draw when both run out at the same moment', async function () {
            const verdicts: boolean[] = [];
            const timers: ByoyomiTimer[] = [];
            timers.push(runningOutAgainst(() => timers[1], verdicts), runningOutAgainst(() => timers[0], verdicts));
            timers.forEach((timer) => timer.start());

            await clock.advanceAsync(turnTimeMs + mainTimeMs);

            expect(verdicts).toEqual([true, true]);
        });

        it('is not a draw when the opponent is off the clock, however little time they have', async function () {
            const verdicts: boolean[] = [];
            const opponent = newTimer();
            const player = runningOutAgainst(() => opponent, verdicts);
            await spendAndStopAsync(opponent, mainTimeMs - 1_000);

            player.start();
            await clock.advanceAsync(turnTimeMs + mainTimeMs);

            expect(opponent.msUntilTimeout).withContext('the opponent, stopped with 1 s left')
                .toBe(1_000);
            expect(verdicts).toEqual([false]);
        });
    });

    /**
     * The main time given back at the end of each round, at the unit level: the cap, once per round, and the scheduled
     * warnings and timeout of a main time counting down. In a game the round ends as the last player answers the resource
     * step, possibly with their main time still counting down. A game without cards then goes straight to the first
     * action, which starts the active player's turn time afresh, so no spec on the wire sees a timeout move.
     * `RoundEndMainTime` has the rest on the wire.
     */
    describe('the main time given back at the end of a round', function () {
        it('adds 10 s to the main time left', async function () {
            const timer = newTimer();
            await spendAndStopAsync(timer, 30_000);

            timer.grantRoundEndMainTime(1);

            expect(timer.mainTimeRemainingSeconds).toBe((mainTimeMs - 30_000 + roundEndGrantMs) / 1000);
            expect(timer.lastMainTimeGrant).toEqual({ round: 1, seconds: roundEndGrantMs / 1000 });
        });

        it('adds only what fills the main time back up, and nothing to a full one', async function () {
            const nearlyFull = newTimer();
            await spendAndStopAsync(nearlyFull, 4_000);
            const full = newTimer();

            nearlyFull.grantRoundEndMainTime(1);
            full.grantRoundEndMainTime(1);

            expect(nearlyFull.mainTimeRemainingSeconds).toBe(mainTimeMs / 1000);
            expect(nearlyFull.lastMainTimeGrant).toEqual({ round: 1, seconds: 4 });
            expect(full.mainTimeRemainingSeconds).toBe(mainTimeMs / 1000);
            expect(full.lastMainTimeGrant).toEqual({ round: 1, seconds: 0 });
        });

        it('reports the seconds the main time shown goes up by, part way through a second', async function () {
            // the main time is shown in whole seconds rounded up: 114.3 s left shows as 1:55, 89.7 s as 1:30
            const capped = newTimer();
            await spendAndStopAsync(capped, 5_700);
            const uncapped = newTimer();
            await spendAndStopAsync(uncapped, 30_300);
            const shownBefore = [capped.mainTimeRemainingSeconds, uncapped.mainTimeRemainingSeconds];
            expect(shownBefore).toEqual([115, 90]);

            capped.grantRoundEndMainTime(1);
            uncapped.grantRoundEndMainTime(1);

            expect(capped.mainTimeRemainingSeconds).toBe(120);
            expect(capped.lastMainTimeGrant).withContext('1:55 to 2:00')
                .toEqual({ round: 1, seconds: 5 });
            expect(uncapped.mainTimeRemainingSeconds).toBe(100);
            expect(uncapped.lastMainTimeGrant).withContext('1:30 to 1:40')
                .toEqual({ round: 1, seconds: 10 });
        });

        it('gives nothing for a part of a second short of the full main time', async function () {
            const timer = newTimer();
            await spendAndStopAsync(timer, 600);
            expect(timer.mainTimeRemainingSeconds).withContext('119.4 s left shows as 2:00')
                .toBe(120);

            timer.grantRoundEndMainTime(1);

            expect(timer.lastMainTimeGrant).toEqual({ round: 1, seconds: 0 });
            expect(timer.msUntilTimeout).withContext('the time is still topped up')
                .toBe(mainTimeMs);
        });

        it('gives time once for each round, and none for a round before one already given', async function () {
            const timer = newTimer();
            await spendAndStopAsync(timer, 30_000);
            timer.grantRoundEndMainTime(1);

            timer.grantRoundEndMainTime(1);
            expect(timer.mainTimeRemainingSeconds).withContext('the same round again')
                .toBe(100);

            await spendAndStopAsync(timer, 30_000);
            timer.grantRoundEndMainTime(2);
            expect(timer.mainTimeRemainingSeconds).withContext('the next round')
                .toBe(80);

            timer.grantRoundEndMainTime(1);
            expect(timer.mainTimeRemainingSeconds).withContext('an earlier round')
                .toBe(80);
            expect(timer.lastMainTimeGrant).toEqual({ round: 2, seconds: 10 });
        });

        it('moves the timeout of a main time that is counting down, and warns again once it falls back to 30 s', async function () {
            const warnings: PlayerTimeRemainingStatus[] = [];
            const timer = newTimer((status) => warnings.push(status));
            timer.start();
            await clock.advanceAsync(turnTimeMs + mainTimeMs - 25_000);
            expect(warnings.length).withContext('warned once, at 30 s')
                .toBe(1);

            timer.grantRoundEndMainTime(1);

            expect(timer.isCountingDown).toBeTrue();
            expect(timer.msUntilTimeout).toBe(25_000 + roundEndGrantMs);
            await clock.advanceToDeadlineAsync(25_000 + roundEndGrantMs - warningSeconds * 1000, {
                justBefore: () => {
                    expect(warnings.length).toBe(1);
                },
                atDeadline: () => {
                    expect(warnings.length).withContext('warned again at 30 s')
                        .toBe(2);
                },
            });
            await clock.advanceToDeadlineAsync(warningSeconds * 1000, {
                justBefore: () => {
                    expect(timeouts).toBe(0);
                },
                atDeadline: () => {
                    expect(timeouts).toBe(1);
                },
            });
        });

        it('warns again at 30 s when a stopped timer below it is given time and then spends it', async function () {
            const warnings: PlayerTimeRemainingStatus[] = [];
            const timer = newTimer((status) => warnings.push(status));
            await spendAndStopAsync(timer, mainTimeMs - 25_000);
            expect(warnings.length).toBe(1);

            timer.grantRoundEndMainTime(1);
            timer.start();
            await clock.advanceAsync(turnTimeMs + 5_000);

            expect(warnings.length).toBe(2);
        });

        it('gives no time to a timer that has run out', async function () {
            const timer = newTimer();
            timer.start();
            await clock.advanceAsync(turnTimeMs + mainTimeMs);
            timer.stop();

            timer.grantRoundEndMainTime(1);

            expect(timer.mainTimeRemainingSeconds).toBe(0);
            expect(timer.msUntilTimeout).toBe(0);
            expect(timer.lastMainTimeGrant).toEqual({ round: 1, seconds: 0 });
        });

        it('hands out a copy of the grant, which the game state it is sent in cannot change', async function () {
            const timer = newTimer();
            await spendAndStopAsync(timer, 30_000);
            timer.grantRoundEndMainTime(1);

            const sent = timer.lastMainTimeGrant as { round: number; seconds: number };
            sent.seconds = 0;

            expect(timer.lastMainTimeGrant).toEqual({ round: 1, seconds: 10 });
        });
    });
});
