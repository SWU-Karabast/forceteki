describe('GreatPitOfCarkoon', function() {
    integration(function(contextRef) {
        describe('Epic Action [discard a unit card]: Search your deck for a card named The Sarlacc of Carkon, reveal it and draw it', function() {
            it('discard only a unit card, search for a Sarlacc, reveal it and draw it', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: ['atst', 'superlaser-technician', 'the-sarlacc-of-carkoon#horror-of-the-dune-sea', 'takedown', 'blizzard-assault-atat'],
                        hand: ['superlaser-blast', 'wampa', 'darth-vader#commanding-the-first-legion'],
                        base: 'great-pit-of-carkoon',
                    },
                    player2: {
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.greatPitOfCarkoon);
                expect(context.player1).toHavePrompt('Choose a card to discard');

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.darthVaderCommandingTheFirstLegion]);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.theSarlaccOfCarkoonHorrorOfTheDuneSea],
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.theSarlaccOfCarkoonHorrorOfTheDuneSea);
                expect(context.player1).toHavePrompt('Waiting for opponent to finish viewing cards for Great Pit of Carkoon ability');

                expect(context.player2).toHaveExactViewableDisplayPromptCards([
                    context.theSarlaccOfCarkoonHorrorOfTheDuneSea
                ]);
                expect(context.player2).toHaveEnabledPromptButton('Done');

                context.player2.clickPrompt('Done');

                expect(context.theSarlaccOfCarkoonHorrorOfTheDuneSea).toBeInZone('hand', context.player1);
                expect(context.player2).toBeActivePlayer();

                // confirm that the ability cannot be used again
                context.player2.passAction();
                expect(context.greatPitOfCarkoon).not.toHaveAvailableActionWhenClickedBy(context.player1);

                // skip to next turn so we can confirm that the ability is still unusable
                context.moveToNextActionPhase();
                expect(context.player1).toBeActivePlayer();
                expect(context.greatPitOfCarkoon).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });

            it('can be used even if there is no valid target in hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: ['wampa', 'atst', 'superlaser-blast', 'superlaser-technician', 'the-sarlacc-of-carkoon#horror-of-the-dune-sea', 'takedown', 'blizzard-assault-atat', 'wampa'],
                        hand: ['superlaser-blast', 'takedown'],
                        base: 'great-pit-of-carkoon',
                    },
                    player2: {
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.greatPitOfCarkoon);
                expect(context.player2).toBeActivePlayer();
            });

            it('can be used even if the hand is empty', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: ['wampa', 'atst', 'superlaser-blast', 'superlaser-technician', 'the-sarlacc-of-carkoon#horror-of-the-dune-sea', 'takedown', 'blizzard-assault-atat', 'wampa'],
                        base: 'great-pit-of-carkoon',
                    },
                    player2: {
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.greatPitOfCarkoon);
                expect(context.player2).toBeActivePlayer();
            });

            it('can be used even if no Sarlacc in deck', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: ['wampa', 'atst', 'superlaser-blast', 'superlaser-technician', 'takedown', 'blizzard-assault-atat', 'wampa'],
                        base: 'great-pit-of-carkoon',
                    },
                    player2: {
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.greatPitOfCarkoon);

                // Don't beleive we can currently display a blank/take nothing prompt at this point, at least not with entireDeckSearch
                expect(context.player2).toBeActivePlayer();
            });

            it('can be used even if no cards in deck', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: ['wampa', 'atst', 'superlaser-blast', 'superlaser-technician', 'takedown', 'blizzard-assault-atat', 'wampa'],
                        base: 'great-pit-of-carkoon',
                    },
                    player2: {
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.greatPitOfCarkoon);

                // Don't beleive we can currently display a blank/take nothing prompt at this point, at least not with entireDeckSearch
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
