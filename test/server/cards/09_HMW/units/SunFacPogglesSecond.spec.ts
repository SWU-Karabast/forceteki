describe('Sun Fac, Poggle\'s Second', function() {
    integration(function(contextRef) {
        it('Sun Fac\'s when played ability should give a unit Grit for this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['sun-fac#poggles-second'],
                    groundArena: [{ card: 'battlefield-marine', damage: 2 }]
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.sunFac);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();

            expect(context.battlefieldMarine.getPower()).toBe(5);
            expect(context.battlefieldMarine.getHp()).toBe(3);

            context.moveToNextActionPhase();

            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.battlefieldMarine.getHp()).toBe(3);
        });
    });
});
