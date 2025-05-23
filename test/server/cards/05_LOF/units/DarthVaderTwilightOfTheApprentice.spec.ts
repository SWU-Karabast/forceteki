describe('Darth Vader, Twilight of the Apprentice', function() {
    integration(function(contextRef) {
        describe('Darth Vader\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['darth-vader#twilight-of-the-apprentice'],
                        groundArena: [{ card: 'pyke-sentinel', upgrades: ['shield'] }],
                    },
                    player2: {
                        groundArena: ['wampa', { card: 'atst', upgrades: ['devotion'] }],
                        spaceArena: [{ card: 'imperial-interceptor', upgrades: ['shield'] }]
                    }
                });
            });

            it('give a shield token to a friendly and an enemy unit when played', function () {
                const { context } = contextRef;

                // Play Darth Vader, give a shield to a friendly unit
                context.player1.clickCard(context.darthVader);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.darthVader]);
                context.player1.clickCard(context.darthVader);

                // Give a shield to an enemy unit
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.imperialInterceptor, context.atst]);
                context.player1.clickCard(context.wampa);

                expect(context.wampa).toHaveExactUpgradeNames(['shield']);
                expect(context.darthVader).toHaveExactUpgradeNames(['shield']);
                expect(context.player2).toBeActivePlayer();
            });

            it('give a shield token to a friendly and an enemy unit and defeat an enemy unit with shield token', function () {
                const { context } = contextRef;

                // Play Darth Vader, give a shield to a friendly unit
                context.player1.clickCard(context.darthVader);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.darthVader]);
                context.player1.clickCard(context.darthVader);

                // Give a shield to an enemy unit
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.imperialInterceptor, context.atst]);
                context.player1.clickCard(context.wampa);

                expect(context.wampa).toHaveExactUpgradeNames(['shield']);
                expect(context.darthVader).toHaveExactUpgradeNames(['shield']);
                expect(context.player2).toBeActivePlayer();

                // Move to next action phase
                context.moveToNextActionPhase();

                // Attack with Darth Vader
                context.player1.clickCard(context.darthVader);
                context.player1.clickCard(context.p2Base);

                // Defeat enemy unit with a shield token
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.imperialInterceptor]);
                context.player1.clickCard(context.wampa);

                expect(context.wampa).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('when played should only give a shield to a friendly unit as there is no enemy units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['darth-vader#twilight-of-the-apprentice']
                },
            });
            const { context } = contextRef;

            // Play Darth Vader, give a shield to a friendly unit
            context.player1.clickCard(context.darthVader);
            context.player1.clickCard(context.darthVader);

            // Assert that the shield token is given to the friendly unit
            expect(context.darthVader).toHaveExactUpgradeNames(['shield']);
            expect(context.player2).toBeActivePlayer();
        });

        it('should defeat a shielded enemy unit after opponent takes control of the unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['darth-vader#twilight-of-the-apprentice', { card: 'atst', upgrades: ['shield'] }]
                },
                player2: {
                    hand: ['change-of-heart'],
                    spaceArena: [{ card: 'imperial-interceptor', upgrades: ['shield'] }],
                    groundArena: ['wampa', { card: 'pyke-sentinel', upgrades: ['shield'] }]
                }
            });
            const { context } = contextRef;

            // Pass action to opponent
            context.player1.passAction();

            // Opponent takes control of Darth Vader
            context.player2.clickCard(context.changeOfHeart);
            context.player2.clickCard(context.darthVader);

            // Pass action to opponent
            context.player1.passAction();

            // Attack with Darth Vader
            context.player2.clickCard(context.darthVader);
            context.player2.clickCard(context.p1Base);
            expect(context.player2).toBeAbleToSelectExactly([context.atst]);
            context.player2.clickCard(context.atst);

            // Assert that the enemy unit with a shield token is defeated
            expect(context.atst).toBeInZone('discard');
            expect(context.player1).toBeActivePlayer();
        });
    });
});
