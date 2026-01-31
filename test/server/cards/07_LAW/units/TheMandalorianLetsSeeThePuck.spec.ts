describe('Seasoned Fleet Admiral', function () {
    integration(function (contextRef) {
        describe('Seasoned Fleet Admiral\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['no-bargain', 'this-is-the-way'],
                        groundArena: ['the-mandalorian#lets-see-the-puck', 'battlefield-marine'],
                        deck: ['sabine-wren#explosives-artist', 'supercommando-squad']
                    },
                    player2: {
                        hand: ['strategic-analysis', 'waylay'],
                        groundArena: ['wampa'],
                    }
                });
            });

            it('should give shield if we draw a card during action phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.noBargain);
                // no bargain ask opponent to discard a card
                context.player2.clickCard(context.strategicAnalysis);
                expect(context.theMandalorianLetsSeeThePuck).toHaveExactUpgradeNames(['shield']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not give shield token to him if opponent draws multiple cards during action phase', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.strategicAnalysis);

                expect(context.player1).toBeActivePlayer();
                expect(context.theMandalorianLetsSeeThePuck.upgrades.length).toBe(0);
            });

            it('should only give 1 shield token if we draw multiple cards at once during action phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.thisIsTheWay);
                context.player1.clickCardInDisplayCardPrompt(context.sabineWren);
                context.player1.clickCardInDisplayCardPrompt(context.supercommandoSquad);
                context.player1.clickDone();

                expect(context.player2).toBeActivePlayer();
                expect(context.theMandalorianLetsSeeThePuck).toHaveExactUpgradeNames(['shield']);
                expect(context.battlefieldMarine.upgrades.length).toBe(0);
                expect(context.wampa.upgrades.length).toBe(0);
            });

            it('should not give experience token if we draw cards during regroup phase', function () {
                const { context } = contextRef;

                context.moveToRegroupPhase();
                context.player1.clickDone();
                context.player2.clickDone();
                expect(context.player1).toBeActivePlayer();
                expect(context.theMandalorianLetsSeeThePuck.upgrades.length).toBe(0);
                expect(context.player1).toHavePrompt('Choose an action');
            });

            it('should give a shield from the when played ability', function () {
                const { context } = contextRef;

                context.player1.clickPrompt('Pass');
                context.player2.clickCard(context.waylay);
                context.player2.clickCard(context.theMandalorianLetsSeeThePuck);
                context.player1.clickCard(context.theMandalorianLetsSeeThePuck);
                expect(context.player2).toBeActivePlayer();
                expect(context.theMandalorianLetsSeeThePuck).toHaveExactUpgradeNames(['shield']);
            });
        });
    });
});