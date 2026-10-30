import * as fs from 'fs';
import * as path from 'path';
import { TOKEN_ID, TOKEN_NAME, tokenName, tokenNameOf } from '../../../swupgn/src/index';

const CARD_DIR = path.resolve(__dirname, '../../../../test/json/Card');

interface CardFile {
    internalName: string;
    title: string;
    types: string[];
}

function tokensInCardData(): CardFile[] {
    const out: CardFile[] = [];
    for (const file of fs.readdirSync(CARD_DIR)) {
        const parsed = JSON.parse(fs.readFileSync(path.join(CARD_DIR, file), 'utf8')) as CardFile | CardFile[];
        const card = Array.isArray(parsed) ? parsed[0] : parsed;
        if (card?.types?.includes('token')) {
            out.push(card);
        }
    }
    return out;
}

describe('SWU-PGN token names (spec 6.1)', function () {
    it('derives the name from the printed title', function () {
        const table: [string, string][] = [
            ['X-Wing', 'xwing'],
            ['TIE Fighter', 'tie-fighter'],
            ['The Force', 'the-force'],
            ['Battle Droid', 'battle-droid'],
            ['Chirrut Îmwe', 'chirrut-imwe'],
            ['  Clone   Trooper ', 'clone-trooper'],
            ['Spy', 'spy'],
            ['Death Star\'s Beam', 'death-stars-beam'],
        ];
        for (const [title, name] of table) {
            expect(tokenName(title)).toBe(name);
            expect(TOKEN_NAME.test(name)).toBeTrue();
        }
    });

    it('agrees with every token in the card data', function () {
        const tokens = tokensInCardData();
        expect(tokens.length).toBeGreaterThan(0);
        for (const token of tokens) {
            expect(tokenName(token.title)).withContext(token.title)
                .toBe(token.internalName);
        }
    });

    it('matches the id grammar', function () {
        expect(TOKEN_ID.test('TOKEN:xwing#9415311381:2')).toBeTrue();
        expect(TOKEN_ID.test('TOKEN:credit')).toBeTrue();
        expect(TOKEN_ID.test('TOKEN:X-Wing#1')).toBeFalse();
        expect(TOKEN_ID.test('TOKEN:advantage#5844562972:1')).toBeFalse();
        expect(TOKEN_ID.test('TOKEN:weakness#weakness-id')).toBeFalse();
    });

    // Value: protects=one definition of a token id's name part, shared by the fold and the validator (spec 6.1); fails_when=the copy suffix or the card id is left on the name, or a non-token id gets a name; why_new=fold and validate each matched Credit with their own pattern and disagreed; seam=none; no_claim=whether the id is well-formed
    it('reads the name part of a token id, with the copy suffix and card id stripped', function () {
        expect(tokenNameOf('TOKEN:credit')).toBe('credit');
        expect(tokenNameOf('TOKEN:credit:2')).toBe('credit');
        expect(tokenNameOf('TOKEN:credit#8015500527')).toBe('credit');
        expect(tokenNameOf('TOKEN:credit#8015500527:12')).toBe('credit');
        expect(tokenNameOf('TOKEN:the-force#4571900905')).toBe('the-force');
        expect(tokenNameOf('TOKEN:credit:1')).not.toBe('credit');
        expect(tokenNameOf('SOR#095')).toBeUndefined();
        expect(tokenNameOf('base@1')).toBeUndefined();
    });
});
