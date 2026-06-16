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
