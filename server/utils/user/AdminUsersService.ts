import { getDynamoDbServiceAsync } from '../../services/DynamoDBService';

export class AdminUsersService {
    private dbServicePromise = getDynamoDbServiceAsync();

    public async getAdminUsersAsync() {
        const dbService = await this.dbServicePromise;
        return dbService.getAdminUsersAsync();
    }
}