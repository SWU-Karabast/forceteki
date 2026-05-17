describe('Sundari Palace', function() {
    integration(function(contextRef) {
        describe('Sundari Palace\'s Epic Action', function() {
            it('should resource cards from hand equal to the number of friendly leader units and defeat that many resources at the start of the regroup phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'sundari-palace',
                        leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true },
                        hand: ['wampa', 'battlefield-marine', 'mastery', 'fulcrum'],
                        resources: ['atst', 'tieln-fighter', 'snowtrooper-lieutenant'],
                    },
                    player2: {
                        leader: { card: 'chewbacca#walking-carpet', deployed: true },
                        hand: ['awing']

                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sundariPalace);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.mastery, context.fulcrum, context.awing]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.wampa);
                context.player1.clickPrompt('Done');

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toBeInZone('resource', context.player1);
                expect(context.sundariPalace.epicActionSpent).toBeTrue();

                context.moveToRegroupPhase();

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.tielnFighter, context.snowtrooperLieutenant]);
                context.player1.clickCard(context.atst);

                expect(context.atst).toBeInZone('discard', context.player1);
            });

            it('should allow choosing no cards to resource', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'sundari-palace',
                        leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true },
                        hand: ['wampa'],
                        resources: ['atst'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sundariPalace);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickPrompt('Choose nothing');

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toBeInZone('hand', context.player1);
                expect(context.sundariPalace.epicActionSpent).toBeTrue();

                context.moveToRegroupPhase();

                expect(context.player1).toHavePrompt('Select between 0 and 1 cards to resource');
            });

            it('should not do anything when there are no friendly leader units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'sundari-palace',
                        hand: ['wampa'],
                        resources: ['atst'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sundariPalace);
                context.player1.clickPrompt('Use it anyway');

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toBeInZone('hand', context.player1);
                expect(context.sundariPalace.epicActionSpent).toBeTrue();

                context.moveToRegroupPhase();
                expect(context.player1).toHavePrompt('Select between 0 and 1 cards to resource');
            });

            it('should not do anything when there are no cards in hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'sundari-palace',
                        leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true },
                        resources: ['atst'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sundariPalace);
                context.player1.clickPrompt('Use it anyway');

                expect(context.player2).toBeActivePlayer();
                expect(context.sundariPalace.epicActionSpent).toBeTrue();

                context.moveToRegroupPhase();
                expect(context.player1).toHavePrompt('Select between 0 and 1 cards to resource');
            });

            it('should not defeated a resource with delayed effect if there is no more resource', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'sundari-palace',
                        leader: { card: 'chewbacca#hero-of-kessel', deployed: true },
                        hand: ['wampa'],
                        resources: [],
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sundariPalace);
                context.player1.clickCard(context.wampa);
                context.player1.clickPrompt('Done');

                expect(context.player2).toBeActivePlayer();
                expect(context.sundariPalace.epicActionSpent).toBeTrue();

                context.player2.passAction();

                context.player1.clickCard(context.chewbacca);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.resources.length).toBe(0);

                context.moveToRegroupPhase();

                expect(context.player1).toHavePrompt('Select between 0 and 1 cards to resource');
            });
        });
    });
});
