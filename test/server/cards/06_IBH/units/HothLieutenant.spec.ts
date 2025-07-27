describe('Hoth Lieutenant', function() {
    integration(function(contextRef) {
        describe('Hoth Lieutenant\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['sneak-attack', 'hoth-lieutenant'],
                        groundArena: ['wampa'],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper']
                    }
                });
            });

            it('should allow attacking with a unit and give it +2 power when played', function () {
                const { context } = contextRef;

                // Play Hoth Lieutenant
                context.player1.clickCard(context.hothLieutenant);

                // Verify player is prompted to select an attacker
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.greenSquadronAwing]);
                expect(context.player1).toHavePassAbilityButton();

                // Select Wampa as the attacker
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(6);
            });

            it('should not allow Hoth Lieutenant to attack with itself', function () {
                const { context } = contextRef;

                // Play Hoth Lieutenant with sneak attack to ready him
                context.player1.clickCard(context.sneakAttack);
                context.player1.clickCard(context.hothLieutenant);

                expect(context.hothLieutenant.exhausted).toBeFalse();

                // Verify Hoth Lieutenant cannot be selected
                expect(context.player1).not.toBeAbleToSelect(context.hothLieutenant);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.greenSquadronAwing]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);
            });
        });
    });
});