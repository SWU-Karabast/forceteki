describe('Kreia\'s Whispers', function () {
    integration(function (contextRef) {
        it('Kreia\'s Whispers\'s ability should draw 3 cards, put one card from hand on top of the deck, and one on bottom', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['kreias-whispers', 'battlefield-marine', 'jedi-knight'],
                    deck: ['sabine-wren#explosives-artist', 'secretive-sage', 'inferno-four#unforgetting'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.kreiasWhispers);

            expect(context.player1).toBeAbleToSelectExactly([
                context.battlefieldMarine,
                context.jediKnight,
                context.sabineWrenExplosivesArtist,
                context.secretiveSage,
                context.infernoFourUnforgetting
            ]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1).toBeAbleToSelectExactly([
                context.jediKnight,
                context.sabineWrenExplosivesArtist,
                context.secretiveSage,
                context.infernoFourUnforgetting
            ]);
            context.player1.clickCard(context.jediKnight);
            expect(context.jediKnight).toBeInBottomOfDeck(context.player1, 1);
            expect(context.player1.deck[0]).toBe(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
        });

        it('Kreia\'s Whispers\'s ability should draw as many cards as available, then trigger the top and bottom placement', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['kreias-whispers', 'battlefield-marine', 'jedi-knight'],
                    deck: ['sabine-wren#explosives-artist', 'inferno-four#unforgetting'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.kreiasWhispers);

            expect(context.player1).toBeAbleToSelectExactly([
                context.battlefieldMarine,
                context.jediKnight,
                context.sabineWrenExplosivesArtist,
                context.infernoFourUnforgetting
            ]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1).toBeAbleToSelectExactly([
                context.jediKnight,
                context.sabineWrenExplosivesArtist,
                context.infernoFourUnforgetting
            ]);
            context.player1.clickCard(context.jediKnight);
            expect(context.jediKnight).toBeInBottomOfDeck(context.player1, 1);
            expect(context.player1.deck[0]).toBe(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
        });

        it('Kreia\'s Whispers\'s ability should still trigger placement if no cards are drawn', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['kreias-whispers', 'battlefield-marine', 'jedi-knight'],
                    deck: [],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.kreiasWhispers);

            expect(context.player1).toBeAbleToSelectExactly([
                context.battlefieldMarine,
                context.jediKnight
            ]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1).toBeAbleToSelectExactly([
                context.jediKnight
            ]);
            context.player1.clickCard(context.jediKnight);
            expect(context.jediKnight).toBeInBottomOfDeck(context.player1, 1);
            expect(context.player1.deck[0]).toBe(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
        });
    });
});