import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';

// Run the source script: its paths and data hash intentionally refer to the repository, not build/.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { syncCardData, main } = require(path.join(process.cwd(), 'scripts/fetchdata.js'));

describe('incremental card downloads', function() {
    const now = Date.parse('2026-10-27T12:00:00Z');
    const hour = 60 * 60 * 1000;
    const card = (id: number, title = `Card ${id}`) => ({
        id,
        attributes: {
            title, cardId: String(id), cardNumber: id, updatedAt: new Date(now - hour).toISOString(),
            variantOf: { data: null }, expansion: { data: { attributes: { code: 'SOR' } } },
            type: { data: { attributes: { name: 'unit' } } },
            aspects: { data: [] }, aspectDuplicates: { data: [] }, traits: { data: [] },
            arenas: { data: [] }, keywords: { data: [] },
            cost: 1, hp: 1, power: 1, text: '',
        },
    });
    const response = (cards: ReturnType<typeof card>[], total = cards.length, pageCount = 1) => ({
        data: { data: cards, meta: { pagination: { total, pageCount } } },
        headers: { date: new Date(now).toUTCString() },
    });
    const cached = () => ({ version: 1, syncedAt: now - hour, fullRefreshAt: now - hour, cards: [card(1), card(2)] });

    it('downloads all pages on the first run, without fetching page one twice', async function() {
        const request = jasmine.createSpy('request').and.callFake((params) =>
            Promise.resolve(response([card(Number(params['pagination[page]']))], 2, 2)));

        const result = await syncCardData({ now, request });

        expect(request).toHaveBeenCalledTimes(2);
        expect(request.calls.first().args[0]['filters[variantOf][id][$null]']).toBe('true');
        expect(result.cache.cards.map((entry) => entry.id)).toEqual([1, 2]);
        expect(result.fullRefresh).toBeTrue();
    });

    it('merges changes and additions without downloading unchanged cards or mutating the cache', async function() {
        const cache = cached();
        const request = jasmine.createSpy('request').and.resolveTo(response([card(2, 'Updated'), card(3)]));

        const result = await syncCardData({ cache, now, request });

        expect(request).toHaveBeenCalledTimes(1);
        expect(request.calls.first().args[0]['filters[updatedAt][$gte]']).toBe(new Date(now - 3 * hour).toISOString());
        expect(request.calls.first().args[0]['filters[variantOf][id][$null]']).toBeUndefined();
        expect(result.cache.cards.map((entry) => entry.attributes.title)).toEqual(['Card 1', 'Updated', 'Card 3']);
        expect(cache.cards[1].attributes.title).toBe('Card 2');
        expect(result.fullRefresh).toBeFalse();
    });

    it('reuses all cached cards when the update query is empty', async function() {
        const cache = cached();
        const request = jasmine.createSpy('request').and.resolveTo(response([], 0, 0));

        const result = await syncCardData({ cache, now, request });

        expect(result.cache.cards).toEqual(cache.cards);
        expect(result.fetchedCount).toBe(0);
        expect(request).toHaveBeenCalledTimes(1);
    });

    it('does not replace newer cached data with an older CDN response', async function() {
        const stale = card(1, 'Old title');
        stale.attributes.updatedAt = new Date(now - 2 * hour).toISOString();

        const result = await syncCardData({ cache: cached(), now, request: () => Promise.resolve(response([stale])) });

        expect(result.cache.cards[0].attributes.title).toBe('Card 1');
    });

    it('removes cards that became promos or variants during an incremental sync', async function() {
        const variant = { ...card(1), attributes: { ...card(1).attributes, variantOf: { data: { id: 3 } } } };
        const promo = card(2);
        promo.attributes.expansion.data.attributes.code = 'P26';
        const request = jasmine.createSpy('request').and.resolveTo({ ...response([]),
            data: { data: [variant, promo], meta: { pagination: { total: 2, pageCount: 1 } } } });

        const result = await syncCardData({ cache: cached(), now, request });

        expect(result.cache.cards).toEqual([]);
    });

    for (const reason of ['force', 'weekly', 'invalid']) {
        it(`replaces the catalog on a ${reason} refresh, dropping deleted records`, async function() {
            const cache = cached();
            if (reason === 'weekly') {
                cache.fullRefreshAt = now - 8 * 24 * hour;
            }
            if (reason === 'invalid') {
                cache.version = -1;
            }
            const request = jasmine.createSpy('request').and.resolveTo(response([card(2)]));

            const result = await syncCardData({ cache, now, force: reason === 'force', request });

            expect(result.fullRefresh).toBeTrue();
            expect(result.cache.cards.map((entry) => entry.id)).toEqual([2]);
            expect(request.calls.first().args[0]['filters[updatedAt][$gte]']).toBeUndefined();
        });
    }

    it('does not advance the sync cursor past the CDN response time', async function() {
        const apiResponse = response([]);
        apiResponse.headers.date = new Date(now - hour).toUTCString();

        const result = await syncCardData({ cache: cached(), now, request: () => Promise.resolve(apiResponse) });

        expect(result.cache.syncedAt).toBe(now - hour);
    });

    it('rejects partial downloads without changing the cache', async function() {
        const cache = cached();
        const original = JSON.stringify(cache);
        const request = jasmine.createSpy('request').and.returnValues(
            Promise.resolve(response([card(1)], 2, 2)),
            Promise.resolve(response([card(2)], 3, 2))
        );

        await expectAsync(syncCardData({ cache, now, request })).toBeRejectedWithError(/catalog changed/);
        expect(JSON.stringify(cache)).toBe(original);
    });

    it('rejects an empty full refresh instead of deleting the local catalog', async function() {
        await expectAsync(syncCardData({ now, request: () => Promise.resolve(response([])) })).toBeRejectedWithError(/empty catalog/);
    });

    describe('generated files', function() {
        let outputDir: string;

        beforeEach(async function() {
            outputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'forceteki-card-sync-'));
            spyOn(console, 'log');
        });

        afterEach(async function() {
            await fs.rm(outputDir, { recursive: true, force: true });
        });

        const readJson = async (directory: string, name: string) => JSON.parse(await fs.readFile(path.join(directory, name), 'utf8'));
        const liveResponse = (cards: ReturnType<typeof card>[]) => ({ ...response(cards), headers: {} });

        it('regenerates missing outputs from source cache and removes obsolete files after a rename', async function() {
            await main({ outputDir, request: () => Promise.resolve(liveResponse([card(1)])) });
            await fs.unlink(path.join(outputDir, 'Card/card-1.json'));

            await main({ outputDir, request: () => Promise.resolve(liveResponse([])) });

            expect((await readJson(outputDir, 'Card/card-1.json')).title).toBe('Card 1');

            await main({ outputDir, request: () => Promise.resolve(liveResponse([card(1, 'Renamed')])) });

            expect((await readJson(outputDir, 'Card/renamed.json')).title).toBe('Renamed');
            await expectAsync(fs.access(path.join(outputDir, 'Card/card-1.json'))).toBeRejected();
            expect((await readJson(outputDir, '_cardMap.json')).some((entry) => entry.internalName === 'renamed')).toBeTrue();
            expect((await fs.readFile(path.join(outputDir, 'card-data-hash.txt'), 'utf8')).length).toBe(64);
        });

        it('keeps the previous cache and output intact when fetching or transforming fails', async function() {
            await main({ outputDir, request: () => Promise.resolve(liveResponse([card(1)])) });
            const before = await fs.readFile(path.join(outputDir, '_sourceCardCache.json'), 'utf8');

            await expectAsync(main({ outputDir, request: () => Promise.reject(new Error('Network failure')) })).toBeRejectedWithError('Network failure');

            const malformed = card(1);
            delete malformed.attributes.type;
            await expectAsync(main({ outputDir, request: () => Promise.resolve(liveResponse([malformed])) })).toBeRejectedWithError(/Error parsing card/);
            expect(await fs.readFile(path.join(outputDir, '_sourceCardCache.json'), 'utf8')).toBe(before);
            expect((await readJson(outputDir, 'Card/card-1.json')).title).toBe('Card 1');
        });

        it('recovers from corrupt source cache with a full refresh', async function() {
            await fs.writeFile(path.join(outputDir, '_sourceCardCache.json'), '{broken');
            const request = jasmine.createSpy('request').and.resolveTo(liveResponse([card(1)]));

            await main({ outputDir, request });

            expect(request.calls.first().args[0]['filters[variantOf][id][$null]']).toBe('true');
            expect((await readJson(outputDir, '_sourceCardCache.json')).cards.length).toBe(1);
        });

        it('keeps API source data unmodified when applying local card fixes', async function() {
            const shield = card(1, 'Shield');
            shield.attributes.cardId = '8752877738';

            await main({ outputDir, request: () => Promise.resolve(liveResponse([shield])) });

            expect((await readJson(outputDir, 'Card/shield.json')).upgradePower).toBe(0);
            expect((await readJson(outputDir, '_sourceCardCache.json')).cards[0].attributes.upgradePower).toBeUndefined();
        });
    });
});
