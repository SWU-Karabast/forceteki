describe('Coleman Trebor, Jedi Rescuer', function() {
    integration(function(contextRef) {
        it('Coleman Trebor\'s ability should deal 1 damage to enemy base and heal 1 damage from our base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['coleman-trebor#jedi-rescuer'],
                    base: { card: 'tarkintown', damage: 2 }
                },
                player2: {
                    base: { card: 'echo-base', damage: 2 }
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.colemanTrebor);

            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(1);
            expect(context.p2Base.damage).toBe(3);
        });

        it('Coleman Trebor\'s ability should try to deal 1 damage to enemy base, if not succeed, it should not heal 1 damage from our base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['coleman-trebor#jedi-rescuer'],
                    base: { card: 'tarkintown', damage: 2 }
                },
                player2: {
                    hand: ['close-the-shield-gate'],
                    base: { card: 'echo-base', damage: 2 },
                    hasInitiative: true,
                },
            });

            const { context } = contextRef;

            context.player2.clickCard(context.closeTheShieldGate);
            context.player2.clickCard(context.p2Base);

            context.player1.clickCard(context.colemanTrebor);

            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(2);
            expect(context.p2Base.damage).toBe(2);
        });
    });
});
