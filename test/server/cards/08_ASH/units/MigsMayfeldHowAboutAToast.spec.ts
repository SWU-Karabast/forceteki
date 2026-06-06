describe('Migs Mayfeld, How About A Toast?', function() {
    integration(function(contextRef) {
        it('should deal 1 damage to the defender on attack when not upgraded', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa', 'migs-mayfeld#how-about-a-toast']
                },
                player2: {
                    groundArena: ['gungi#finding-himself'],
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.migsMayfeld);
            context.player1.clickCard(context.gungi);

            expect(context.player2).toBeActivePlayer();
            expect(context.migsMayfeld.damage).toBe(2);
            expect(context.gungi.damage).toBe(3);
            expect(context.p2Base.damage).toBe(0);
            expect(context.wampa.damage).toBe(0);
            expect(context.awing.damage).toBe(0);
            expect(context.p1Base.damage).toBe(0);
        });

        it('should deal 2 damage to the defender on attack when upgraded', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa', { card: 'migs-mayfeld#how-about-a-toast', upgrades: ['armor-of-fortune'] }]
                },
                player2: {
                    groundArena: ['gungi#finding-himself'],
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.migsMayfeld);
            context.player1.clickCard(context.gungi);

            expect(context.player2).toBeActivePlayer();
            expect(context.migsMayfeld.damage).toBe(2);
            expect(context.gungi.damage).toBe(4);
            expect(context.p2Base.damage).toBe(0);
            expect(context.wampa.damage).toBe(0);
            expect(context.awing.damage).toBe(0);
            expect(context.p1Base.damage).toBe(0);
        });

        it('should deal no extra damage to the base on attack when upgraded', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa', { card: 'migs-mayfeld#how-about-a-toast', upgrades: ['armor-of-fortune'] }]
                },
                player2: {
                    groundArena: ['gungi#finding-himself'],
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.migsMayfeld);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.migsMayfeld.damage).toBe(0);
            expect(context.gungi.damage).toBe(0);
            expect(context.p2Base.damage).toBe(2);
            expect(context.wampa.damage).toBe(0);
            expect(context.awing.damage).toBe(0);
            expect(context.p1Base.damage).toBe(0);
        });

        it('should deal no extra damage to the base on attack when not upgraded', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa', 'migs-mayfeld#how-about-a-toast']
                },
                player2: {
                    groundArena: ['gungi#finding-himself'],
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.migsMayfeld);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.migsMayfeld.damage).toBe(0);
            expect(context.gungi.damage).toBe(0);
            expect(context.p2Base.damage).toBe(2);
            expect(context.wampa.damage).toBe(0);
            expect(context.awing.damage).toBe(0);
            expect(context.p1Base.damage).toBe(0);
        });
    });
});