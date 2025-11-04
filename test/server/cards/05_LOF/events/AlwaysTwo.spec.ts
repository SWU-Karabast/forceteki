describe('Always Two', function () {
    integration(function (contextRef) {
        const prompt = 'Choose 2 friendly unique Sith units. Give 2 Shield tokens and 2 Experience tokens to each chosen unit.';

        it('selects two friendly unique Sith units and gives them 2 Shield and 2 Experience tokens, then it defeats all other friendly units', async function () {
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
            expect(context.player1).not.toHaveEnabledPromptButton('Choose nothing');
            expect(context.player1).toBeAbleToSelectExactly([
                context.emperorPalpatine,
                context.scimitar,
                context.darthVader,
            ]);

            context.player1.clickCard(context.emperorPalpatine);
            context.player1.clickCard(context.scimitar);
            context.player1.clickCardNonChecking(context.darthVader);
            expect(context.player1).toHaveEnabledPromptButton('Done');

            // Confirm the selection
            context.player1.clickDone();

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

        it('defeats all friendly units even if less than 2 unique Sith units are in play', async function () {
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
                        // Enemy unique Sith unit
                        'darth-tyranus#servant-of-sidious'
                    ]
                }
            });

            const { context } = contextRef;

            // Player 1 plays Always Two
            context.player1.clickCard(context.alwaysTwo);

            // All friendly units are defeated
            expect(context.sithTrooper).toBeInZone('discard', context.player1);
            expect(context.deathStarStormtrooper).toBeInZone('discard', context.player1);

            // Enemy units unaffected
            expect(context.darthTyranus).toBeInZone('groundArena', context.player2);
        });
    });
});