describe('Desperate Attack', function() {
    integration(function(contextRef) {
        describe('Desperate Attack\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['desperate-attack'],
                        groundArena: [{ card: 'isb-agent', damage: 1 }, { card: 'cell-block-guard', damage: 1 }, 'wampa'],
                        spaceArena: ['tieln-fighter']
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper', 'atst'],
                    }
                });
            });

            it('should allowing triggering an attack with a damaged unit, and give the attacker +2/+0', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.desperateAttack);
                expect(context.player1).toBeAbleToSelectExactly([context.isbAgent, context.cellBlockGuard]);

                context.player1.clickCard(context.isbAgent);
                expect(context.player1).toBeAbleToSelectExactly([context.sundariPeacekeeper, context.atst, context.p2Base]);

                context.player1.clickCard(context.sundariPeacekeeper);
                expect(context.isbAgent.exhausted).toBe(true);
                expect(context.sundariPeacekeeper.damage).toBe(3);
                expect(context.isbAgent.damage).toBe(2);

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