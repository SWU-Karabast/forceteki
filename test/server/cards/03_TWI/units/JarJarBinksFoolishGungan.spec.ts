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

            context.game.setRandomSeed('khgfk');

            context.player1.clickCard(context.jarJarBinks);
            context.player1.clickCard(context.p2Base);

            // Ability hits own base
            expect(context.getChatLogs(1)).toContain('player1 uses Jar Jar Binks to randomly select player1\'s base from Jar Jar Binks, Republic ARC-170, Wampa, AT-ST, Restored ARC-170, player2\'s base, and player1\'s base, and to deal 2 damage to player1\'s base');
            expect(context.p1Base.damage).toBe(2);
            expect(context.p2Base.damage).toBe(2);

            context.moveToNextActionPhase();
            context.player1.clickCard(context.jarJarBinks);
            context.player1.clickCard(context.p2Base);

            // Ability hits Republic ARC-170 (friendly unit)
            expect(context.getChatLogs(1)).toContain('player1 uses Jar Jar Binks to randomly select Republic ARC-170 from Jar Jar Binks, Republic ARC-170, Wampa, AT-ST, Restored ARC-170, player2\'s base, and player1\'s base, and to deal 2 damage to Republic ARC-170');
            expect(context.republicArc170.damage).toBe(2);
            expect(context.p2Base.damage).toBe(4);

            context.moveToNextActionPhase();
            context.player1.clickCard(context.jarJarBinks);
            context.player1.clickCard(context.p2Base);

            // Ability hits Wampa (enemy unit)
            expect(context.getChatLogs(1)).toContain('player1 uses Jar Jar Binks to randomly select Wampa from Jar Jar Binks, Republic ARC-170, Wampa, AT-ST, Restored ARC-170, player2\'s base, and player1\'s base, and to deal 2 damage to Wampa');
            expect(context.wampa.damage).toBe(2);
            expect(context.p2Base.damage).toBe(6);
        });
    });
});
