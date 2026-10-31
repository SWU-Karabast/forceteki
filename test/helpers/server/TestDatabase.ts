import * as DynamoDBServiceModule from '../../../server/services/DynamoDBService';
import { GameServer } from '../../../server/gamenode/GameServer';
import { CosmeticsService } from '../../../server/utils/cosmetics/CosmeticsService';
import type { IScheduler } from '../../../server/utils/IScheduler';
import { ModActionService } from '../../../server/utils/ModActionService';
import { ServerRoleUsersCache } from '../../../server/utils/ServerRoleUsersCache';
import { ServerSettingsCache } from '../../../server/utils/ServerSettingsCache';
import type { FakeDynamoDbService } from './FakeDynamoDbService';
import { overrideEnv } from './ServerTestEnv';

/** The DynamoDB-backed services a deployed server has and a local dev box does not. */
export interface ITestDbServices {
    readonly serverRoleUsersCache: ServerRoleUsersCache;
    readonly serverSettingsCache: ServerSettingsCache;
    readonly cosmeticsService: CosmeticsService;
    readonly modActionService: ModActionService;

    /** Stops every service's periodic refresh, so nothing is left scheduled on the clock. */
    stop(): void;
}

/**
 * Makes `getDynamoDbServiceAsync()` resolve to the fake for the rest of the current spec.
 *
 * This is the seam the whole server hangs off: every service that reads the database asks this one
 * function for it. It must run **before the server is constructed** - `GameServer`'s field
 * initialisers and `authMiddleware`'s per-route `UserFactory` capture the promise it returns at
 * construction, so spying afterwards silently changes nothing for them.
 *
 * jasmine removes the spy when the spec ends. A second call in the same spec points the existing spy
 * at the new fake, so a spec has one database at a time.
 */
export function routeDatabaseThrough(fake: FakeDynamoDbService): void {
    const current = DynamoDBServiceModule.getDynamoDbServiceAsync;

    if (jasmine.isSpy(current)) {
        (current as jasmine.Spy).and.resolveTo(fake.asService());
    } else {
        spyOn(DynamoDBServiceModule, 'getDynamoDbServiceAsync').and.resolveTo(fake.asService());
    }
}

/**
 * Builds the real role, settings, cosmetics and mod-action services over `fake`, driven by `scheduler`
 * so their refresh timers and clocks are the spec's virtual ones.
 */
export async function createTestDbServicesAsync(fake: FakeDynamoDbService, scheduler: IScheduler): Promise<ITestDbServices> {
    routeDatabaseThrough(fake);

    // `CosmeticsService.createAsync` refuses to build in development unless a local DynamoDB is
    // declared. It only reads the variable; with `getDynamoDbServiceAsync` spied, no local database is
    // ever contacted.
    const restoreEnv = overrideEnv({ USE_LOCAL_DYNAMODB: 'true' });

    try {
        const serverRoleUsersCache = await ServerRoleUsersCache.createAsync(GameServer.ServerCacheRefreshMinutes, scheduler);
        const serverSettingsCache = await ServerSettingsCache.createAsync(GameServer.ServerCacheRefreshMinutes, scheduler);
        const cosmeticsService = await CosmeticsService.createAsync(scheduler);
        const modActionService = await ModActionService.createAsync(scheduler);

        return {
            serverRoleUsersCache,
            serverSettingsCache,
            cosmeticsService,
            modActionService,
            stop: () => {
                serverRoleUsersCache.stop();
                serverSettingsCache.stop();
                cosmeticsService.stop();
                modActionService.stop();
            },
        };
    } finally {
        restoreEnv();
    }
}
