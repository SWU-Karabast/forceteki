describe('Unfettered Ambition', function() {
    integration(function(contextRef) {
        it('should give 1 Advantage token when played on a unit with no other upgrades', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { hand: ['unfettered-ambition'],
                    groundArena: [{ card: 'battlefield-marine', upgrades: ['advantage', 'shield', 'fulcrum'] }],
                    leader: 'the-mandalorian#sworn-to-the-creed' },
                player2: {
                    groundArena: ['specforce-soldier']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.unfetteredAmbition);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1).toHaveEnabledPromptButtons([
                'Exhaust this leader to exhaust an enemy unit with 4 or less remaining HP',
                'Give 3 Advantage tokens to Unfettered Ambition'
            ]);

            // resolve advantage prompt first
            context.player1.clickPrompt('Give 3 Advantage tokens to Unfettered Ambition');

            // resolve exhaust prompt from leader
            context.player1.clickPrompt('Trigger');
            context.player1.clickCard(context.specforceSoldier);

            expect(context.player2).toBeActivePlayer();

            // unfettered ambition should create 3 Advantage tokens for Shield, Fulcrum and itself
            expect(context.battlefieldMarine).toHaveExactUpgradeNames([
                'advantage', 'shield', 'fulcrum', 'unfettered-ambition',
                'advantage', 'advantage', 'advantage'
            ]);
        });
    });
});
