import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';

/**
 * A deck as the real client sends it in `POST /api/save-deck`, inside the entity it wraps it in. It is also how
 * the deck is stored.
 */
const sampleDeck = {
    leader: { id: 'SOR_005' },
    base: { id: 'SOR_026' },
    name: 'Test Deck',
    favourite: false,
    deckLink: 'https://swudb.com/deck/abc123',
    deckLinkID: 'abc123',
    source: 'SWUDB',
};

const noResults = { wins: 0, losses: 0, draws: 0, statsByMatchup: [] };

describe('Saving a deck', function () {
    serverIntegration(function (contextRef) {
        it('stores the deck for the caller, under a new id and with no results', async function () {
            const { harness } = contextRef;
            const user = harness.createAccountClient();

            const response = await user.saveDeckAsync(sampleDeck);

            expect(response.status).toBe(200);
            const stored = harness.db.decksOf(user.id);
            expect(stored.length).toBe(1);
            expect(stored[0]).toEqual({ id: response.body.deck.id, userId: user.id, deck: sampleDeck, stats: noResults });
        });

        it('keeps a second leader', async function () {
            const { harness } = contextRef;
            const user = harness.createAccountClient();

            await user.saveDeckAsync({ ...sampleDeck, secondLeader: { id: 'SOR_010' } });

            expect(harness.db.decksOf(user.id)[0].deck).toEqual({ ...sampleDeck, secondLeader: { id: 'SOR_010' } });
        });

        it('takes only the deck\'s own fields from the request, not its owner, id, favourite flag or results', async function () {
            const { harness } = contextRef;
            const user = harness.createAccountClient();
            const other = harness.createAccountClient();
            // what the server hands the database, before the database's own validation can tidy it
            const save = spyOn(harness.db, 'saveDeckAsync').and.callThrough();

            const response = await user.requestAsync('post', '/api/save-deck', {
                deck: {
                    id: 'chosen-id',
                    userId: other.id,
                    stats: { wins: 99, losses: 0, draws: 0 },
                    label: 'not part of a deck',
                    deck: { ...sampleDeck, favourite: true, notes: 'not part of a deck' },
                },
            });

            expect(response.status).toBe(200);
            const expected = { id: jasmine.any(String), userId: user.id, deck: sampleDeck, stats: noResults };
            expect(save.calls.allArgs()).toEqual([[expected]]);
            expect(harness.db.decksOf(other.id)).toEqual([]);
            const [stored] = harness.db.decksOf(user.id);
            expect(stored).toEqual(expected);
            expect(stored.id).not.toBe('chosen-id');
        });

        it('cuts a name over 200 characters to its first 200', async function () {
            const { harness } = contextRef;
            const user = harness.createAccountClient();

            const response = await user.saveDeckAsync({ ...sampleDeck, name: 'x'.repeat(150) + 'y'.repeat(100) });

            expect(response.status).toBe(200);
            expect(harness.db.decksOf(user.id)[0].deck.name).toBe('x'.repeat(150) + 'y'.repeat(50));
        });

        it('returns the deck already saved with the same link instead of saving it again', async function () {
            const { harness } = contextRef;
            const user = harness.createAccountClient();

            const first = await user.saveDeckAsync(sampleDeck);
            const second = await user.saveDeckAsync({ ...sampleDeck, name: 'Renamed' });

            expect(second.status).toBe(200);
            expect(second.body.deck.id).toBe(first.body.deck.id);
            expect(harness.db.decksOf(user.id).map((deck) => deck.deck.name)).toEqual(['Test Deck']);
        });

        const malformed: { description: string; deck: Record<string, unknown> }[] = [
            { description: 'with no base', deck: { ...sampleDeck, base: undefined } },
            { description: 'whose leader is not a card reference', deck: { ...sampleDeck, leader: 'SOR_005' } },
            { description: 'whose name is not a string', deck: { ...sampleDeck, name: 42 } },
            { description: 'whose link is over 2000 characters', deck: { ...sampleDeck, deckLink: `https://swudb.com/deck/${'x'.repeat(2000)}` } },
            { description: 'with no link id', deck: { ...sampleDeck, deckLinkID: undefined } },
        ];
        for (const { description, deck } of malformed) {
            it(`refuses a deck ${description}, and stores nothing`, async function () {
                const { harness } = contextRef;
                const user = harness.createAccountClient();

                const response = await user.saveDeckAsync(deck);

                expect(response.status).toBe(400);
                expect(harness.db.decksOf(user.id)).toEqual([]);
            });
        }
    });
});
