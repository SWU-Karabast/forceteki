describe('Outflank', function () {
    integration(function (contextRef) {
        describe('Outflank\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['outflank'],
                        groundArena: ['pyke-sentinel', 'battlefield-marine'],
                        spaceArena: ['green-squadron-awing'],
                        leader: { card: 'chirrut-imwe#one-with-the-force', deployed: true }
                    },
                    player2: {}
                });
            });

            it('should initiate 2 attacks', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.outflank);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.greenSquadronAwing, context.battlefieldMarine, context.chirrutImwe]);

                context.player1.clickCard(context.battlefieldMarine);
                // base was automatically choose

                context.player1.clickCard(context.chirrutImwe);
                // base was automatically choose

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(6);
            });

            it('should initiate only 1 attack', function () {
                const { context } = contextRef;

                context.battlefieldMarine.exhausted = true;
                context.chirrutImwe.exhausted = true;
                context.pykeSentinel.exhausted = true;

                context.player1.clickCard(context.outflank);

                // no one can be chosen anymore > next player action
                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(3);
            });
        });
    });
});
