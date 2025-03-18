describe('Shadow Caster, Just Business', function() {
    integration(function(contextRef) {
        describe('Shadow Caster\'s ability', function() {
            it('should allow a unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['shadow-caster#just-business', 'rhokai-gunship'],
                    },
                    player2: {
                        hand: ['daring-raid']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.rhokaiGunship);

                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt('When a friendly unit is defeated, you may use all of its When Defeated abilities again');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(2);
                expect(context.player1).toBeActivePlayer();
            });


            // TODO: Add a test that ensures Chimaera doesn't trigger Shadow Caster
            // TODO: Add a test that ensures Chimaera triggers JTL Thrawn
        });
    });
});
