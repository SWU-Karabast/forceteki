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

        describe('Iden\'s piloting ability, with another copy of Iden already attached (uniqueness rule),', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['iden-versio#adapt-or-die'],
                        groundArena: ['atst'],
                        spaceArena: [{ card: 'tieln-fighter', upgrades: ['iden-versio#adapt-or-die'] }]
                    }
                });

                const { context } = contextRef;
                const copies = context.player1.findCardsByName('iden-versio#adapt-or-die');
                context.copyInHand = copies.find((copy) => copy.zoneName === 'hand');
                context.copyInPlay = copies.find((copy) => copy.zoneName === 'spaceArena');
            });

            it('should not throw when the copy that was just played is defeated, and should still give the Shield to the unit it attached to', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.copyInHand);
                context.player1.clickPrompt('Play Iden Versio with Piloting');
                context.player1.clickCard(context.atst);

                expect(context.player1).toHavePrompt('Choose which copy of Iden Versio, Adapt or Die to defeat');
                expect(context.player1).toBeAbleToSelectExactly([context.copyInHand, context.copyInPlay]);

                // The copy just played is defeated by the uniqueness rule, but "When this upgrade attaches to a unit: Give a Shield token to that unit"
                // already triggered: "that unit" is the one it attached to (the attach event's parent), so it gets the Shield.
                context.player1.clickCard(context.copyInHand);

                expect(context.copyInHand).toBeInZone('discard');
                expect(context.copyInPlay).toBeAttachedTo(context.tielnFighter);
                expect(context.atst).toHaveExactUpgradeNames(['shield']);
                expect(context.tielnFighter).toHaveExactUpgradeNames(['iden-versio#adapt-or-die']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should give a Shield to the unit the remaining copy is attached to when the copy that was already in play is defeated', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.copyInHand);
                context.player1.clickPrompt('Play Iden Versio with Piloting');
                context.player1.clickCard(context.atst);

                expect(context.player1).toHavePrompt('Choose which copy of Iden Versio, Adapt or Die to defeat');
                context.player1.clickCard(context.copyInPlay);

                expect(context.copyInPlay).toBeInZone('discard');
                expect(context.copyInHand).toBeAttachedTo(context.atst);
                expect(context.atst).toHaveExactUpgradeNames(['iden-versio#adapt-or-die', 'shield']);
                expect(context.tielnFighter.isUpgraded()).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});