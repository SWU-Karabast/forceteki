describe('Howler Pack', function() {
    integration(function(contextRef) {
        it('Howler Pack\'s when played ability should create a Beast token', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['howler-pack']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.howlerPack);

            expect(context.player2).toBeActivePlayer();
            const p1Beast = context.player1.findCardsByName('beast');
            expect(p1Beast.length).toBe(1);

            const p2Beast = context.player2.findCardsByName('beast');
            expect(p2Beast.length).toBe(0);
        });

        it('Howler Pack\'s when defeated ability should create a Beast token', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['howler-pack']
                },
                player2: {
                    hand: ['vanquish'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.howlerPack);

            expect(context.player1).toBeActivePlayer();
            const p1Beast = context.player1.findCardsByName('beast');
            expect(p1Beast.length).toBe(1);

            const p2Beast = context.player2.findCardsByName('beast');
            expect(p2Beast.length).toBe(0);
        });

        it('Howler Pack\'s when defeated ability should create a Beast token, with NGOR', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['howler-pack']
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.howlerPack);

            expect(context.player1).toBeActivePlayer();
            const p1Beast = context.player1.findCardsByName('beast');
            expect(p1Beast.length).toBe(0);

            const p2Beast = context.player2.findCardsByName('beast');
            expect(p2Beast.length).toBe(1);
        });
    });
});