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

    it('maps winner names to the Result enum', function () {
        const p1 = { name: 'Player1' };
        const result = (winnerNames: string[]) =>
            (new SwuPgnGameAdapter(fakeGame({ players: [{ id: 'a', name: 'Player1' }, { id: 'b', name: 'Player2' }], winnerNames })) as any)
                .swuPgnResult(p1);

        expect(result([])).toBe('Incomplete');
        expect(result(['Player1', 'Player2'])).toBe('Draw');
        expect(result(['Player1'])).toBe('P1');
        expect(result(['Player2'])).toBe('P2');
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
        savedForceteki === undefined ? delete process.env.FORCETEKI_VERSION : process.env.FORCETEKI_VERSION = savedForceteki;
        savedNpm === undefined ? delete process.env.npm_package_version : process.env.npm_package_version = savedNpm;
        Adapter.cachedEngineVersion = undefined;
    });

    it('prefers the deploy-time override', function () {
        process.env.FORCETEKI_VERSION = '9.9.9';
        process.env.npm_package_version = '0.0.1';

        expect(Adapter.engineVersion()).toBe('forceteki@9.9.9');
    });

    it('falls back to the package version', function () {
        delete process.env.FORCETEKI_VERSION;
        process.env.npm_package_version = '0.0.1';

        expect(Adapter.engineVersion()).toBe('forceteki@0.0.1');
    });

    it('falls back to the git sha when no version is set', function () {
        delete process.env.FORCETEKI_VERSION;
        delete process.env.npm_package_version;
        spyOn(Adapter, 'gitSha').and.returnValue('abc1234');

        expect(Adapter.engineVersion()).toBe('forceteki@abc1234');
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
