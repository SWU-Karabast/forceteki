describe('Eviscerator, Burn Them Away', function() {
    integration(function(contextRef) {
        it('Eviscerator\'s when played ability should give 2 Advantage token to other friendly units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['eviscerator#burn-them-away'],
                    groundArena: ['wampa', 'porg'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['sundari-peacekeeper'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.eviscerator);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toHaveExactUpgradeNames(['advantage', 'advantage']);
            expect(context.awing).toHaveExactUpgradeNames(['advantage', 'advantage']);
            expect(context.porg).toHaveExactUpgradeNames(['advantage', 'advantage']);
            expect(context.sundariPeacekeeper).toHaveExactUpgradeNames([]);
            expect(context.eviscerator).toHaveExactUpgradeNames([]);
        });

        it('Eviscerator\'s on attack ability should give 2 Advantage token to other friendly units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: [],
                    groundArena: ['wampa', 'porg'],
                    spaceArena: ['awing', 'eviscerator#burn-them-away']
                },
                player2: {
                    groundArena: ['sundari-peacekeeper'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.eviscerator);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toHaveExactUpgradeNames(['advantage', 'advantage']);
            expect(context.awing).toHaveExactUpgradeNames(['advantage', 'advantage']);
            expect(context.porg).toHaveExactUpgradeNames(['advantage', 'advantage']);
            expect(context.sundariPeacekeeper).toHaveExactUpgradeNames([]);
            expect(context.eviscerator).toHaveExactUpgradeNames([]);
        });

        it('Eviscerator\'s constant ability should make friendly Advantage tokens lose all abilities', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: [],
                    groundArena: ['wampa', 'porg'],
                    spaceArena: [{ card: 'awing', upgrades: ['advantage', 'advantage'] }, 'eviscerator#burn-them-away']
                },
                player2: {
                    groundArena: [{ card: 'sundari-peacekeeper', upgrades: ['advantage'] }],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.awing);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.awing).toHaveExactUpgradeNames(['advantage', 'advantage']);
            expect(context.p2Base.damage).toBe(4);

            context.player2.clickCard(context.sundariPeacekeeper);
            context.player2.clickCard(context.p1Base);

            expect(context.player1).toBeActivePlayer();
            expect(context.sundariPeacekeeper).toHaveExactUpgradeNames([]);
        });
    });
});
