describe('Bib Fortuna, Die Wanna Wanga?', function () {
    integration(function (contextRef) {
        it('Bib Fortuna\'s when played ability should create a Credit token', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['bib-fortuna#die-wanna-wanga'],
                    groundArena: ['greedo#slow-on-the-draw']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.bibFortuna);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.credits).toBe(1);
        });

        it('Bib Fortuna\'s when played ability should create a Credit token (as we do not control another Underworld unit)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['bib-fortuna#die-wanna-wanga'],
                },
                player2: {

                    groundArena: ['greedo#slow-on-the-draw']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.bibFortuna);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.credits).toBe(0);
        });
    });
});
