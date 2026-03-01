
describe('Undo with Additional Phases', function () {
    undoIntegration(function(contextRef) {
        describe('Additional Regroup Phase with unprompted triggers', function() {
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

            it('Handles quick rollbacks into the regroup phases correctly', function() {
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

                // Each player resources B to get back to the action phase
                context.player1.clickCard(context.p1Draws.b);
                context.player1.clickDone();
                context.player2.clickCard(context.p2Draws.b);
                context.player2.clickDone();
                expect(context.game.currentPhase).toBe('action');
            });
        });

        describe('Additional Regroup Phase with trigger prompt', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['max-rebo#encore'],
                        spaceArena: ['millennium-falcon#piece-of-junk'],
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

            const skipResourcing = (context) => {
                expect(context.player1).toHavePrompt('Select between 0 and 1 cards to resource');
                context.player1.clickDone();
                expect(context.player2).toHavePrompt('Select between 0 and 1 cards to resource');
                context.player2.clickDone();
            };

            const assertFirstRegroupPhaseStartState = (context) => {
                // First Regroup Phase: Millennium Falcon is in play, each player draws A,B
                expect(context.game.currentPhase).toBe('regroup');
                expect(context.millenniumFalcon).toBeInZone('spaceArena', context.player1);
                expect([context.p1Draws.a, context.p1Draws.b]).toAllBeInZone('hand', context.player1);
                expect([context.p2Draws.a, context.p2Draws.b]).toAllBeInZone('hand', context.player2);
            };

            const assertSecondRegroupPhaseStartState = (context, didBounceFalcon) => {
                // Second Regroup Phase: Check Millennium Falcon zone, each player draws C,D
                expect(context.game.currentPhase).toBe('regroup');
                expect(context.millenniumFalcon).toBeInZone(didBounceFalcon ? 'hand' : 'spaceArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(didBounceFalcon ? 0 : 1);
                expect([context.p1Draws.c, context.p1Draws.d]).toAllBeInZone('hand', context.player1);
                expect([context.p2Draws.c, context.p2Draws.d]).toAllBeInZone('hand', context.player2);
            };

            const assertActionPhaseStartState = (context, didBounceFalcon) => {
                // Action Phase: Check Millennium Falcon zone and resource count
                expect(context.game.currentPhase).toBe('action');
                expect(context.millenniumFalcon).toBeInZone(didBounceFalcon ? 'hand' : 'spaceArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(didBounceFalcon ? 0 : 1);
            };

            it('Handles quick rollbacks in the regroup phases correctly with prompt states', function() {
                const { context } = contextRef;

                // Move to the regroup phase
                context.moveToRegroupPhase();
                assertFirstRegroupPhaseStartState(context);

                // Each player skips resourcing to get to Millennium Falcon prompt
                skipResourcing(context);
                expect(context.player1).toHaveEnabledPromptButtons(['Pay 1 resource', 'Return this unit to her owner\'s hand']);

                // Quick rollback to get back to the start of the first regroup phase
                contextRef.snapshot.quickRollback(context.player1.id);
                assertFirstRegroupPhaseStartState(context);

                // Each player skips resourcing again to get to Millennium Falcon prompt again
                skipResourcing(context);
                expect(context.player1).toHaveEnabledPromptButtons(['Pay 1 resource', 'Return this unit to her owner\'s hand']);

                // Choose to bounce Millennium Falcon
                context.player1.clickPrompt('Return this unit to her owner\'s hand');
                assertSecondRegroupPhaseStartState(context, true);

                // Quick rollback to get back to the Millennium Falcon prompt
                contextRef.snapshot.quickRollback(context.player1.id);
                expect(context.player1).toHaveEnabledPromptButtons(['Pay 1 resource', 'Return this unit to her owner\'s hand']);

                // Choose not to bounce Millennium Falcon this time
                context.player1.clickPrompt('Pay 1 resource');
                assertSecondRegroupPhaseStartState(context, false);

                // Pass resourcing to get to the Millennium Falcon prompt in second Regroup Phase
                skipResourcing(context);
                expect(context.player1).toHaveEnabledPromptButtons(['Pay 1 resource', 'Return this unit to her owner\'s hand']);

                // Quick rollback to get back to the start of the second regroup phase
                contextRef.snapshot.quickRollback(context.player1.id);
                assertSecondRegroupPhaseStartState(context, false);

                // Pass resourcing to get to the Millennium Falcon prompt again
                skipResourcing(context);
                expect(context.player1).toHaveEnabledPromptButtons(['Pay 1 resource', 'Return this unit to her owner\'s hand']);

                // Bounce the falcon and start the action phase
                context.player1.clickPrompt('Return this unit to her owner\'s hand');
                assertActionPhaseStartState(context, true);

                // Quick rollback to get back to the Millennium Falcon prompt in second Regroup Phase
                contextRef.snapshot.quickRollback(context.player1.id);
                expect(context.player1).toHaveEnabledPromptButtons(['Pay 1 resource', 'Return this unit to her owner\'s hand']);

                // Choose not to bounce Millennium Falcon this time and start the action phase
                context.player1.clickPrompt('Pay 1 resource');
                assertActionPhaseStartState(context, false);
            });
        });
    });
});