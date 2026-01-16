describe('The Blade Wing, The Secret of Shantipole', function() {
    integration(function(contextRef) {
        describe('The Blade Wing\'s when played ability', function() {
            it('should optionally return a non-leader unit to its owner\'s hand', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-blade-wing#the-secret-of-shantipole'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theBladeWing);

                // Should be able to select any non-leader unit (both friendly and enemy), including itself
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.greenSquadronAwing,
                    context.theBladeWing,
                    context.wampa,
                    context.cartelSpacer
                ]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('hand', context.player2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should return unit to its owner\'s hand even when controlled by opponent', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-blade-wing#the-secret-of-shantipole', 'change-of-heart'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });

                const { context } = contextRef;

                // Take control of enemy wampa
                context.player1.clickCard(context.changeOfHeart);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('groundArena', context.player1);

                context.player2.passAction();

                // Play The Blade Wing and return the controlled unit
                context.player1.clickCard(context.theBladeWing);
                context.player1.clickCard(context.wampa);

                // Wampa should return to its owner's (player2) hand
                expect(context.wampa).toBeInZone('hand', context.player2);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
