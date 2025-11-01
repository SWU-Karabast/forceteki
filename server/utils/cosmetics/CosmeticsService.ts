import { getDynamoDbServiceAsync } from '../../services/DynamoDBService';
import { type IRegisteredCosmeticOption } from './CosmeticsInterfaces';


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