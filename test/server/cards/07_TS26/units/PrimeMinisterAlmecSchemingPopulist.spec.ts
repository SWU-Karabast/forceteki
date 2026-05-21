describe('Prime Minister Almec, Scheming Populist', function () {
    integration(function (contextRef) {
        it('Prime Minister Almec\'s When Played ability should give a friendly unit +2/+2 for this phase and exhaust each enemy unit in its arena with less power than it', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['prime-minister-almec#scheming-populist'],
                    groundArena: ['wampa', 'yoda#old-master'],
                },
                player2: {
                    groundArena: ['atst', 'battlefield-marine', 'pyke-sentinel'],
                    spaceArena: ['awing']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.primeMinisterAlmec);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.yoda, context.primeMinisterAlmec]);
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();

            expect(context.wampa.getPower()).toBe(6);
            expect(context.wampa.getHp()).toBe(7);

            // should exhaust enemy unit with less power than it
            expect(context.battlefieldMarine.exhausted).toBeTrue();
            expect(context.pykeSentinel.exhausted).toBeTrue();

            // should not exhaust enemy unit with same or more power than it
            expect(context.atst.exhausted).toBeFalse();

            // should not exhaust enemy unit on other arena
            expect(context.awing.exhausted).toBeFalse();

            // should not exhaust friendly unit
            expect(context.yoda.exhausted).toBeFalse();

            context.moveToNextActionPhase();

            expect(context.wampa.getPower()).toBe(4);
            expect(context.wampa.getHp()).toBe(5);
        });
    });
});
