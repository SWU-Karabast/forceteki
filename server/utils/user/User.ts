import type { IUserDataEntity, UserPreferences } from '../../services/DynamoDBInterfaces';

/**
 * Abstract base User class
 */
export abstract class User {
    /**
     * Checks if the user is authenticated (has an account)
     */
    public abstract isAuthenticatedUser(): boolean;

    /**
     * Checks if the user isn't authenticated (is anonymous)
     */
    public abstract isAnonymousUser(): boolean;

    /**
     * Gets the user's ID (either authenticated user ID or anonymous ID)
     */
    public abstract getId(): string;

    /**
     * Gets the user's username
     */
    public abstract getUsername(): string;

    /**
     * Gets a users welcomeMessage status
     */
    public abstract getShowWelcomeMessage(): boolean;

    /**
     * Gets the user's preferences
     */
    public abstract getPreferences(): UserPreferences;

    /**
     * Sets the user's preferences
     */
    public abstract setPreferences(preferences: UserPreferences): void;

    /**
     * Gets the object representation of the user for sending to the client
     */
    public abstract toJSON(): Record<string, any>;

    public abstract needsUsernameChange(): boolean;
}

/**
 * Represents an authenticated user with a full account
 */
export class AuthenticatedUser extends User {
    public userData: IUserDataEntity;

    public constructor(userData: IUserDataEntity) {
        super();
        this.userData = userData;
    }

    public isAuthenticatedUser(): boolean {
        return true;
    }

    public isAnonymousUser(): boolean {
        return false;
    }

    public getId(): string {
        return this.userData.id;
    }

    public getShowWelcomeMessage(): boolean {
        return this.userData.showWelcomeMessage;
    }

    public getUsername(): string {
        return this.userData.username;
    }

    public getPreferences(): UserPreferences {
        return this.userData.preferences;
    }

    public setPreferences(preferences: UserPreferences) {
        this.userData.preferences = preferences;
    }

    public needsUsernameChange(): boolean {
        // undefined = false
        return !!this.userData.needsUsernameChange;
    }

    public toJSON(): Record<string, any> {
        return {
            id: this.getId(),
            username: this.getUsername(),
            isAuthenticated: this.isAuthenticatedUser(),
            isAnonymousUser: this.isAnonymousUser(),
            preferences: this.getPreferences(),
        };
    }
}

/**
 * Represents an anonymous user without an account
 */
export class AnonymousUser extends User {
    public id: string;
    public username: string;

    public constructor(id: string, username: string = 'Anonymous') {
        super();
        this.id = id;
        this.username = username;
    }

    public isAuthenticatedUser(): boolean {
        return false;
    }

    public isAnonymousUser(): boolean {
        return true;
    }

    public getId(): string {
        return this.id;
    }

    public needsUsernameChange(): boolean {
        return false;
    }

    public getUsername(): string {
        return this.username;
    }

    public getPreferences(): UserPreferences {
        return null;
    }

    public setPreferences(_preferences: UserPreferences) {
        throw new Error('Anonymous users do not support preferences. Check supportsPreferences() before calling this method.');
    }

    public override getShowWelcomeMessage(): boolean {
        return false;
    }

    public toJSON(): Record<string, any> {
        return {
            id: this.getId(),
            username: this.getUsername(),
            isAuthenticated: this.isAuthenticatedUser(),
            isAnonymousUser: this.isAnonymousUser(),
            preferences: this.getPreferences(),
        };
    }
}