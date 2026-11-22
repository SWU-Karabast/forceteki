/**
 * Day and month bucket keys for retention cleanups. Items that expire together are indexed under the same
 * bucket so a cleanup can find them with one GSI query instead of scanning the table. All values are UTC.
 */

/** YYYY-MM-DD in UTC */
export function dayOf(date: Date): string {
    return date.toISOString().substring(0, 10);
}

export function addDays(day: string, days: number): string {
    const [year, month, dayOfMonth] = day.split('-').map(Number);
    return dayOf(new Date(Date.UTC(year, month - 1, dayOfMonth + days)));
}

/** YYYY-MM in UTC */
export function monthOf(date: Date): string {
    return date.toISOString().substring(0, 7);
}

export function previousMonth(month: string): string {
    const [year, monthNumber] = month.split('-').map(Number);
    return monthOf(new Date(Date.UTC(year, monthNumber - 2, 1)));
}

export function nextMonth(month: string): string {
    const [year, monthNumber] = month.split('-').map(Number);
    return monthOf(new Date(Date.UTC(year, monthNumber, 1)));
}

/**
 * The newest month bucket whose items are all at least `retentionMonths` old at `now`.
 * Example: with 12 months in November 2027, October 2026 is the newest bucket that may be deleted, since
 * an item from 31 October 2026 turns 12 months old during November 2027 at the latest.
 */
export function lastExpiredMonth(now: Date, retentionMonths: number): string {
    let month = monthOf(now);
    for (let i = 0; i <= retentionMonths; i++) {
        month = previousMonth(month);
    }
    return month;
}
