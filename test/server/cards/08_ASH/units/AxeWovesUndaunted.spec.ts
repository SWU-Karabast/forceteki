describe('Axe Woves, Undaunted', function () {
    integration(function (contextRef) {
        describe('Axe Woves\' ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['no-bargain', 'kreias-whispers'],
                        groundArena: ['axe-woves#undaunted', 'battlefield-marine'],
                        deck: ['sabine-wren#explosives-artist', 'supercommando-squad', 'atst', 'vigilance']
                    },
                    player2: {
                        hand: ['strategic-analysis', 'waylay'],
                        groundArena: ['wampa'],
                    }
                });
            });

            it('should give an advantage token if we draw a card during action phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.noBargain);
                // no bargain ask opponent to discard a card and we draw a card
                context.player2.clickCard(context.strategicAnalysis);
                expect(context.axeWovesUndaunted).toHaveExactUpgradeNames(['advantage']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should give advantage token if we draw cards during regroup phase', function () {
                const { context } = contextRef;

                context.moveToRegroupPhase();
                context.player1.clickDone();
                context.player2.clickDone();
                expect(context.player1).toBeActivePlayer();
                expect(context.axeWovesUndaunted.upgrades.length).toBe(1);
                expect(context.axeWovesUndaunted).toHaveExactUpgradeNames(['advantage']);
                expect(context.player1).toHavePrompt('Choose an action');
            });

            it('should give only one advantage token if we draw multiple cards', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.kreiasWhispers);
                context.player1.clickCard(context.sabineWrenExplosivesArtist);
                context.player1.clickCard(context.supercommandoSquad);

                expect(context.axeWovesUndaunted).toHaveExactUpgradeNames(['advantage']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should give advantage tokens if we draw multiple cards during action phase', function () {
                const { context } = contextRef;

                // Player 1 draw 1 card from no bargain, then 3 cards from kreia's whispers
                context.player1.clickCard(context.noBargain);
                context.player2.clickCard(context.strategicAnalysis);

                context.player2.passAction();

                expect(context.axeWovesUndaunted).toHaveExactUpgradeNames(['advantage']);

                context.player1.clickCard(context.kreiasWhispers);
                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.supercommandoSquad);

                expect(context.axeWovesUndaunted).toHaveExactUpgradeNames(['advantage', 'advantage']);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});