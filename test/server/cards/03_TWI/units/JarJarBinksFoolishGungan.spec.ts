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

            context.game.setRandomSeed('12345');

            context.player1.clickCard(context.jarJarBinks);
            context.player1.clickCard(context.p2Base);

            // Ability hits Republic ARC-170
            expect(context.getChatLogs(1)).toContain('player1 uses Jar Jar Binks to deal 2 damage to Republic ARC-170');
            expect(context.republicArc170.damage).toBe(2);
            expect(context.p2Base.damage).toBe(2);

            context.moveToNextActionPhase();
            context.player1.clickCard(context.jarJarBinks);
            context.player1.clickCard(context.p2Base);

            // Ability hits Restored ARC-170
            expect(context.getChatLogs(1)).toContain('player1 uses Jar Jar Binks to deal 2 damage to Restored ARC-170');
            expect(context.restoredArc170.damage).toBe(2);
            expect(context.p2Base.damage).toBe(4);

            context.moveToNextActionPhase();
            context.player1.clickCard(context.jarJarBinks);
            context.player1.clickCard(context.p2Base);

            // Ability hits AT-ST
            expect(context.getChatLogs(1)).toContain('player1 uses Jar Jar Binks to deal 2 damage to AT-ST');
            expect(context.atst.damage).toBe(2);
            expect(context.p2Base.damage).toBe(6);
        });
    });
});
