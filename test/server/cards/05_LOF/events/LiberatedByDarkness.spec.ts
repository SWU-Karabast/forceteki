describe('Liberated by Darkness', function() {
    integration(function(contextRef) {
        describe('Liberated by Darkness\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hasForceToken: true,
                        hand: ['liberated-by-darkness'],
                        groundArena: [{ card: 'pyke-sentinel', owner: 'player2' }],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        hand: ['vanquish'],
                        groundArena: [{ card: 'battlefield-marine', owner: 'player1' }, 'wampa']
                    }
                });
            });

            it('takes control and will return enemy non-leader unit to owner\'s control', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.liberatedByDarkness);

                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.battlefieldMarine, context.wampa, context.pykeSentinel]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('groundArena', context.player1);

                // Check that Wampa returns to player 2
                context.moveToRegroupPhase();
                expect(context.wampa).toBeInZone('groundArena', context.player2);
                expect(context.player1).toHavePrompt('Select between 0 and 1 cards to resource');
            });

            it('takes control and will return enemy non-leader unit to owner\'s control', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.liberatedByDarkness);

                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.battlefieldMarine, context.wampa, context.pykeSentinel]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('groundArena', context.player1);

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('discard', context.player2);

                // Check that Wampa stays in player 2 discard
                context.moveToRegroupPhase();
                expect(context.wampa).toBeInZone('discard', context.player2);
                expect(context.player1).toHavePrompt('Select between 0 and 1 cards to resource');
            });

            it('takes control and will return stolen friendly non-leader unit to owner\'s control', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.liberatedByDarkness);

                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.battlefieldMarine, context.wampa, context.pykeSentinel]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);

                // Check that Battlefield Marine stays with player1 since p1 is the owner
                context.moveToRegroupPhase();
                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);
                expect(context.player1).toHavePrompt('Select between 0 and 1 cards to resource');
            });

            it('takes control and will not return stolen friendly non-leader unit to owner\'s control if unit is dead', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.liberatedByDarkness);

                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.battlefieldMarine, context.wampa, context.pykeSentinel]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard', context.player1);

                // Check that Battlefield Marine stays in p1 discard
                context.moveToRegroupPhase();
                expect(context.battlefieldMarine).toBeInZone('discard', context.player1);
                expect(context.player1).toHavePrompt('Select between 0 and 1 cards to resource');
            });

            it('has no effect if the player does not have the force', function () {
                const { context } = contextRef;
                context.player1.setHasTheForce(false);

                context.player1.clickCard(context.liberatedByDarkness);
                context.player1.clickPrompt('Play anyway');

                expect(context.liberatedByDarkness).toBeInZone('discard', context.player1);
                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player2);
                expect(context.wampa).toBeInZone('groundArena', context.player2);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
