describe('Wookiee Rangers', function() {
    integration(function(contextRef) {
        describe('Wookiee Rangers\'s ability', function() {
            it('should not have Sentinel when no other Wookiee unit is controlled and no Kashyyk base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['gungi#finding-himself'],
                    },
                    player2: {
                        groundArena: ['wookiee-rangers', 'battlefield-marine'],
                        base: 'colossus'
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.gungi);
                expect(context.player1).toBeAbleToSelectExactly([context.wookieeRangers, context.battlefieldMarine, context.p2Base]);
                context.player1.clickCard(context.p2Base);
            });

            it('should have Sentinel when you control another Wookiee unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['wookiee-rangers', 'gungi#finding-himself'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.wookieeRangers]);
                context.player1.clickCard(context.wookieeRangers);
            });

            // TODO: Add test for when controlling a Kashyyk base - need actual Kashyyk base card
        });
    });
});
