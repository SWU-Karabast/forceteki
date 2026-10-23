import jwt from 'jsonwebtoken';

import { testNextAuthSecret } from './ServerTestEnv';

/**
 * Cookie the FE's NextAuth session lives in. The server reads this one on every API call; behind HTTPS
 * the FE's cookie is named with a `__Secure-` prefix instead, which the server accepts too.
 */
export const sessionCookieName = 'next-auth.session-token';
export const secureSessionCookieName = '__Secure-next-auth.session-token';

/**
 * The claims the game node reads from a session JWT.
 *
 * They are the ones the FE's NextAuth `jwt` callback puts in the token (`forceteki-client`,
 * `src/app/_utils/auth.ts`): at sign-in it sets `id` (`<provider>_<providerId>`), `provider`,
 * `providerId`, `name` and `email`; the FE adds `userId` - the game node's own id for the account -
 * only after its first `/api/get-user`, via `session.update`. The server's two ways of
 * authenticating need different subsets, which is why a token must be built for the path under test:
 *
 * - a **synced** request (the FE sends `authenticated: true` and its own copy of the profile) needs `userId`;
 * - the **DB path** (the FE's first `/api/get-user` of a session) needs `id`, `provider`, `providerId`,
 *   `email` and `name`, and finds or creates the account from them.
 *
 * If the FE changes what it puts in the token, this is what needs to change with it.
 */
export interface ISessionClaims {
    id?: string;
    provider?: string;
    providerId?: string;
    name?: string;
    email?: string;
    picture?: string;
    sub?: string;
    userId?: string;

    /** Expiry and issue time, in seconds since the epoch; the FE's encoder adds both. */
    exp?: number;
    iat?: number;
}

/** The part of a seeded account a sign-in token is built from. */
export interface ISignInIdentity {
    username: string;
    provider: string;
    providerId: string;
    email: string;
}

export interface IMintOptions {

    /** Secret to sign with. Defaults to the one the server verifies against. */
    secret?: string;

    /**
     * Seconds until the token expires, from the real wall clock - which is what the server checks it
     * against, so advancing a spec's virtual clock never expires a token. To test an expired token,
     * mint one that is already expired (see {@link badSessionTokens}).
     */
    expiresInSeconds?: number;
}

/** Signs `claims` the way the FE does (HS256 with the shared secret). */
export function mintSessionToken(claims: ISessionClaims, options: IMintOptions = {}): string {
    return jwt.sign(claims, options.secret ?? testNextAuthSecret, {
        algorithm: 'HS256',
        ...(options.expiresInSeconds === undefined ? {} : { expiresIn: options.expiresInSeconds }),
    });
}

/** The claims in a freshly signed-in session, before the FE has called `/api/get-user`: no `userId` yet. */
export function signInClaims(identity: ISignInIdentity): ISessionClaims {
    return {
        id: `${identity.provider}_${identity.providerId}`,
        provider: identity.provider,
        providerId: identity.providerId,
        sub: identity.providerId,
        name: identity.username,
        email: identity.email,
    };
}

/** {@link signInClaims} plus the `userId` the FE adds after its first sync, i.e. every later session. */
export function syncedClaims(identity: ISignInIdentity, userId: string): ISessionClaims {
    return { ...signInClaims(identity), userId };
}

/** A `Cookie` header carrying `token` as the NextAuth session. */
export function sessionCookie(token: string, cookieName: string = sessionCookieName): string {
    return `${cookieName}=${token}`;
}

/** A token the server must reject, and what is wrong with it. */
export interface IBadSessionToken {
    description: string;
    token: string;
}

/** `claims` with `claim` taken out, as a token that was never given it. */
export function withoutClaim(claims: ISessionClaims, claim: keyof ISessionClaims): ISessionClaims {
    return Object.fromEntries(Object.entries(claims).filter(([key]) => key !== claim)) as ISessionClaims;
}

/**
 * Tokens carrying `claims` that are invalid in every way the server must catch: signed with another
 * secret, already expired, unsigned (`alg: none`), and not a JWT at all.
 */
export function badSessionTokens(claims: ISessionClaims): IBadSessionToken[] {
    const nowSeconds = Math.floor(Date.now() / 1000);

    return [
        { description: 'signed with a different secret', token: mintSessionToken(claims, { secret: 'a-completely-different-secret' }) },
        { description: 'already expired', token: mintSessionToken({ ...claims, exp: nowSeconds - 60 }) },
        { description: 'unsigned (alg: none)', token: jwt.sign(claims, '', { algorithm: 'none' }) },
        { description: 'not a JWT', token: 'not.a.jwt' },
    ];
}
