describe('Luke Skywalker, Answering the Call', function () {
    integration(function (contextRef) {
        it('should deal 3 damage to each enemy unit when controlling at least 4 units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['luke-skywalker#answering-the-call'],
                    groundArena: ['porg', 'wampa'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['atst', 'consular-security-force'],
                    spaceArena: ['corellian-freighter']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.lukeSkywalker);

            expect(context.player2).toBeActivePlayer();

            expect(context.atst.damage).toBe(3);
            expect(context.consularSecurityForce.damage).toBe(3);
            expect(context.corellianFreighter.damage).toBe(3);

            expect(context.wampa.damage).toBe(0);
            expect(context.awing.damage).toBe(0);
            expect(context.lukeSkywalker.damage).toBe(0);
            expect(context.porg.damage).toBe(0);
        });

        it('should deal 3 damage to each enemy unit when controlling at least 4 units (Queen Amidala)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['queen-amidala#championing-her-people', 'luke-skywalker#answering-the-call'],
                },
                player2: {
                    groundArena: ['atst', 'consular-security-force'],
                    spaceArena: ['corellian-freighter']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.queenAmidala);

            context.player2.passAction();

            context.player1.clickCard(context.lukeSkywalker);

            expect(context.player2).toBeActivePlayer();

            expect(context.atst.damage).toBe(3);
            expect(context.consularSecurityForce.damage).toBe(3);
            expect(context.corellianFreighter.damage).toBe(3);

            expect(context.lukeSkywalker.damage).toBe(0);
            expect(context.queenAmidala.damage).toBe(0);
        });

        it('should not deal damage when controlling fewer than 4 units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['luke-skywalker#answering-the-call'],
                },
                player2: {
                    groundArena: ['porg', 'wampa', 'rampaging-wampa'],
                    spaceArena: ['corellian-freighter']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.lukeSkywalker);

            expect(context.player2).toBeActivePlayer();

            expect(context.corellianFreighter.damage).toBe(0);
            expect(context.wampa.damage).toBe(0);
            expect(context.rampagingWampa.damage).toBe(0);
            expect(context.lukeSkywalker.damage).toBe(0);
            expect(context.porg.damage).toBe(0);
        });
    });
});
