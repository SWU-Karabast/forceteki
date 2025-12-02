import { getDynamoDbServiceAsync } from '../../services/DynamoDBService';
import { type IRegisteredCosmeticOption, RegisteredCosmeticType } from './CosmeticsInterfaces';
import { randomUUID } from 'crypto';


export class CosmeticsService {
    private dbServicePromise = getDynamoDbServiceAsync();
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

    public async getCosmeticsAsync() {
        const dbService = await this.dbServicePromise;
        return dbService.getCosmeticsAsync();
    }

    public async initializeCosmeticsAsync(cosmetics: IRegisteredCosmeticOption[]) {
        const dbService = await this.dbServicePromise;
        return dbService.initializeCosmeticsAsync(cosmetics);
    }

    public async saveCosmeticAsync(cosmeticData: IRegisteredCosmeticOption) {
        const dbService = await this.dbServicePromise;
        return dbService.saveCosmeticAsync(cosmeticData);
    }

    public async deleteCosmeticAsync(cosmeticId: string) {
        const dbService = await this.dbServicePromise;
        return dbService.deleteCosmeticAsync(cosmeticId);
    }

    // Development use only
    public async clearAllCosmeticsAsync() {
        const dbService = await this.dbServicePromise;
        return dbService.clearAllCosmeticsAsync();
    }

    public async resetCosmeticsAsync(defaultCosmetics: IRegisteredCosmeticOption[]) {
        const dbService = await this.dbServicePromise;
        const deletedResult = await dbService.clearAllCosmeticsAsync();
        const initializedResult = await dbService.initializeCosmeticsAsync(defaultCosmetics);
        return {
            deletedCount: deletedResult,
            initializedCount: initializedResult
        };
    }
}