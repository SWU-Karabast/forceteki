describe('Seismic Detonation', function() {
    integration(function(contextRef) {
        it('deals 3 damage to each enemy unit in the chosen arena at the start of the next regroup phase, and only triggers once even with an additional regroup phase (ground arena)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['seismic-detonation'],
                    groundArena: ['max-rebo#encore'],
                },
                player2: {
                    hand: ['yoda#old-master'],
                    groundArena: ['wampa', 'atst'],
                    spaceArena: ['cartel-spacer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.seismicDetonation);
            expect(context.player1).toHavePrompt('Choose an arena');
            expect(context.player1).toHaveEnabledPromptButtons(['Ground', 'Space']);
            context.player1.clickPrompt('Ground');

            context.player2.clickCard(context.yoda);

            expect(context.seismicDetonation).toHaveOngoingEffectForPlayer(context.player1, 'Deal 3 damage to each enemy unit in the ground arena');

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

        it('deals 3 damage to each enemy unit in the chosen arena at the start of the next regroup phase (space arena)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['seismic-detonation'],
                    spaceArena: ['awing']
                },
                player2: {
                    hand: ['green-squadron-awing'],
                    groundArena: ['wampa'],
                    spaceArena: ['corellian-freighter']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.seismicDetonation);
            expect(context.player1).toHavePrompt('Choose an arena');
            expect(context.player1).toHaveEnabledPromptButtons(['Ground', 'Space']);
            context.player1.clickPrompt('Space');

            context.player2.clickCard(context.greenSquadronAwing);

            expect(context.seismicDetonation).toHaveOngoingEffectForPlayer(context.player1, 'Deal 3 damage to each enemy unit in the space arena');

            // Move to the regroup phase
            context.moveToRegroupPhase();

            expect(context.wampa.damage).toBe(0);
            expect(context.awing.damage).toBe(0);
            expect(context.corellianFreighter.damage).toBe(3);
            expect(context.greenSquadronAwing).toBeInZone('discard', context.player2);


            expect(context.player1).toHavePrompt('Select between 0 and 1 cards to resource');
            expect(context.player2).toHavePrompt('Select between 0 and 1 cards to resource');
            context.player1.clickDone();
            context.player2.clickDone();
        });
    });
});
