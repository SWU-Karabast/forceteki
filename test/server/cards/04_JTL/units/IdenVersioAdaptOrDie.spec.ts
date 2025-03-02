describe('Iden Version, Adapt or Die', function() {
    integration(function(contextRef) {
        describe('Iden\'s piloting ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['iden-versio#adapt-or-die', 'survivors-gauntlet'],
                        groundArena: ['atst'],
                        spaceArena: ['tieln-fighter']
                    },
                    player2: {
                        hand: ['bamboozle']
                    }
                });
            });

            it('should give a shield to the attached unit when played as a pilot', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.idenVersio);
                context.player1.clickPrompt('Play Iden Versio with Piloting');
                context.player1.clickCard(context.tielnFighter);

                expect(context.tielnFighter).toHaveExactUpgradeNames(['iden-versio#adapt-or-die', 'shield']);
            });

            it('should only have one shield when played as a unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.idenVersio);
                context.player1.clickPrompt('Play Iden Versio');

                // gains shield from Shielded keyword
                expect(context.idenVersio).toHaveExactUpgradeNames(['shield']);
            });

            it('should correctly unregister and re-register triggered abilities when leaving and re-entering the arena', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.idenVersio);
                context.player1.clickPrompt('Play Iden Versio with Piloting');
                context.player1.clickCard(context.tielnFighter);

                expect(context.tielnFighter).toHaveExactUpgradeNames(['iden-versio#adapt-or-die', 'shield']);

                context.player2.clickCard(context.bamboozle);
                context.player2.clickCard(context.tielnFighter);
                expect(context.idenVersio).toBeInZone('hand');
                expect(context.tielnFighter.isUpgraded()).toBeFalse();

                context.player1.clickCard(context.idenVersio);
                context.player1.clickPrompt('Play Iden Versio with Piloting');
                context.player1.clickCard(context.atst);

                expect(context.atst).toHaveExactUpgradeNames(['iden-versio#adapt-or-die', 'shield']);
                expect(context.tielnFighter.isUpgraded()).toBeFalse();
            });

            it('should give a shield when moved to another vehicle', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.idenVersio);
                context.player1.clickPrompt('Play Iden Versio with Piloting');
                context.player1.clickCard(context.tielnFighter);
                expect(context.tielnFighter).toHaveExactUpgradeNames(['iden-versio#adapt-or-die', 'shield']);

                context.player2.passAction();

                context.player1.clickCard(context.survivorsGauntlet);
                expect(context.player1).toBeAbleToSelectExactly(['iden-versio#adapt-or-die', 'shield']);
                context.player1.clickCard(context.idenVersio);
                expect(context.player1).toBeAbleToSelectExactly(['atst', 'survivors-gauntlet']);
                context.player1.clickCard(context.atst);

                expect(context.atst).toHaveExactUpgradeNames(['iden-versio#adapt-or-die', 'shield']);
                expect(context.tielnFighter).toHaveExactUpgradeNames(['shield']);
            });
        });
    });
});