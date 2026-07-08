describe('Jar Jar Binks, Bumbling Representative', function() {
    integration(function(contextRef) {
        it('Jar Jar Binks\' ability should discard a card from a deck. No power increase if the cost is less than 6', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['jar-jar-binks#bumbling-representative'],
                    deck: ['wampa', 'atst'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.jarJarBinksBumblingRepresentative);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(1);
            expect(context.wampa).toBeInZone('discard', context.player1);

            expect(context.jarJarBinks.getPower()).toBe(1);
            expect(context.jarJarBinks.getHp()).toBe(5);
        });

        it('Jar Jar Binks\' ability should discard a card from a deck and gets +4/+0 if the cost of discarded card is 6 or more', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['jar-jar-binks#bumbling-representative'],
                    deck: ['atst'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.jarJarBinksBumblingRepresentative);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(5);
            expect(context.atst).toBeInZone('discard', context.player1);

            expect(context.jarJarBinks.getPower()).toBe(1);
            expect(context.jarJarBinks.getHp()).toBe(5);
        });

        it('Jar Jar Binks\' ability should discard a card from a deck and gets +4/+0 if the cost of discarded card is 6 or more (event)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['jar-jar-binks#bumbling-representative'],
                    deck: ['lost-and-forgotten'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.jarJarBinksBumblingRepresentative);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(5);
            expect(context.lostAndForgotten).toBeInZone('discard', context.player1);

            expect(context.jarJarBinks.getPower()).toBe(1);
            expect(context.jarJarBinks.getHp()).toBe(5);
        });

        it('Jar Jar Binks\' ability should be passed if there is no card in deck', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['jar-jar-binks#bumbling-representative'],
                    deck: [],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.jarJarBinksBumblingRepresentative);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(0);
            expect(context.p2Base.damage).toBe(1);

            expect(context.jarJarBinks.getPower()).toBe(1);
            expect(context.jarJarBinks.getHp()).toBe(5);
        });
    });
});
