describe('Grand Admiral Thrawn, Listen to Me Carefully', function() {
    integration(function(contextRef) {
        describe('Thrawn\'s triggered ability', function() {
            it('should give an Experience token and Sentinel for this phase to a friendly unit when played', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['grand-admiral-thrawn#listen-to-me-carefully'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: ['wampa', 'porg']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.grandAdmiralThrawn);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.grandAdmiralThrawn, context.awing]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);

                context.player2.clickCard(context.porg);
                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player2.clickCard(context.battlefieldMarine);

                context.moveToNextActionPhase();

                context.player1.passAction();
                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.grandAdmiralThrawn, context.p1Base]);
                context.player2.clickCard(context.p1Base);
            });

            it('can be passed', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['grand-admiral-thrawn#listen-to-me-carefully'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: ['wampa', 'porg']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.grandAdmiralThrawn);
                context.player1.clickPrompt('Pass');

                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.grandAdmiralThrawn, context.p1Base]);
                context.player2.clickCard(context.p1Base);
            });

            it('should give an Experience token and Sentinel to a friendly unit when attacking', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['grand-admiral-thrawn#listen-to-me-carefully', 'battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.grandAdmiralThrawn);
                context.player1.clickCard(context.p2Base);

                // Trigger the ability
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);

                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player2.clickCard(context.battlefieldMarine);
            });

            it('should give an Experience token and Sentinel to a friendly unit when defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['grand-admiral-thrawn#listen-to-me-carefully', 'battlefield-marine'],
                    },
                    player2: {
                        hand: ['rivals-fall'],
                        groundArena: ['wampa'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.grandAdmiralThrawn);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);

                context.player1.passAction();
                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player2.clickCard(context.battlefieldMarine);
            });

            it('should give an Experience token and Sentinel to a friendly unit when defeated (No Glory Only Results)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['grand-admiral-thrawn#listen-to-me-carefully', 'battlefield-marine'],
                    },
                    player2: {
                        hand: ['no-glory-only-results'],
                        groundArena: ['wampa'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.grandAdmiralThrawn);

                expect(context.player2).toBeAbleToSelectExactly([context.wampa]);
                context.player2.clickCard(context.wampa);

                expect(context.wampa).toHaveExactUpgradeNames(['experience']);

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);
            });
        });
    });
});
