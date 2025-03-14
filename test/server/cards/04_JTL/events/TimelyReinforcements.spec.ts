describe('Timely Reinforcements', function () {
    integration(function (contextRef) {
        describe('Timely Reinforcements\' ability', function () {
            it('should create x-wing token for each 2 resources controlled by the player 2', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['timely-reinforcements', 'dedicated-wingmen'],
                        spaceArena: ['green-squadron-awing'],
                    },
                    player2: {
                        hand: ['steadfast-battalion'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['alliance-xwing'],
                        base: { card: 'echo-base' },
                        resources: 6
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.timelyReinforcements);
                let xwingTokens = context.player1.findCardsByName('xwing');
                expect(xwingTokens.length).toBe(3);
                expect(xwingTokens.every((xwing) => xwing.exhausted)).toBe(true);
                expect(xwingTokens.every((xwing) => xwing.keywords.some((keyword) => keyword.name === 'sentinel'))).toBe(true);
                const opponentXwingTokens = context.player2.findCardsByName('xwing');
                expect(opponentXwingTokens.length).toBe(0);
                expect(context.player2.readyResourceCount).toBe(6);

                context.player2.clickCard(context.allianceXwing);
                expect(context.player2).toBeAbleToSelectExactly([
                    ...xwingTokens
                ]);
                context.player2.clickCard(xwingTokens[0]);
                expect(xwingTokens[0]).toBeInZone('outsideTheGame');

                // Test xwing lost sentinel at the end of the phase
                context.moveToNextActionPhase();
                xwingTokens = context.player1.findCardsByName('xwing');
                context.player1.passAction();

                context.player2.clickCard(context.allianceXwing);
                expect(context.player2).toBeAbleToSelectExactly([
                    xwingTokens[1],
                    xwingTokens[2],
                    context.greenSquadronAwing,
                    context.p1Base
                ]);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(2);
            });

            it('should create x-wing token for each 2 resources controlled by the player 2 even when the resources are exhausted', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['timely-reinforcements', 'dedicated-wingmen']
                    },
                    player2: {
                        hand: ['steadfast-battalion'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['alliance-xwing'],
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

            it('should not bug if the number of resources is 0', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['timely-reinforcements', 'dedicated-wingmen']
                    },
                    player2: {
                        hand: ['steadfast-battalion'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['alliance-xwing'],
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

            it('should not give sentinel to existing x-wing tokens', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['timely-reinforcements', 'dedicated-wingmen'],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        hand: ['steadfast-battalion'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['alliance-xwing'],
                        base: { card: 'echo-base' },
                        resources: 9
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.dedicatedWingmen);
                const firstXwingsBatch = context.player1.findCardsByName('xwing');
                expect(firstXwingsBatch.length).toBe(2);
                context.player2.passAction();

                context.player1.clickCard(context.timelyReinforcements);
                const secondXwingBatch = context.player1.findCardsByName('xwing').filter((xwing) => !firstXwingsBatch.includes(xwing));
                expect(secondXwingBatch.length).toBe(4);
                expect(secondXwingBatch.every((xwing) => xwing.keywords.some((keyword) => keyword.name === 'sentinel'))).toBe(true);
                expect(firstXwingsBatch.every((xwing) => xwing.keywords.length === 0)).toBe(true);

                context.player2.clickCard(context.allianceXwing);
                expect(context.player2).toBeAbleToSelectExactly([
                    ...secondXwingBatch
                ]);
                context.player2.clickCard(secondXwingBatch[1]);
                expect(secondXwingBatch[1]).toBeInZone('outsideTheGame');
            });
        });
    });
});
