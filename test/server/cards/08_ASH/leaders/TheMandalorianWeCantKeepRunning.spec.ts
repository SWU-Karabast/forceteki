describe('The Mandalorian, We Can\'t Keep Running', function () {
    integration(function (contextRef) {
        describe('leader side ability', function () {
            it('should allow paying 1 resource to draw a card when claiming initiative', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'the-mandalorian#we-cant-keep-running'
                    },
                });
                const { context } = contextRef;

                context.player1.claimInitiative();
                expect(context.player1).toHavePassAbilityPrompt('Pay 1 resource to draw a card');
                context.player1.clickPrompt('Trigger');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.hand.length).toBe(1);
            });

            it('should not draw card when claiming initiative without resources', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'the-mandalorian#we-cant-keep-running',
                        resources: 0,
                    },
                });
                const { context } = contextRef;

                context.player1.claimInitiative();

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.hand.length).toBe(0);
            });

            it('should not trigger when opponent claims initiative', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'the-mandalorian#we-cant-keep-running',
                        spaceArena: ['awing']
                    },
                });
                const { context } = contextRef;

                context.player1.clickCard(context.awing);
                context.player1.clickCard(context.p2Base);
                context.player2.claimInitiative();

                expect(context.player1).toBeActivePlayer();
                expect(context.player1.hand.length).toBe(0);
            });

            it('should not trigger when turn end when both players pass', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'the-mandalorian#we-cant-keep-running',
                        spaceArena: ['awing']
                    },
                });
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.passAction();

                expect(context.player1).toHavePrompt('Select between 0 and 1 cards to resource');
                expect(context.player2).toHavePrompt('Select between 0 and 1 cards to resource');
            });
        });

        describe('leader unit side ability', function () {
            it('should draw a card when attacking if player has initiative', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'the-mandalorian#we-cant-keep-running', deployed: true },
                        hasInitiative: true,
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.theMandalorian);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toHavePassAbilityPrompt('Draw a card');
                context.player1.clickPrompt('Trigger');

                expect(context.player1.hand.length).toBe(1);
            });

            it('should not draw a card when attacking if player does not have initiative', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'the-mandalorian#we-cant-keep-running', deployed: true },
                    },
                    player2: {
                        groundArena: ['wampa'],
                        hasInitiative: true,
                    }
                });
                const { context } = contextRef;

                context.player2.passAction();

                context.player1.clickCard(context.theMandalorian);
                context.player1.clickCard(context.wampa);

                expect(context.player1.hand.length).toBe(0);
            });
        });
    });
});
