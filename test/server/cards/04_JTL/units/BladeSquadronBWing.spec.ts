describe('Blade Squadron B-Wing', function() {
    integration(function(contextRef) {
        it('Blade Squadron B-Wing\'s ability should give shield to a unit if the opponent has at least 3 exhausted units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['blade-squadron-bwing'],
                    spaceArena: ['alliance-xwing'],
                    groundArena: ['wampa']
                },
                player2: {
                    groundArena: [{ card: 'atst', exhausted: true }],
                    spaceArena: [{ card: 'tieln-fighter', exhausted: true }, { card: 'tie-advanced', exhausted: true }, { card: 'imperial-interceptor', exhausted: false }]
                }
            });

            const { context } = contextRef;

            // Play Blade Squadron B-Wing
            context.player1.clickCard(context.bladeSquadronBwing);

            // Assert ability Give shield to a unit if the opponent has at least 3 exhausted units
            expect(context.player1).toHavePrompt('Choose a unit');
            expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing, context.wampa, context.tielnFighter, context.tieAdvanced, context.imperialInterceptor, context.bladeSquadronBwing, context.atst]);
            context.player1.clickCard(context.allianceXwing);

            expect(context.allianceXwing).toHaveExactUpgradeNames(['shield']);
        });

        it('Blade Squadron B-Wing\'s ability should not be triggered as opponent does not have 3 or more exhausted units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['blade-squadron-bwing'],
                    spaceArena: [{ card: 'alliance-xwing', exhausted: true }, { card: 'tie-advanced', exhausted: true }, { card: 'imperial-interceptor', exhausted: true }]
                },
                player2: {
                    groundArena: [{ card: 'atst', exhausted: true }],
                    spaceArena: [{ card: 'tieln-fighter', exhausted: true }]
                }
            });

            const { context } = contextRef;

            // Play Blade Squadron B-Wing, player has 3 exhausted units but should be ignored by the ability
            context.player1.clickCard(context.bladeSquadronBwing);

            // Assert ability Give shield to a unit should not be triggered as opponent does not have 3 or more exhausted units
            expect(context.player2).toBeActivePlayer();
        });
    });
});
