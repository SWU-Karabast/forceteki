describe('Shadowed Intentions', function() {
    integration(function(contextRef) {
        it('Shadowed Intentions\' ability should prevent the unit to be defeated, captured or returned to hand', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['waylay', 'vanquish', 'relentless-pursuit', 'daring-raid'],
                    groundArena: ['wampa', 'jedha-agitator']
                },
                player2: {
                    groundArena: [{ card: 'battlefield-marine', upgrades: ['shadowed-intentions'] }],
                    hand: ['rivals-fall', 'bright-hope#the-last-transport'],
                }
            });

            const { context } = contextRef;

            // try to return upgraded battlefield marine to hand but fail
            context.player1.clickCard(context.waylay);
            context.player1.clickCardNonChecking(context.battlefieldMarine);
            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toBeInZone('groundArena');
            expect(context.waylay).toBeInZone('discard');
            context.player2.passAction();

            // try to defeat upgraded battlefield marine to hand but fail
            context.player1.clickCard(context.vanquish);
            context.player1.clickCardNonChecking(context.battlefieldMarine);
            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toBeInZone('groundArena');
            expect(context.vanquish).toBeInZone('discard');
            context.player2.passAction();

            // try to capture upgraded battlefield marine to hand but fail
            context.player1.clickCard(context.relentlessPursuit);
            context.player1.clickCard(context.wampa);
            context.player1.clickCardNonChecking(context.battlefieldMarine);
            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toBeInZone('groundArena');
            expect(context.relentlessPursuit).toBeInZone('discard');
            context.player2.passAction();

            // try to damage upgraded battlefield marine and succeed
            context.player1.clickCard(context.daringRaid);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine.damage).toBe(2);

            // controller can return upgraded battlefield marine
            context.player2.clickCard(context.brightHope);
            context.player2.clickCard(context.battlefieldMarine);
            expect(context.player1).toBeActivePlayer();
            expect(context.battlefieldMarine).toBeInZone('hand');
            expect(context.shadowedIntentions).toBeInZone('discard');

            // reset
            context.player2.moveCard(context.battlefieldMarine, 'groundArena');
            context.player2.moveCard(context.shadowedIntentions, 'hand');
            context.player1.passAction();
            context.player2.clickCard(context.shadowedIntentions);
            context.player2.clickCard(context.battlefieldMarine);
            context.player1.passAction();

            // controller can defeat upgraded battlefield marine
            context.player2.clickCard(context.rivalsFall);
            context.player2.clickCard(context.battlefieldMarine);
            expect(context.player1).toBeActivePlayer();
            expect(context.battlefieldMarine).toBeInZone('discard');
            expect(context.shadowedIntentions).toBeInZone('discard');
        });
    });
});
