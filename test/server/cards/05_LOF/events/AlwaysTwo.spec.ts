describe('Always Two', function () {
    integration(function (contextRef) {
        const prompt = 'Choose 2 friendly unique Sith units. Give 2 Shield tokens and 2 Experience tokens to each chosen unit.';

        it('selects two friendly unique Sith units and gives them 2 Shield and 2 Experience tokens, then defeats all other friendly units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['always-two'],
                    groundArena: [
                        'emperor-palpatine#master-of-the-dark-side',
                        'sith-trooper',
                        'death-star-stormtrooper',
                        'darth-vader#twilight-of-the-apprentice',
                    ],
                    spaceArena: [
                        'scimitar#sith-infiltrator',
                    ]
                },
                player2: {
                    groundArena: [
                        // Enemy unique Sith unit
                        'darth-tyranus#servant-of-sidious'
                    ]
                }
            });

            const { context } = contextRef;

            // Player 1 plays Always Two
            context.player1.clickCard(context.alwaysTwo);

            // Only friendly unique Sith units should be selectable
            expect(context.player1).toHavePrompt(prompt);
            expect(context.player1).toBeAbleToSelectExactly([
                context.emperorPalpatine,
                context.scimitar,
                context.darthVader,
            ]);
            // With 3 available targets, there should be no "Choose nothing" option
            expect(context.player1).not.toHaveEnabledPromptButton('Choose nothing');

            context.player1.clickCard(context.emperorPalpatine);
            context.player1.clickCard(context.scimitar);
            context.player1.clickPrompt('Done');

            // Check that the selected units received 2 Shield and 2 Experience tokens
            const expectedUpgrades = ['shield', 'shield', 'experience', 'experience'];
            expect(context.emperorPalpatine).toHaveExactUpgradeNames(expectedUpgrades);
            expect(context.scimitar).toHaveExactUpgradeNames(expectedUpgrades);

            // Check that all other friendly units were defeated
            expect(context.sithTrooper).toBeInZone('discard', context.player1);
            expect(context.deathStarStormtrooper).toBeInZone('discard', context.player1);
            expect(context.darthVader).toBeInZone('discard', context.player1);

            // Check that enemy units remained unaffected
            expect(context.darthTyranus).toBeInZone('groundArena', context.player2);
        });

        it('should allow selecting exactly 2 when exactly 2 unique Sith units are available', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['always-two'],
                    groundArena: [
                        'emperor-palpatine#master-of-the-dark-side',
                        'sith-trooper',
                        'death-star-stormtrooper',
                    ],
                    spaceArena: [
                        'scimitar#sith-infiltrator',
                    ]
                },
                player2: {
                    groundArena: [
                        'darth-tyranus#servant-of-sidious'
                    ]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.alwaysTwo);

            // With exactly 2 available targets, there should be no "Choose nothing" option
            expect(context.player1).toHavePrompt(prompt);
            expect(context.player1).toBeAbleToSelectExactly([context.emperorPalpatine, context.scimitar]);
            expect(context.player1).not.toHaveEnabledPromptButton('Choose nothing');

            context.player1.clickCard(context.emperorPalpatine);
            context.player1.clickCard(context.scimitar);
            context.player1.clickPrompt('Done');

            // Check that both units received tokens
            const expectedUpgrades = ['shield', 'shield', 'experience', 'experience'];
            expect(context.emperorPalpatine).toHaveExactUpgradeNames(expectedUpgrades);
            expect(context.scimitar).toHaveExactUpgradeNames(expectedUpgrades);

            // All other friendly units are defeated
            expect(context.sithTrooper).toBeInZone('discard', context.player1);
            expect(context.deathStarStormtrooper).toBeInZone('discard', context.player1);

            // Enemy units unaffected
            expect(context.darthTyranus).toBeInZone('groundArena', context.player2);
        });

        it('should skip selection and defeat all friendly units when only 1 unique Sith unit is available', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['always-two'],
                    groundArena: [
                        'sith-trooper',
                        'death-star-stormtrooper',
                    ],
                    spaceArena: [
                        'scimitar#sith-infiltrator',
                    ]
                },
                player2: {
                    groundArena: [
                        'darth-tyranus#servant-of-sidious'
                    ]
                }
            });

            const { context } = contextRef;

            // Player 1 plays Always Two
            context.player1.clickCard(context.alwaysTwo);

            // With fewer than 2 targets, selection should be skipped entirely
            // All friendly units are defeated and control passes to opponent
            expect(context.player2).toBeActivePlayer();

            // All friendly units are defeated
            expect(context.scimitar).toBeInZone('discard', context.player1);
            expect(context.sithTrooper).toBeInZone('discard', context.player1);
            expect(context.deathStarStormtrooper).toBeInZone('discard', context.player1);

            // Enemy units unaffected
            expect(context.darthTyranus).toBeInZone('groundArena', context.player2);
        });

        it('should skip selection and defeat all friendly units when no unique Sith units are available', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['always-two'],
                    groundArena: [
                        'sith-trooper',
                        'death-star-stormtrooper',
                    ],
                },
                player2: {
                    groundArena: [
                        'darth-tyranus#servant-of-sidious'
                    ]
                }
            });

            const { context } = contextRef;

            // Player 1 plays Always Two
            context.player1.clickCard(context.alwaysTwo);

            // With no valid targets, selection should be skipped entirely
            // All friendly units are defeated and control passes to opponent
            expect(context.player2).toBeActivePlayer();

            // All friendly units are defeated
            expect(context.sithTrooper).toBeInZone('discard', context.player1);
            expect(context.deathStarStormtrooper).toBeInZone('discard', context.player1);

            // Enemy units unaffected
            expect(context.darthTyranus).toBeInZone('groundArena', context.player2);
        });
    });
});