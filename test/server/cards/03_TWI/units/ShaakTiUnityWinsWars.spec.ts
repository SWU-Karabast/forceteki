describe('Shaak Ti Unity Wins Wars', function() {
    integration(function(contextRef) {
        it('Shaak Ti\'s ability should should create 1 Clone Tropper token when attack and Clone Troppers must have +1 power', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['shaak-ti#unity-wins-wars']

                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.shaakTi);
            context.player1.clickCard(context.battlefieldMarine);

            const cloneTroopers = context.player1.findCardsByName('clone-trooper');
            expect(cloneTroopers.length).toBe(1);
            expect(cloneTroopers[0]).toBeInZone('groundArena');
            expect(cloneTroopers[0].exhausted).toBeTrue();
            expect(cloneTroopers[0].getPower()).toBe(3);
            expect(cloneTroopers[0].getHp()).toBe(2);
        });
    });
});
