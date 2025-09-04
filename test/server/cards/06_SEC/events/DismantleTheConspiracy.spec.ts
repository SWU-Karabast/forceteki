describe('Dismantle the Conspiracy', function() {
    integration(function(contextRef) {
        it('Dismantle the Conspiracy\'s ability should allow you to capture any number of enemy non-leader units with 7 or less HP', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['dismantle-the-conspiracy'],
                    groundArena: [{ card: 'battlefield-marine', damage: 2 }, 'isb-agent']
                },
                player2: {
                    hand: ['change-of-heart'],
                    groundArena: ['wampa', 'greedo#slow-on-the-draw', 'death-star-stormtrooper'],
                    spaceArena: ['wing-leader', 'consortium-starviper', 'avenger#hunting-star-destroyer'],
                    leader: { card: 'iden-versio#inferno-squad-commander', deployed: true },
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.dismantleTheConspiracy);

            expect(context.player1).toHavePrompt('A friendly unit captures any number of enemy non leader units with 7 or less HP');
            expect(context.player1).toBeAbleToSelectExactly([context.isbAgent, context.battlefieldMarine]);

            context.player1.clickCard(context.isbAgent);

            expect(context.player1).toHavePrompt('A friendly unit captures any number of enemy non leader units with 7 or less HP');
            expect(context.player1).toHaveChooseNothingButton();
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.greedoSlowOnTheDraw, context.wingLeader, context.consortiumStarviper, context.deathStarStormtrooper]);

            context.player1.clickCard(context.consortiumStarviper);
            expect(context.player1).toBeAbleToSelectExactly([context.consortiumStarviper, context.wingLeader, context.greedoSlowOnTheDraw, context.deathStarStormtrooper]);

            context.player1.clickCard(context.wingLeader);
            expect(context.player1).toBeAbleToSelectExactly([context.consortiumStarviper, context.wingLeader, context.greedoSlowOnTheDraw, context.deathStarStormtrooper]);

            context.player1.clickCard(context.greedoSlowOnTheDraw);
            expect(context.player1).toBeAbleToSelectExactly([context.consortiumStarviper, context.wingLeader, context.greedoSlowOnTheDraw, context.deathStarStormtrooper]);

            context.player1.clickCard(context.deathStarStormtrooper);
            expect(context.player1).toBeAbleToSelectExactly([context.consortiumStarviper, context.wingLeader, context.greedoSlowOnTheDraw, context.deathStarStormtrooper]);

            context.player1.clickCardNonChecking(context.wampa);
            context.player1.clickDone();

            expect(context.consortiumStarviper).toBeCapturedBy(context.isbAgent);
            expect(context.wingLeader).toBeCapturedBy(context.isbAgent);
            expect(context.greedoSlowOnTheDraw).toBeCapturedBy(context.isbAgent);
            expect(context.deathStarStormtrooper).toBeCapturedBy(context.isbAgent);
            expect(context.wampa).toBeInZone('groundArena', context.player2);
            expect(context.getChatLogs(2)).toContain('player1 plays Dismantle the Conspiracy to capture Consortium StarViper, Wing Leader, Greedo, and Death Star Stormtrooper with ISB Agent');
        });
    });
});