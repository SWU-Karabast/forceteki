describe('On Top of Things', function() {
    integration(function(contextRef) {
        describe('On Top of Things\' ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['on-top-of-things'],
                        groundArena: ['battlefield-marine', 'wampa'],
                    },
                    player2: {
                        hand: ['confiscate'],
                        groundArena: ['atst']
                    }
                });
            });

            it('should make attached unit untargetable for this phase', function () {
                const { context } = contextRef;

                // add on top of things to wampa
                context.player1.clickCard(context.onTopOfThings);
                context.player1.clickCard(context.wampa);
                expect(context.getChatLogs(1)).toContain('player1 uses On Top of Things to prevent Wampa from being attacked for this phase');

                // atst cannot attack wampa
                context.player2.clickCard(context.atst);
                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.p1Base]);
                context.player2.clickCard(context.p1Base);

                context.moveToNextActionPhase();
                context.player1.passAction();

                // next action phase, wampa can be attacked
                context.player2.clickCard(context.atst);
                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.p1Base]);
                context.player2.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('discard');
            });

            // Ruling 2025-05-19 (CR 7.7.3B): "Attached unit can't be attacked this phase" is a When
            // Played ability that creates a lasting effect locked onto the unit at resolution. It
            // persists for the phase even if the On Top of Things upgrade is later defeated.
            it('keeps protecting the unit for the phase even after the On Top of Things upgrade is defeated', function () {
                const { context } = contextRef;

                // Play On Top of Things on Wampa, applying "can't be attacked this phase"
                context.player1.clickCard(context.onTopOfThings);
                context.player1.clickCard(context.wampa);

                // Player2 defeats On Top of Things with Confiscate
                context.player2.clickCard(context.confiscate);
                context.player2.clickCard(context.onTopOfThings);
                expect(context.onTopOfThings).toBeInZone('discard');

                // The lasting effect still protects Wampa for the rest of the phase
                context.player1.passAction();
                context.player2.clickCard(context.atst);
                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.p1Base]);
                context.player2.clickCard(context.p1Base);
            });
        });
    });
});
