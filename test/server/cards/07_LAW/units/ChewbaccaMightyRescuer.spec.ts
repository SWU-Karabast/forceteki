describe('Chewbacca, Mighty Rescuer', function() {
    integration(function(contextRef) {
        beforeEach(async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                attackRulesVersion: 'cr7',
                player1: {
                    hand: ['heroic-sacrifice'],
                    groundArena: [{ card: 'chewbacca#mighty-rescuer', upgrades: ['experience'], damage: 1 }],
                },
                player2: {
                    groundArena: ['battlefield-marine', 'escort-skiff']
                }
            });
        });

        it('Chewbacca\'s attack-completed ability should heal 3 damage from him and give him an Experience token if the defending unit was defeated', function () {
            const { context } = contextRef;

            context.player1.clickCard(context.chewbacca);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.chewbacca.damage).toBe(1);
            expect(context.chewbacca).toHaveExactUpgradeNames(['experience', 'experience']);
        });

        it('Chewbacca\'s attack-completed ability should not trigger if he is defeated by an ability first', function () {
            const { context } = contextRef;

            context.player1.clickCard(context.heroicSacrifice);
            context.player1.clickCard(context.chewbacca);
            context.player1.clickCard(context.battlefieldMarine);

            // Heroic Sac and Chewie abilities resolve in the same window
            expect(context.player1).toHaveExactPromptButtons([
                'When this unit deals combat damage: Defeat it.',
                'If the defending unit was defeated, give an Experience token to Chewbacca and heal 3 damage from him'
            ]);

            context.player1.clickPrompt('When this unit deals combat damage: Defeat it.');

            expect(context.chewbacca).toBeInZone('discard');
            expect(context.player2).toBeActivePlayer();
        });

        it('Chewbacca\'s attack-completed ability should not trigger if he is defeated by combat damage', function () {
            const { context } = contextRef;

            context.player1.clickCard(context.chewbacca);
            context.player1.clickCard(context.escortSkiff);

            expect(context.chewbacca).toBeInZone('discard');
            expect(context.player2).toBeActivePlayer();
        });
    });
});
