describe('Lothal E-Wing', function() {
    integration(function(contextRef) {
        describe('Lothal E-Wing\'s Restore 2 constant ability', function() {
            it('should grant Restore 2 when an enemy unit is upgraded', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['lothal-ewing'],
                        base: { card: 'echo-base', damage: 6 }
                    },
                    player2: {
                        spaceArena: [{ card: 'tieln-fighter', upgrades: ['experience'] }]
                    }
                });

                const { context } = contextRef;

                // E-Wing attacks the base; enemy unit is upgraded so Restore 2 is active
                context.player1.clickCard(context.lothalEwing);
                context.player1.clickCard(context.p2Base);

                // Base heals 2 damage (6 → 4)
                expect(context.p1Base.damage).toBe(4);
            });

            it('should not grant Restore 2 when only a friendly unit is upgraded', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: [
                            'lothal-ewing',
                            { card: 'tieln-fighter', upgrades: ['experience'] }
                        ],
                        base: { card: 'echo-base', damage: 6 }
                    },
                    player2: {
                        spaceArena: ['awing']
                    }
                });

                const { context } = contextRef;

                // E-Wing attacks the base; only a friendly unit is upgraded so Restore 2 is not active
                context.player1.clickCard(context.lothalEwing);
                context.player1.clickCard(context.p2Base);

                // Base damage is unchanged
                expect(context.p1Base.damage).toBe(6);
            });

            it('should not grant Restore 2 when no units are upgraded', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['lothal-ewing'],
                        base: { card: 'echo-base', damage: 6 }
                    },
                    player2: {
                        spaceArena: ['awing']
                    }
                });

                const { context } = contextRef;

                // E-Wing attacks the base; no units are upgraded so Restore 2 is not active
                context.player1.clickCard(context.lothalEwing);
                context.player1.clickCard(context.p2Base);

                // Base damage is unchanged
                expect(context.p1Base.damage).toBe(6);
            });
        });
    });
});
