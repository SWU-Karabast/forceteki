import { parse } from '../../../swupgn/src/parse';

const SAMPLE = [
    '[Game "SWU-PGN/1.1"]',
    '[GameId "g1"]',
    '[Date "2026-06-16T00:00:00Z"]',
    '[CardPool "LOF"] [Engine "forceteki@2.3.1"]',
    '[Seed "abc"] [Perspective "P1"]',
    '[P1Id "sha256:a"] [P2Id "sha256:b"] [P1 "Player 1"] [P2 "Player 2"]',
    '[P1Leader "SOR#010"] [P1Base "SOR#028"] [P2Leader "SOR#005"] [P2Base "SOR#020"]',
    '[Result "P1"] [Reason "BaseDestroyed"] [Rounds "4"]',
    '',
    '%%% DECKS',
    '{"p":1,"leader":"SOR#010","base":"SOR#028","deck":[["SOR#087",2]]}',
    '',
    '%%% SETUP',
    '{"seq":"R1.S.0","t":"INIT","p1DeckOrder":["SOR#087"],"p2DeckOrder":["SOR#045"]}',
    '',
    '%%% EVENTS',
    '{"seq":"R1.A.1","t":"PLAY","p":1,"card":"SOR#108","zone":"ground","cost":2}',
    '',
    '%%% ANNOTATIONS',
    '{"ref":"R1.A.1","nag":"?!","text":"too greedy"}',
].join('\n');

describe('parse', function () {
    it('parses header tags including multiple tags per line', function () {
        const doc = parse(SAMPLE);
        expect(doc.header.game).toBe('SWU-PGN/1.1');
        expect(doc.header.rounds).toBe(4);
        expect(doc.header.perspective).toBe('P1');
        expect(doc.header.result).toBe('P1');
    });

    it('parses each section into typed records', function () {
        const doc = parse(SAMPLE);
        expect(doc.decks.length).toBe(1);
        expect(doc.decks[0].deck[0]).toEqual(['SOR#087', 2]);
        expect(doc.setup.length).toBe(1);
        expect(doc.events.length).toBe(1);
        expect(doc.events[0].t).toBe('PLAY');
        expect(doc.annotations[0].nag).toBe('?!');
    });

    it('ignores blank lines and tolerates trailing whitespace', function () {
        const doc = parse(SAMPLE + '\n\n   \n');
        expect(doc.events.length).toBe(1);
    });
});

describe('parse error paths', function () {
    const HEAD = [
        '[Game "SWU-PGN/1.1"]','[GameId "g1"]','[Date "2026-06-16T00:00:00Z"]',
        '[CardPool "LOF"] [Engine "e"] [Seed "s"]',
        '[P1Id "a"] [P2Id "b"] [P1 "Player 1"] [P2 "Player 2"]',
        '[P1Leader "SOR#010"] [P1Base "SOR#028"] [P2Leader "SOR#005"] [P2Base "SOR#020"]',
        '[Result "P1"] [Reason "X"] [Rounds "1"]',
    ].join('\n');

    it('throws on a missing required header tag', function () {
        const bad = HEAD.replace('[Result "P1"] ', '');
        expect(() => parse(bad)).toThrowError(/required header tag \[Result\]/);
    });

    it('throws with a line number on invalid JSON in a body section', function () {
        const bad = HEAD + '\n%%% EVENTS\n{not json}';
        expect(() => parse(bad)).toThrowError(/invalid JSON on line/);
    });

    it('throws when a record appears before any section', function () {
        const bad = HEAD + '\n{"seq":"R1.A.1","t":"PASS","p":1}';
        expect(() => parse(bad)).toThrowError(/before any %%% section/);
    });

    it('throws a distinct error for a record under an unrecognized section', function () {
        const bad = HEAD + '\n%%% BOGUS\n{"x":1}';
        expect(() => parse(bad)).toThrowError(/unrecognized section/);
    });
});
