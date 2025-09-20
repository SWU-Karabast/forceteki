describe('Imperial Occupier', function() {
    integration(function(contextRef) {
        it('should create a Spy token when this unit is defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['imperial-occupier']
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            // Attack so that Imperial Occupier trades with Battlefield Marine (both 2/2)
            context.player1.clickCard(context.imperialOccupier);
            context.player1.clickCard(context.battlefieldMarine);

            // Imperial Occupier should be defeated, triggering the When Defeated ability to create a Spy token
            const spies = context.player1.findCardsByName('spy');
            expect(spies.length).toBe(1);
            expect(spies).toAllBeInZone('groundArena');
            expect(spies[0].exhausted).toBeTrue();

            // Active player should rotate after attack resolution
            expect(context.player2).toBeActivePlayer();
        });

        it('should create a Spy token for opponent when this unit is defeated with No Glory Only Results', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['no-glory-only-results']
                },
                player2: {
                    groundArena: ['imperial-occupier']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.noGloryOnlyResults);
            context.player1.clickCard(context.imperialOccupier);

            // Imperial Occupier should be defeated, triggering the When Defeated ability to create a Spy token
            const spies = context.player1.findCardsByName('spy');
            expect(spies.length).toBe(1);
            expect(spies).toAllBeInZone('groundArena');
            expect(spies[0].exhausted).toBeTrue();

            // Active player should rotate after attack resolution
            expect(context.player2).toBeActivePlayer();
        });
    });
});
