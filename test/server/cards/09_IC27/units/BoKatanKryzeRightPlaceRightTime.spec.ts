describe('Bo-Katan Kryze, Right Place Right Time', function() {
    integration(function(contextRef) {
        it('Bo-Katan\'s when played ability should give each enemy unit -7/-0 for this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['bokatan-kryze#right-place-right-time'],
                    groundArena: ['porg']
                },
                player2: {
                    groundArena: ['wampa', 'blizzard-assault-atat'],
                    spaceArena: ['avenger#hunting-the-rebels']
                }
            });

            const { context } = contextRef;

            // Play Bo-Katan Kryze
            context.player1.clickCard(context.bokatanKryze);

            // Two when played triggers: Shielded and the -7/-0 effect.
            // Resolving the -7/-0 trigger leaves Shielded to resolve automatically
            context.player1.clickPrompt('Give each enemy unit -7/-0 for this phase');

            // All enemy units (in both arenas) get -7/-0, power floors at 0
            expect(context.wampa.getPower()).toBe(0);
            expect(context.wampa.getHp()).toBe(5);
            expect(context.blizzardAssaultAtat.getPower()).toBe(2);
            expect(context.blizzardAssaultAtat.getHp()).toBe(9);
            expect(context.avenger.getPower()).toBe(1);
            expect(context.avenger.getHp()).toBe(6);

            // Friendly units are unaffected
            expect(context.porg.getPower()).toBe(1);
            expect(context.porg.getHp()).toBe(1);

            // Move to the next action phase, the -7/-0 effect is gone
            context.moveToNextActionPhase();

            expect(context.wampa.getPower()).toBe(4);
            expect(context.blizzardAssaultAtat.getPower()).toBe(9);
            expect(context.avenger.getPower()).toBe(8);
        });
    });
});
