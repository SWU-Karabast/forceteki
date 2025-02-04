describe('I Have The High Ground', function () {
    integration(function (contextRef) {
        it('I Have The High Ground\'s ability should modify attackers power by -4 when targetting the selected friendly unit for this phase', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['i-have-the-high-ground'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.iHaveTheHighGround);
            context.player1.clickCard(context.battlefieldMarine);
            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.battlefieldMarine);
            expect(context.battlefieldMarine).toBeInZone('ground-arena');
            expect(context.wampa.damage).toBe(3);
        });
    });
});