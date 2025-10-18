describe('Condemn', function () {
    integration(function (contextRef) {
        it('should make the defending player disclose Vigilance or Villainy to give -6 power for the attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['condemn', 'superlaser-blast'],
                    groundArena: ['darth-vader#twilight-of-the-apprentice']
                },
                player2: {
                    deck: [],
                    groundArena: ['reinforcement-walker']
                }
            });

            const { context } = contextRef;

            // Play Condemn on Reinforcement Walker
            context.player1.clickCard(context.condemn);
            expect(context.player1).toBeAbleToSelectExactly([
                context.darthVader,
                context.reinforcementWalker
            ]);
            context.player1.clickCard(context.reinforcementWalker);

            // P2 attacks Darth Vader with Reinforcement Walker
            context.player2.clickCard(context.reinforcementWalker);
            context.player2.clickCard(context.darthVader);
            context.player2.clickPrompt('The defending player discloses Vigilance, Villainy. If they do, this unit gets -6/-0 for this attack');
        });
    });
});