import type { DeleteCommandOutput, PutCommandOutput, UpdateCommandOutput } from '@aws-sdk/lib-dynamodb';
import { v4 as uuid } from 'uuid';

import type {
    IModActionEntity,
    IServerRoleUsersListsEntity,
    IServerSettingsEntity,
    IUsernameChangeEntity,
    IUserPreferences,
    IUserProfileDataEntity
} from '../../../server/services/DynamoDBInterfaces';
import { isTrackedModAction } from '../../../server/services/DynamoDBInterfaces';
import { ModActionEntitySchema, UsernameChangeEntitySchema } from '../../../server/services/DynamoDBInterfaceSchemas';
import type { DynamoDBService } from '../../../server/services/DynamoDBService';
import type { ICosmeticEntity } from '../../../server/utils/cosmetics/CosmeticsInterfaces';
import { getDefaultPreferences } from '../../../server/utils/user/UserFactory';

/**
 * The slice of {@link DynamoDBService} this fake supplies. Typing the class against exactly these
 * methods means a signature change in the real service fails the build here, instead of the fake
 * silently drifting from it. Deck methods are deliberately absent until the deck suite needs them.
 */
type FakedMethod =
  | 'getUserProfileAsync' | 'getAllUserProfilesAsync' | 'saveUserProfileAsync' | 'updateUserProfileAsync'
  | 'removeUserProfileAttributeAsync' | 'recordNewLoginAsync' | 'saveUserSettingsAsync' | 'updateUserPreferencesAsync'
  | 'saveOAuthLinkAsync' | 'getUserIdByOAuthAsync' | 'saveEmailLinkAsync' | 'getUserIdByEmailAsync'
  | 'saveUsernameLinkAsync' | 'deleteUsernameLinkAsync' | 'getUserIdsByUsernameAsync'
  | 'saveUsernameChangeAsync' | 'getUsernameChangesAsync'
  | 'saveModActionAsync' | 'getModActionsAsync' | 'activateMuteAsync' | 'cancelModActionAsync'
  | 'removeModActionFromActiveIndexAsync'
  | 'getServerRoleUsersAsync' | 'getServerSettingsAsync' | 'saveServerSettingsAsync'
  | 'getCosmeticsAsync' | 'saveCosmeticAsync' | 'initializeCosmeticsAsync' | 'deleteCosmeticAsync' | 'clearAllCosmeticsAsync';

/** What {@link FakeDynamoDbService.seedAccount} can set; everything is generated when omitted. */
export interface ISeedAccountOptions {
    id?: string;
    username?: string;

    /** OAuth provider the account signs in with, e.g. `discord`. */
    provider?: string;

    /** The provider's own id for the user. */
    providerId?: string;
    email?: string;

    /** Extra profile fields, e.g. `moderation`, `preferences` or `usernameLastUpdatedAt`. */
    profile?: Partial<IUserProfileDataEntity>;
}

/** Identity of a seeded account: everything a sign-in token needs to resolve to it. */
export interface ISeededAccount {
    id: string;
    username: string;
    provider: string;
    providerId: string;
    email: string;
}

export type ServerRoleLists = Partial<Record<keyof IServerRoleUsersListsEntity, string[]>>;

/** A stored mod action, plus whether it is still in the sparse `ACTIVE_MODACTION` index. */
export type StoredModAction = IModActionEntity & { active: boolean };

const putResult: PutCommandOutput = { $metadata: {} };
const updateResult: UpdateCommandOutput = { $metadata: {} };
const deleteResult: DeleteCommandOutput = { $metadata: {} };

let nextSeededAccount = 1;

/** The error DynamoDB raises when a write's condition expression fails. */
function conditionalCheckFailed(): Error {
    return Object.assign(new Error('The conditional request failed'), { name: 'ConditionalCheckFailedException' });
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Mirrors `DynamoDBService.deepMergePreferences`: nested objects merge, `undefined` is skipped. */
function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
    const merged: Record<string, unknown> = { ...target };
    for (const [key, sourceValue] of Object.entries(source)) {
        if (sourceValue === undefined) {
            continue;
        }

        const targetValue = merged[key];
        merged[key] = isPlainObject(sourceValue) && isPlainObject(targetValue)
            ? deepMerge(targetValue, sourceValue)
            : sourceValue;
    }
    return merged;
}

/**
 * In-memory stand-in for the DynamoDB service, so the real services built over it (`UserFactory`,
 * `ModActionService`, `ServerRoleUsersCache`, `ServerSettingsCache`, `CosmeticsService`) and everything
 * that uses them run unchanged in a spec.
 *
 * It keeps the behaviours the production code actually depends on, copied from `DynamoDBService`:
 * - the OAuth link is a conditional put - a second link for the same provider identity throws a
 *   `ConditionalCheckFailedException`, which `UserFactory` handles by name;
 * - email and username keys are case-folded on write and read;
 * - `getUserProfileAsync` returns `undefined` for an unknown user, while `updateUserProfileAsync` and
 *   `recordNewLoginAsync` upsert, as DynamoDB's `UpdateItem` does;
 * - only tracked, uncancelled mod actions are in the active index, and cancelling is conditional;
 * - missing role lists read as four empty lists and missing settings as `{ gamesEnabled: true }`;
 * - everything read back through a zod schema in production goes through the same schema here.
 *
 * It does not model throttling, eventual consistency or item-size limits. Methods outside
 * {@link FakedMethod} throw a named error when called, rather than "x is not a function".
 *
 * Hand it to the server with {@link asService}; the harness does this when a spec opts in to a
 * database.
 */
export class FakeDynamoDbService implements Pick<DynamoDBService, FakedMethod> {
    public readonly profiles = new Map<string, IUserProfileDataEntity>();

    /** `<provider>_<providerId>` -> user id. */
    public readonly oauthLinks = new Map<string, string>();

    /** Lower-cased email -> user id. */
    public readonly emailLinks = new Map<string, string>();

    /** `<lower-cased username>#<user id>`, one entry per link. */
    public readonly usernameLinks = new Set<string>();
    public readonly usernameChanges: IUsernameChangeEntity[] = [];
    public readonly modActions = new Map<string, StoredModAction>();
    public readonly cosmetics = new Map<string, ICosmeticEntity>();
    public roleUsers: IServerRoleUsersListsEntity = { admins: [], developers: [], moderators: [], contributors: [] };
    public serverSettings?: IServerSettingsEntity;

    private readonly recordedLogins: string[] = [];

    /**
     * @param currentDate Supplies the time recorded in `lastLogin` and `cancelledAt`. The harness passes
     * its virtual clock so a spec controls these timestamps.
     */
    public constructor(private readonly currentDate: () => Date = () => new Date()) {}

    /**
     * The fake as the real service's type, for `getDynamoDbServiceAsync` to resolve to. This is the one
     * cast in the seam: the fake only implements part of the real class, and calls outside that part
     * fail with a clear message.
     */
    public asService(): DynamoDBService {
        return new Proxy(this, {
            get: (target, property, receiver) => {
                const isUnfakedDbMethod = typeof property === 'string' && property.endsWith('Async') && !(property in target);
                if (isUnfakedDbMethod) {
                    return () => {
                        throw new Error(`FakeDynamoDbService: ${property} is not implemented. Add it to test/helpers/server/FakeDynamoDbService.ts before a spec depends on it.`);
                    };
                }

                return Reflect.get(target, property, receiver);
            },
        }) as unknown as DynamoDBService;
    }

    // ---- Seeding and inspection (not part of the real service) ----

    /** A profile with no identity links. Use {@link seedAccount} for an account a sign-in token can reach. */
    public addProfile(profile: Partial<IUserProfileDataEntity> & { id: string; username: string }): void {
        this.profiles.set(profile.id, {
            lastLogin: '2026-01-01T00:00:00.000Z',
            createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
            showWelcomeMessage: false,
            ...profile,
        });
        this.usernameLinks.add(`${profile.username.toLowerCase()}#${profile.id}`);
    }

    /** Creates an account exactly as the first-login flow would leave it: profile plus OAuth, email and username links. */
    public seedAccount(options: ISeedAccountOptions = {}): ISeededAccount {
        const sequence = nextSeededAccount++;
        const account: ISeededAccount = {
            id: options.id ?? uuid(),
            username: options.username ?? `SeededUser${sequence}`,
            provider: options.provider ?? 'discord',
            providerId: options.providerId ?? String(100000 + sequence),
            email: options.email ?? `seeded-user-${sequence}@example.test`,
        };

        this.addProfile({
            id: account.id,
            username: account.username,
            usernameLastUpdatedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
            preferences: getDefaultPreferences(),
            needsUsernameChange: false,
            moderation: undefined,
            ...options.profile,
        });
        this.oauthLinks.set(`${account.provider}_${account.providerId}`, account.id);
        this.emailLinks.set(account.email.toLowerCase(), account.id);

        return account;
    }

    /** Replaces the given role lists; roles not named keep their current members. */
    public seedRoles(roles: ServerRoleLists): void {
        for (const [role, userIds] of Object.entries(roles) as [keyof IServerRoleUsersListsEntity, string[]][]) {
            this.roleUsers[role] = userIds.map((id) => ({ id }));
        }
    }

    public seedSettings(settings: IServerSettingsEntity): void {
        this.serverSettings = settings;
    }

    public seedModAction(modAction: IModActionEntity): void {
        this.modActions.set(this.modActionKey(modAction.playerId, modAction.id), {
            ...modAction,
            active: isTrackedModAction(modAction.actionType) && !modAction.cancelledAt,
        });
    }

    public actionsOfType(actionType: IModActionEntity['actionType']): StoredModAction[] {
        return [...this.modActions.values()].filter((item) => item.actionType === actionType);
    }

    /** User ids that have had a login recorded through `recordNewLoginAsync`, in order. */
    public get loggedInUserIds(): readonly string[] {
        return this.recordedLogins;
    }

    // ---- User profiles ----

    public getUserProfileAsync(userId: string): Promise<IUserProfileDataEntity | undefined> {
        const profile = this.profiles.get(userId);
        return Promise.resolve(profile ? { ...profile } : undefined);
    }

    public getAllUserProfilesAsync(): Promise<IUserProfileDataEntity[]> {
        return Promise.resolve([...this.profiles.values()].map((profile) => ({ ...profile })));
    }

    public saveUserProfileAsync(userData: IUserProfileDataEntity): Promise<PutCommandOutput> {
        this.profiles.set(userData.id, { ...userData, preferences: userData.preferences || getDefaultPreferences() });
        return Promise.resolve(putResult);
    }

    public updateUserProfileAsync(userId: string, updates: Partial<IUserProfileDataEntity>): Promise<UpdateCommandOutput> {
        const fields: Partial<IUserProfileDataEntity> = { ...updates };

        // the primary key is never updated
        delete fields.id;

        this.profiles.set(userId, { ...this.profiles.get(userId), ...fields });
        return Promise.resolve(updateResult);
    }

    public removeUserProfileAttributeAsync(userId: string, attributeName: keyof IUserProfileDataEntity): Promise<UpdateCommandOutput> {
        const remaining = Object.fromEntries(Object.entries(this.profiles.get(userId) ?? {}).filter(([key]) => key !== attributeName));
        this.profiles.set(userId, remaining as unknown as IUserProfileDataEntity);
        return Promise.resolve(updateResult);
    }

    public recordNewLoginAsync(userId: string): Promise<UpdateCommandOutput> {
        this.profiles.set(userId, { ...this.profiles.get(userId), lastLogin: this.currentDate().toISOString() });
        this.recordedLogins.push(userId);
        return Promise.resolve(updateResult);
    }

    public saveUserSettingsAsync(userId: string, settings: Record<string, unknown>): Promise<UpdateCommandOutput> {
        this.profiles.set(userId, { ...this.profiles.get(userId), preferences: settings as IUserPreferences });
        return Promise.resolve(updateResult);
    }

    public updateUserPreferencesAsync(userId: string, preferences: Partial<IUserPreferences>): Promise<void> {
        const stored = this.profiles.get(userId)?.preferences ?? {};
        const merged = deepMerge(deepMerge({ ...getDefaultPreferences() }, { ...stored }), { ...preferences });
        this.profiles.set(userId, { ...this.profiles.get(userId), preferences: merged as IUserPreferences });
        return Promise.resolve();
    }

    // ---- Identity links ----

    public saveOAuthLinkAsync(provider: string, providerId: string, userId: string): Promise<PutCommandOutput> {
        const key = `${provider}_${providerId}`;
        if (this.oauthLinks.has(key)) {
            return Promise.reject(conditionalCheckFailed());
        }

        this.oauthLinks.set(key, userId);
        return Promise.resolve(putResult);
    }

    public getUserIdByOAuthAsync(provider: string, providerId: string): Promise<string | undefined> {
        return Promise.resolve(this.oauthLinks.get(`${provider}_${providerId}`));
    }

    public saveEmailLinkAsync(email: string, userId: string): Promise<PutCommandOutput> {
        this.emailLinks.set(email.toLowerCase(), userId);
        return Promise.resolve(putResult);
    }

    public getUserIdByEmailAsync(email: string): Promise<string | undefined> {
        return Promise.resolve(this.emailLinks.get(email.toLowerCase()));
    }

    public saveUsernameLinkAsync(username: string, userId: string): Promise<PutCommandOutput> {
        this.usernameLinks.add(`${username.toLowerCase()}#${userId}`);
        return Promise.resolve(putResult);
    }

    public deleteUsernameLinkAsync(username: string, userId: string): Promise<DeleteCommandOutput> {
        this.usernameLinks.delete(`${username.toLowerCase()}#${userId}`);
        return Promise.resolve(deleteResult);
    }

    public getUserIdsByUsernameAsync(username: string): Promise<string[]> {
        const folded = username.toLowerCase();
        const userIds = [...this.usernameLinks]
            .filter((link) => link.slice(0, link.lastIndexOf('#')) === folded)
            .map((link) => link.slice(link.lastIndexOf('#') + 1));
        return Promise.resolve(userIds);
    }

    // ---- Username history ----

    public saveUsernameChangeAsync(record: IUsernameChangeEntity): Promise<PutCommandOutput> {
        this.usernameChanges.push(UsernameChangeEntitySchema.parse(record));
        return Promise.resolve(putResult);
    }

    public getUsernameChangesAsync(userId: string): Promise<IUsernameChangeEntity[]> {
        return Promise.resolve(this.usernameChanges.filter((change) => change.playerId === userId));
    }

    // ---- Mod actions ----

    public saveModActionAsync(modAction: IModActionEntity): Promise<PutCommandOutput> {
        this.seedModAction(modAction);
        return Promise.resolve(putResult);
    }

    /** With a user id, every action for that player; without one, only those still in the active index. */
    public getModActionsAsync(options: { userId?: string } = {}): Promise<IModActionEntity[]> {
        const items = [...this.modActions.values()].filter((item) => {
            return options.userId ? item.playerId === options.userId : item.active;
        });

        // as on the real read path, the schema drops everything that is not part of the entity
        // (`pk`, `sk` and `GSI_PK` there, the `active` flag here)
        return Promise.resolve(items.map((item) => ModActionEntitySchema.parse(item)));
    }

    public activateMuteAsync(playerId: string, modActionId: string, startedAt: string, expiresAt: string): Promise<UpdateCommandOutput> {
        const item = this.modActions.get(this.modActionKey(playerId, modActionId));
        if (item) {
            Object.assign(item, { startedAt, expiresAt });
        }
        return Promise.resolve(updateResult);
    }

    public cancelModActionAsync(playerId: string, modActionId: string, cancelledById: string, cancelledByUsername: string): Promise<UpdateCommandOutput> {
        const item = this.modActions.get(this.modActionKey(playerId, modActionId));
        if (!item || item.cancelledAt) {
            return Promise.reject(conditionalCheckFailed());
        }

        Object.assign(item, { cancelledAt: this.currentDate().toISOString(), cancelledById, cancelledByUsername, active: false });
        return Promise.resolve({ ...updateResult, Attributes: { ...item } });
    }

    public removeModActionFromActiveIndexAsync(playerId: string, modActionId: string): Promise<UpdateCommandOutput> {
        const item = this.modActions.get(this.modActionKey(playerId, modActionId));
        if (item) {
            item.active = false;
        }
        return Promise.resolve(updateResult);
    }

    // ---- Server roles and settings ----

    public getServerRoleUsersAsync(): Promise<IServerRoleUsersListsEntity> {
        return Promise.resolve({
            admins: [...this.roleUsers.admins],
            developers: [...this.roleUsers.developers],
            moderators: [...this.roleUsers.moderators],
            contributors: [...this.roleUsers.contributors],
        });
    }

    public getServerSettingsAsync(): Promise<IServerSettingsEntity> {
        if (!this.serverSettings) {
            return Promise.resolve({ gamesEnabled: true });
        }

        const { gamesEnabled, maintenanceMessage, updatedBy, updatedAt } = this.serverSettings;
        return Promise.resolve({ gamesEnabled: gamesEnabled !== false, maintenanceMessage, updatedBy, updatedAt });
    }

    public saveServerSettingsAsync(settings: IServerSettingsEntity): Promise<PutCommandOutput> {
        // like the real service, fields that are undefined are omitted rather than stored
        const stored: IServerSettingsEntity = { gamesEnabled: settings.gamesEnabled };
        for (const key of ['maintenanceMessage', 'updatedBy', 'updatedAt'] as const) {
            if (settings[key] !== undefined) {
                stored[key] = settings[key];
            }
        }

        this.serverSettings = stored;
        return Promise.resolve(putResult);
    }

    // ---- Cosmetics ----

    public getCosmeticsAsync(): Promise<ICosmeticEntity[]> {
        return Promise.resolve([...this.cosmetics.values()].map(({ id, title, type, path }) => ({ id, title, type, path })));
    }

    public saveCosmeticAsync(cosmeticData: ICosmeticEntity): Promise<PutCommandOutput> {
        this.cosmetics.set(cosmeticData.id, { ...cosmeticData });
        return Promise.resolve(putResult);
    }

    public initializeCosmeticsAsync(cosmetics: ICosmeticEntity[]): Promise<{ initializedCount: number }> {
        for (const cosmetic of cosmetics) {
            this.cosmetics.set(cosmetic.id, { ...cosmetic });
        }
        return Promise.resolve({ initializedCount: cosmetics.length });
    }

    public deleteCosmeticAsync(cosmeticId: string): Promise<DeleteCommandOutput> {
        this.cosmetics.delete(cosmeticId);
        return Promise.resolve(deleteResult);
    }

    public clearAllCosmeticsAsync(): Promise<{ deletedCount: number }> {
        const deletedCount = this.cosmetics.size;
        this.cosmetics.clear();
        return Promise.resolve({ deletedCount });
    }

    private modActionKey(playerId: string, modActionId: string): string {
        return `${playerId}#${modActionId}`;
    }
}
