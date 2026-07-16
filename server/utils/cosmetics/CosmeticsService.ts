import { getDynamoDbServiceAsync } from '../../services/DynamoDBService';
import { type IActiveCosmetics, type ICosmeticEntity, RegisteredCosmeticType } from './CosmeticsInterfaces';
import { CosmeticsCache } from './CosmeticsCache';
import { randomUUID } from 'crypto';

export interface ICosmeticsSelection {
    cardback?: string;
    background?: string;
}

export class CosmeticsService {
    private readonly dbServicePromise = getDynamoDbServiceAsync();
    private readonly cosmeticsCache: CosmeticsCache;

    public static readonly defaultCosmetics: ICosmeticEntity[] = [
        {
            id: randomUUID(),
            title: 'Default',
            type: RegisteredCosmeticType.Background,
            path: 'https://karabast-data.s3.amazonaws.com/ui/board-background-1.webp',
        },
        {
            id: randomUUID(),
            title: 'Default',
            type: RegisteredCosmeticType.Cardback,
            path: 'https://karabast-data.s3.amazonaws.com/game/swu-cardback.webp',
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
    public getCosmetics(): ICosmeticEntity[] {
        return this.cosmeticsCache.getCosmetics();
    }

    /**
     * Resolves a single cosmetic selection id into a minimal resolved cosmetic.
     * Falls back to the Default cosmetic for the given type if the id is missing or unknown.
     */
    public resolveCosmetic(type: RegisteredCosmeticType, id?: string): ICosmeticEntity {
        return CosmeticsService.resolveCosmeticFrom(this.getCosmetics(), type, id);
    }

    /**
     * Resolves a user's active cosmetic selection (cardback + background) into resolved cosmetics.
     */
    public resolveActiveCosmetics(selection?: ICosmeticsSelection): IActiveCosmetics {
        return {
            cardback: this.resolveCosmetic(RegisteredCosmeticType.Cardback, selection?.cardback),
            background: this.resolveCosmetic(RegisteredCosmeticType.Background, selection?.background),
        };
    }

    /**
     * Static resolution against the built-in default cosmetics, for use when no
     * CosmeticsService instance is available (e.g. dev without local DynamoDB).
     */
    public static resolveDefaultCosmetics(selection?: ICosmeticsSelection): IActiveCosmetics {
        return {
            cardback: CosmeticsService.resolveCosmeticFrom(CosmeticsService.defaultCosmetics, RegisteredCosmeticType.Cardback, selection?.cardback),
            background: CosmeticsService.resolveCosmeticFrom(CosmeticsService.defaultCosmetics, RegisteredCosmeticType.Background, selection?.background),
        };
    }

    private static resolveCosmeticFrom(
        cosmetics: ICosmeticEntity[],
        type: RegisteredCosmeticType,
        id?: string
    ): ICosmeticEntity {
        const pool = (cosmetics && cosmetics.length > 0) ? cosmetics : CosmeticsService.defaultCosmetics;

        const match = id ? pool.find((cosmetic) => cosmetic.id === id && cosmetic.type === type) : undefined;
        const resolved = match ??
          pool.find((cosmetic) => cosmetic.type === type && cosmetic.title === 'Default') ??
          CosmeticsService.defaultCosmetics.find((cosmetic) => cosmetic.type === type);

        if (!resolved) {
            throw new Error(`No default cosmetic available for type ${type}`);
        }

        return {
            id: resolved.id,
            title: resolved.title,
            type: resolved.type,
            path: resolved.path,
        };
    }

    public async initializeCosmeticsAsync(cosmetics: ICosmeticEntity[]) {
        const dbService = await this.dbServicePromise;
        const result = await dbService.initializeCosmeticsAsync(cosmetics);
        await this.cosmeticsCache.forceRefreshAsync();
        return result;
    }

    public async saveCosmeticAsync(cosmeticData: ICosmeticEntity) {
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

    public async resetCosmeticsAsync(defaultCosmetics: ICosmeticEntity[]) {
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