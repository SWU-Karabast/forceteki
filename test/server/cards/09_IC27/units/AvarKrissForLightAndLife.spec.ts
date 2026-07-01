describe('Avar Kriss, For Light and Life', function() {
    integration(function(contextRef) {
        it('Avar Kriss\'s ability should give Raid 1 for each other friendly units (no other friendly units)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['avar-kriss#for-light-and-life'],
                },
                player2: {
                    groundArena: ['sundari-peacekeeper']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.avarKriss);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(1);
        });

        it('Avar Kriss\'s ability should give Raid 1 for each other friendly units (2 other friendly units = Raid 2)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['avar-kriss#for-light-and-life', 'wampa', 'atst'],
                },
                player2: {
                    groundArena: ['sundari-peacekeeper']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.avarKriss);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(3);
        });

        it('Avar Kriss\'s ability should give Raid 1 for each other friendly units (4 other friendly units = Raid 4)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['avar-kriss#for-light-and-life', 'wampa', 'atst'],
                    spaceArena: ['awing', 'x-wing']
                },
                player2: {
                    groundArena: ['sundari-peacekeeper']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.avarKriss);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(5);
        });
    });
});
