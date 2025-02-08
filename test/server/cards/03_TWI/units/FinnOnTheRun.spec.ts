describe('Finn, On the Run', function () {
    integration(function (contextRef) {
        it('Finn\'s ability should prevent 1 damage from any source to a unique unit', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['finn#on-the-run', 'wampa', 'admiral-yularen#advising-caution']
                },
                player2: {
                    hand: ['daring-raid'],
                    groundArena: ['battlefield-marine', 'maul#shadow-collective-visionary'],
                }
            });

            const { context } = contextRef;

            // trigger finn ability
            context.player1.clickCard(context.finn);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.finn, context.admiralYularen, context.maul]);
            context.player1.clickCard(context.admiralYularen);

            // attack with battlefield marine, should do only 2 damage
            context.player2.clickCard(context.battlefieldMarine);
            context.player2.clickCard(context.admiralYularen);

            expect(context.admiralYularen.damage).toBe(2);

            context.setDamage(context.admiralYularen, 0);
            context.player1.passAction();

            // use daring raid into yularen, should do only 1 damage
            context.player2.clickCard(context.daringRaid);
            context.player2.clickCard(context.admiralYularen);
            expect(context.admiralYularen.damage).toBe(1);

            context.setDamage(context.admiralYularen, 0);
            context.moveToNextActionPhase();

            context.player1.passAction();

            // next action, ability should be expired
            context.player2.clickCard(context.battlefieldMarine);
            context.player2.clickCard(context.admiralYularen);

            expect(context.admiralYularen.damage).toBe(3);
        });
    });
});
