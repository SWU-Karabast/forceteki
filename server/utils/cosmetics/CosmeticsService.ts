import { getDynamoDbServiceAsync } from '../../services/DynamoDBService';
import { type IRegisteredCosmeticOption, RegisteredCosmeticType } from './CosmeticsInterfaces';
import { CosmeticsCache } from './CosmeticsCache';
import { randomUUID } from 'crypto';


export class CosmeticsService {
    private readonly dbServicePromise = getDynamoDbServiceAsync();
    private readonly cosmeticsCache: CosmeticsCache;

    public static readonly defaultCosmetics: IRegisteredCosmeticOption[] = [
        {
            id: randomUUID(),
            title: 'Default',
            type: RegisteredCosmeticType.Background,
            path: 'https://karabast-data.s3.amazonaws.com/ui/board-background-1.webp',
            darkened: undefined
        },
        {
            id: randomUUID(),
            title: 'Default',
            type: RegisteredCosmeticType.Cardback,
            path: 'https://karabast-data.s3.amazonaws.com/game/swu-cardback.webp',
            darkened: undefined
        },
    ];

    private constructor(cosmeticsCache: CosmeticsCache) {
        this.cosmeticsCache = cosmeticsCache;
    }

    /**
     * Creates and initializes a new CosmeticsService instance.
     * @throws Error if in development mode without local DynamoDB
     */
    public static async createAsync(): Promise<CosmeticsService> {
        if (process.env.ENVIRONMENT === 'development' && process.env.USE_LOCAL_DYNAMODB !== 'true') {
            throw new Error('CosmeticsService requires USE_LOCAL_DYNAMODB=true in development mode');
        }

        const cache = new CosmeticsCache(60);
        await cache.initializeAsync();
        return new CosmeticsService(cache);
    }

    /**
     * Gets all cosmetics from the cache synchronously.
     */
    public getCosmetics(): IRegisteredCosmeticOption[] {
        return this.cosmeticsCache.getCosmetics();
    }

    public getCosmeticUriById(cosmeticId: string): string | null {
        const cosmetics = this.getCosmetics();
        const cosmetic = cosmetics.find((c) => c.id === cosmeticId);
        return cosmetic ? cosmetic.path : null;
    }

    public getDefaultCardbackUri(): string | null {
        const cosmetics = this.getCosmetics();
        const cosmetic = cosmetics.find((c) => c.type === RegisteredCosmeticType.Cardback && c.title === 'Default');
        return cosmetic ? cosmetic.path : null;
    }

    public getDefaultBackgroundUri(): string | null {
        const cosmetics = this.getCosmetics();
        const cosmetic = cosmetics.find((c) => c.type === RegisteredCosmeticType.Background && c.title === 'Default');
        return cosmetic ? cosmetic.path : null;
    }

    public async initializeCosmeticsAsync(cosmetics: IRegisteredCosmeticOption[]) {
        const dbService = await this.dbServicePromise;
        const result = await dbService.initializeCosmeticsAsync(cosmetics);
        await this.cosmeticsCache.forceRefreshAsync();
        return result;
    }

    public async saveCosmeticAsync(cosmeticData: IRegisteredCosmeticOption) {
        const dbService = await this.dbServicePromise;
        const result = await dbService.saveCosmeticAsync(cosmeticData);
        await this.cosmeticsCache.forceRefreshAsync();
        return result;
    }

    public async deleteCosmeticAsync(cosmeticId: string) {
        const dbService = await this.dbServicePromise;
        const result = await dbService.deleteCosmeticAsync(cosmeticId);
        await this.cosmeticsCache.forceRefreshAsync();
        return result;
    }

    // Development use only
    public async clearAllCosmeticsAsync() {
        const dbService = await this.dbServicePromise;
        const result = await dbService.clearAllCosmeticsAsync();
        await this.cosmeticsCache.forceRefreshAsync();
        return result;
    }

    public async resetCosmeticsAsync(defaultCosmetics: IRegisteredCosmeticOption[]) {
        const dbService = await this.dbServicePromise;
        const deletedResult = await dbService.clearAllCosmeticsAsync();
        const initializedResult = await dbService.initializeCosmeticsAsync(defaultCosmetics);
        await this.cosmeticsCache.forceRefreshAsync();
        return {
            deletedCount: deletedResult,
            initializedCount: initializedResult
        };
    }
}