describe('Timely Reinforcements', function () {
    integration(function (contextRef) {
        describe('Timely Reinforcements\' ability', function () {
            it('should create x-wing token for each 2 resources controlled by the player 2', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['timely-reinforcements']
                    },
                    player2: {
                        hand: ['steadfast-battalion'],
                        base: { card: 'echo-base' },
                        resources: 6
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.timelyReinforcements);
                const xwingTokens = context.player1.findCardsByName('xwing');
                expect(xwingTokens.length).toBe(3);
                expect(xwingTokens.every((xwing) => xwing.exhausted)).toBe(true);
                const opponentXwingTokens = context.player2.findCardsByName('xwing');
                expect(opponentXwingTokens.length).toBe(0);
                expect(context.player2.readyResourceCount).toBe(6);
            });

            it('should create x-wing token for each 2 resources controlled by the player 2 even when the resources are exhausted', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['timely-reinforcements']
                    },
                    player2: {
                        hand: ['steadfast-battalion'],
                        base: { card: 'echo-base' },
                        resources: 5
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.steadfastBattalion);
                expect(context.player2.readyResourceCount).toBe(0);

                context.player1.clickCard(context.timelyReinforcements);
                const xwingTokens = context.player1.findCardsByName('xwing');
                expect(xwingTokens.length).toBe(2);
                expect(xwingTokens.every((xwing) => xwing.exhausted)).toBe(true);
                const opponentXwingTokens = context.player2.findCardsByName('xwing');
                expect(opponentXwingTokens.length).toBe(0);
                expect(context.player2.readyResourceCount).toBe(0);
            });

            it('should create x-wing token for each 2 resources controlled by the player 2 even when the resources are exhausted', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['timely-reinforcements']
                    },
                    player2: {
                        hand: ['steadfast-battalion'],
                        base: { card: 'echo-base' },
                        resources: 0 // I am not sure it makes sense but trying to test the edge case
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.timelyReinforcements);
                const xwingTokens = context.player1.findCardsByName('xwing');
                expect(xwingTokens.length).toBe(0);
                const opponentXwingTokens = context.player2.findCardsByName('xwing');
                expect(opponentXwingTokens.length).toBe(0);
                expect(context.player2.readyResourceCount).toBe(0);
            });
        });
    });
});
