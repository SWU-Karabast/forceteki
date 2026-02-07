describe('Highsinger, Deadly Droid', function() {
    integration(function(contextRef) {
        describe('Highsinger\'s abilities', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['highsinger#deadly-droid'],
                        groundArena: ['battlefield-marine', 'wampa', 'crafty-smuggler'],
                    },
                    player2: {
                        hand: ['takedown', 'no-glory-only-results'],
                        groundArena: ['bt1#blastomech', 'phaseiii-dark-trooper']
                    },
                });
            });

            it('should give Experience to another friendly Command unit when played', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.highsinger);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should give Experience to friendly Aggression unit when defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.highsinger);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);

                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.highsinger);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);

                expect(context.wampa).toHaveExactUpgradeNames(['experience']);
            });

            it('should work with NGOR', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.highsinger);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);

                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.highsinger);

                expect(context.player2).toBeAbleToSelectExactly([context.bt1]);
                context.player2.clickCard(context.bt1);

                expect(context.bt1).toHaveExactUpgradeNames(['experience']);
            });
        });
    });
});