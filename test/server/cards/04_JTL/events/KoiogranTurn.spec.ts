
describe('Koiogran Turn', function() {
    integration(function(contextRef) {
        it('KoiogranTurn\'s ability should ready a Fighter or Transport unit with 6 or less power', function() {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['koiogran-turn'],
                    groundArena: ['atst'],
                    spaceArena: [{ card: 'padawan-starfighter', exhausted: true }, 'trade-federation-shuttle', { card: 'first-light#headquarters-of-the-crimson-dawn', damage: 3 }]
                },
                player2: {
                    hand: ['superlaser-blast'],
                    spaceArena: ['imperial-interceptor'],

                }
            });

            const { context } = contextRef;

            // Ready a Unit
            context.player1.clickCard(context.koiogranTurn);
            expect(context.player1).toBeAbleToSelectExactly([context.padawanStarfighter, context.tradeFederationShuttle, context.imperialInterceptor]);
            context.player1.clickCard(context.padawanStarfighter);
            expect(context.padawanStarfighter.exhausted).toBeFalse();

            // Defeat all units
            context.player2.clickCard(context.superlaserBlast);
            context.koiogranTurn.moveTo('hand');

            // Card played but not triggered
            context.player1.clickCard(context.koiogranTurn);
            expect(context.koiogranTurn).toBeInZone('discard');
        });
    });
});
