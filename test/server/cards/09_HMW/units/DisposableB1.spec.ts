describe('Disposable B1', function() {
    integration(function(contextRef) {
        describe('Disposable B1\'s When Played ability', function() {
            it('should not draw a card if no other friendly unit entered play this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['disposable-b1'],
                        groundArena: ['battlefield-marine'],
                        deck: ['atst']
                    }
                });

                const { context } = contextRef;

                // Battlefield Marine was already in play, so it did not enter play this phase
                context.player1.clickCard(context.disposableB1);

                expect(context.atst).toBeInZone('deck', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should draw a card if another friendly unit was played this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['disposable-b1', 'battlefield-marine'],
                        deck: ['atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player2.passAction();

                context.player1.clickCard(context.disposableB1);

                expect(context.atst).toBeInZone('hand', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should draw a card if a friendly leader was deployed this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grand-moff-tarkin#oversector-governor',
                        hand: ['disposable-b1'],
                        deck: ['atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.grandMoffTarkin);
                context.player1.clickPrompt('Deploy Grand Moff Tarkin');
                context.player2.passAction();

                context.player1.clickCard(context.disposableB1);

                expect(context.atst).toBeInZone('hand', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should draw a card if a friendly token unit was created this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['disposable-b1', 'droid-deployment'],
                        deck: ['atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.droidDeployment);
                expect(context.player1.getArenaCards().length).toBe(2);
                context.player2.passAction();

                context.player1.clickCard(context.disposableB1);

                expect(context.atst).toBeInZone('hand', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should draw a card if another friendly unit entered play this phase and was then defeated', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['disposable-b1', 'battlefield-marine'],
                        deck: ['atst']
                    },
                    player2: {
                        hand: ['vanquish']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard', context.player1);

                context.player1.clickCard(context.disposableB1);

                expect(context.atst).toBeInZone('hand', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not draw a card if only enemy units entered play this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['disposable-b1'],
                        deck: ['atst']
                    },
                    player2: {
                        leader: 'grand-moff-tarkin#oversector-governor',
                        hand: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.wampa);

                context.player1.passAction();
                context.player2.clickCard(context.grandMoffTarkin);
                context.player2.clickPrompt('Deploy Grand Moff Tarkin');

                context.player1.clickCard(context.disposableB1);

                expect(context.atst).toBeInZone('deck', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not draw a card if the other friendly unit entered play in a previous phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['disposable-b1', 'battlefield-marine'],
                        // the first two cards are drawn during the regroup phase, leaving the AT-ST on top of the deck
                        deck: ['wampa', 'cartel-spacer', 'atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.moveToNextActionPhase();

                context.player1.clickCard(context.disposableB1);

                expect(context.atst).toBeInZone('deck', context.player1);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
