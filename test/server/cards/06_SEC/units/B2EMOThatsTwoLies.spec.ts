describe('B2EMO, That\'s Two Lies', function() {
    integration(function(contextRef) {
        it('B2EMO\'s on attack ability should disclose Heroism, Heroism to give a unit Sentinel for this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['b2emo#thats-two-lies', 'battlefield-marine'],
                    hand: ['medal-ceremony', 'c3po#protocol-droid']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            // Attack with B2EMO to trigger the disclose prompt
            context.player1.clickCard(context.b2emoThatsTwoLies);
            context.player1.clickCard(context.p2Base);

            // First, the on-attack ability appears as a choice in the triggered ability selection
            context.player1.clickPrompt('Disclose Heroism, Heroism to give a unit Sentinel for this phase');

            expect(context.player1).toBeAbleToSelectExactly([context.medalCeremony, context.c3poProtocolDroid]);
            expect(context.player1).toHaveChooseNothingButton();
            context.player1.clickCard(context.medalCeremony);
            context.player1.clickCard(context.c3poProtocolDroid);
            context.player1.clickPrompt('Done');
            // Opponent views disclosed cards and clicks Done
            context.player2.clickDone();

            // Choose a unit to gain Sentinel for this phase (our Battlefield Marine)
            expect(context.player1).toBeAbleToSelectExactly([context.b2emoThatsTwoLies, context.battlefieldMarine, context.wampa]);
            context.player1.clickCard(context.battlefieldMarine);

            // Turn passes to opponent after the attack resolves
            expect(context.player2).toBeActivePlayer();

            // Opponent must target Sentinel when attacking on ground this phase
            context.player2.clickCard(context.wampa);
            expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine]);
            // Resolve selection to avoid leaving prompts open
            context.player2.clickCard(context.battlefieldMarine);
        });
    });
});
