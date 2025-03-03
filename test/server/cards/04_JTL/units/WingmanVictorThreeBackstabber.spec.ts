describe('Wingman Victor Three, Backstabber', function() {
    integration(function(contextRef) {
        describe('Wingman Victor Three\'s piloting ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['wingman-victor-three#backstabber', 'survivors-gauntlet'],
                        groundArena: ['atst'],
                        spaceArena: ['tieln-fighter'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    }
                });
            });

            it('should give an Experience token to another unit when played as a pilot', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.wingmanVictorThree);
                context.player1.clickPrompt('Play Wingman Victor Three with Piloting');
                context.player1.clickCard(context.tielnFighter);

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.battlefieldMarine]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.battlefieldMarine);

                expect(context.tielnFighter).toHaveExactUpgradeNames(['wingman-victor-three#backstabber']);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
            });

            it('should not give an Experience token to another when played as a unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.wingmanVictorThree);
                context.player1.clickPrompt('Play Wingman Victor Three');

                expect(context.tielnFighter).toHaveExactUpgradeNames([]);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
                expect(context.wingmanVictorThree).toHaveExactUpgradeNames([]);
            });

            it('should not give an Experience token to another unit when moved to another vehicle', function() {
                const { context } = contextRef;

                // Play Wingman Victor Three as pilot
                context.player1.clickCard(context.wingmanVictorThree);
                context.player1.clickPrompt('Play Wingman Victor Three with Piloting');
                context.player1.clickCard(context.tielnFighter);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);

                context.player2.passAction();

                // Move him with Survivors' Gauntlet
                context.player1.clickCard(context.survivorsGauntlet);
                expect(context.player1).toBeAbleToSelectExactly([context.wingmanVictorThree]);
                context.player1.clickCard(context.wingmanVictorThree);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.survivorsGauntlet]);
                context.player1.clickCard(context.atst);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});