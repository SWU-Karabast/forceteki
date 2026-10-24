describe('Landing Pad', function() {
    integration(function(contextRef) {
        it('Landing Pad\'s ability should give +1/+0 to friendly space units only', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: { card: 'kestro-city', upgrades: ['landing-pad'] },
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['green-squadron-awing', 'mynock']
                },
                player2: {
                    spaceArena: ['tie-fighter']
                }
            });

            const { context } = contextRef;

            // Friendly space units get +1/+0
            expect(context.greenSquadronAwing.getPower()).toBe(2);
            expect(context.greenSquadronAwing.getHp()).toBe(3);
            expect(context.mynock.getPower()).toBe(3);
            expect(context.mynock.getHp()).toBe(3);

            // Friendly ground units are unaffected
            expect(context.battlefieldMarine.getPower()).toBe(3);

            // Enemy space units are unaffected
            expect(context.tieFighter.getPower()).toBe(1);
        });
    });
});
