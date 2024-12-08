describe('Jyn Erso, Stardust', function () {
    integration(function (contextRef) {
        describe('Jyn Erso\'s ability', function () {
            it('should give +1/+0 and saboteur while an enemy unit has been defeated this phase', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['rivals-fall'],
                        groundArena: ['jyn-erso#stardust'],
                    },
                    player2: {
                        hand: ['echo-base-defender'],
                        groundArena: ['r2d2#ignoring-protocol']
                    }
                });

                const { context } = contextRef;

                // attack, no unit was defeated this phase, jyn should not have +1 and saboteur
                context.player1.clickCard(context.jynErso);
                context.player1.clickCard(context.r2d2);

                expect(context.r2d2.damage).toBe(3);

                // opponent play a sentinel
                context.player2.clickCard(context.echoBaseDefender);

                // we kill an enemy unit
                context.player1.clickCard(context.rivalsFall);
                context.player1.clickCard(context.r2d2);

                context.jynErso.exhausted = false;
                context.player2.passAction();

                // attack with jyn, she should have +1/+0 and saboteur because r2d2 died
                context.player1.clickCard(context.jynErso);
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.echoBaseDefender]);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(4);
            });
        });
    });
});
