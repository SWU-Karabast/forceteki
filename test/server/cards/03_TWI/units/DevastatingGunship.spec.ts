describe('Devastating Gunship', function () {
    integration(function (contextRef) {
        describe('Devastating Gunship\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
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

            it('should defeat an enemy unit with 2 or less remaining HP', function () {
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
