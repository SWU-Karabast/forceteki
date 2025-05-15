describe('Doctor Pershing, Experimenting With Life', function() {
    integration(function(contextRef) {
        describe('Doctor Pershing\'s action ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['doctor-pershing#experimenting-with-life', { card: 'wampa', upgrades: ['shield'] }],
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
                    context.readyCard(context.doctorPershing);
                };

                // Trigger the ability
                context.player1.clickCard(context.doctorPershing);
                context.player1.clickPrompt('Draw a card');
                expect(context.player1).toBeAbleToSelectExactly([context.doctorPershing, context.wampa, context.tielnFighter]);
                expect(context.player1).not.toHaveChooseNothingButton();

                // Target a space friendly unit
                context.player1.clickCard(context.tielnFighter);
                expect(context.doctorPershing.exhausted).toBeTrue();
                expect(context.tielnFighter).toBeInZone('discard');
                expect(context.player1.hand.length).toBe(1);
                expect(context.player2.hand.length).toBe(0);
                expect(context.getChatLogs(2)).toEqual([
                    'player1 uses Doctor Pershing to deal 1 damage to TIE/ln Fighter',
                    'player1 uses Doctor Pershing, exhausting Doctor Pershing to draw a card',
                ]);

                // Trigger the ability again
                reset();
                context.player1.clickCard(context.doctorPershing);
                context.player1.clickPrompt('Draw a card');
                expect(context.player1).toBeAbleToSelectExactly([context.doctorPershing, context.wampa]);
                expect(context.player1).not.toHaveChooseNothingButton();

                // Target a shilded friendly unit
                context.player1.clickCard(context.wampa);
                expect(context.doctorPershing.exhausted).toBeTrue();
                expect(context.wampa).toHaveExactUpgradeNames([]);
                expect(context.wampa.damage).toBe(0);
                expect(context.player1.hand.length).toBe(2);
                expect(context.player2.hand.length).toBe(0);

                // Trigger the ability again
                reset();
                context.player1.clickCard(context.doctorPershing);
                context.player1.clickPrompt('Draw a card');
                expect(context.player1).toBeAbleToSelectExactly([context.doctorPershing, context.wampa]);
                expect(context.player1).not.toHaveChooseNothingButton();

                // Target self
                context.player1.clickCard(context.doctorPershing);
                expect(context.doctorPershing.exhausted).toBeTrue();
                expect(context.doctorPershing.damage).toBe(1);
                expect(context.player1.hand.length).toBe(3);
                expect(context.player2.hand.length).toBe(0);

                // The action is not available while Doctor Pershing is exhausted
                context.player2.passAction();
                expect(context.doctorPershing).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });
        });
    });
});