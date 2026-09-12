import { Game } from '../../../../server/game/core/Game';
import type { GameConfiguration } from '../../../../server/game/core/GameInterfaces';
import { GameMode } from '../../../../server/GameMode';
import { UnitTestCardDataGetter } from '../../../../server/utils/cardData/UnitTestCardDataGetter';
import * as Settings from '../../../../server/Settings';
import { GainKeyword } from '../../../../server/game/core/ongoingEffect/effectImpl/GainKeyword';
import { KeywordName } from '../../../../server/game/core/Constants';
import type { KeywordNameOrProperties } from '../../../../server/game/Interfaces';

/**
 * p1-a boundary cases 2/3: GainKeyword's constructor normalizes raw keyword props before storing them
 * (e.g. 'sentinel' -> {keyword: 'sentinel'}), and the deferred wrap path in OngoingEffectLibrary compares
 * against that same normalized form via GainKeyword.normalizeKeywordProps. This spec pins that
 * normalizeKeywordProps is idempotent and that constructing from raw vs. normalized props is unobservable.
 */
describe('GainKeyword.normalizeKeywordProps', function() {
    const cardDataGetter = new UnitTestCardDataGetter('test/json');
    const router = jasmine.createSpyObj('router', ['handleError', 'handleSerializationFailure']);

    function buildGameConfiguration(overrides: Partial<GameConfiguration> = {}): GameConfiguration {
        return {
            id: 'test-game-id',
            owner: 'player1',
            gameMode: GameMode.Premier,
            players: [
                Settings.getUserWithDefaultsSet({ id: 'player1', username: 'player1' }),
                Settings.getUserWithDefaultsSet({ id: 'player2', username: 'player2' }),
            ],
            allowSpectators: false,
            cardDataGetter,
            pushUpdate: () => true,
            buildSafeTimeout: () => undefined,
            userTimeoutDisconnect: () => undefined,
            ...overrides,
        };
    }

    it('is idempotent for a bare string', function() {
        const once = GainKeyword.normalizeKeywordProps(KeywordName.Sentinel);
        expect(once).toEqual({ keyword: KeywordName.Sentinel });
        expect(GainKeyword.normalizeKeywordProps(once)).toEqual(once);
    });

    it('is idempotent for an already-normalized object', function() {
        const props: KeywordNameOrProperties = { keyword: KeywordName.Raid, amount: 3 };
        expect(GainKeyword.normalizeKeywordProps(props)).toEqual(props);
        expect(GainKeyword.normalizeKeywordProps(GainKeyword.normalizeKeywordProps(props))).toEqual(props);
    });

    it('is idempotent for a numeric-keyword object', function() {
        const props: KeywordNameOrProperties = { keyword: KeywordName.Exploit, amount: 2 };
        const normalized = GainKeyword.normalizeKeywordProps(props);
        expect(normalized).toEqual(props);
        expect(GainKeyword.normalizeKeywordProps(normalized)).toEqual(props);
    });

    it('is idempotent for an array mixing strings and objects', function() {
        const mixed: KeywordNameOrProperties[] = [KeywordName.Sentinel, { keyword: KeywordName.Raid, amount: 2 }];
        const normalizedOnce = GainKeyword.normalizeKeywordProps(mixed);
        expect(normalizedOnce).toEqual([{ keyword: KeywordName.Sentinel }, { keyword: KeywordName.Raid, amount: 2 }]);
        expect(GainKeyword.normalizeKeywordProps(normalizedOnce)).toEqual(normalizedOnce);
    });

    it('is identity on nullish input', function() {
        expect(GainKeyword.normalizeKeywordProps(null)).toBeNull();
        expect(GainKeyword.normalizeKeywordProps(undefined)).toBeUndefined();
    });

    function buildGame(): Game {
        return new Game(buildGameConfiguration(), { router });
    }

    it('produces the same getValue() and effectDescription from raw and normalized props (bare string)', function() {
        const game = buildGame();
        const fromRaw = new GainKeyword(game, KeywordName.Sentinel);
        const fromNormalized = new GainKeyword(game, GainKeyword.normalizeKeywordProps(KeywordName.Sentinel));

        expect(fromRaw.getValue()).toEqual(fromNormalized.getValue());
        expect(fromRaw.effectDescription).toEqual(fromNormalized.effectDescription);
    });

    it('produces the same getValue() and effectDescription for a {keyword, amount} shape', function() {
        const game = buildGame();
        const raw: KeywordNameOrProperties = { keyword: KeywordName.Raid, amount: 4 };
        const fromRaw = new GainKeyword(game, raw);
        const fromNormalized = new GainKeyword(game, GainKeyword.normalizeKeywordProps(raw));

        expect(fromRaw.getValue()).toEqual(fromNormalized.getValue());
        expect(fromRaw.effectDescription).toEqual(fromNormalized.effectDescription);
    });

    it('produces the same getValue() and effectDescription for a {keyword, cost, aspects} shape', function() {
        const game = buildGame();
        const raw: KeywordNameOrProperties = { keyword: KeywordName.Smuggle, cost: 2, aspects: [] };
        const fromRaw = new GainKeyword(game, raw);
        const fromNormalized = new GainKeyword(game, GainKeyword.normalizeKeywordProps(raw));

        expect(fromRaw.getValue()).toEqual(fromNormalized.getValue());
        expect(fromRaw.effectDescription).toEqual(fromNormalized.effectDescription);
    });

    it('produces the same getValue() and effectDescription for an array of mixed shapes', function() {
        const game = buildGame();
        const raw: KeywordNameOrProperties[] = [KeywordName.Sentinel, { keyword: KeywordName.Raid, amount: 1 }];
        const fromRaw = new GainKeyword(game, raw);
        const fromNormalized = new GainKeyword(game, GainKeyword.normalizeKeywordProps(raw));

        expect(fromRaw.getValue()).toEqual(fromNormalized.getValue());
        expect(fromRaw.effectDescription).toEqual(fromNormalized.effectDescription);
    });
});
