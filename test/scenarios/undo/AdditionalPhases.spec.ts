
describe('Undo with Additional Phases', function () {
    undoIntegration(function(contextRef) {
        describe('Additional Regroup Phase', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['max-rebo#encore'],
                        spaceArena: [{ card: 'fireball#an-explosion-with-wings', damage: 1 }],
                        deck: [
                            // To have specific cards to check during regroup phase (in alphabetical order)
                            'air-superiority',
                            'beguile',
                            'choose-sides',
                            'daring-raid',
                            'eject',
                            'face-off'
                        ]
                    },
                    player2: {
                        deck: [
                            // To have specific cards to check during regroup phase (in alphabetical order)
                            'apology-accepted',
                            'budget-scheming',
                            'change-of-heart',
                            'death-field',
                            'evacuate',
                            'fly-casual'
                        ]
                    }
                });

                const { context } = contextRef;

                // Asign each expected draw card to a variable for easier access
                context.p1Draws = {
                    a: context.player1.findCardByName('air-superiority'),
                    b: context.player1.findCardByName('beguile'),
                    c: context.player1.findCardByName('choose-sides'),
                    d: context.player1.findCardByName('daring-raid'),
                    e: context.player1.findCardByName('eject'),
                    f: context.player1.findCardByName('face-off')
                };

                context.p2Draws = {
                    a: context.player2.findCardByName('apology-accepted'),
                    b: context.player2.findCardByName('budget-scheming'),
                    c: context.player2.findCardByName('change-of-heart'),
                    d: context.player2.findCardByName('death-field'),
                    e: context.player2.findCardByName('evacuate'),
                    f: context.player2.findCardByName('fly-casual')
                };
            });

            const assertFirstRegroupPhaseStartState = (context) => {
                // First Regroup Phase: Fireball should take 1 damage, each player draws A,B
                expect(context.game.currentPhase).toBe('regroup');
                expect(context.fireball.damage).toBe(2);
                expect([context.p1Draws.a, context.p1Draws.b]).toAllBeInZone('hand', context.player1);
                expect([context.p2Draws.a, context.p2Draws.b]).toAllBeInZone('hand', context.player2);
            };

            const assertSecondRegroupPhaseStartState = (context) => {
                // Additional Regroup Phase: Fireball is defeated by taking 1 more damage, each player draws C,D
                expect(context.game.currentPhase).toBe('regroup');
                expect(context.fireball).toBeInZone('discard', context.player1);
                expect([context.p1Draws.c, context.p1Draws.d]).toAllBeInZone('hand', context.player1);
                expect([context.p2Draws.c, context.p2Draws.d]).toAllBeInZone('hand', context.player2);
            };

            undoIt('Fireball takes damage in each regroup phase', function() {
                const { context } = contextRef;

                expect(context.fireball).toBeInZone('spaceArena', context.player1);

                // Move to the regroup phase
                context.moveToRegroupPhase();
                assertFirstRegroupPhaseStartState(context);

                // Pass resourcing to get to the Additional Regroup Phase
                context.player1.clickDone();
                context.player2.clickDone();
                assertSecondRegroupPhaseStartState(context);

                // Quick rollback to get back to the start of the first regroup phase
                contextRef.snapshot.quickRollback(context.player1.id);
                assertFirstRegroupPhaseStartState(context);

                // Pass resourcing again to get to the Additional Regroup Phase again
                context.player1.clickDone();
                context.player2.clickDone();
                assertSecondRegroupPhaseStartState(context);

                // Pass resourcing to get to the action phase
                context.player1.clickDone();
                context.player2.clickDone();
                expect(context.game.currentPhase).toBe('action');

                // Quick rollback to get back to the start of the Additional Regroup Phase
                contextRef.snapshot.quickRollback(context.player1.id);
                assertSecondRegroupPhaseStartState(context);
            });
        });
    });
});