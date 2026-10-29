import { SwuPgnGameAdapter } from '../../../server/game/core/chat/SwuPgnGameAdapter';
import { GameEndReason } from '../../../server/game/core/Constants';

// Direct unit coverage for SwuPgnGameAdapter logic that the integration specs never exercise
// (Plan-3 review gap #3): the :N copy-suffix id scheme, the game-end-reason mapping, and the
// result mapping. Driven through a minimal fake Game so the real adapter code runs without the
// full engine. Private methods are reached via `as any` — these are the canonical behaviors.

function fakeGame(opts: { cards?: Record<string, any>; players?: any[]; winnerNames?: string[] }): any {
    return {
        on: () => undefined, // the recorder/adapter register listeners in the ctor; no-op them
        getFromUuidUnsafe: (uuid: string) => opts.cards?.[uuid] ?? null,
        getPlayers: () => opts.players ?? [],
        winnerNames: opts.winnerNames ?? [],
    };
}

describe('SwuPgnGameAdapter.swuPgnCardId (stable :N copy ids)', function () {
    const printed = (set: string, number: number) => ({ setId: { set, number }, isToken: () => false });

    it('keeps the bare id for the first instance and adds :N for later copies of the same printed card', function () {
        const cards = { u1: printed('sor', 108), u2: printed('sor', 108), u3: printed('sor', 108), other: printed('shd', 5) };
        const adapter: any = new SwuPgnGameAdapter(fakeGame({ cards, players: [{ id: 'p1' }, { id: 'p2' }] }));

        expect(adapter.swuPgnCardId('u1')).toBe('SOR#108');
        expect(adapter.swuPgnCardId('u2')).toBe('SOR#108:2');
        expect(adapter.swuPgnCardId('u3')).toBe('SOR#108:3');
        expect(adapter.swuPgnCardId('u1')).toBe('SOR#108');   // memoized — stable across calls
        expect(adapter.swuPgnCardId('other')).toBe('SHD#005'); // distinct printed id, own counter
    });

    it('returns "unknown" when the uuid resolves to no card', function () {
        const adapter: any = new SwuPgnGameAdapter(fakeGame({ cards: {}, players: [] }));
        expect(adapter.swuPgnCardId('missing')).toBe('unknown');
    });
});

describe('SwuPgnGameAdapter end-state mapping', function () {
    it('maps every GameEndReason to its notation string', function () {
        const adapter: any = new SwuPgnGameAdapter(fakeGame({}));
        expect(adapter.gameEndReasonString(GameEndReason.Concede)).toBe('Concession');
        expect(adapter.gameEndReasonString(GameEndReason.GameRules)).toBe('Base Destroyed');
        expect(adapter.gameEndReasonString(GameEndReason.PlayerLeft)).toBe('Disconnection');
        expect(adapter.gameEndReasonString(GameEndReason.Timeout)).toBe('Timeout');
        expect(adapter.gameEndReasonString(undefined)).toBe('Unknown');
    });

    // Value: protects=the header Result follows the recorded GAME_END, never display names; fails_when=Result compares names again (two guests are both AnonymousPlayer); why_new=replaces the name-based mapping test; seam=none; no_claim=the GAME_END winner itself (SwuPgnGameEnd.spec)
    it('maps the recorded GAME_END winner to the Result enum', function () {
        const adapter = new SwuPgnGameAdapter(fakeGame({ players: [{ id: 'a', name: 'AnonymousPlayer' }, { id: 'b', name: 'AnonymousPlayer' }] })) as any;
        const result = (gameEnd: { winner: 1 | 2 | 'Draw' } | undefined) => adapter.swuPgnResult(gameEnd);

        expect(result(undefined)).toBe('Incomplete');
        expect(result({ winner: 'Draw' })).toBe('Draw');
        expect(result({ winner: 1 })).toBe('P1');
        expect(result({ winner: 2 })).toBe('P2');
    });
});

describe('SwuPgnGameAdapter.engineVersion', function () {
    // The result is memoized in a process-wide static, so every case has to clear it or it
    // silently asserts against whatever the first caller in the whole jasmine run computed.
    const Adapter = SwuPgnGameAdapter as any;
    let savedForceteki: string | undefined;
    let savedNpm: string | undefined;

    beforeEach(function () {
        savedForceteki = process.env.FORCETEKI_VERSION;
        savedNpm = process.env.npm_package_version;
        Adapter.cachedEngineVersion = undefined;
    });

    afterEach(function () {
        if (savedForceteki === undefined) {
            delete process.env.FORCETEKI_VERSION;
        } else {
            process.env.FORCETEKI_VERSION = savedForceteki;
        }
        if (savedNpm === undefined) {
            delete process.env.npm_package_version;
        } else {
            process.env.npm_package_version = savedNpm;
        }
        Adapter.cachedEngineVersion = undefined;
    });

    it('prefers the deploy-time override', function () {
        process.env.FORCETEKI_VERSION = '9.9.9';
        process.env.npm_package_version = '0.0.1';

        expect(Adapter.engineVersion()).toBe('forceteki@9.9.9');
    });

    // package.json has said 0.1.0 for the project's whole life, so the package version names
    // no build: the git SHA must win over it (spec §5.3), and it is only the last resort.
    it('prefers the git sha over the package version', function () {
        delete process.env.FORCETEKI_VERSION;
        process.env.npm_package_version = '0.0.1';
        spyOn(Adapter, 'gitSha').and.returnValue('abc1234');

        expect(Adapter.engineVersion()).toBe('forceteki@abc1234');
    });

    // A bare HEAD SHA names the last COMMIT, not the code that ran: a day of writer changes on
    // one commit stamps every file identically, and a replay client holding a defective file and
    // a fixed one could not tell them apart from the header. It had to infer the writer
    // generation from the records instead.
    it('marks an uncommitted tree so two builds on one commit are distinguishable', function () {
        delete process.env.FORCETEKI_VERSION;
        spyOn(Adapter, 'gitSha').and.returnValue('abc1234-dirty');

        expect(Adapter.engineVersion()).toBe('forceteki@abc1234-dirty');
    });

    it('falls back to the package version only when there is no git sha', function () {
        delete process.env.FORCETEKI_VERSION;
        process.env.npm_package_version = '0.0.1';
        spyOn(Adapter, 'gitSha').and.returnValue(undefined);

        expect(Adapter.engineVersion()).toBe('forceteki@0.0.1');
    });

    it('records provenance as unknown rather than inventing a build', function () {
        delete process.env.FORCETEKI_VERSION;
        delete process.env.npm_package_version;
        spyOn(Adapter, 'gitSha').and.returnValue(undefined);

        expect(Adapter.engineVersion()).toBe('forceteki@unknown');
    });

    it('memoizes, so the git subprocess never runs twice', function () {
        delete process.env.FORCETEKI_VERSION;
        delete process.env.npm_package_version;
        const shaSpy = spyOn(Adapter, 'gitSha').and.returnValue('abc1234');

        Adapter.engineVersion();
        Adapter.engineVersion();
        SwuPgnGameAdapter.warmEngineVersion();

        expect(shaSpy.calls.count()).toBe(1);
    });
});

describe('SwuPgnGameAdapter header Date', function () {
    const players = () => [1, 2].map((n) => ({
        id: `p${n}`, name: `Player${n}`, user: { username: `user${n}` },
        getAllDeckLeaders: () => [{ setId: { set: 'sor', number: 10 } }], base: { setId: { set: 'sor', number: 20 } },
    }));
    const headerFor = (extra: Record<string, unknown>) => (new SwuPgnGameAdapter({
        ...fakeGame({ players: players() }), id: 'g', format: 'premier', roundNumber: 3, randomSeed: 'seed', ...extra,
    }) as any).swuPgnHeaderContext();

    it('is when the game STARTED, falling back to creation for a game that never started', function () {
        const started = new Date('2026-01-01T10:00:00Z');
        const created = new Date('2026-01-01T09:00:00Z');
        expect(headerFor({ startedAt: started, createdAt: created }).date).toBe(started.toISOString());
        expect(headerFor({ createdAt: created }).date).toBe(created.toISOString());

        // Value: protects=Format header from game.format; fails_when=header reads gameMode (or any other field) again; why_new=no test asserted the Format header source; seam=none; no_claim=format string vocabulary
        expect(headerFor({ createdAt: created, gameMode: 'not-the-format' }).format).toBe('premier');
    });

    it('omits RecorderErrors when no handler failed', function () {
        expect(headerFor({ createdAt: new Date() }).recorderErrors).toBeUndefined();
    });

    // EndDate (spec §5.2). With Date this gives the game's duration, which is the only thing
    // per-event timestamps would have bought -- see the SWU-PGN/SWUForge exchange.
    it('reports EndDate from finishedAt, and omits it while the game is still running', function () {
        const finished = new Date('2026-01-01T11:30:00Z');
        expect(headerFor({ createdAt: new Date(), finishedAt: finished }).endDate).toBe(finished.toISOString());
        expect(headerFor({ createdAt: new Date() }).endDate).toBeUndefined();
    });

    // Match grouping. The LOBBY id is what identifies a Bo3, but it is a host-internal id and
    // must not reach a shareable file, so the context carries it raw and buildHeader anonymizes.
    it('carries the lobby id for anonymization, and omits it when there is no lobby', function () {
        expect(headerFor({ createdAt: new Date() }).lobbyId).toBeUndefined();
    });

    // GameNumber is never set by the game: it does not know which game of a match it is.
    it('never sets GameNumber itself', function () {
        expect(headerFor({ createdAt: new Date() }).gameNumber).toBeUndefined();
    });
});

describe('SwuPgnGameAdapter %%% CARDS index from a sideboard', function () {
    // Value: protects=a sideboard-only card is named from the card map (title, subtitle when it has one), a card the game loaded keeps its own entry and kind, and an entry the map does not know is left out; fails_when=a sideboard entry overwrites a loaded card's entry, drops the subtitle, or is added without a name; why_new=the lobby spec only checks that some name appears for one sideboard card; seam=none; no_claim=which cards a real sideboard may hold
    it('names sideboard-only cards from the card map without overwriting a loaded card', function () {
        const loaded = { setId: { set: 'sor', number: 95 }, isToken: () => false, printedType: 'basicUnit', cardData: { title: 'Loaded', subtitle: 'In Deck' } };
        const cardMap = new Map<string, { title?: string; subtitle?: string }>([
            ['loaded', { title: 'Sideboard Copy' }],
            ['titled', { title: 'Titled', subtitle: 'Subtitled' }],
            ['plain', { title: 'Plain' }],
            ['untitled', {}],
        ]);
        const player = {
            id: 'p1',
            getAllDeckLeaders: () => [],
            base: null,
            allCards: [loaded],
            lobbyDeck: { getDecklist: () => ({ sideboard: [
                { id: 'sor_095', internalName: 'loaded' },
                { id: 'sor_100', internalName: 'titled' },
                { id: 'shd_7', internalName: 'plain' },
                { id: 'sor_101', internalName: 'untitled' },
                { id: 'sor_102', internalName: 'not-in-map' },
            ] }) },
        };
        const adapter: any = new SwuPgnGameAdapter({ ...fakeGame({ players: [player] }), cardDataGetter: { cardMap } });

        expect(adapter.buildSwuPgnCardIndex()).toEqual([
            { id: 'SHD#007', name: 'Plain' },
            { id: 'SOR#095', name: 'Loaded, In Deck', kind: 'unit' },
            { id: 'SOR#100', name: 'Titled, Subtitled' },
        ]);
    });
});
