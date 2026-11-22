describe('Chief Chirpa Defiant Elder', function() {
    integration(function(contextRef) {
        describe('Chief Chirpa\'s ability', function() {
            it('should get +0/+0 when no other friendly Ewok units are in play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['chief-chirpa#defiant-elder', 'battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['atst', 'wicket#yub-nub'],
                    }
                });

                const { context } = contextRef;

                expect(context.chiefChirpa.getPower()).toBe(1);
                expect(context.chiefChirpa.getHp()).toBe(5);
            });

            it('should get +1/+0 for each other friendly Ewok unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['chief-chirpa#defiant-elder', 'village-tender', 'ewok-warrior'],
                    },
                    player2: {
                        groundArena: ['atst'],
                    }
                });

                const { context } = contextRef;

                expect(context.chiefChirpa.getPower()).toBe(3);
                expect(context.chiefChirpa.getHp()).toBe(5);
            });
        });
    });
});
