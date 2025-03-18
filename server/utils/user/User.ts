export interface IUserData {
    id: string;
    username: string;
    preferences?: Record<string, any>;
}

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
     * Checks if the user has admin privileges
     */
    public abstract isAdmin(): boolean;

    /**
     * Gets the user's preferences
     */
    public abstract getPreferences(): Record<string, any>;

    /**
     * Gets the object representation of the user for sending to the client
     */
    public abstract toJSON(): Record<string, any>;
}

/**
 * Represents an authenticated user with a full account
 */
export class AuthenticatedUser extends User {
    public userData: IUserData;

    public constructor(userData: IUserData) {
        super();
        this.userData = userData;
    }

    public isAuthenticatedUser(): boolean {
        return true;
    }

    public isAnonymousUser(): boolean {
        return true;
    }

    public getId(): string {
        return this.userData.id;
    }

    public getUsername(): string {
        return this.userData.username;
    }

    public isAdmin(): boolean {
        return this.userData.preferences?.isAdmin === true;
    }

    public getPreferences(): Record<string, any> {
        return this.userData.preferences || {};
    }

    public toJSON(): Record<string, any> {
        return {
            id: this.getId(),
            isAdmin: this.isAdmin(),
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

    public getUsername(): string {
        return this.username;
    }

    public isAdmin(): boolean {
        return false;
    }

    public getPreferences(): Record<string, any> {
        return { cardback: 'default' };
    }

    public toJSON(): Record<string, any> {
        return {
            id: this.getId(),
            isAdmin: this.isAdmin(),
            username: this.getUsername(),
            isAuthenticated: this.isAuthenticatedUser(),
            isAnonymousUser: this.isAnonymousUser(),
            preferences: this.getPreferences(),
        };
    }
}