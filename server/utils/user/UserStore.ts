import { getDynamoDbServiceAsync } from '../../services/DynamoDBService';
import type { DynamoDBService } from '../../services/DynamoDBService';
import { Contract } from '../../game/core/utils/Contract';
import { InMemoryUserStore } from './InMemoryUserStore';

/** The account operations UserFactory needs, independent of the storage backend. */
type UserStoreMethods = Pick<DynamoDBService,
'getUserProfileAsync' | 'saveUserProfileAsync' | 'updateUserProfileAsync' |
'updateUserPreferencesAsync' | 'getUserIdByOAuthAsync' | 'saveOAuthLinkAsync' |
'getUserIdByEmailAsync' | 'saveEmailLinkAsync' | 'getUserIdsByUsernameAsync' |
'saveUsernameLinkAsync' | 'deleteUsernameLinkAsync' | 'recordNewLoginAsync' |
'getModActionsAsync' | 'saveUsernameChangeAsync' | 'getUsernameChangesAsync'
>;

// Writes have no result used by the factory; do not expose AWS response types to other stores.
export type IUserStore = {
    [K in keyof UserStoreMethods]: (...args: Parameters<UserStoreMethods[K]>) =>
    K extends `get${string}` ? ReturnType<UserStoreMethods[K]> : Promise<unknown>;
};

let developmentStore: InMemoryUserStore | undefined;

export async function getUserStoreAsync(): Promise<IUserStore> {
    const database = await getDynamoDbServiceAsync();
    if (database) {
        return database;
    }

    Contract.assertEqual(process.env.ENVIRONMENT, 'development', 'In-memory user storage is only available in development');
    // Auth middleware and the game server each own factories, but must see the same profiles.
    developmentStore ??= new InMemoryUserStore();
    return developmentStore;
}
