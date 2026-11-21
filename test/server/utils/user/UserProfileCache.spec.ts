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

    describe('identity capacity', function() {
        const lookup = (id: string) => jasmine.createSpy(`lookup-${id}`).and.callFake(() => Promise.resolve(`user-${id}`));

        it('drops the least recently used identity when full, and reading one counts as using it', async function() {
            const lookups = { a: lookup('a'), b: lookup('b'), c: lookup('c'), d: lookup('d') };

            await cache.getUserIdAsync('discord', 'a', lookups.a);
            await cache.getUserIdAsync('discord', 'b', lookups.b);
            await cache.getUserIdAsync('discord', 'c', lookups.c);
            await cache.getUserIdAsync('discord', 'a', lookups.a);
            await cache.getUserIdAsync('discord', 'd', lookups.d);

            for (const id of ['a', 'c', 'd'] as const) {
                await cache.getUserIdAsync('discord', id, lookups[id]);
                expect(lookups[id]).withContext(id)
                    .toHaveBeenCalledTimes(1);
            }
            await cache.getUserIdAsync('discord', 'b', lookups.b);
            expect(lookups.b).toHaveBeenCalledTimes(2);
        });

        it('drops the least recently used identity when one recorded by setIdentity makes it full', async function() {
            cache.setIdentity('discord', 'a', 'user-a');
            cache.setIdentity('discord', 'b', 'user-b');
            cache.setIdentity('discord', 'c', 'user-c');
            cache.setIdentity('discord', 'd', 'user-d');

            const reloaded = jasmine.createSpy('reloaded').and.resolveTo('user-a');
            await cache.getUserIdAsync('discord', 'a', reloaded);

            expect(reloaded).toHaveBeenCalledTimes(1);
            expect(cache.consumeStats().identityCount).toBe(3);
        });

        it('keeps one identity entry when the same identity is recorded again', function() {
            cache.setIdentity('discord', 'a', 'user-a');
            cache.setIdentity('discord', 'a', 'user-b');

            expect(cache.consumeStats()).toEqual(jasmine.objectContaining({ identityCount: 1, identityEvictions: 0 }));
        });
    });

    describe('profile capacity counts', function() {
        it('holds no more than the limit, and counts each profile it drops', async function() {
            for (const id of ['a', 'b', 'c', 'd', 'e']) {
                await cache.getProfileAsync(id, () => Promise.resolve(profileOf(id)));
            }

            expect(cache.consumeStats()).toEqual(jasmine.objectContaining({ profileCount: 3, profileEvictions: 2 }));
        });

        it('does not let a full set of identities push out profiles, or the reverse', async function() {
            for (const id of ['a', 'b', 'c']) {
                await cache.getProfileAsync(id, () => Promise.resolve(profileOf(id)));
            }
            for (const id of ['1', '2', '3', '4', '5']) {
                cache.setIdentity('discord', id, `user-${id}`);
            }

            const stats = cache.consumeStats();
            expect(stats.profileCount).toBe(3);
            expect(stats.profileEvictions).toBe(0);
            expect(stats.identityCount).toBe(3);
            expect(stats.identityEvictions).toBe(2);
        });
    });

    describe('expiry details', function() {
        const load = () => Promise.resolve(profileOf('a'));

        it('treats a profile as expired exactly when its time is up', async function() {
            const spy = jasmine.createSpy('load').and.callFake(load);
            await cache.getProfileAsync('a', spy);

            now += 1000;
            await cache.getProfileAsync('a', spy);

            expect(spy).toHaveBeenCalledTimes(2);
        });

        it('starts a reloaded profile\'s time again from the reload', async function() {
            const spy = jasmine.createSpy('load').and.callFake(load);
            await cache.getProfileAsync('a', spy);
            now += 1500;
            await cache.getProfileAsync('a', spy);

            now += 999;
            await cache.getProfileAsync('a', spy);
            expect(spy).toHaveBeenCalledTimes(2);

            now += 2;
            await cache.getProfileAsync('a', spy);
            expect(spy).toHaveBeenCalledTimes(3);
        });

        it('still expires a profile that is read all the time', async function() {
            const spy = jasmine.createSpy('load').and.callFake(load);
            await cache.getProfileAsync('a', spy);

            for (let elapsed = 0; elapsed < 900; elapsed += 100) {
                now += 100;
                await cache.getProfileAsync('a', spy);
            }
            expect(spy).toHaveBeenCalledTimes(1);

            now += 200;
            await cache.getProfileAsync('a', spy);
            expect(spy).toHaveBeenCalledTimes(2);
        });

        it('counts an expired profile as a miss and replaces it rather than keeping both', async function() {
            await cache.getProfileAsync('a', load);
            now += 1000;
            await cache.getProfileAsync('a', load);

            expect(cache.consumeStats()).toEqual(jasmine.objectContaining({ profileHits: 0, profileMisses: 2, profileCount: 1 }));
        });

        it('shares one reload between concurrent requests for an expired profile', async function() {
            const spy = jasmine.createSpy('load').and.callFake(load);
            await cache.getProfileAsync('a', spy);
            now += 1000;

            await Promise.all([cache.getProfileAsync('a', spy), cache.getProfileAsync('a', spy), cache.getProfileAsync('a', spy)]);

            expect(spy).toHaveBeenCalledTimes(2);
        });
    });

    describe('failed loads', function() {
        it('fail every request that was waiting on them, after a single attempt', async function() {
            const load = jasmine.createSpy('load').and.callFake(() => Promise.reject(new Error('db down')));

            const results = await Promise.allSettled([cache.getProfileAsync('a', load), cache.getProfileAsync('a', load)]);

            expect(results.map((result) => result.status)).toEqual(['rejected', 'rejected']);
            expect(load).toHaveBeenCalledTimes(1);
        });

        it('do not disturb a newer load that started after an invalidation', async function() {
            let failStale: (error: Error) => void;
            let resolveFresh: (profile: IUserProfileDataEntity) => void;
            const stale = cache.getProfileAsync('a', () => new Promise<IUserProfileDataEntity>((_resolve, reject) => (failStale = reject)));
            cache.invalidateProfile('a');
            const freshLoad = jasmine.createSpy('freshLoad').and.returnValue(new Promise<IUserProfileDataEntity>((resolve) => (resolveFresh = resolve)));
            const fresh = cache.getProfileAsync('a', freshLoad);

            failStale(new Error('db down'));
            await expectAsync(stale).toBeRejectedWithError('db down');
            const joiner = cache.getProfileAsync('a', () => Promise.reject(new Error('should join the fresh load')));
            resolveFresh(profileOf('a', 'fresh'));

            expect((await fresh).username).toBe('fresh');
            expect((await joiner).username).toBe('fresh');
            expect(freshLoad).toHaveBeenCalledTimes(1);
        });
    });

    describe('clearing', function() {
        it('drops every profile and identity', async function() {
            const profileLoad = jasmine.createSpy('profileLoad').and.callFake(() => Promise.resolve(profileOf('a')));
            const identityLoad = jasmine.createSpy('identityLoad').and.callFake(() => Promise.resolve('user-a'));
            await cache.getProfileAsync('a', profileLoad);
            await cache.getUserIdAsync('discord', '1', identityLoad);

            cache.clear();
            await cache.getProfileAsync('a', profileLoad);
            await cache.getUserIdAsync('discord', '1', identityLoad);

            expect(profileLoad).toHaveBeenCalledTimes(2);
            expect(identityLoad).toHaveBeenCalledTimes(2);
        });

        it('stops a read in flight from storing what it read', async function() {
            let resolveStale: (profile: IUserProfileDataEntity) => void;
            const inFlight = cache.getProfileAsync('a', () => new Promise<IUserProfileDataEntity>((resolve) => (resolveStale = resolve)));

            cache.clear();
            resolveStale(profileOf('a', 'stale'));
            await inFlight;

            const fresh = await cache.getProfileAsync('a', () => Promise.resolve(profileOf('a', 'fresh')));
            expect(fresh.username).toBe('fresh');
        });
    });

    describe('defaults', function() {
        it('keeps 3000 profiles and 6000 identities', async function() {
            const defaults = new UserProfileCache();

            for (let i = 0; i < 3001; i++) {
                await defaults.getProfileAsync(`user-${i}`, () => Promise.resolve(profileOf(`user-${i}`)));
            }
            for (let i = 0; i < 6001; i++) {
                defaults.setIdentity('discord', String(i), `user-${i}`);
            }

            expect(defaults.consumeStats()).toEqual(jasmine.objectContaining({
                profileCount: 3000,
                profileEvictions: 1,
                identityCount: 6000,
                identityEvictions: 1,
            }));
        });

        it('keeps a profile for 4 hours from when it was loaded', async function() {
            const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;
            const defaults = new UserProfileCache({ now: () => now });
            const load = jasmine.createSpy('load').and.callFake(() => Promise.resolve(profileOf('a')));
            await defaults.getProfileAsync('a', load);

            now += FOUR_HOURS_MS - 1;
            await defaults.getProfileAsync('a', load);
            expect(load).toHaveBeenCalledTimes(1);

            now += 1;
            await defaults.getProfileAsync('a', load);
            expect(load).toHaveBeenCalledTimes(2);
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

        it('counts identity hits and evictions, and keeps the sizes when the counts start again', async function() {
            for (const id of ['a', 'b', 'c', 'd']) {
                await cache.getUserIdAsync('discord', id, () => Promise.resolve(`user-${id}`));
            }
            await cache.getUserIdAsync('discord', 'd', () => Promise.reject(new Error('should not load')));

            expect(cache.consumeStats()).toEqual(jasmine.objectContaining({
                identityHits: 1,
                identityMisses: 4,
                identityEvictions: 1,
                identityCount: 3,
            }));
            expect(cache.consumeStats()).toEqual(jasmine.objectContaining({ identityHits: 0, identityEvictions: 0, identityCount: 3 }));
        });
    });
});
