describe('Clone Combat Squadron', function () {
    integration(function (contextRef) {
        it('Clone Combat Squadron\'s ability should give him +1/+1 for each other friendly space unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['phoenix-squadron-awing'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['clone-combat-squadron', 'green-squadron-awing']
                },
                player2: {
                    spaceArena: ['inferno-four#unforgetting']
                }
            });

            const { context } = contextRef;

            expect(context.cloneCombatSquadron.getPower()).toBe(4);
            expect(context.cloneCombatSquadron.getHp()).toBe(4);

            context.player1.clickCard(context.phoenixSquadronAwing);

            expect(context.cloneCombatSquadron.getPower()).toBe(5);
            expect(context.cloneCombatSquadron.getHp()).toBe(5);
        });
    });
});
