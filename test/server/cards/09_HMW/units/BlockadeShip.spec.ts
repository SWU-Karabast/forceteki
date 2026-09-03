describe('Blockade Ship', function () {
    integration(function (contextRef) {
        it('should reduce an enemy ground unit\'s power by 1 while it is attacking', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['blockade-ship']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.passAction();
            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.p1Base);

            expect(context.p1Base.damage).toBe(3);
            expect(context.player1).toBeActivePlayer();
        });

        it('should not reduce a friendly ground unit\'s power while attacking', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['blockade-ship'],
                    groundArena: ['wampa']
                },
                player2: {}
            });

            const { context } = contextRef;

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(4);
            expect(context.player2).toBeActivePlayer();
        });

        it('should not reduce an enemy space unit\'s power while attacking', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['blockade-ship']
                },
                player2: {
                    spaceArena: ['alliance-xwing']
                }
            });

            const { context } = contextRef;

            context.player1.passAction();
            context.player2.clickCard(context.allianceXwing);
            context.player2.clickCard(context.blockadeShip);

            // Alliance X-Wing is a space unit, so Blockade Ship's ability doesn't reduce its power
            expect(context.blockadeShip.damage).toBe(2);
            expect(context.player1).toBeActivePlayer();
        });

        it('should not reduce an enemy ground unit\'s power while it is only defending', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['blockade-ship'],
                    groundArena: ['atte-vanguard']
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.atteVanguard);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toBeInZone('discard');
            expect(context.atteVanguard.damage).toBe(3);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
