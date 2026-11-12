describe('Carbonite Chamber', function() {
    integration(function(contextRef) {
        it('Carbonite Chamber\'s action ability should defeat this upgrade and prevent a non-Vehicle unit from readying during the next regroup phase', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine'],
                    base: { card: 'kestro-city', upgrades: ['carbonite-chamber'] },
                },
                player2: {
                    hand: ['bravado'],
                    groundArena: [{ card: 'wampa', exhausted: true }],
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.carboniteChamber);

            expect(context.player1).toHavePrompt('Choose a non-Vehicle unit. It doesn\'t ready during the next regroup phase');
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine]);
            context.player1.clickCard(context.wampa);

            expect(context.carboniteChamber).toBeInZone('discard', context.player1);

            context.player2.clickCard(context.bravado);
            context.player2.clickCard(context.wampa);

            context.player1.passAction();

            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.p1Base);

            context.moveToNextActionPhase();

            expect(context.wampa.exhausted).toBeTrue();

            context.moveToNextActionPhase();

            expect(context.wampa.exhausted).toBeFalse();
        });

        it('Carbonite Chamber\'s action ability should defeat this upgrade and prevent a non-Vehicle unit from readying during the next regroup phase (Max Rebo creating one more regroup phase, on next action phase, target should be ready)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: { card: 'kestro-city', upgrades: ['carbonite-chamber'] },
                },
                player2: {
                    groundArena: [{ card: 'wampa', exhausted: true }, 'max-rebo#encore'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.carboniteChamber);
            context.player1.clickCard(context.wampa);

            context.player2.passAction();
            context.player1.claimInitiative();

            context.player1.clickPrompt('Skip resourcing');
            context.player2.clickPrompt('Skip resourcing');
            context.player1.clickPrompt('Skip resourcing');
            context.player2.clickPrompt('Skip resourcing');

            expect(context.wampa.exhausted).toBeFalse();
        });
    });

    integration(function(contextRef) {
        it('should be controlled by the player who played it from the opponent\'s discard pile and go back to its owner\'s discard pile', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['a-fine-addition'],
                    groundArena: ['wampa'],
                },
                player2: {
                    groundArena: ['death-star-stormtrooper', 'battlefield-marine'],
                    discard: ['carbonite-chamber'],
                }
            });

            const { context } = contextRef;

            // Defeat an enemy unit to enable A Fine Addition
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.deathStarStormtrooper);
            context.player2.passAction();

            // Play player2's Carbonite Chamber from their discard pile onto player1's base
            context.player1.clickCard(context.aFineAddition);
            context.player1.clickCard(context.carboniteChamber);
            context.player1.clickCard(context.p1Base);
            expect(context.carboniteChamber).toBeAttachedTo(context.p1Base);
            expect(context.carboniteChamber.controller).toBe(context.player1.player);
            context.player2.passAction();

            // player1 controls the upgrade and can use its action, which defeats it
            context.player1.clickCard(context.carboniteChamber);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.carboniteChamber).toBeInZone('discard', context.player2);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
