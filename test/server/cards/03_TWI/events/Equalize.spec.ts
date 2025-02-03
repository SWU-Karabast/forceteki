describe('Equalize', function () {
    integration(function (contextRef) {
        it('Equalize\'s ability should give -2/-2 to a unit and -2/-2 to another unit if opponent control more card than controller', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['equalize'],
                    groundArena: ['battlefield-marine'],
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['lurking-tie-phantom'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.equalize);

            // can select any unit
            expect(context.player1).toBeAbleToSelectAllOf([context.battlefieldMarine, context.atst, context.lurkingTiePhantom]);
            context.player1.clickCard(context.atst);

            // at-st should have -2/-2
            expect(context.atst.getPower()).toBe(4);
            expect(context.atst.getHp()).toBe(5);

            // player 2 controls more units than player 1, you must choose another unit (at-st cannot be selected)
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.lurkingTiePhantom]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine.getPower()).toBe(1);
            expect(context.battlefieldMarine.getHp()).toBe(1);

            expect(context.player2).toBeActivePlayer();
            context.player1.moveCard(context.equalize, 'hand');

            context.moveToNextActionPhase();

            // -2/-2 should be reset
            expect(context.atst.getPower()).toBe(6);
            expect(context.atst.getHp()).toBe(7);
            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.battlefieldMarine.getHp()).toBe(3);

            // play equalize, kill lurking tie phantom, player 2 does not control more units than player 1, no more effect
            context.player1.clickCard(context.equalize);
            context.player1.clickCard(context.lurkingTiePhantom);
            expect(context.lurkingTiePhantom).toBeInZone('discard');
            expect(context.player2).toBeActivePlayer();
        });
    });
});
