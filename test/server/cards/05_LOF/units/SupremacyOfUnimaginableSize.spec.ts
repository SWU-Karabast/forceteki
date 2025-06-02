describe('Supremacy, Of Unimaginable Size', function() {
    integration(function(contextRef) {
        it('Supremacy\'s ability should give +6/+6 to all friendly Vehicle units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['supremacy#of-unimaginable-size', 'supremacy-tiesf', 'exegol-patroller'],
                    groundArena: ['wampa']
                },
                player2: {
                    spaceArena: ['tieln-fighter']
                }
            });
            const { context } = contextRef;

            // Supremacy itself is a Vehicle, but it should not buff itself
            expect(context.supremacy.getPower()).toBe(12);
            expect(context.supremacy.getHp()).toBe(12);

            // Buff other friendly Vehicle units
            expect(context.supremacyTiesf.getPower()).toBe(9); // Base 3 + 6 = 9
            expect(context.supremacyTiesf.getHp()).toBe(9); // Base 3 + 6 = 9

            expect(context.exegolPatroller.getPower()).toBe(9); // Base 3 + 6 = 9
            expect(context.exegolPatroller.getHp()).toBe(7); // Base 1 + 6 = 7

            // Do not buff non-Vehicle units
            expect(context.wampa.getPower()).toBe(4);
            expect(context.wampa.getHp()).toBe(5);

            // Do not buff enemy Vehicle units
            expect(context.tielnFighter.getPower()).toBe(2);
            expect(context.tielnFighter.getHp()).toBe(1);
        });
    });
});