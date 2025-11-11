import { getDynamoDbServiceAsync } from '../../services/DynamoDBService';
import { type IRegisteredCosmeticOption, RegisteredCosmeticType } from './CosmeticsInterfaces';

export const defaultCosmetics: IRegisteredCosmeticOption[] = [
    {
        id: 'eabf26d3-a85c-4999-a045-abf143518faf',
        title: 'Default',
        type: RegisteredCosmeticType.Background,
        path: '/default-background.webp',
        darkened: undefined
    },
    {
        id: '5da51f47-66f2-4c3a-a016-c979246034a7',
        title: 'Default',
        type: RegisteredCosmeticType.Cardback,
        path: 'https://karabast-data.s3.amazonaws.com/game/swu-cardback.webp',
        darkened: undefined
    },
];

export class CosmeticsService {
    private dbServicePromise = getDynamoDbServiceAsync();

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