describe('Change of Heart', function() {
    integration(function(contextRef) {
        describe('Change of Heart\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['change-of-heart'],
                        groundArena: [{ card: 'pyke-sentinel', owner: 'player2' }],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        hand: ['vanquish'],
                        // TODO: map player1 / player2 name onto player objects
                        groundArena: [{ card: 'battlefield-marine', owner: 'player1' }, 'wampa']
                    }
                });
            });

            it('takes control and will return enemy non-leader unit to owner\'s control', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.changeOfHeart);
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
                context.player1.clickCard(context.changeOfHeart);
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
                context.player1.clickCard(context.changeOfHeart);
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
                context.player1.clickCard(context.changeOfHeart);
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
        });
    });
});
