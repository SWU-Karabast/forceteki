import * as DynamoDBServiceModule from '../../../server/services/DynamoDBService';
import type { IModActionCleanupCursor } from '../../../server/services/DynamoDBInterfaces';
import { ModActionRetentionService } from '../../../server/utils/ModActionRetentionService';

type DynamoDBService = Awaited<ReturnType<typeof DynamoDBServiceModule.getDynamoDbServiceAsync>>;

/** Stores mod actions by their GSI bucket, the way the ended-action index exposes them */
class FakeModActionDb {
    public readonly buckets = new Map<string, { id: string; playerId: string }[]>();
    public readonly deleted: string[] = [];
    public readonly queriedBuckets: string[] = [];
    public cursor: IModActionCleanupCursor | null = null;

    public addEnded(month: string, id: string, playerId = 'player-1'): void {
        const key = DynamoDBServiceModule.endedModActionGsiKey(month);
        this.buckets.set(key, [...(this.buckets.get(key) ?? []), { id, playerId }]);
    }

    public queryAttributesByGsiAsync(gsiKey: string): Promise<Record<string, any>[]> {
        this.queriedBuckets.push(gsiKey);
        return Promise.resolve(this.buckets.get(gsiKey) ?? []);
    }

    public deleteModActionAsync(playerId: string, modActionId: string): Promise<unknown> {
        this.deleted.push(`${playerId}/${modActionId}`);
        for (const [key, actions] of this.buckets) {
            this.buckets.set(key, actions.filter((action) => action.id !== modActionId));
        }
        return Promise.resolve({});
    }

    public getModActionCleanupCursorAsync(): Promise<IModActionCleanupCursor | null> {
        return Promise.resolve(this.cursor);
    }

    public saveModActionCleanupCursorAsync(cursor: IModActionCleanupCursor): Promise<unknown> {
        this.cursor = cursor;
        return Promise.resolve({});
    }
}

describe('ModActionRetentionService', function() {
    let db: FakeModActionDb;
    let service: ModActionRetentionService;

    beforeEach(function() {
        db = new FakeModActionDb();
        spyOn(DynamoDBServiceModule, 'getDynamoDbServiceAsync').and.resolveTo(db as unknown as DynamoDBService);
        service = new ModActionRetentionService();
    });

    it('deletes actions only once every action of their month has been ended for 24 months', async function() {
        db.addEnded('2026-10', 'ended-oct-2026');
        db.addEnded('2026-11', 'ended-nov-2026');

        // 31 October 2026 is not 24 months ago before November 2028
        expect(await service.runCleanupAsync(new Date('2028-10-31T23:59:59.000Z'))).toBe(0);
        expect(await service.runCleanupAsync(new Date('2028-11-01T00:00:00.000Z'))).toBe(1);

        expect(db.deleted).toEqual(['player-1/ended-oct-2026']);
        expect(db.cursor).toEqual({ lastMonth: '2026-10' });
    });

    it('starts at the first month mod actions existed and resumes from the cursor afterwards', async function() {
        db.addEnded(ModActionRetentionService.FirstModActionMonth, 'first');

        await service.runCleanupAsync(new Date('2028-06-01T00:00:00.000Z'));
        expect(db.queriedBuckets).toEqual([DynamoDBServiceModule.endedModActionGsiKey(ModActionRetentionService.FirstModActionMonth)]);
        expect(db.queriedBuckets[0]).toBe(DynamoDBServiceModule.endedModActionGsiKey(ModActionRetentionService.FirstModActionMonth));
        expect(db.deleted).toEqual(['player-1/first']);

        db.queriedBuckets.length = 0;
        await service.runCleanupAsync(new Date('2028-07-01T00:00:00.000Z'));
        expect(db.queriedBuckets).toEqual([DynamoDBServiceModule.endedModActionGsiKey('2026-06')]);
    });

    it('keeps the cursor before a month with a failed delete so the next run retries it', async function() {
        db.addEnded('2026-05', 'fails');
        db.addEnded('2026-05', 'works');
        db.addEnded('2026-06', 'later');
        const deleteOne = db.deleteModActionAsync.bind(db);
        spyOn(db, 'deleteModActionAsync').and.callFake((playerId: string, modActionId: string) =>
            (modActionId === 'fails' ? Promise.reject(new Error('throttled')) : deleteOne(playerId, modActionId)));

        expect(await service.runCleanupAsync(new Date('2028-07-01T00:00:00.000Z'))).toBe(1);
        expect(db.cursor).toBeNull();
        expect(db.deleted).toEqual(['player-1/works']);

        (db.deleteModActionAsync as jasmine.Spy).and.callFake(deleteOne);
        expect(await service.runCleanupAsync(new Date('2028-07-01T06:00:00.000Z'))).toBe(2);
        expect(db.cursor).toEqual({ lastMonth: '2026-06' });
    });

    it('never queries the active index', async function() {
        await service.runCleanupAsync(new Date('2030-01-01T00:00:00.000Z'));

        expect(db.queriedBuckets.length).toBeGreaterThan(0);
        expect(db.queriedBuckets.every((key) => key.startsWith('ENDED_MODACTION#'))).toBeTrue();
    });

    it('does nothing without DynamoDB', async function() {
        (DynamoDBServiceModule.getDynamoDbServiceAsync as jasmine.Spy).and.resolveTo(null);

        expect(await new ModActionRetentionService().runCleanupAsync()).toBe(0);
    });
});
