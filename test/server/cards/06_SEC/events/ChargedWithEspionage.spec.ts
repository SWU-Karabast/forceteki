describe('Charged With Espionage', function () {
    integration(function (contextRef) {
        describe('Charged With Espionage\'s ability', function () {
            it('should, after disclosing Cunning, Cunning, look at an opponent\'s hand and discard a unit from it', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['charged-with-espionage', 'waylay', 'cartel-spacer'], // Waylay (Cunning), Cartel Spacer (Cunning)
                        groundArena: ['wampa']
                    },
                    player2: {
                        hand: ['battlefield-marine', 'vigilance', 'protector', 'inferno-four#unforgetting']
                    }
                });
                const { context } = contextRef;

                // Play the event, disclose [Cunning, Cunning]
                context.player1.clickCard(context.chargedWithEspionage);
                // Disclose by selecting Waylay (Cunning) and Cartel Spacer (Cunning)
                context.player1.clickCard(context.waylay);
                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickPrompt('Done');
                // Opponent sees the disclosed cards
                context.player2.clickDone();

                // Verify that only units are selectable from opponent's hand
                // Units: Battlefield Marine, Inferno Four; Non-units: Waylay, Protector
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.battlefieldMarine, context.infernoFour],
                    invalid: [context.vigilance, context.protector]
                });
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                // Card names should be revealed in chat
                expect(context.getChatLogs(1)[0]).toContain(context.battlefieldMarine.title);
                expect(context.getChatLogs(1)[0]).toContain(context.infernoFour.title);
                expect(context.getChatLogs(1)[0]).toContain(context.vigilance.title);
                expect(context.getChatLogs(1)[0]).toContain(context.protector.title);
                expect(context.getChatLogs(1)[0]).toEqual(
                    'player1 uses Charged with Espionage to look at the opponent\'s hand and sees Battlefield Marine, Vigilance, Protector, and Inferno Four',
                );

                // Discard one of the units
                context.player1.clickCardInDisplayCardPrompt(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('should not proceed if the player declines to disclose the required aspects', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['charged-with-espionage', 'waylay', 'cartel-spacer'], // can satisfy but choose nothing
                        base: 'administrators-tower'
                    },
                    player2: {
                        hand: ['battlefield-marine', 'vigilance']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.chargedWithEspionage);
                // Decline to disclose even though it's possible
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                context.player1.clickPrompt('Choose nothing');

                // Event is played and resources are paid, but no look-at-hand prompt should occur
                expect(context.chargedWithEspionage.zoneName).toBe('discard');
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});