describe('Battle Fury', function () {
    integration(function (contextRef) {
        describe('Attached unit\'s gained On Attack ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['darth-vader#commanding-the-first-legion'],
                        hand: ['battle-fury', 'arquitens-assault-cruiser'],
                    },
                    player2: {
                        groundArena: ['syndicate-lackeys'],
                        hand: ['change-of-heart', 'phaseiii-dark-trooper'],
                    }
                });
            });

            it('discards a card from the hand of the attached unit\'s controller', function () {
                const { context } = contextRef;

                // Play Battle Fury
                context.player1.clickCard(context.battleFury);

                // Can play on any unit
                expect(context.player1).toBeAbleToSelectExactly([
                    context.darthVader,
                    context.syndicateLackeys
                ]);

                // Attach to Darth Vader
                context.player1.clickCard(context.darthVader);
                expect(context.darthVader).toHaveExactUpgradeNames(['battle-fury']);
                context.player2.passAction();

                // Attack with Darth Vader
                context.player1.clickCard(context.darthVader);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Choose a card to discard for Darth Vader\'s effect');
                expect(context.player1).toBeAbleToSelectExactly([context.arquitensAssaultCruiser]);

                // Discard a card from hand
                context.player1.clickCard(context.arquitensAssaultCruiser);
                expect(context.arquitensAssaultCruiser).toBeInZone('discard');
            });

            it('discards from the unit\'s controller if it is played on an enemy uni', function () {
                const { context } = contextRef;

                // Play Battle Fury
                context.player1.clickCard(context.battleFury);

                // Can play on any unit
                expect(context.player1).toBeAbleToSelectExactly([
                    context.darthVader,
                    context.syndicateLackeys
                ]);

                // Attach to Syndicate Lackeys
                context.player1.clickCard(context.syndicateLackeys);
                expect(context.syndicateLackeys).toHaveExactUpgradeNames(['battle-fury']);

                // Player 2 attacks with Syndicate Lackeys
                context.player2.clickCard(context.syndicateLackeys);
                context.player2.clickCard(context.p1Base);

                expect(context.player2).toHavePrompt('Choose a card to discard for Syndicate Lackeys\'s effect');
                expect(context.player2).toBeAbleToSelectExactly([context.changeOfHeart, context.phaseiiiDarkTrooper]);

                // Discard a card from hand
                context.player2.clickCard(context.changeOfHeart);
                expect(context.changeOfHeart).toBeInZone('discard');
            });

            it('discards from the correct player when the unit changes controllers', function () {
                const { context } = contextRef;

                // Play Battle Fury on Darth Vader
                context.player1.clickCard(context.battleFury);
                context.player1.clickCard(context.darthVader);

                // Player 2 plays Change of Heart to take control of Darth Vader
                context.player2.clickCard(context.changeOfHeart);
                context.player2.clickCard(context.darthVader);
                context.player1.passAction();

                // Player 2 attacks with Darth Vader
                context.player2.clickCard(context.darthVader);
                context.player2.clickCard(context.p1Base);

                expect(context.player2).toHavePrompt('Choose a card to discard for Darth Vader\'s effect');
                expect(context.player2).toBeAbleToSelectExactly([context.phaseiiiDarkTrooper]);

                // Discard a card from hand
                context.player2.clickCard(context.phaseiiiDarkTrooper);
                expect(context.phaseiiiDarkTrooper).toBeInZone('discard');
            });
        });
    });
});