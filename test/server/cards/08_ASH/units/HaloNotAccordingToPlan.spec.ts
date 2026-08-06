describe('Halo, Not According to Plan', function() {
    integration(function(contextRef) {
        beforeEach(async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['heroic-sacrifice'],
                    spaceArena: ['halo#not-according-to-plan'],
                },
                player2: {
                    spaceArena: ['green-squadron-awing', 'bwing-skirmisher']
                }
            });
        });

        it('Halo\'s attack-completed ability should give it a shield if the defender is defeated', function () {
            const { context } = contextRef;

            context.player1.clickCard(context.halo);
            context.player1.clickCard(context.greenSquadronAwing);

            expect(context.halo.damage).toBe(1);
            expect(context.halo).toHaveExactUpgradeNames(['shield']);
        });

        it('Halo\'s attack-completed ability should not trigger if it is defeated by an ability first', function () {
            const { context } = contextRef;

            context.player1.clickCard(context.heroicSacrifice);
            context.player1.clickCard(context.halo);
            context.player1.clickCard(context.greenSquadronAwing);

            // Heroic Sac and Halo abilities resolve in the same window
            expect(context.player1).toHaveExactPromptButtons([
                'When this unit deals combat damage: Defeat it.',
                'If the defending unit was defeated, give a Shield token to Halo'
            ]);

            context.player1.clickPrompt('When this unit deals combat damage: Defeat it.');

            expect(context.halo).toBeInZone('discard');
            expect(context.player2).toBeActivePlayer();
        });

        it('Halo\'s attack-completed ability should not trigger if it is defeated by combat damage', function () {
            const { context } = contextRef;

            context.player1.clickCard(context.halo);
            context.player1.clickCard(context.bwingSkirmisher);

            expect(context.halo).toBeInZone('discard');
            expect(context.player2).toBeActivePlayer();
        });

        it('Halo\'s attack-completed ability should give it a new shield if the defender is defeated while it already has one', function () {
            const { context } = contextRef;

            context.player1.clickCard(context.halo);
            context.player1.clickCard(context.greenSquadronAwing);

            expect(context.halo.damage).toBe(1);
            expect(context.halo).toHaveExactUpgradeNames(['shield']);
            context.readyCard(context.halo);
            context.player2.passAction();

            context.player1.clickCard(context.halo);
            context.player1.clickCard(context.bwingSkirmisher);

            expect(context.halo.damage).toBe(1);
            expect(context.halo).toHaveExactUpgradeNames(['shield']);
        });
    });
});