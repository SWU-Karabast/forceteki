/* eslint-disable require-await -- Match the async store contract, including rejected promises for failed writes. */
import type { IModActionEntity, IUserPreferences, IUserProfileDataEntity, IUsernameChangeEntity } from '../../services/DynamoDBInterfaces';
import { Contract } from '../../game/core/utils/Contract';
import type { IUserStore } from './UserStore';
import { getDefaultPreferences } from './UserFactory';
import { mergeUserPreferences } from './UserPreferences';

/** Process-local account storage for development without DynamoDB. Reads return detached snapshots. */
export class InMemoryUserStore implements IUserStore {
    private readonly profiles = new Map<string, IUserProfileDataEntity>();
    private readonly oauthLinks = new Map<string, string>();
    private readonly emailLinks = new Map<string, string>();
    private readonly usernameLinks = new Map<string, Set<string>>();
    private readonly usernameChanges = new Map<string, IUsernameChangeEntity[]>();

    public async getUserProfileAsync(userId: string): Promise<IUserProfileDataEntity | undefined> {
        return structuredClone(this.profiles.get(userId));
    }

    public async saveUserProfileAsync(profile: IUserProfileDataEntity): Promise<void> {
        this.profiles.set(profile.id, structuredClone({ ...profile, preferences: profile.preferences ?? getDefaultPreferences() }));
    }

    public async updateUserProfileAsync(userId: string, updates: Partial<IUserProfileDataEntity>): Promise<void> {
        const profile = this.profiles.get(userId);
        Contract.assertNotNullLike(profile, `No user profile found for userId ${userId}`);
        this.profiles.set(userId, structuredClone({ ...profile, ...updates, id: userId }));
    }

    public async updateUserPreferencesAsync(userId: string, preferences: Partial<IUserPreferences>): Promise<void> {
        const profile = this.profiles.get(userId);
        Contract.assertNotNullLike(profile, `No user profile found for userId ${userId}`);
        await this.updateUserProfileAsync(userId, {
            preferences: mergeUserPreferences(mergeUserPreferences(getDefaultPreferences(), profile.preferences ?? {}), preferences),
        });
    }

    public async getUserIdByOAuthAsync(provider: string, providerId: string): Promise<string | undefined> {
        return this.oauthLinks.get(JSON.stringify([provider, providerId]));
    }

    public async saveOAuthLinkAsync(provider: string, providerId: string, userId: string): Promise<void> {
        const key = JSON.stringify([provider, providerId]);
        if (this.oauthLinks.has(key)) {
            const error = new Error('OAuth identity already linked');
            error.name = 'ConditionalCheckFailedException';
            throw error;
        }
        this.oauthLinks.set(key, userId);
    }

    public async getUserIdByEmailAsync(email: string): Promise<string | undefined> {
        return this.emailLinks.get(email.toLowerCase());
    }

    public async saveEmailLinkAsync(email: string, userId: string): Promise<void> {
        this.emailLinks.set(email.toLowerCase(), userId);
    }

    public async getUserIdsByUsernameAsync(username: string): Promise<string[]> {
        return [...this.usernameLinks.get(username.toLowerCase()) ?? []];
    }

    public async saveUsernameLinkAsync(username: string, userId: string): Promise<void> {
        const key = username.toLowerCase();
        const ids = this.usernameLinks.get(key) ?? new Set<string>();
        ids.add(userId);
        this.usernameLinks.set(key, ids);
    }

    public async deleteUsernameLinkAsync(username: string, userId: string): Promise<void> {
        this.usernameLinks.get(username.toLowerCase())?.delete(userId);
    }

    public async recordNewLoginAsync(userId: string): Promise<void> {
        await this.updateUserProfileAsync(userId, { lastLogin: new Date().toISOString() });
    }

    public async getModActionsAsync(): Promise<IModActionEntity[]> {
        // Database-backed moderation is disabled in this local development mode.
        return [];
    }

    public async saveUsernameChangeAsync(change: IUsernameChangeEntity): Promise<void> {
        const changes = this.usernameChanges.get(change.playerId) ?? [];
        changes.push(structuredClone(change));
        this.usernameChanges.set(change.playerId, changes);
    }

    public async getUsernameChangesAsync(userId: string): Promise<IUsernameChangeEntity[]> {
        return structuredClone(this.usernameChanges.get(userId) ?? []);
    }
}
