describe('First Order TIE Fighter', function () {
    integration(function (contextRef) {
        it('First Order TIE Fighter\'s ability should give RAID 1 to itself, if control a token unit', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['battle-droid', 'poggle-the-lesser#archduke-of-the-stalgasin-hive'],
                    spaceArena: ['first-order-tie-fighter']
                },
                player2: {
                    groundArena: ['battlefield-marine', 'clone-trooper']
                }
            });

            const { context } = contextRef;
            // Checking RAID isnt applied globally to Player 1
            context.player1.clickCard(context.poggleTheLesser);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(1);

            // Checking RAID isnt applied globally to Player 2
            context.player2.clickCard(context.battlefieldMarine);
            context.player2.clickCard(context.p1Base);
            expect(context.p1Base.damage).toBe(3);

            // RAID applied to correct unit
            context.player1.clickCard(context.firstOrderTieFighter);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(4);

            context.moveToNextActionPhase();

            // Esnuring RAID is removed when controlling no token unit
            context.player1.passAction();
            context.player2.clickCard(context.battlefieldMarine);
            context.player2.clickCard(context.battleDroid);
            context.player1.clickCard(context.firstOrderTieFighter);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(6);
        });
    });
});
