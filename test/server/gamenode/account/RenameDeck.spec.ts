import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';
import type { TestClient } from '../../../helpers/server/TestClient';

const sampleDeck = {
    leader: { id: 'SOR_005' },
    base: { id: 'SOR_026' },
    name: 'Test Deck',
    favourite: false,
    deckLink: 'https://swudb.com/deck/abc123',
    deckLinkID: 'abc123',
    source: 'SWUDB',
};

describe('Renaming a deck', function () {
    serverIntegration(function (contextRef) {
        async function saveSampleDeckAsync(user: TestClient): Promise<string> {
            const response = await user.saveDeckAsync(sampleDeck);
            expect(response.status).withContext('saving the deck to rename')
                .toBe(200);
            return response.body.deck.id;
        }

        it('renames one of the caller\'s decks', async function () {
            const { harness } = contextRef;
            const user = harness.createAccountClient();
            const deckId = await saveSampleDeckAsync(user);

            const response = await user.renameDeckAsync(deckId, 'Renamed Deck');

            expect(response.status).toBe(200);
            expect(harness.db.decksOf(user.id)[0].deck.name).toBe('Renamed Deck');
        });

        it('cuts a name over 200 characters to its first 200', async function () {
            const { harness } = contextRef;
            const user = harness.createAccountClient();
            const deckId = await saveSampleDeckAsync(user);

            await user.renameDeckAsync(deckId, 'x'.repeat(150) + 'y'.repeat(100));

            expect(harness.db.decksOf(user.id)[0].deck.name).toBe('x'.repeat(150) + 'y'.repeat(50));
        });

        for (const newName of [42, null, { name: 'Renamed Deck' }]) {
            it(`refuses a name that is not a string (${JSON.stringify(newName)}), leaving the deck as it was`, async function () {
                const { harness } = contextRef;
                const user = harness.createAccountClient();
                const deckId = await saveSampleDeckAsync(user);

                // a body the real client never sends: it always sends a string
                const response = await user.requestAsync('put', `/api/get-deck/${deckId}/rename`, { newName });

                expect(response.status).toBe(400);
                expect(harness.db.decksOf(user.id)[0].deck.name).toBe('Test Deck');
            });
        }
    });
});
