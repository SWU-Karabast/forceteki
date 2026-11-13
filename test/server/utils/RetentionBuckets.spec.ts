import { addDays, dayOf, lastExpiredMonth, monthOf, nextMonth, previousMonth } from '../../../server/utils/RetentionBuckets';

describe('RetentionBuckets', function() {
    it('uses UTC for day and month keys', function() {
        const lateEvening = new Date('2026-10-31T23:30:00.000Z');

        expect(dayOf(lateEvening)).toBe('2026-10-31');
        expect(monthOf(lateEvening)).toBe('2026-10');
    });

    it('steps days across month and year boundaries', function() {
        expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
        expect(addDays('2026-11-01', 30)).toBe('2026-12-01');
    });

    it('steps months across year boundaries', function() {
        expect(previousMonth('2027-01')).toBe('2026-12');
        expect(nextMonth('2026-12')).toBe('2027-01');
    });

    describe('lastExpiredMonth', function() {
        it('only returns a month once its newest possible item has reached the retention age', function() {
            // An item from 31 October 2026 is not 12 months old before November 2027
            expect(lastExpiredMonth(new Date('2027-10-31T23:59:59.000Z'), 12)).toBe('2026-09');
            expect(lastExpiredMonth(new Date('2027-11-01T00:00:00.000Z'), 12)).toBe('2026-10');
        });

        it('handles retention periods longer than a year', function() {
            expect(lastExpiredMonth(new Date('2028-11-15T00:00:00.000Z'), 24)).toBe('2026-10');
        });
    });
});
