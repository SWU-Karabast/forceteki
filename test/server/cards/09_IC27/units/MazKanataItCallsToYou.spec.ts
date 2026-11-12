describe('Maz Kanata, It Calls to You', function() {
    integration(function(contextRef) {
        describe('its triggered ability', function() {
            it('gets an Experience token when you resource a card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['resupply'],
                        groundArena: ['maz-kanata#it-calls-to-you'],
                    }
                });

                const { context } = contextRef;

                // Resupply puts itself into play as a resource, triggering Maz
                context.player1.clickCard(context.resupply);

                expect(context.player2).toBeActivePlayer();
                expect(context.mazKanata).toHaveExactUpgradeNames(['experience']);
                expect(context.resupply).toBeInZone('resource');
            });

            it('gets an Experience token for each card resourced by Stockpile', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['stockpile'],
                        groundArena: ['maz-kanata#it-calls-to-you'],
                    }
                });

                const { context } = contextRef;

                // Stockpile resources itself and the top card of the deck — two resourced cards, two triggers
                context.player1.clickCard(context.stockpile);

                expect(context.player1).toHaveExactPromptButtons(['Resolve next', 'Resolve all (2)']);
                context.player1.clickPrompt('Resolve all (2)');

                expect(context.player2).toBeActivePlayer();
                expect(context.mazKanata).toHaveExactUpgradeNames(['experience', 'experience']);
                expect(context.stockpile).toBeInZone('resource');
            });

            it('gets an Experience token when you resource a card during the regroup phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['maz-kanata#it-calls-to-you', 'wampa'],
                    },
                    player2: {
                        hand: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.mazKanata);
                context.player2.passAction();

                context.moveToRegroupPhase();

                // P1 resources Wampa — triggers Maz; P2's resourcing does not
                context.player1.clickCard(context.wampa);
                context.player1.clickDone();
                context.player2.clickDone();

                expect(context.mazKanata).toHaveExactUpgradeNames(['experience']);
            });

            it('does not trigger when you decline to resource during the regroup phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['maz-kanata#it-calls-to-you', 'wampa'],
                    },
                    player2: {}
                });

                const { context } = contextRef;

                context.player1.clickCard(context.mazKanata);
                context.player2.passAction();

                context.moveToRegroupPhase();

                // P1 skips resourcing — no card is resourced, so Maz does not trigger
                context.player1.clickDone();
                context.player2.clickDone();

                expect(context.mazKanata).toHaveExactUpgradeNames([]);
            });

            it('does not trigger when the opponent resources a card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['maz-kanata#it-calls-to-you'],
                    },
                    player2: {
                        hand: ['resupply'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.mazKanata);
                context.player2.clickCard(context.resupply);

                expect(context.mazKanata.upgrades.length).toBe(0);
            });
        });
    });
});
