import { AnonymousUser, AuthenticatedUser } from './User';
import { logger } from '../../logger';
import { v4 as uuid, validate as isUuid } from 'uuid';
import jwt from 'jsonwebtoken';
import { getDynamoDbServiceAsync } from '../../services/DynamoDBService';
import { Contract } from '../../game/core/utils/Contract';
import type { ParsedUrlQuery } from 'node:querystring';
import type { IUserDataEntity, IUserPreferences, IUserProfileDataEntity, IModActionEntity, IUsernameChangeEntity } from '../../services/DynamoDBInterfaces';
import { CardImageLocale, ModerationType, TimerVisibility, UsernameChangeSource } from '../../services/DynamoDBInterfaces';
import { evaluateUsernameChangeEligibility } from './UsernameRules';
import { RefreshTokenSource } from '../statHandlers/StatHandlerTypes';
import { UserProfileCache } from './UserProfileCache';


const getDefaultSoundPreferences = () => ({
    muteAllSound: false,
    muteCardAndButtonClickSound: false,
    muteChatSound: false,
    muteYourTurn: false,
    muteOpponentFoundSound: false,
});

const getDefaultCosmeticsPreferences = () => ({
    cardback: null,
    background: null,
});

const getDefaultGameOptionsPreferences = () => ({
    muteChat: false,
    cardLanguage: CardImageLocale.English,
    timerVisibility: TimerVisibility.Standard,
    autoResolve: {
        singleTarget: false,
    },
});

export const getDefaultPreferences = (): IUserPreferences => ({
    sound: getDefaultSoundPreferences(),
    cosmetics: getDefaultCosmeticsPreferences(),
    gameOptions: getDefaultGameOptionsPreferences(),
});


const refreshTokenFieldMap: Record<RefreshTokenSource, {
    [K in keyof IUserDataEntity]: IUserDataEntity[K] extends string | undefined ? K : never;
}[keyof IUserDataEntity]> = {
    [RefreshTokenSource.SWUStats]: 'swuStatsRefreshToken',
    [RefreshTokenSource.SWUBase]: 'swubaseRefreshToken',
};


/** The signed-in identity a session token vouches for. */
interface ITokenIdentity {
    provider: string;
    providerId: string;
    email?: string;
    name?: string;
}

/** A valid session token whose identity has no account on this server yet. */
export class AccountNotFoundError extends Error {
    public constructor(message = 'No account exists for this sign-in') {
        super(message);
        this.name = 'AccountNotFoundError';
    }
}

/**
 * Factory class responsible for creating the appropriate User instance
 * based on authentication status and data
 */
export class UserFactory {
    private dbServicePromise = getDynamoDbServiceAsync();
    private MS_PER_DAY = 24 * 60 * 60 * 1000;
    private readonly accountCreations = new Map<string, Promise<AuthenticatedUser>>();

    public constructor(public readonly cache: UserProfileCache = new UserProfileCache()) {}

    /**
     * Resolves the account a session token belongs to. Identity comes only from the token's signed
     * `provider` and `providerId` claims, through the stored identity link; the profile is then read from
     * the server's own copy. It never creates or modifies anything.
     * @throws AccountNotFoundError if the token is valid but has no account
     */
    public async resolveUserFromTokenAsync(token: string): Promise<AuthenticatedUser> {
        try {
            const identity = this.verifyTokenIdentity(token);
            return await this.resolveUserFromIdentityAsync(identity);
        } catch (error) {
            if (!(error instanceof AccountNotFoundError)) {
                logger.error('Error resolving user from token:', { error: { message: error.message, stack: error.stack } });
            }
            throw error;
        }
    }

    /**
     * Finds the account for a session token, creating it if this is the identity's first sign-in. Safe
     * to call repeatedly: an identity that already has an account just gets that account back.
     *
     * An identity with no link but a known email is attached to the account with that email, which is
     * how one account is reached from more than one sign-in provider.
     */
    public async createUserFromTokenAsync(token: string): Promise<AuthenticatedUser> {
        try {
            const identity = this.verifyTokenIdentity(token);
            const key = UserProfileCache.identityKey(identity.provider, identity.providerId);

            // concurrent first requests for one identity share a single creation
            let creation = this.accountCreations.get(key);
            if (!creation) {
                creation = this.findOrCreateAccountAsync(identity).finally(() => this.accountCreations.delete(key));
                this.accountCreations.set(key, creation);
            }

            return await creation;
        } catch (error) {
            logger.error('Error creating user from token:', { error: { message: error.message, stack: error.stack } });
            throw error;
        }
    }

    /** Records a sign-in on the account. Not part of resolving a user, which happens on every request. */
    public async recordLoginAsync(userId: string): Promise<void> {
        const dbService = await this.dbServicePromise;
        await dbService.recordNewLoginAsync(userId);
    }

    /**
     * Writes profile fields, then drops the cached profile. The cache is cleared whether or not the write
     * succeeds, so it never keeps data that was not saved, and a read that began before the write can't
     * store its older result afterwards.
     */
    private async updateProfileAsync(userId: string, updates: Partial<IUserProfileDataEntity>): Promise<void> {
        const dbService = await this.dbServicePromise;
        try {
            await dbService.updateUserProfileAsync(userId, updates);
        } finally {
            this.cache.invalidateProfile(userId);
        }
    }

    /**
     * Checks a session token's signature and expiry against `NEXTAUTH_SECRET` and returns the sign-in
     * identity it carries. Only the signed claims are read, so this is the one place a token is trusted.
     * `email` and `name` are optional because they are only needed to create an account.
     * @throws if the token is invalid or expired, or has no `provider` and `providerId` claims
     */
    private verifyTokenIdentity(token: string): ITokenIdentity {
        const secret = process.env.NEXTAUTH_SECRET;
        Contract.assertTrue(!!secret, 'NEXTAUTH_SECRET environment variable must be set and not empty for authentication to work');

        const decoded = jwt.verify(token, secret) as Record<string, unknown>;
        const { provider, providerId, email, name } = decoded ?? {};
        if (typeof provider !== 'string' || !provider || typeof providerId !== 'string' || !providerId) {
            throw new Error('Session token does not identify a sign-in provider account');
        }

        return {
            provider,
            providerId,
            email: typeof email === 'string' ? email : undefined,
            name: typeof name === 'string' ? name : undefined,
        };
    }

    private async requireDbServiceAsync() {
        const dbService = await this.dbServicePromise;
        Contract.assertNotNullLike(dbService, 'No database is available to look up accounts');
        return dbService;
    }

    private async resolveUserFromIdentityAsync(identity: ITokenIdentity): Promise<AuthenticatedUser> {
        const dbService = await this.requireDbServiceAsync();

        const userId = await this.cache.getUserIdAsync(
            identity.provider,
            identity.providerId,
            () => dbService.getUserIdByOAuthAsync(identity.provider, identity.providerId)
        );
        if (!userId) {
            throw new AccountNotFoundError();
        }

        const loadProfileAsync = () => this.cache.getProfileAsync(userId, async () => {
            const stored = await dbService.getUserProfileAsync(userId);
            return stored ? await this.processModerationAsync(stored) : undefined;
        });

        let profile = await loadProfileAsync();
        // legacy moderation is only evaluated when a profile is loaded, so one that has run out since is reloaded
        if (profile?.moderation?.endDate && new Date(profile.moderation.endDate).getTime() < Date.now()) {
            this.cache.invalidateProfile(userId);
            profile = await loadProfileAsync();
        }
        if (!profile) {
            throw new AccountNotFoundError(`Account ${userId} linked to this sign-in has no profile`);
        }

        return new AuthenticatedUser(profile);
    }

    /**
     * Creates an anonymous user with a generated ID or provided ID
     * @param id Optional ID for the anonymous user
     * @param name Optional name for the anonymous user
     * @returns An AnonymousUser instance
     */
    public createAnonymousUser(id?: string, name?: string): AnonymousUser {
        return new AnonymousUser(id || uuid(), name || 'Anonymous', !!id);
    }

    /**
     * Creates an anonymous user from the `user` field of a socket handshake query or request body.
     *
     * Only the id is taken from the client, and it must be a UUID (the dev test users excepted). The
     * username is always derived from the id, so a client cannot choose its own anonymous name.
     */
    public createAnonymousUserFromQuery(query?: ParsedUrlQuery): AnonymousUser {
        const queryUser = typeof query.user === 'string'
            ? JSON.parse(query.user)
            : query.user;

        const id = queryUser?.id;
        if (id == null) {
            return new AnonymousUser(uuid(), 'AnonymousPlayer', false);
        }

        if (AnonymousUser.isDevTestUserId(id)) {
            return new AnonymousUser(id, queryUser.username, true);
        }

        if (typeof id !== 'string' || !isUuid(id)) {
            throw new Error(`Anonymous user id is not a valid UUID: '${String(id).substring(0, 64)}'`);
        }

        const username = AnonymousUser.usernameForId(id);
        if (queryUser.username !== username) {
            logger.info(`Auth Anon-creation: ignoring client-supplied username '${String(queryUser.username).substring(0, 64)}' for user ${id}`, { userId: id });
        }

        return new AnonymousUser(id, username, true);
    }

    public async setWelcomeMessageStatus(userId: string): Promise<boolean> {
        try {
            const dbService = await this.dbServicePromise;
            const userProfile = await dbService.getUserProfileAsync(userId);
            Contract.assertNotNullLike(userProfile, `No user profile found for userId ${userId}`);
            await this.updateProfileAsync(userId, {
                showWelcomeMessage: false
            });
            return true;
        } catch (error) {
            logger.error('Error setting showWelcomeMessage status:', { error: { message: error.message, stack: error.stack } });
            throw error;
        }
    }

    public async setUndoPopupSeenStatus(userId: string): Promise<boolean> {
        try {
            const dbService = await this.dbServicePromise;
            const userProfile = await dbService.getUserProfileAsync(userId);
            Contract.assertNotNullLike(userProfile, `No user profile found for userId ${userId}`);
            await this.updateProfileAsync(userId, {
                undoPopupSeenDate: new Date().toISOString()
            });
            return true;
        } catch (error) {
            logger.error('Error setting undoPopupSeen status:', { error: { message: error.message, stack: error.stack } });
            throw error;
        }
    }

    public async setTimerPopupSeenStatus(userId: string): Promise<boolean> {
        try {
            const dbService = await this.dbServicePromise;
            const userProfile = await dbService.getUserProfileAsync(userId);
            Contract.assertNotNullLike(userProfile, `No user profile found for userId ${userId}`);
            await this.updateProfileAsync(userId, {
                timerPopupSeenDate: new Date().toISOString()
            });
            return true;
        } catch (error) {
            logger.error('Error setting timerPopupSeen status:', { error: { message: error.message, stack: error.stack } });
            throw error;
        }
    }

    /**
     * • Unlimited username changes during the first week (7 days) after account creation.
     * • After that, a 1‑month (30‑days) cooldown between changes.
     * • A forced rename (active Rename mod action or legacy needsUsernameChange flag) is always allowed.
     * @param options.hasActiveForcedRename whether the player has an active Rename mod action (from ModActionService)
     * @param options.usernameChangesBlocked whether the player has an active UsernameChangesBlocked mod action (from ModActionService)
     */
    public async canChangeUsernameAsync(userId: string, options: {
        hasActiveForcedRename?: boolean;
        usernameChangesBlocked?: boolean;
    } = {}): Promise<{
            canChange: boolean;
            message?: string;
            nextChangeAllowedAt?: string; // ISO timestamp when they can change again
            typeOfMessage: string | null;
        }> {
        try {
            const dbService = await this.dbServicePromise;
            const userProfile = await dbService.getUserProfileAsync(userId);
            Contract.assertNotNullLike(userProfile, `No user profile found for userId ${userId}`);

            const eligibility = evaluateUsernameChangeEligibility({
                createdAt: userProfile.createdAt,
                usernameLastUpdatedAt: userProfile.usernameLastUpdatedAt,
                isForcedRename: !!options.hasActiveForcedRename || !!userProfile.needsUsernameChange,
                usernameChangesBlocked: !!options.usernameChangesBlocked,
            });

            switch (eligibility.reason) {
                case 'forcedRename':
                    return {
                        canChange: true,
                        message: 'You are required to change your username.',
                        typeOfMessage: 'green',
                    };
                case 'usernameChangesBlocked':
                    return {
                        canChange: false,
                        message: 'You must submit a ticket to request a username change.',
                        typeOfMessage: 'green',
                    };
                case 'firstWeek':
                    return {
                        canChange: true,
                        message: 'You can change your username freely within the first week',
                        typeOfMessage: 'green'
                    };
                case 'cooldownActive':
                    return {
                        canChange: false,
                        message: `You can change your username again in ${eligibility.daysRemaining} days`,
                        nextChangeAllowedAt: eligibility.nextChangeAllowedAt,
                        typeOfMessage: null
                    };
                case 'cooldownElapsed':
                    return {
                        canChange: true,
                        message: 'You can change your username (available every 30 days)',
                        typeOfMessage: 'yellow'
                    };
            }
        } catch (error: any) {
            logger.error('Error checking username change eligibility:', {
                error: { message: error.message, stack: error.stack }
            });
            throw error;
        }
    }

    /**
     * • Unlimited username changes during the first week (7 days) after account creation.
     * • After that, a 1‑month (30‑days) cooldown between changes.
     * • A forced rename (source ForcedRename or legacy needsUsernameChange flag) bypasses the cooldown and
     *   the username-changes block, and does not reset the cooldown, so it never costs the player a free rename.
     */
    public async changeUsernameAsync(userId: string, newUsername: string, options?: {
        source?: UsernameChangeSource;
        relatedModActionId?: string;
        usernameChangesBlocked?: boolean; // whether the player has an active UsernameChangesBlocked mod action
    }): Promise<{
            success: boolean;
            username?: string;
            message?: string;
            nextChangeAllowedAt?: string; // ISO timestamp when they can change again
            daysRemaining?: number;
        }> {
        try {
            const dbService = await this.dbServicePromise;
            const userProfile = await dbService.getUserProfileAsync(userId);
            Contract.assertNotNullLike(userProfile, `No user profile found for userId ${userId}`);

            // Check if the new username is the same as the current one
            if (userProfile.username === newUsername) {
                return {
                    success: false,
                    message: 'The new username is the same as your current username.'
                };
            }

            const isForcedRename = options?.source === UsernameChangeSource.ForcedRename || userProfile.needsUsernameChange === true;

            const eligibility = evaluateUsernameChangeEligibility({
                createdAt: userProfile.createdAt,
                usernameLastUpdatedAt: userProfile.usernameLastUpdatedAt,
                isForcedRename,
                usernameChangesBlocked: options?.usernameChangesBlocked ?? false,
            });

            if (eligibility.reason === 'usernameChangesBlocked') {
                return {
                    success: false,
                    message: 'You must submit a ticket to request a username change.'
                };
            }

            if (!eligibility.canChange) {
                logger.error(`GameServer (change-username): User ${userId} must wait ${eligibility.daysRemaining} more days before changing username again`);
                return {
                    success: false,
                    message: `You can change your username again in ${eligibility.daysRemaining} days (on ${eligibility.nextChangeAllowedAt})`,
                    nextChangeAllowedAt: eligibility.nextChangeAllowedAt,
                    daysRemaining: eligibility.daysRemaining
                };
            }

            // Only a voluntary change starts the cooldown; a forced rename keeps the previous timestamp so the
            // player is left with exactly the rename allowance they had before.
            await this.applyUsernameChangeAsync(userId, userProfile.username, newUsername, {
                source: options?.source ?? UsernameChangeSource.UserInitiated,
                relatedModActionId: options?.relatedModActionId,
                startCooldown: !isForcedRename,
            });

            return {
                success: true,
                username: newUsername,
                message: 'Username successfully changed',
            };
        } catch (error) {
            logger.error('Error changing username:', { error: { message: error.message, stack: error.stack } });
            throw error;
        }
    }

    /**
     * @returns the player's current username, or null when no profile exists for exactly this id
     */
    public async getUsernameAsync(userId: string): Promise<string | null> {
        const dbService = await this.dbServicePromise;
        const userProfile = await dbService.getUserProfileAsync(userId);
        return userProfile?.username ?? null;
    }

    /**
     * Changes a username on a moderator's behalf. Unlike {@link changeUsernameAsync} it bypasses the player's own
     * eligibility rules (username-changes block, cooldown) and never starts the cooldown.
     * The username-history entry is required here, but a missing one is reported via `historyRecorded` rather than
     * thrown, because the rename itself is already committed by then.
     */
    public async changeUsernameByModeratorAsync(userId: string, newUsername: string, relatedModActionId: string): Promise<{
        success: boolean;
        previousUsername?: string;
        historyRecorded?: boolean;
        message?: string;
    }> {
        try {
            const dbService = await this.dbServicePromise;
            const userProfile = await dbService.getUserProfileAsync(userId);
            Contract.assertNotNullLike(userProfile, `No user profile found for userId ${userId}`);

            if (userProfile.username === newUsername) {
                return {
                    success: false,
                    message: 'The player already has that username.'
                };
            }

            const historyRecorded = await this.applyUsernameChangeAsync(userId, userProfile.username, newUsername, {
                source: UsernameChangeSource.UsernameChangedByModerator,
                relatedModActionId,
                startCooldown: false,
            });

            return { success: true, previousUsername: userProfile.username, historyRecorded };
        } catch (error) {
            logger.error('Error changing username on behalf of a moderator:', { error: { message: error.message, stack: error.stack }, userId });
            throw error;
        }
    }

    /**
     * Moves the username lookup link, updates the profile, then records the history entry.
     * @param options.startCooldown whether this counts as the player's own change, starting the 30-day cooldown
     * @returns whether the history entry was recorded. That is tracking data, so a failure is logged by
     * {@link recordUsernameChangeAsync} and must not fail a rename that is already committed.
     */
    private async applyUsernameChangeAsync(userId: string, previousUsername: string, newUsername: string, options: {
        source: UsernameChangeSource;
        relatedModActionId?: string;
        startCooldown: boolean;
    }): Promise<boolean> {
        const dbService = await this.dbServicePromise;

        // update the GSI username
        await dbService.deleteUsernameLinkAsync(previousUsername, userId);
        await dbService.saveUsernameLinkAsync(newUsername, userId);

        await this.updateProfileAsync(userId, {
            username: newUsername,
            needsUsernameChange: false,
            ...(options.startCooldown ? { usernameLastUpdatedAt: new Date().toISOString() } : {}),
        });
        logger.info(`Username for ${userId} changed to ${newUsername}`);

        try {
            await this.recordUsernameChangeAsync(userId, previousUsername, newUsername, options.source, options.relatedModActionId);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Update user preferences
     * @param userId The user ID
     * @param updatedPreferences The updated preferences object
     * @returns True if update was successful
     */
    public async updateUserPreferencesAsync(userId: string, updatedPreferences: Record<string, any>): Promise<void> {
        try {
            const dbService = await this.dbServicePromise;
            try {
                await dbService.updateUserPreferencesAsync(userId, updatedPreferences);
            } finally {
                this.cache.invalidateProfile(userId);
            }
        } catch (error) {
            logger.error('Error updating user preferences:', { error: { message: error.message, stack: error.stack, userId: userId } });
            throw error;
        }
    }

    private async findOrCreateAccountAsync(identity: ITokenIdentity): Promise<AuthenticatedUser> {
        try {
            return await this.resolveUserFromIdentityAsync(identity);
        } catch (error) {
            if (!(error instanceof AccountNotFoundError)) {
                throw error;
            }
        }

        const dbService = await this.requireDbServiceAsync();
        const { provider, providerId, email, name } = identity;

        // The identity may be linked to an account whose profile is gone. The link stays authoritative, so the
        // profile is recreated under the linked id, which also reattaches everything else stored for it.
        const linkedUserId = await this.cache.getUserIdAsync(provider, providerId, () => dbService.getUserIdByOAuthAsync(provider, providerId));

        // An account may already exist under this email, from signing in with another provider
        const existingUserId = !linkedUserId && email ? await dbService.getUserIdByEmailAsync(email) : undefined;
        if (existingUserId) {
            logger.info(`User found by email ${email} but not by OAuth, creating OAuth link`);
            await dbService.saveOAuthLinkAsync(provider, providerId, existingUserId);
            this.cache.setIdentity(provider, providerId, existingUserId);
            return this.resolveUserFromIdentityAsync(identity);
        }

        // refuse before anything is written, so a refused sign-in leaves nothing behind
        if (!name) {
            throw new Error('Session token has no name to create an account with');
        }
        if (!email) {
            throw new Error('Session token has no email to create an account with');
        }
        const cleanedUsername = name.trim()
            .replace(/\s+/g, '')
            .replace(/[^a-zA-Z0-9_]/g, '');
        const newUser: IUserProfileDataEntity = {
            id: linkedUserId ?? uuid(),
            username: cleanedUsername,
            lastLogin: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            usernameLastUpdatedAt: new Date().toISOString(),
            showWelcomeMessage: true,
            preferences: getDefaultPreferences(),
            needsUsernameChange: false,
            swuStatsRefreshToken: null,
            swubaseRefreshToken: null,
            moderation: null,
            undoPopupSeenDate: null,
            timerPopupSeenDate: null,
        };

        // Nothing refers to a new account until the OAuth link is written, and that is done last. If an earlier
        // write fails, a retry finds the email link (or starts again) instead of being refused by an existing link.
        await dbService.saveUserProfileAsync(newUser);
        await dbService.saveUsernameLinkAsync(newUser.username, newUser.id);
        await dbService.saveEmailLinkAsync(email, newUser.id);
        if (!linkedUserId) {
            try {
                await dbService.saveOAuthLinkAsync(provider, providerId, newUser.id);
            } catch (error) {
                if (error.name !== 'ConditionalCheckFailedException') {
                    throw error;
                }

                // another request claimed this identity first: use its account and drop what was written for this one
                logger.warn(`Account for ${provider} identity was created concurrently, discarding ${newUser.id}`);
                this.cache.invalidateProfile(newUser.id);
                await dbService.deleteUsernameLinkAsync(newUser.username, newUser.id);
                const winner = await this.resolveUserFromIdentityAsync(identity);
                await dbService.saveEmailLinkAsync(email, winner.getId());
                return winner;
            }
        }

        // Record the initial username in the change history. This runs after all essential account
        // records are created and is best-effort, so a failure here won't leave the account in a
        // half-finished state or abort account creation.
        try {
            await this.recordUsernameChangeAsync(newUser.id, null, newUser.username, UsernameChangeSource.AccountCreation);
        } catch {
            // error already logged in recordUsernameChangeAsync
        }
        logger.info(`Created new user: ${newUser.id} (${name}) with ${provider} authentication`);

        this.cache.setIdentity(provider, providerId, newUser.id);
        this.cache.invalidateProfile(newUser.id);
        return new AuthenticatedUser(structuredClone(newUser));
    }

    /**
     * Add or update the SWUstats / SWUBase refresh token for a user.
     * - Calling again overwrites the old token.
     * - Does NOT return the token.
     */
    public async addRefreshTokenAsync(userId: string, refreshToken: string, source: RefreshTokenSource): Promise<void> {
        Contract.assertNotNullLike(userId, 'userId is required');
        Contract.assertTrue(!!refreshToken, 'refreshToken is required');
        try {
            await this.updateProfileAsync(userId, {
                [refreshTokenFieldMap[source]]: refreshToken,
            });
        } catch (error: any) {
            logger.error(`Error linking ${source} refresh token:`, {
                error: { message: error.message, stack: error.stack }, userId
            });
            throw error;
        }
    }

    /**
     * Fetches the SWUstats / SWUBase refresh token for a user
     * @returns The refresh token
     * @param userId a users id
     * @param source a source of the refresh token (SWUStats or SWUBase)
     */
    public async getUserRefreshTokenAsync(userId: string, source: RefreshTokenSource): Promise<string | null> {
        Contract.assertNotNullLike(userId, 'user is required');
        try {
            const dbService = await this.dbServicePromise;
            const userProfile = await dbService.getUserProfileAsync(userId);

            if (!userProfile) {
                throw new Error(`No user profile found for userId ${userId}`);
            }
            return userProfile[refreshTokenFieldMap[source]];
        } catch (error: any) {
            logger.error(`Error refreshing user ${source} token:`, {
                error: { message: error.message, stack: error.stack },
                userId
            });
            throw error;
        }
    }

    /**
     * Remove the SWUstats / SWUBase refresh token (unlink account).
     */
    public async unlinkRefreshTokenAsync(userId: string, source: RefreshTokenSource): Promise<void> {
        Contract.assertTrue(!!userId, 'userId is required');

        try {
            await this.updateProfileAsync(userId, {
                [refreshTokenFieldMap[source]]: null,
            });
        } catch (error: any) {
            logger.error(`Error unlinking ${source}:`, {
                error: { message: error.message, stack: error.stack }, userId
            });
            throw error;
        }
    }

    /**
     * TODO remove this function after 1 month of new mod actions since its legacy
     * Processes moderation logic for a user
     * @param userData User data from database
     * @returns Updated user data with moderation processed
     */
    private async processModerationAsync(userData: IUserProfileDataEntity): Promise<IUserProfileDataEntity> {
        if (!userData.moderation || !userData.moderation.daysRemaining) {
            return userData;
        }
        try {
            const dbService = await this.dbServicePromise;
            Contract.assertNonNegative(userData.moderation.daysRemaining);
            // Check if user has moderation field and it's not null
            if (!userData.moderation.endDate) {
                userData.moderation = {
                    ...userData.moderation,
                    endDate: new Date(Date.now() + userData.moderation.daysRemaining * this.MS_PER_DAY).toISOString(),
                    hasSeen: false,
                    moderationType: ModerationType.Mute
                };
                // Update the user in the database with the new moderation data
                await dbService.updateUserProfileAsync(userData.id, {
                    moderation: userData.moderation
                });

                logger.info(`UserFactory: Initialized moderation end date ${userData.moderation.endDate} with days remaining ${userData.moderation.daysRemaining} for user ${userData.id}`, {
                    userId: userData.id
                });
                return userData;
            }

            // Check if moderation has expired
            const endDate = new Date(userData.moderation.endDate);
            const now = new Date(Date.now());

            if (now > endDate) {
                userData.moderation = null;
                // Update the user in the database to remove moderation data
                await dbService.updateUserProfileAsync(userData.id, {
                    moderation: null
                });

                logger.info(`UserFactory: Cleared expired moderation for user ${userData.id}`, {
                    userId: userData.id,
                });
            }

            return userData;
        } catch (error) {
            logger.error('Error processing moderation for user:', {
                error: { message: error.message, stack: error.stack },
                userId: userData.id
            });
            throw error;
        }
    }

    /**
     * Records that the user has seen the one-time notice for a UsernameChangesBlocked restriction.
     * Same design as {@link setReportingDisabledSeenAsync}: stored on the profile, keyed by action id, so a
     * re-issued restriction shows the notice again.
     * @returns True if the profile was updated.
     */
    public async setUsernameChangesBlockedSeenAsync(userId: string, modActionId: string): Promise<boolean> {
        try {
            const dbService = await this.dbServicePromise;
            const userProfile = await dbService.getUserProfileAsync(userId);
            Contract.assertNotNullLike(userProfile, `No user profile found for userId ${userId}`);

            if (userProfile.usernameChangesBlockedSeenActionId === modActionId) {
                return false;
            }

            await this.updateProfileAsync(userId, {
                usernameChangesBlockedSeenActionId: modActionId
            });

            logger.info(`UserFactory: Set usernameChangesBlocked notice as seen for user ${userId}`, { userId });
            return true;
        } catch (error) {
            logger.error('Error setting usernameChangesBlocked seen status:', {
                error: { message: error.message, stack: error.stack },
                userId
            });
            throw error;
        }
    }

    public async setModerationSeenAsync(userId: string): Promise<boolean> {
        try {
            const dbService = await this.dbServicePromise;
            const userProfile = await dbService.getUserProfileAsync(userId);
            Contract.assertNotNullLike(userProfile, `No user profile found for userId ${userId}`);

            if (userProfile.moderation) {
                userProfile.moderation.hasSeen = true;
                await this.updateProfileAsync(userId, {
                    moderation: userProfile.moderation
                });

                logger.info(`UserFactory: Set moderation as seen for user ${userId}`, { userId: userId });
                return true;
            }

            return false;
        } catch (error) {
            logger.error('Error setting moderation seen status:', {
                error: { message: error.message, stack: error.stack },
                userId
            });
            throw error;
        }
    }

    /**
     * Records that the user has seen the one-time notice for a ReportingDisabled restriction.
     * Stored on the profile so it is authoritative across instances; a re-issued restriction has a
     * different action id and so shows the notice again.
     * @returns True if the profile was updated.
     */
    public async setReportingDisabledSeenAsync(userId: string, modActionId: string): Promise<boolean> {
        try {
            const dbService = await this.dbServicePromise;
            const userProfile = await dbService.getUserProfileAsync(userId);
            Contract.assertNotNullLike(userProfile, `No user profile found for userId ${userId}`);

            if (userProfile.reportingDisabledSeenActionId === modActionId) {
                return false;
            }

            await this.updateProfileAsync(userId, {
                reportingDisabledSeenActionId: modActionId
            });

            logger.info(`UserFactory: Set reportingDisabled notice as seen for user ${userId}`, { userId });
            return true;
        } catch (error) {
            logger.error('Error setting reportingDisabled seen status:', {
                error: { message: error.message, stack: error.stack },
                userId
            });
            throw error;
        }
    }

    // ------------------ MOD ACTIONS ------------------
    /**
     * Find user profile(s) by ID or username.
     * - If searchQuery matches a userId: returns a single profile.
     * - Otherwise tries username lookup: can return multiple profiles.
     * @returns Array of matching user profiles, or empty array if not found.
     */
    public async findUserProfilesAsync(searchQuery: string): Promise<IUserProfileDataEntity[]> {
        try {
            const dbService = await this.dbServicePromise;

            // Try direct lookup by userId first
            const directProfile = await dbService.getUserProfileAsync(searchQuery);
            if (directProfile) {
                return [directProfile];
            }

            // Fallback to username search
            const userIds = await dbService.getUserIdsByUsernameAsync(searchQuery);
            if (!userIds || userIds.length === 0) {
                return [];
            }

            const profiles: IUserProfileDataEntity[] = [];
            for (const userId of userIds) {
                const profile = await dbService.getUserProfileAsync(userId);
                if (profile) {
                    profiles.push(profile);
                }
            }

            return profiles;
        } catch (error) {
            logger.error('Error finding user profiles:', {
                error: { message: error.message, stack: error.stack },
            });
            throw error;
        }
    }

    /**
     * Get the full mod action history for a player (all actions, including cancelled/expired).
     * Sorted by createdAt descending (newest first).
     */
    public async getModActionHistoryAsync(userId: string): Promise<IModActionEntity[]> {
        try {
            const dbService = await this.dbServicePromise;
            const modActions = await dbService.getModActionsAsync({ userId });
            modActions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return modActions;
        } catch (error) {
            logger.error('Error getting mod action history:', {
                error: { message: error.message, stack: error.stack },
                userId
            });
            throw error;
        }
    }

    /**
     * Record a username change in the user's history.
     */
    public async recordUsernameChangeAsync(
        userId: string,
        previousUsername: string | null,
        newUsername: string,
        source: UsernameChangeSource,
        relatedModActionId?: string,
    ): Promise<void> {
        try {
            const dbService = await this.dbServicePromise;
            const record: IUsernameChangeEntity = {
                id: uuid(),
                playerId: userId,
                previousUsername,
                newUsername,
                source,
                relatedModActionId,
                createdAt: new Date().toISOString(),
            };
            await dbService.saveUsernameChangeAsync(record);
        } catch (error) {
            logger.error('Error recording username change:', {
                error: { message: error.message, stack: error.stack },
                userId
            });
            throw error;
        }
    }

    /**
     * Get the full username change history for a player.
     * Sorted by createdAt descending (newest first).
     */
    public async getUsernameChangeHistoryAsync(userId: string): Promise<IUsernameChangeEntity[]> {
        try {
            const dbService = await this.dbServicePromise;
            const usernameChanges = await dbService.getUsernameChangesAsync(userId);
            usernameChanges.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return usernameChanges;
        } catch (error) {
            logger.error('Error getting username change history:', {
                error: { message: error.message, stack: error.stack },
                userId
            });
            throw error;
        }
    }
}