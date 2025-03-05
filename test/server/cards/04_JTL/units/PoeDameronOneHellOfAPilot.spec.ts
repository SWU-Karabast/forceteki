describe('Poe Dameron, One Hell of a Pilot', function() {
    integration(function(contextRef) {
        describe('Poe Dameron\'s piloting ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['poe-dameron#one-hell-of-a-pilot', 'survivors-gauntlet'],
                        groundArena: ['snowspeeder'],
                        spaceArena: ['alliance-xwing', 'restored-arc170'],
                    },
                    player2: {
                        hand: ['bamboozle']
                    }
                });
            });

            it('should give restore 1 to the attached unit when played as a pilot', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.poeDameron);
                context.player1.clickPrompt('Play Poe Dameron');
                const xwingTokens = context.player1.findCardsByName('xwing');
                expect(xwingTokens.length).toBe(1);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.allianceXwing,
                    context.restoredArc170,
                    context.snowspeeder,
                    xwingTokens[0]
                ]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(xwingTokens[0]);
                expect(xwingTokens[0]).toHaveExactUpgradeNames(['poe-dameron#one-hell-of-a-pilot']);
                // expect(xwingTokens[0]).toHaveExactUpgradeNames([context.poeDameron]);
            });
        });
    });
});