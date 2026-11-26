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

        describe('Wingman Victor Three\'s piloting ability, with another copy already attached (uniqueness rule),', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['wingman-victor-three#backstabber'],
                        groundArena: ['atst'],
                        spaceArena: [{ card: 'tieln-fighter', upgrades: ['wingman-victor-three#backstabber'] }, 'cartel-spacer']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    }
                });

                const { context } = contextRef;
                const copies = context.player1.findCardsByName('wingman-victor-three#backstabber');
                context.copyInHand = copies.find((copy) => copy.zoneName === 'hand');
                context.copyInPlay = copies.find((copy) => copy.zoneName === 'spaceArena');
            });

            it('should be able to give an Experience token to any unit when the copy just played is the one defeated', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.copyInHand);
                context.player1.clickPrompt('Play Wingman Victor Three with Piloting');
                context.player1.clickCard(context.cartelSpacer);

                expect(context.player1).toHavePrompt('Choose which copy of Wingman Victor Three, Backstabber to defeat');
                expect(context.player1).toBeAbleToSelectExactly([context.copyInHand, context.copyInPlay]);
                context.player1.clickCard(context.copyInHand);

                // When the ability resolves, the copy just played is attached to nothing, so "another unit" excludes no unit,
                // not even the vehicle it was played on (read as the ruling of 2025-09-29 reads "attached unit"; no ruling covers this card)
                expect(context.copyInHand).toBeInZone('discard');
                expect(context.copyInPlay).toBeAttachedTo(context.tielnFighter);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.tielnFighter, context.cartelSpacer, context.battlefieldMarine]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.cartelSpacer);

                expect(context.cartelSpacer).toHaveExactUpgradeNames(['experience']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not be able to give an Experience token to the vehicle it was played on when the copy already in play is the one defeated', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.copyInHand);
                context.player1.clickPrompt('Play Wingman Victor Three with Piloting');
                context.player1.clickCard(context.cartelSpacer);

                expect(context.player1).toHavePrompt('Choose which copy of Wingman Victor Three, Backstabber to defeat');
                context.player1.clickCard(context.copyInPlay);

                expect(context.copyInPlay).toBeInZone('discard');
                expect(context.copyInHand).toBeAttachedTo(context.cartelSpacer);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.tielnFighter, context.battlefieldMarine]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.atst);

                expect(context.atst).toHaveExactUpgradeNames(['experience']);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});