describe('Jar Jar Binks, Foolish Gungan', function () {
    integration(function (contextRef) {
        it('Jar Jar Binks, Foolish Gungan\'s ability should deal damage to a random unit or base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['jar-jar-binks#foolish-gungan'],
                    spaceArena: ['republic-arc170']
                },
                player2: {
                    groundArena: ['wampa', 'atst'],
                    spaceArena: ['restored-arc170']
                }
            });

            const { context } = contextRef;

            context.game.setRandomSeed('356244');

            context.player1.clickCard(context.jarJarBinks);
            context.player1.clickCard(context.p2Base);

            context.moveToNextActionPhase();
            context.player1.clickCard(context.jarJarBinks);
            context.player1.clickCard(context.p2Base);

            context.moveToNextActionPhase();
            context.player1.clickCard(context.jarJarBinks);
            context.player1.clickCard(context.p2Base);

            expect(context.p1Base.damage).toBe(2); // Jar Jar's ability deals damage to a base
            expect(context.p2Base.damage).toBe(6); // Jar Jar's attacks
            expect(context.jarJarBinks.damage).toBe(2); // Jar Jar's ability deals damage to a friendly unit
            expect(context.restoredArc170.damage).toBe(2); // Jar Jar's ability deals damage to an enemy unit
        });
    });
});
