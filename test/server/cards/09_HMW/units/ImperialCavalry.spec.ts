describe('Imperial Cavalry', function() {
    integration(function(contextRef) {
        describe('Imperial Cavalry\'s when played ability', function() {
            it('should create a Beast token and deal 1 damage to an enemy unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['imperial-cavalry']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.imperialCavalry);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.cartelSpacer, context.cadBane]);
                expect(context.player1).not.toHaveChooseNothingButton();
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.battlefieldMarine);

                const beast = context.player1.findCardByName('beast');
                expect(beast).toBeInZone('groundArena', context.player1);

                expect(context.battlefieldMarine.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should still create a Beast token when there are no units to damage', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['imperial-cavalry']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.imperialCavalry);

                const beast = context.player1.findCardByName('beast');
                expect(beast).toBeInZone('groundArena', context.player1);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});