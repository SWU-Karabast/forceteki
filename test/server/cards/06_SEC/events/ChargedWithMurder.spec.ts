describe('Charged With Murder', function () {
    integration(function (contextRef) {
        describe('Charged With Murder\'s ability', function () {
            it('should, after disclosing Vigilance, Vigilance, defeat a non-leader unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['charged-with-murder', 'vigilance'],
                        spaceArena: [{ card: 'green-squadron-awing', damage: 2 }]
                    },
                    player2: {
                        groundArena: [{ card: 'atst', damage: 5 }, 'wampa'],
                        leader: { card: 'boba-fett#collecting-the-bounty', deployed: true }
                    }
                });
                const { context } = contextRef;

                // Play the event, disclose [Vigilance, Vigilance]
                context.player1.clickCard(context.chargedWithMurder);
                // Disclose by selecting Vigilance (Vigilance|Vigilance)
                context.player1.clickCard(context.vigilance);
                // Opponent sees the disclosed card
                context.player2.clickDone();

                // Now select a non-leader unit to defeat
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.greenSquadronAwing]);
                context.player1.clickCard(context.atst);

                expect(context.atst).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('should not proceed if the player declines to disclose the required aspects', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['charged-with-murder', 'vigilance'] // can satisfy but choose nothing
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.chargedWithMurder);
                // Decline to disclose even though it's possible
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                context.player1.clickPrompt('Choose nothing');

                // Event is played, but no target prompt and no damage dealt
                expect(context.chargedWithMurder.zoneName).toBe('discard');
                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
