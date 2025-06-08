describe('Rampage', function() {
    integration(function(contextRef) {
        it('Rampage\'s ability should give all friendly Creature units +2/+2 for the phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['rampage'],
                    groundArena: ['hunting-nexu', 'alliance-dispatcher', 'porg'],
                    spaceArena: ['graceful-purrgil']
                },
                player2: {
                    groundArena: ['battle-droid', 'nameless-terror']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.rampage);

            // Friendly creatures should be +2/+2
            expect(context.huntingNexu.getPower()).toBe(4 + 2);
            expect(context.huntingNexu.getHp()).toBe(4 + 2);

            expect(context.porg.getPower()).toBe(1 + 2);
            expect(context.porg.getHp()).toBe(1 + 2);

            expect(context.gracefulPurrgil.getPower()).toBe(2 + 2);
            expect(context.gracefulPurrgil.getHp()).toBe(7 + 2);

            // Non creatures are not affected
            expect(context.allianceDispatcher.getPower()).toBe(1);
            expect(context.allianceDispatcher.getHp()).toBe(2);

            // Non friendly creatures are also not affected
            expect(context.namelessTerror.getPower()).toBe(3);
            expect(context.namelessTerror.getHp()).toBe(3);

            // Non friendly, non creature also not affected
            expect(context.battleDroid.getPower()).toBe(1);
            expect(context.battleDroid.getHp()).toBe(1);

            context.moveToRegroupPhase();

            // bonus expired after phase ends
            expect(context.huntingNexu.getPower()).toBe(4);
            expect(context.huntingNexu.getHp()).toBe(4);

            expect(context.porg.getPower()).toBe(1);
            expect(context.porg.getHp()).toBe(1);

            expect(context.gracefulPurrgil.getPower()).toBe(2);
            expect(context.gracefulPurrgil.getHp()).toBe(7);
        });
    });
});
