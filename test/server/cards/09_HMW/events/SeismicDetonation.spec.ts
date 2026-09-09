describe('Seismic Detonation', function() {
    integration(function(contextRef) {
        it('deals 3 damage to each enemy unit in the chosen arena at the start of the next regroup phase, and only triggers once even with an additional regroup phase', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'sly-moore#cipher-in-the-dark',
                    base: 'data-vault',
                    resources: 15,
                    hand: ['seismic-detonation'],
                    groundArena: ['max-rebo#encore'],
                },
                player2: {
                    leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                    base: 'data-vault',
                    hand: ['yoda#old-master'],
                    groundArena: ['wampa', 'atst'],
                    spaceArena: ['cartel-spacer']
                }
            });

            const { context } = contextRef;

            // Play Seismic Detonation and choose the Ground arena
            context.player1.clickCard(context.seismicDetonation);
            expect(context.player1).toHavePrompt('Choose an arena');
            expect(context.player1).toHaveEnabledPromptButtons(['Ground', 'Space']);
            context.player1.clickPrompt('Ground');

            // Pass priority and play Max Rebo to create a second regroup phase
            context.player2.clickCard(context.yoda);

            // Move to the regroup phase
            context.moveToRegroupPhase();

            expect(context.wampa.damage).toBe(3);
            expect(context.atst.damage).toBe(3);
            expect(context.yoda.damage).toBe(3);
            expect(context.maxRebo.damage).toBe(0);
            expect(context.cartelSpacer.damage).toBe(0);

            expect(context.player1).toHavePrompt('Select between 0 and 1 cards to resource');
            expect(context.player2).toHavePrompt('Select between 0 and 1 cards to resource');
            context.player1.clickDone();
            context.player2.clickDone();

            // Second regroup phase begins (from Max Rebo): Seismic Detonation should not trigger again
            expect(context.wampa.damage).toBe(3);
            expect(context.atst.damage).toBe(3);
            expect(context.yoda.damage).toBe(3);
            expect(context.maxRebo.damage).toBe(0);
            expect(context.cartelSpacer.damage).toBe(0);

            expect(context.player1).toHavePrompt('Select between 0 and 1 cards to resource');
            expect(context.player2).toHavePrompt('Select between 0 and 1 cards to resource');
            context.player1.clickDone();
            context.player2.clickDone();
        });
    });
});
