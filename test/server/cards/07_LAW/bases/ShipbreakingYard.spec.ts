describe('Shipbreaking Yard', function() {
    integration(function(contextRef) {
        describe('Shipbreaking Yard\'s epic action', function() {
            it('discards the top 3 cards of the controller\'s deck, and they can return one to top', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: ['atst', 'superlaser-technician', 'resupply', 'takedown', 'blizzard-assault-atat'],
                        hand: ['superlaser-blast', 'wampa', 'darth-vader#commanding-the-first-legion'],
                        base: 'shipbreaking-yard',
                    },
                    player2: {
                        deck: ['rivals-fall', 'power-of-the-dark-side', 'battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.shipbreakingYard);
                expect(context.player1).toHavePrompt('Return a discarded card to the top of your deck');

                expect(context.player1).toBeAbleToSelectExactly([
                    context.atst,
                    context.superlaserTechnician,
                    context.resupply
                ]);
                expect(context.player1).toHaveEnabledPromptButton('Pass');
                context.player1.clickCard(context.resupply);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.deck[0]).toBe(context.resupply);
                expect(context.atst).toBeInZone('discard');
                expect(context.superlaserTechnician).toBeInZone('discard');

                expect(context.player2.deck[0]).toBe(context.rivalsFall);

                // confirm that the ability cannot be used again
                context.player2.passAction();
                expect(context.shipbreakingYard).not.toHaveAvailableActionWhenClickedBy(context.player1);

                // skip to next turn so we can confirm that the ability is still unusable
                context.moveToNextActionPhase();
                expect(context.player1).toBeActivePlayer();
                expect(context.shipbreakingYard).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });

            it('can be used if only 2 cards in deck', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: ['wampa', 'atst'],
                        hand: ['takedown'],
                        base: 'shipbreaking-yard',
                    },
                    player2: {
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.shipbreakingYard);
                expect(context.player1).toHavePrompt('Return a discarded card to the top of your deck');

                expect(context.player1).toBeAbleToSelectExactly([
                    context.atst,
                    context.wampa,

                ]);
                expect(context.player1).toHaveEnabledPromptButton('Pass');
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.deck[0]).toBe(context.wampa);
                expect(context.atst).toBeInZone('discard');
            });

            it('can be used and then the return ability passed', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: ['atst', 'superlaser-blast', 'superlaser-technician', 'takedown', 'blizzard-assault-atat'],
                        base: 'shipbreaking-yard',
                        hand: ['wampa', 'darth-vader#commanding-the-first-legion']
                    },
                    player2: {
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.shipbreakingYard);
                expect(context.player1).toHavePrompt('Return a discarded card to the top of your deck');

                expect(context.player1).toBeAbleToSelectExactly([
                    context.atst,
                    context.superlaserBlast,
                    context.superlaserTechnician
                ]);
                expect(context.player1).toHaveEnabledPromptButton('Pass');
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.deck[0]).toBe(context.takedown);
                expect(context.atst).toBeInZone('discard');
                expect(context.superlaserTechnician).toBeInZone('discard');
                expect(context.superlaserBlast).toBeInZone('discard');

                // confirm that the ability cannot be used again
                context.player2.passAction();
                expect(context.shipbreakingYard).not.toHaveAvailableActionWhenClickedBy(context.player1);

                // skip to next turn so we can confirm that the ability is still unusable
                context.moveToNextActionPhase();
                expect(context.player1).toBeActivePlayer();
                expect(context.shipbreakingYard).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });

            it('can be used even if no cards in deck', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: [],
                        base: 'shipbreaking-yard',
                        hand: ['superlaser-blast', 'wampa', 'darth-vader#commanding-the-first-legion']
                    },
                    player2: {
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.shipbreakingYard);

                // confirm that the ability cannot be used again
                context.player2.passAction();
                expect(context.shipbreakingYard).not.toHaveAvailableActionWhenClickedBy(context.player1);

                // skip to next turn so we can confirm that the ability is still unusable
                context.moveToNextActionPhase();
                expect(context.player1).toBeActivePlayer();
                expect(context.shipbreakingYard).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });
        });
    });
});