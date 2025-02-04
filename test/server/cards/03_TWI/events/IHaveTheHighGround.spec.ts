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
            expect(context.battlefieldMarine).toBeInZone('groundArena');
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.wampa.damage).toBe(3);

            context.setDamage(context.wampa,0);
            context.moveToNextActionPhase();

            context.player1.passAction();
            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.battlefieldMarine);
            expect(context.battlefieldMarine).toBeInZone('discard');
        });
    });
});
