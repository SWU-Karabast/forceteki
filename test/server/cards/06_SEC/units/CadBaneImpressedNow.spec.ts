describe('Cad Bane, Impressed Now?', function () {
    integration(function (contextRef) {
        describe('Cad Bane\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['cad-bane#impressed-now'],
                        groundArena: ['specforce-soldier']
                    },
                    player2: {
                        groundArena: [{ card: 'battlefield-marine', damage: 2 }, 'wampa'],
                        spaceArena: ['lurking-tie-phantom']
                    }
                });
            });

            it('should be able to pass', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.cadBaneImpressedNow);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.lurkingTiePhantom, context.specforceSoldier]);
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
            });

            it('should defeat an enemy unit with 2 or less remaining HP', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.cadBaneImpressedNow);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.lurkingTiePhantom, context.specforceSoldier]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine).toBeInZone('discard');
            });

            it('should defeat a friendly unit with 2 or less remaining HP', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.cadBaneImpressedNow);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.lurkingTiePhantom, context.specforceSoldier]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.specforceSoldier);

                expect(context.player2).toBeActivePlayer();
                expect(context.specforceSoldier).toBeInZone('discard');
            });
        });
    });
});
