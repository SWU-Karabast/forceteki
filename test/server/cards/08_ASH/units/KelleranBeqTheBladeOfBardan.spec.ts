describe('Kelleran Beq, The Blade Of Bardan', function() {
    integration(function(contextRef) {
        describe('Constant ability', function() {
            it('should give +1/+0 for each other units with 0 power', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['kelleran-beq#where-are-the-others', 'doctor-pershing#dedicated-to-research'],
                        spaceArena: ['strikeship']
                    },
                    player2: {
                        groundArena: ['doctor-pershing#experimenting-with-life'],
                        spaceArena: ['tie-bomber'],
                    },
                });
                const { context } = contextRef;

                expect(context.kelleranBeq.getPower()).toBe(7);
                expect(context.kelleranBeq.getHp()).toBe(5);
            });

            it('should not count itself', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['tie-bomber'],
                        groundArena: ['kelleran-beq#where-are-the-others'],
                    },
                    player2: {
                        hasInitiative: true,
                        hasForceToken: true,
                        hand: ['talzins-assassin'],
                    },
                });
                const { context } = contextRef;

                expect(context.kelleranBeq.getPower()).toBe(3);
                expect(context.kelleranBeq.getHp()).toBe(5);

                context.player2.clickCard(context.talzinsAssassin);
                context.player2.clickPrompt('Trigger');
                context.player2.clickCard(context.kelleranBeq);

                expect(context.kelleranBeq.getPower()).toBe(0);
                expect(context.kelleranBeq.getHp()).toBe(2);

                context.player1.clickCard(context.tieBomber);

                expect(context.kelleranBeq.getPower()).toBe(1);
                expect(context.kelleranBeq.getHp()).toBe(2);
            });
        });
    });
});
