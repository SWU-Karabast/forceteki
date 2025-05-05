describe('Captain Enoch, Captain of the Guard', function() {
    integration(function(contextRef) {
        it('Captain Enoch\'s ability should give +1/+1 for each resource of the controller', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['captain-enoch#captain-of-the-guard', 'battlefield-marine'],
                    discard: ['echo-base-defender', 'vanguard-infantry']
                },
                player2: {
                    groundArena: ['wampa', 'death-star-stormtrooper'],
                    discard: ['first-legion-snowtrooper']
                }
            });
            const { context } = contextRef;

            expect(context.captainEnoch.getPower()).toBe(3);
            expect(context.captainEnoch.getHp()).toBe(5);

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();

            expect(context.captainEnoch.getPower()).toBe(4);
            expect(context.captainEnoch.getHp()).toBe(5);
        });
    });
});