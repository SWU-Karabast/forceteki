describe('Jyn Erso, Stardust', function () {
    integration(function (contextRef) {
        it('Jyn Erso\'s ability should give +1/+0 and saboteur while an enemy unit has been defeated this phase', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'jyn-erso#stardust', upgrades: ['experience', 'experience', 'experience'] }],
                },
                player2: {
                    groundArena: ['echo-base-defender'],
                }
            });

            const { context } = contextRef;

            // attack, no unit was defeated this phase, jyn should not have +1 and saboteur
            context.player1.clickCard(context.jynErso);
            context.player1.clickCard(context.echoBaseDefender);
            expect(context.echoBaseDefender).toBeInZone('discard');

            context.player2.moveCard(context.echoBaseDefender, 'groundArena');

            context.jynErso.exhausted = false;
            context.player2.passAction();

            // attack with jyn, she should have +1/+0 and saboteur because echo base defender already died
            context.player1.clickCard(context.jynErso);
            expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.echoBaseDefender]);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(7);

            context.moveToNextActionPhase();

            expect(context.jynErso.getPower()).toBe(6);
            context.player1.clickCard(context.jynErso);
            context.player1.clickCard(context.echoBaseDefender);
            expect(context.echoBaseDefender).toBeInZone('discard');
        });
    });
});
