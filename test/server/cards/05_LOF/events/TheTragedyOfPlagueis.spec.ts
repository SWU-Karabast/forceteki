describe('The Tragedy of Plagueis', function() {
    integration(function(contextRef) {
        describe('The Tragedy of Plagueis\'s ability', function() {
            it('can be played when there are no targets for either ability', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'gar-saxon#viceroy-of-mandalore',
                        hand: ['the-tragedy-of-plagueis']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.theTragedyOfPlagueis);

                // Uncomment these once we update event Cancel logic for opponent selections
                // expect(context.player1).toHavePrompt('Playing The Tragedy of Plagueis will have no effect. Are you sure you want to play it?');
                // context.player1.clickPrompt('Play anyway');

                expect(context.player1.exhaustedResourceCount).toBe(5);
                expect(context.theTragedyOfPlagueis).toBeInZone('discard');
            });

            it('will allow choosing a friendly unit even if there are no enemy units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'gar-saxon#viceroy-of-mandalore',
                        hand: ['the-tragedy-of-plagueis'],
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theTragedyOfPlagueis);

                expect(context.player1.exhaustedResourceCount).toBe(5);
                expect(context.theTragedyOfPlagueis).toBeInZone('discard');

                expect(context.player1).toHavePrompt('Choose a friendly unit. For this phase, it can\'t be defeated by having no remaining HP.');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);
                expect(context.player2).toBeActivePlayer();
            });

            it('will make an opponent defeat a unit even if there are no friendly units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'gar-saxon#viceroy-of-mandalore',
                        hand: ['the-tragedy-of-plagueis']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.theTragedyOfPlagueis);

                expect(context.player1.exhaustedResourceCount).toBe(5);
                expect(context.theTragedyOfPlagueis).toBeInZone('discard');

                expect(context.player2).toHavePrompt('Choose a unit to defeat');
                expect(context.player2).toBeAbleToSelectExactly([context.wampa]);
                context.player2.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('will prevent friendly unit from dying due to 0 HP for the current phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'gar-saxon#viceroy-of-mandalore',
                        hand: ['the-tragedy-of-plagueis'],
                        groundArena: ['moisture-farmer']
                    },
                    player2: {
                        hand: ['open-fire']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theTragedyOfPlagueis);
                context.player1.clickCard(context.moistureFarmer);

                context.player2.clickCard(context.openFire);
                context.player2.clickCard(context.moistureFarmer);
                expect(context.moistureFarmer).toBeInZone('groundArena');
                expect(context.moistureFarmer.damage).toBe(4);
                expect(context.moistureFarmer.remainingHp).toBe(0);

                context.moveToNextActionPhase();
                expect(context.moistureFarmer).toBeInZone('discard');
            });

            it('will not prevent friendly unit from dying from a defeat effect', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'gar-saxon#viceroy-of-mandalore',
                        hand: ['the-tragedy-of-plagueis'],
                        groundArena: ['moisture-farmer']
                    },
                    player2: {
                        hand: ['takedown']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theTragedyOfPlagueis);
                context.player1.clickCard(context.moistureFarmer);

                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.moistureFarmer);
                expect(context.moistureFarmer).toBeInZone('discard');
            });

            it('will prevent friendly unit from dying due to 0 HP for the current phase and defeat an enemy unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'gar-saxon#viceroy-of-mandalore',
                        hand: ['the-tragedy-of-plagueis'],
                        groundArena: ['moisture-farmer']
                    },
                    player2: {
                        hand: ['open-fire'],
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theTragedyOfPlagueis);
                expect(context.player1).toBeAbleToSelectExactly([context.moistureFarmer]);
                context.player1.clickCard(context.moistureFarmer);

                expect(context.player2).toBeAbleToSelectExactly([context.wampa]);
                context.player2.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('discard');

                context.player2.clickCard(context.openFire);
                context.player2.clickCard(context.moistureFarmer);
                expect(context.moistureFarmer).toBeInZone('groundArena');
                expect(context.moistureFarmer.damage).toBe(4);
                expect(context.moistureFarmer.remainingHp).toBe(0);

                context.moveToNextActionPhase();
                expect(context.moistureFarmer).toBeInZone('discard');
            });
        });
    });
});
