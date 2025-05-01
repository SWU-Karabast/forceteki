describe('Stinger Mantis, Where are we Going ?', function() {
    integration(function(contextRef) {
        it('Stinger Mantis\'s ability may deal 2 damage to an exhausted unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['stinger-mantis#where-are-we-going'],
                    groundArena: [{ card: 'wampa', exhausted: true }, 'battlefield-marine']
                },
                player2: {
                    spaceArena: [{ card: 'green-squadron-awing', exhausted: true }],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.stingerMantis);
            expect(context.player1).toBeAbleToSelectExactly([context.stingerMantis, context.wampa, context.greenSquadronAwing]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.greenSquadronAwing);

            expect(context.player2).toBeActivePlayer();
            expect(context.greenSquadronAwing.damage).toBe(2);
        });
    });
});