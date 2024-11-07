describe('Doctor Pershing, Experimenting With Life', function() {
    integration(function(contextRef) {
        describe('Doctor Pershing\'s action ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['doctor-pershing#experimenting-with-life', 'wampa'],
                        spaceArena: ['tieln-fighter']
                    },
                    player2: {
                        groundArena: ['frontier-atrt'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should deal 1 damage to any selected friendly unit and draw a card', function () {
                const { context } = contextRef;

                const reset = () => {
                    context.player2.passAction();
                    context.doctorPershing.exhausted = false;
                };

                // Trigger the ability
                context.player1.clickCard(context.doctorPershing);
                context.player1.clickPrompt('Draw a card');
                expect(context.player1).toBeAbleToSelectExactly([context.doctorPershing, context.wampa, context.tielnFighter]);
                expect(context.player1).not.toHaveChooseNoTargetButton();

                // Target a space friendly unit
                context.player1.clickCard(context.tielnFighter);
                expect(context.doctorPershing.exhausted).toBeTrue();
                expect(context.tielnFighter).toBeInLocation('discard');
                expect(context.player1.hand.length).toBe(1);
                expect(context.player2.hand.length).toBe(0);

                // Trigger the ability again
                reset();
                context.player1.clickCard(context.doctorPershing);
                context.player1.clickPrompt('Draw a card');
                expect(context.player1).toBeAbleToSelectExactly([context.doctorPershing, context.wampa]);
                expect(context.player1).not.toHaveChooseNoTargetButton();

                // Target a ground friendly unit
                context.player1.clickCard(context.wampa);
                expect(context.doctorPershing.exhausted).toBeTrue();
                expect(context.wampa.damage).toBe(1);
                expect(context.player1.hand.length).toBe(2);
                expect(context.player2.hand.length).toBe(0);

                // Trigger the ability again
                reset();
                context.player1.clickCard(context.doctorPershing);
                context.player1.clickPrompt('Draw a card');
                expect(context.player1).toBeAbleToSelectExactly([context.doctorPershing, context.wampa]);
                expect(context.player1).not.toHaveChooseNoTargetButton();

                // Target self
                context.player1.clickCard(context.doctorPershing);
                expect(context.doctorPershing.exhausted).toBeTrue();
                expect(context.doctorPershing.damage).toBe(1);
                expect(context.player1.hand.length).toBe(3);
                expect(context.player2.hand.length).toBe(0);
            });

            it('should not be available if Doctor Pershing is exhausted', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'doctor-pershing#experimenting-with-life', exhausted: true }, 'wampa'],
                        spaceArena: ['tieln-fighter']
                    },
                    player2: {
                        groundArena: ['frontier-atrt'],
                        spaceArena: ['cartel-spacer']
                    }
                });

                const { context } = contextRef;
                expect(context.doctorPershing).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });
        });
    });
});