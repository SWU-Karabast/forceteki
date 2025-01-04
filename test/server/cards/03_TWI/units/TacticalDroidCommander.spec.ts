
describe('Tactical Droid Commander', function() {
    integration(function(contextRef) {
        it('should be able to exhaust a unit that costs the same or less than the played separatist', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['confederate-trifighter', 'morgan-elsbeth#keeper-of-many-secrets'],
                    groundArena: ['tactical-droid-commander']
                },
                player2: {
                    groundArena: ['battlefield-marine', 'plo-koon#kohtoyah']
                }
            });

            const { context } = contextRef;

            // play separatist unit, able to exhaust unit of same cost or less.
            context.player1.clickCard(context.confederateTrifighter);
            expect(context.player1).toBeAbleToSelectExactly(context.battlefieldMarine);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.battlefieldMarine.exhausted).toBeTrue();

            context.player2.passAction();

            // play non separatist, no trigger.
            context.player1.clickCard(context.morganElsbeth);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
