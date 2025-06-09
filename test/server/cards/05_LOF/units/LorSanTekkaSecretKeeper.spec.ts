describe('Lor San Tekka, Secret Keeper', function() {
    integration(function(contextRef) {
        describe('Lor San Tekka, Secret Keeper\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['point-rain-reclaimer'],
                        groundArena: ['luke-skywalker#jedi-knight', 'lor-san-tekka#secret-keeper', 'battlefield-marine'],
                    },
                    player2: {
                        hand: ['no-glory-only-results', 'supreme-leader-snoke#shadow-ruler'],
                        groundArena: ['darth-vader#twilight-of-the-apprentice', 'hylobon-enforcer'],
                    }
                });
            });

            it('should give experience to a friendly unique unit.', function () {
                const { context } = contextRef;
                context.player1.clickPrompt('Pass');
                context.player2.clickCard(context.supremeLeaderSnoke);

                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.lukeSkywalker, context.supremeLeaderSnoke, context.darthVader]);
                context.player1.clickCard(context.lukeSkywalker);
                expect(context.lukeSkywalker).toHaveExactUpgradeNames(['experience']);
                expect(context.player1).toBeActivePlayer();
            });

            it('should give experience to an enemy unique unit.', function () {
                const { context } = contextRef;
                context.player1.clickPrompt('Pass');
                context.player2.clickCard(context.supremeLeaderSnoke);

                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.supremeLeaderSnoke);
                expect(context.supremeLeaderSnoke).toHaveExactUpgradeNames(['experience']);
                expect(context.player1).toBeActivePlayer();
            });

            it('should give trigger choice to opponent when no glory is played.', function () {
                const { context } = contextRef;
                context.player1.clickPrompt('Pass');
                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.lorSanTekka);

                expect(context.player2).toHavePassAbilityButton();
                expect(context.player2).toBeAbleToSelectExactly([context.darthVader, context.lukeSkywalker]);
                context.player2.clickCard(context.darthVader);
                expect(context.darthVader).toHaveExactUpgradeNames(['experience']);
                expect(context.player1).toBeActivePlayer();
            });

            it('should be able to be passed.', function () {
                const { context } = contextRef;
                context.player1.clickPrompt('Pass');
                context.player2.clickCard(context.supremeLeaderSnoke);

                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});