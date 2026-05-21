describe('K2-SO, Locking the Vault', function() {
    integration(function(contextRef) {
        describe('', function() {
            it('K2-SO\'s on attack ability should deal 3 damage to a damaged ground unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['k2so#locking-the-vault', { card: 'wampa', damage: 2 }],
                    },
                    player2: {
                        groundArena: ['battlefield-marine', { card: 'atst', damage: 2 }],
                        spaceArena: [{ card: 'awing', damage: 1 }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.k2soLockingTheVault);
                context.player1.clickCard(context.p2Base);

                // battlefield-marine and awing are not selectable
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst.damage).toBe(5);
                expect(context.wampa.damage).toBe(2);
            });
        });
    });
});
