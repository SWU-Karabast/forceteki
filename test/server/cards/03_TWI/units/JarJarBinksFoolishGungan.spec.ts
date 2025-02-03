describe('Jar Jar Binks, Foolish Gungan', function () {
    integration(function (contextRef) {
        it('Jar Jar Binks, Foolish Gungan\'s ability should deal damage to a random unit or base', function () {
            contextRef.setupTest({
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

            context.player1.clickCard(context.jarJarBinks);
            context.player1.clickCard(context.p2Base);

            const conditions = [
                context.p1Base.damage === 2,
                context.p2Base.damage === 4, // 2 from Jar Jar Binks base power + 2 from Jar Jar's ability
                context.jarJarBinks.damage === 2,
                context.republicArc170.damage === 2,
                context.restoredArc170.damage === 2,
                context.wampa.damage === 2,
                context.atst.damage === 2
            ];

            const assertionsCount = conditions.filter(Boolean).length;
            expect(assertionsCount).toBe(1);
        });
    });
});
