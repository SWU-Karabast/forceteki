describe('Devastating Gunship', function () {
    integration(function (contextRef) {
        describe('Devastating Gunship\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['devastating-gunship'],
                        groundArena: ['specforce-soldier']
                    },
                    player2: {
                        groundArena: [{ card: 'battlefield-marine', damage: 2 }, 'wampa'],
                        spaceArena: ['lurking-tie-phantom']
                    }
                });
            });

            it('should not give -1/-1 because no friendly was defeated this phase', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.devastatingGunship);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.lurkingTiePhantom]);
                expect(context.player1).not.toHaveChooseNoTargetButton();
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine).toBeInZone('discard');
            });
        });
    });
});
