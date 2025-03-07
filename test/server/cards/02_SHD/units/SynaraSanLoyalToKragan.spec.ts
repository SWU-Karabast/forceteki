describe('Synara San, Loyal to Kragan', function() {
    integration(function(contextRef) {
        describe('Synara San\'s Bounty ability', function() {
            it('should heal 5 damage from the opponent\'s base if the unit is exhausted', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'synara-san#loyal-to-kragan', exhausted: true }]
                    },
                    player2: {
                        groundArena: ['atst'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.synaraSan);

                expect(context.player2).toHavePassAbilityPrompt('Collect Bounty: Deal 5 damage to a base');
                context.player2.clickPrompt('Trigger');

                expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player2.clickCard(context.p1Base);

                expect(context.player1).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(5);
            });

            it('should heal 5 damage from the opponent\'s base if the unit is exhausted by its own attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['synara-san#loyal-to-kragan']
                    },
                    player2: {
                        groundArena: ['atst'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.synaraSan);
                context.player1.clickCard(context.atst);

                expect(context.player2).toHavePassAbilityPrompt('Collect Bounty: Deal 5 damage to a base');
                context.player2.clickPrompt('Trigger');

                expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player2.clickCard(context.p1Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(5);
            });

            it('should do nothing if the unit is not exhausted', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['synara-san#loyal-to-kragan']
                    },
                    player2: {
                        groundArena: ['atst'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.synaraSan);
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
