describe('Charged With Treason', function () {
    integration(function (contextRef) {
        describe('Charged With Treason\'s ability', function () {
            it('should, after disclosing Aggression, Aggression, deal 5 damage to a unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['charged-with-treason', 'karabast', 'bravado'] // Karabast (Aggression|Heroism), Bravado (Aggression)
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });
                const { context } = contextRef;

                // Play the event, disclose [Aggression, Aggression]
                context.player1.clickCard(context.chargedWithTreason);
                // Disclose by selecting Karabast (Aggression|Heroism) and Bravado (Aggression)
                context.player1.clickCard(context.karabast);
                context.player1.clickCard(context.bravado);
                context.player1.clickPrompt('Done');
                // Opponent sees the disclosed cards
                context.player2.clickDone();

                // Now select a unit to deal 5 damage to
                expect(context.player1).toBeAbleToSelect(context.atst);
                context.player1.clickCard(context.atst);

                // 5 damage should be dealt
                expect(context.atst.damage).toBe(5);
            });

            it('should not proceed if the player declines to disclose the required aspects', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['charged-with-treason', 'karabast', 'bravado'] // can satisfy but choose nothing
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.chargedWithTreason);
                // Decline to disclose even though it's possible
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                context.player1.clickPrompt('Choose nothing');

                // Event is played, but no target prompt and no damage dealt
                expect(context.chargedWithTreason.zoneName).toBe('discard');
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
