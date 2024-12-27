describe('Rebel Assault', function () {
    integration(function (contextRef) {
        describe('Rebel Assault\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['rebel-assault'],
                        groundArena: ['pyke-sentinel', 'battlefield-marine'],
                        spaceArena: ['green-squadron-awing'],
                        leader: { card: 'chirrut-imwe#one-with-the-force', deployed: true }
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should initiate 2 attacks with +1/+0', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.rebelAssault);
                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.battlefieldMarine, context.chirrutImwe]);

                context.player1.clickCard(context.battlefieldMarine);
                // base was automatically choose

                context.player1.clickCard(context.chirrutImwe);
                // base was automatically choose

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(8);
            });

            it('should initiate only 1 attack with +1/+0', function () {
                const { context } = contextRef;

                context.battlefieldMarine.exhausted = true;
                context.chirrutImwe.exhausted = true;

                context.player1.clickCard(context.rebelAssault);

                // no one can be chosen anymore > next player action
                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(4);
            });
        });
    });
});
