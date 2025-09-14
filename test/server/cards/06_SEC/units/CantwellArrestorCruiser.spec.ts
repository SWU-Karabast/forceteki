describe('Cantwell Arrestor Cruiser\'s when played ability', function() {
    integration(function(contextRef) {
        const disclosePrompt = 'Disclose Vigilance, Vigilance, Villainy to exhaust an enemy unit. That unit cannot ready while this unit is in play';
        const exhaustPrompt = 'Exhaust an enemy unit. That unit cannot ready while this unit is in play';

        describe('When player has required aspects in hand', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hasInitiative: true,
                        hand: [
                            'takedown',
                            'superlaser-blast',
                            'evacuate',
                            'cantwell-arrestor-cruiser'
                        ],
                        groundArena: ['atat-suppressor']
                    },
                    player2: {
                        leader: { card: 'han-solo#worth-the-risk', deployed: true },
                        hand: ['bravado', 'vanquish'],
                        groundArena: ['reinforcement-walker']
                    }
                });
            });

            it('Discloses Vigilance Vigilance Villainy to exhaust an enemy unit and prevents it from readying while Cantwell is in play', function() {
                const { context } = contextRef;

                // Play Cantwell Arrestor Cruiser
                context.player1.clickCard(context.cantwellArrestorCruiser);
                expect(context.player1).toHavePrompt(disclosePrompt);
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.takedown,
                    context.superlaserBlast
                ]);

                // Choose which cards to disclose
                context.player1.clickCard(context.takedown);
                expect(context.player1).toHaveDisabledPromptButton('Done');
                context.player1.clickCard(context.superlaserBlast);
                expect(context.player1).toHaveEnabledPromptButton('Done');
                context.player1.clickPrompt('Done');

                // Cards are revealed to Player 2
                expect(context.player2).toHaveExactViewableDisplayPromptCards([
                    context.takedown,
                    context.superlaserBlast
                ]);
                expect(context.player2).toHaveEnabledPromptButton('Done');
                context.player2.clickDone();

                // Only enemy units should be selectable to exhaust
                expect(context.player1).toHavePrompt(exhaustPrompt);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.reinforcementWalker,
                    context.hanSolo // Can target leader units
                ]);

                // Exhaust the reinforcement walker
                context.player1.clickCard(context.reinforcementWalker);
                expect(context.reinforcementWalker.exhausted).toBe(true);

                // Move to the next action phase. Reinforcement Walker should remain exhausted
                context.moveToNextActionPhase();
                expect(context.reinforcementWalker.exhausted).toBe(true);
                context.player1.passAction();

                // Reinforcement Walker cannot ready from card effects like Bravado
                context.player2.clickCard(context.bravado);
                expect(context.player1).toBeActivePlayer(); // Bravado's effect fizzled
                expect(context.bravado).toBeInZone('discard', context.player2);
                expect(context.reinforcementWalker.exhausted).toBe(true);
                context.player1.passAction();

                // Player 2 plays Vanquish to defeat the Cantwell Arrestor Cruiser
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.cantwellArrestorCruiser);
                expect(context.cantwellArrestorCruiser).toBeInZone('discard', context.player1);

                // Move to the next action phase. Reinforcement Walker should be able to ready now that Cantwell is no longer in play
                context.moveToNextActionPhase();
                expect(context.reinforcementWalker.exhausted).toBe(false);
            });

            it('Can choose not to disclose anything', function() {
                const { context } = contextRef;

                // Play Cantwell Arrestor Cruiser
                context.player1.clickCard(context.cantwellArrestorCruiser);
                expect(context.player1).toHavePrompt(disclosePrompt);
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.takedown,
                    context.superlaserBlast
                ]);

                context.player1.clickPrompt('Choose nothing');

                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('When player does not have required aspects in hand', function() {
            it('The ability is automatically skipped', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hasInitiative: true,
                        hand: ['evacuate', 'cantwell-arrestor-cruiser'],
                        groundArena: ['atat-suppressor']
                    },
                    player2: {
                        leader: { card: 'han-solo#worth-the-risk', deployed: true },
                        hand: ['bravado', 'vanquish'],
                        groundArena: ['reinforcement-walker']
                    }
                });

                const { context } = contextRef;

                // Play Cantwell Arrestor Cruiser
                context.player1.clickCard(context.cantwellArrestorCruiser);

                // Ability is skipped since player does not have required aspects in hand
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});