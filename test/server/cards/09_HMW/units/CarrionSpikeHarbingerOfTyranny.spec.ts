describe('Carrion Spike, Harbinger of Tyranny', function () {
    integration(function (contextRef) {
        it('gains +1 power and Restore 1 for each upgrade on your base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['carrion-spike#harbinger-of-tyranny'],
                    base: { card: 'kestro-city', damage: 5, upgrades: ['alliance-shield-generator', 'sinister-war-memorial'] }
                },
                player2: {
                    base: { card: 'colossus', upgrades: ['trap-field'] }
                }
            });

            const { context } = contextRef;

            expect(context.carrionSpike.getPower()).toBe(5); // 3 base + 2

            context.player1.clickCard(context.carrionSpike);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(5); // 5 + 5
            expect(context.p1Base.damage).toBe(3); // restored 2
        });

        it('has no bonus power or Restore when your base has no upgrades', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['carrion-spike#harbinger-of-tyranny'],
                    base: { card: 'kestro-city', damage: 2 }
                },
                player2: {
                    base: { card: 'colossus', upgrades: ['trap-field'] }
                }
            });

            const { context } = contextRef;

            expect(context.carrionSpike.getPower()).toBe(3);

            context.player1.clickCard(context.carrionSpike);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(3);
            expect(context.p1Base.damage).toBe(2);
        });
    });
});
