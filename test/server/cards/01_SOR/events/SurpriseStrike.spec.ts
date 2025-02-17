describe('Surprise Strike', function() {
    integration(function(contextRef) {
        describe('Surprise Strike\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['surprise-strike'],
                        groundArena: ['isb-agent', { card: 'wampa', exhausted: true }],
                        spaceArena: ['tieln-fighter']
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper', 'atst'],
                    }
                });
            });

            it('should allowing triggering an attack and give the attacker +3/+0', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.surpriseStrike);
                expect(context.player1).toBeAbleToSelectExactly([context.isbAgent, context.tielnFighter]);

                context.player1.clickCard(context.isbAgent);
                expect(context.player1).toBeAbleToSelectExactly([context.sundariPeacekeeper, context.atst, context.p2Base]);

                context.player1.clickCard(context.sundariPeacekeeper);
                expect(context.isbAgent.exhausted).toBe(true);
                expect(context.sundariPeacekeeper.damage).toBe(4);
                expect(context.isbAgent.damage).toBe(1);

                // second attack to confirm that the buff is gone
                context.isbAgent.exhausted = false;
                context.player2.passAction();
                context.player1.clickCard(context.isbAgent);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(1);
            });
        });
    });
});
