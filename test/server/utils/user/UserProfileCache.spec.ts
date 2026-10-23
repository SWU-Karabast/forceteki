import type { IUserProfileDataEntity } from '../../../../server/services/DynamoDBInterfaces';
import { UserProfileCache } from '../../../../server/utils/user/UserProfileCache';

describe('UserProfileCache', function() {
    const profileOf = (id: string, username = `name-${id}`): IUserProfileDataEntity => {
        const profile: Partial<IUserProfileDataEntity> = { id, username };
        return profile as IUserProfileDataEntity;
    };

    let now: number;
    let cache: UserProfileCache;

    beforeEach(function() {
        now = 1_000_000;
        cache = new UserProfileCache({ maxProfiles: 3, maxIdentities: 3, profileTtlMs: 1000, now: () => now });
    });

    describe('profiles', function() {
        it('loads a profile once and then serves it from the cache', async function() {
            const load = jasmine.createSpy('load').and.resolveTo(profileOf('a'));

            await cache.getProfileAsync('a', load);
            const second = await cache.getProfileAsync('a', load);

            expect(load).toHaveBeenCalledTimes(1);
            expect(second.username).toBe('name-a');
        });

        it('gives each caller a copy, so changing one cannot change what is cached', async function() {
            const load = jasmine.createSpy('load').and.resolveTo(profileOf('a'));

            const first = await cache.getProfileAsync('a', load);
            first.username = 'tampered';
            const second = await cache.getProfileAsync('a', load);

            expect(second.username).toBe('name-a');
        });

        it('does not let the loader\'s own object be changed through the cache', async function() {
            const loaded = profileOf('a');

            await cache.getProfileAsync('a', () => Promise.resolve(loaded));
            const cached = await cache.getProfileAsync('a', () => Promise.reject(new Error('should not load')));
            cached.username = 'tampered';

            expect(loaded.username).toBe('name-a');
        });

        it('shares one load between concurrent requests', async function() {
            let resolveLoad: (profile: IUserProfileDataEntity) => void;
            const load = jasmine.createSpy('load').and.returnValue(new Promise<IUserProfileDataEntity>((resolve) => (resolveLoad = resolve)));

            const requests = [cache.getProfileAsync('a', load), cache.getProfileAsync('a', load), cache.getProfileAsync('a', load)];
            resolveLoad(profileOf('a'));
            const profiles = await Promise.all(requests);

            expect(load).toHaveBeenCalledTimes(1);
            expect(profiles.map((profile) => profile.id)).toEqual(['a', 'a', 'a']);
        });

        it('does not cache a user with no profile', async function() {
            const load = jasmine.createSpy('load').and.resolveTo(undefined);

            await cache.getProfileAsync('a', load);
            await cache.getProfileAsync('a', load);

            expect(load).toHaveBeenCalledTimes(2);
        });

        it('does not cache a failed load, and lets the next request try again', async function() {
            let attempts = 0;
            const load = jasmine.createSpy('load').and.callFake(() => (++attempts === 1 ? Promise.reject(new Error('db down')) : Promise.resolve(profileOf('a'))));

            await expectAsync(cache.getProfileAsync('a', load)).toBeRejectedWithError('db down');
            const profile = await cache.getProfileAsync('a', load);

            expect(profile.id).toBe('a');
            expect(load).toHaveBeenCalledTimes(2);
        });

        describe('expiry', function() {
            it('reloads a profile once its time is up, counted from when it was loaded', async function() {
                const load = jasmine.createSpy('load').and.callFake(() => Promise.resolve(profileOf('a')));
                await cache.getProfileAsync('a', load);

                now += 999;
                await cache.getProfileAsync('a', load);
                expect(load).toHaveBeenCalledTimes(1);

                // reading it does not extend its life
                now += 2;
                await cache.getProfileAsync('a', load);
                expect(load).toHaveBeenCalledTimes(2);
            });
        });

        describe('capacity', function() {
            it('drops the least recently used profile when full', async function() {
                const load = (id: string) => jasmine.createSpy(`load-${id}`).and.callFake(() => Promise.resolve(profileOf(id)));
                const loaders = { a: load('a'), b: load('b'), c: load('c'), d: load('d') };

                await cache.getProfileAsync('a', loaders.a);
                await cache.getProfileAsync('b', loaders.b);
                await cache.getProfileAsync('c', loaders.c);
                await cache.getProfileAsync('a', loaders.a);
                await cache.getProfileAsync('d', loaders.d);

                await cache.getProfileAsync('a', loaders.a);
                await cache.getProfileAsync('b', loaders.b);

                expect(loaders.a).toHaveBeenCalledTimes(1);
                expect(loaders.b).toHaveBeenCalledTimes(2);
                expect(cache.consumeStats().profileEvictions).toBeGreaterThan(0);
            });
        });

        describe('invalidation', function() {
            it('makes the next request read the profile again', async function() {
                let username = 'before';
                const load = () => Promise.resolve(profileOf('a', username));
                await cache.getProfileAsync('a', load);

                username = 'after';
                cache.invalidateProfile('a');
                const profile = await cache.getProfileAsync('a', load);

                expect(profile.username).toBe('after');
            });

            it('stops a read that began before it from storing what it read', async function() {
                let resolveStale: (profile: IUserProfileDataEntity) => void;
                const staleLoad = () => new Promise<IUserProfileDataEntity>((resolve) => (resolveStale = resolve));
                const inFlight = cache.getProfileAsync('a', staleLoad);

                cache.invalidateProfile('a');
                resolveStale(profileOf('a', 'stale'));
                await inFlight;

                const fresh = await cache.getProfileAsync('a', () => Promise.resolve(profileOf('a', 'fresh')));
                expect(fresh.username).toBe('fresh');
            });

            it('starts a new read for requests made after it, instead of joining the one already running', async function() {
                let resolveStale: (profile: IUserProfileDataEntity) => void;
                const inFlight = cache.getProfileAsync('a', () => new Promise<IUserProfileDataEntity>((resolve) => (resolveStale = resolve)));

                cache.invalidateProfile('a');
                const fresh = await cache.getProfileAsync('a', () => Promise.resolve(profileOf('a', 'fresh')));
                resolveStale(profileOf('a', 'stale'));
                await inFlight;

                expect(fresh.username).toBe('fresh');
                const cached = await cache.getProfileAsync('a', () => Promise.reject(new Error('should not load')));
                expect(cached.username).toBe('fresh');
            });
        });
    });

    describe('identities', function() {
        it('finds an account id once and then serves it from the cache', async function() {
            const load = jasmine.createSpy('load').and.resolveTo('user-1');

            await cache.getUserIdAsync('discord', '42', load);
            const second = await cache.getUserIdAsync('discord', '42', load);

            expect(second).toBe('user-1');
            expect(load).toHaveBeenCalledTimes(1);
        });

        it('keeps identities of different providers apart', async function() {
            await cache.getUserIdAsync('discord', '42', () => Promise.resolve('discord-user'));
            const google = await cache.getUserIdAsync('google', '42', () => Promise.resolve('google-user'));

            expect(google).toBe('google-user');
        });

        it('lets two providers resolve to the same account', async function() {
            await cache.getUserIdAsync('discord', '1', () => Promise.resolve('shared'));
            await cache.getUserIdAsync('google', '2', () => Promise.resolve('shared'));

            const discord = await cache.getUserIdAsync('discord', '1', () => Promise.reject(new Error('should not load')));
            const google = await cache.getUserIdAsync('google', '2', () => Promise.reject(new Error('should not load')));

            expect([discord, google]).toEqual(['shared', 'shared']);
        });

        it('does not remember an identity that has no account, so a new account is found straight away', async function() {
            let lookups = 0;
            const load = jasmine.createSpy('load').and.callFake(() => Promise.resolve(++lookups === 1 ? undefined : 'user-1'));

            const before = await cache.getUserIdAsync('discord', '42', load);
            const after = await cache.getUserIdAsync('discord', '42', load);

            expect(before).toBeUndefined();
            expect(after).toBe('user-1');
        });

        it('serves an identity recorded by setIdentity without reading it', async function() {
            cache.setIdentity('discord', '42', 'user-1');

            const userId = await cache.getUserIdAsync('discord', '42', () => Promise.reject(new Error('should not load')));

            expect(userId).toBe('user-1');
        });

        it('does not expire identities', async function() {
            cache.setIdentity('discord', '42', 'user-1');

            now += 1000 * 60 * 60 * 24 * 365;
            const userId = await cache.getUserIdAsync('discord', '42', () => Promise.reject(new Error('should not load')));

            expect(userId).toBe('user-1');
        });
    });

    describe('stats', function() {
        it('counts hits, misses and sizes, and starts again after being read', async function() {
            await cache.getProfileAsync('a', () => Promise.resolve(profileOf('a')));
            await cache.getProfileAsync('a', () => Promise.resolve(profileOf('a')));
            await cache.getUserIdAsync('discord', '1', () => Promise.resolve('a'));

            expect(cache.consumeStats()).toEqual(jasmine.objectContaining({
                profileHits: 1,
                profileMisses: 1,
                identityMisses: 1,
                profileCount: 1,
                identityCount: 1,
            }));
            expect(cache.consumeStats()).toEqual(jasmine.objectContaining({ profileHits: 0, profileMisses: 0, identityMisses: 0 }));
        });
    });
});
