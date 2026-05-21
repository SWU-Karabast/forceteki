describe('Moff Gideon, Remnant Commander', function() {
    integration(function(contextRef) {
        it('Moff Gideon\'s ability should return a non-unique imperial unit from the discard to hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['helix-starfighter'],
                    groundArena: ['moff-gideon#remnant-commander'],
                    discard: ['the-emperors-legion', 'death-star-stormtrooper', 'fifth-brother#fear-hunter', 'battlefield-marine']
                },
                player2: {
                    hand: ['no-glory-only-results', 'takedown'],
                    spaceArena: ['awing'],
                    discard: ['ruthless-raider', 'wampa', 'seventh-sister#implacable-inquisitor', 'maximum-firepower'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.moffGideon);

            expect(context.player1).toBeAbleToSelectExactly([context.deathStarStormtrooper]);
            expect(context.player1).toHaveEnabledPromptButton('Pass');
            expect(context.player1).toHavePrompt('Return a non-unique Imperial unit from your discard pile to your hand.');
            context.player1.clickCard(context.deathStarStormtrooper);
            expect(context.deathStarStormtrooper).toBeInZone('hand', context.player1);
            expect(context.theEmperorsLegion).toBeInZone('discard', context.player1);
            expect(context.fifthBrother).toBeInZone('discard', context.player1);
            expect(context.battlefieldMarine).toBeInZone('discard', context.player1);

            expect(context.player1).toBeActivePlayer();
        });

        it('Moff Gideon\'s ability should be able to be passed', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['helix-starfighter'],
                    groundArena: ['moff-gideon#remnant-commander'],
                    discard: ['the-emperors-legion', 'death-star-stormtrooper', 'fifth-brother#fear-hunter', 'battlefield-marine']
                },
                player2: {
                    hand: ['no-glory-only-results', 'takedown'],
                    spaceArena: ['awing'],
                    discard: ['ruthless-raider', 'wampa', 'seventh-sister#implacable-inquisitor', 'maximum-firepower'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.moffGideon);

            expect(context.player1).toBeAbleToSelectExactly([context.deathStarStormtrooper]);
            expect(context.player1).toHaveEnabledPromptButton('Pass');
            expect(context.player1).toHavePrompt('Return a non-unique Imperial unit from your discard pile to your hand.');
            context.player1.clickPrompt('Pass');
            expect(context.deathStarStormtrooper).toBeInZone('discard', context.player1);
            expect(context.theEmperorsLegion).toBeInZone('discard', context.player1);
            expect(context.fifthBrother).toBeInZone('discard', context.player1);
            expect(context.battlefieldMarine).toBeInZone('discard', context.player1);

            expect(context.player1).toBeActivePlayer();
            expect(context.player1).not.toHavePrompt('Return a non-unique Imperial unit from your discard pile to your hand.');
        });

        it('Moff Gideon\'s ability should work with NGOR', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['helix-starfighter'],
                    groundArena: ['moff-gideon#remnant-commander'],
                    discard: ['the-emperors-legion', 'death-star-stormtrooper', 'fifth-brother#fear-hunter', 'battlefield-marine']
                },
                player2: {
                    hand: ['no-glory-only-results', 'takedown'],
                    spaceArena: ['awing'],
                    discard: ['ruthless-raider', 'wampa', 'seventh-sister#implacable-inquisitor', 'maximum-firepower'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.moffGideon);

            expect(context.player2).toBeAbleToSelectExactly([context.ruthlessRaider]);
            expect(context.player2).toHaveEnabledPromptButton('Pass');
            context.player2.clickCard(context.ruthlessRaider);
            expect(context.ruthlessRaider).toBeInZone('hand', context.player2);
            expect(context.wampa).toBeInZone('discard', context.player2);
            expect(context.seventhSister).toBeInZone('discard', context.player2);
            expect(context.maximumFirepower).toBeInZone('discard', context.player2);

            expect(context.player1).toBeActivePlayer();
        });
    });
});