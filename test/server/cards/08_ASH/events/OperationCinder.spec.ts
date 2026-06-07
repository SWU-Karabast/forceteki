describe('Operation Cinder', function() {
    integration(function(contextRef) {
        it('Operation Cinder\'s ability should deal 5 damage to our base and 5 damage to every unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['operation-cinder'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: [{ card: 'awing', upgrades: ['shield'] }],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    groundArena: ['atst'],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true, upgrades: ['fulcrum'] }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.operationCinder);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst.damage).toBe(5);
            expect(context.p1Base.damage).toBe(5);
            expect(context.grandInquisitor.damage).toBe(5);
            expect(context.sabineWren.damage).toBe(5);
            expect(context.p2Base.damage).toBe(0);
            expect(context.awing).toBeInZone('spaceArena', context.player1);
            expect(context.awing).toHaveExactUpgradeNames([]);
            expect(context.battlefieldMarine).toBeInZone('discard', context.player1);
        });

        it('Operation Cinder\'s ability should deal 5 damage to our base even if there are no units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['operation-cinder'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.operationCinder);

            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(5);
            expect(context.p2Base.damage).toBe(0);
        });
    });
});