describe('Crushing Blow', function() {
    integration(function(contextRef) {
        it('Crushing Blow\'s event ability should defeat a non-leader unit that costs 2 or less', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['crushing-blow'],
                    spaceArena: ['green-squadron-awing']
                },
                player2: {
                    groundArena: ['battlefield-marine', 'atst'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.crushingBlow);

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toBeInZone('discard');
        });
    });
});