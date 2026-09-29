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
            expect(context.getChatLogs(3)).toEqual([
                'player1 plays Coleman Trebor',
                'player1 uses Coleman Trebor to deal 1 damage to player2\'s base',
                'player1 uses Coleman Trebor to heal 1 damage from their base'
            ]);
        });

        it('Coleman Trebor\'s ability should not heal when the damage it would deal is prevented', async function () {
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

            // no heal message: no damage was dealt, so there is nothing to heal for
            expect(context.getChatLogs(3)).toEqual([
                'player1 plays Coleman Trebor',
                'player1 uses Coleman Trebor to deal 1 damage to player2\'s base',
                'player2 uses Echo Base\'s gained ability from Close the Shield Gate to prevent all damage to their base'
            ]);
        });
    });
});
