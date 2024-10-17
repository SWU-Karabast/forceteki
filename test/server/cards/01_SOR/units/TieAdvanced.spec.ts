describe('Tie Avanced', function() {
    integration(function(contextRef) {
        describe('Tie Avanced\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['tie-advanced'],
                        groundArena: ['wampa', 'atst', { card: 'tieln-fighter', upgrades: ['experience'] }],
                    },
                    player2: {
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('can give two experience to a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.tieAdvanced);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.tielnFighter]);
                context.player1.clickCard(context.atst);

                expect(context.atst).toHaveExactUpgradeNames(['experience', 'experience']);
            });

            it('can give two experience to a unit that already has an experience', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.tieAdvanced);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.tielnFighter]);
                context.player1.clickCard(context.tielnFighter);

                expect(context.tielnFighter).toHaveExactUpgradeNames(['experience', 'experience', 'experience']);
            });
        });
    });
});
