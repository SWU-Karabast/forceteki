describe('Supremacy, Destroy the Resistance', function () {
    integration(function (contextRef) {
        it('Supremacy\'s When Played ability should deal damage to a base equal to half its remaining HP, rounded down', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['supremacy#destroy-the-resistance'],
                    base: 'echo-base',
                },
                player2: {
                    base: 'tarkintown',
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.supremacy);

            // Can target either base
            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            context.player1.clickCard(context.p2Base);

            // Tarkintown has 25 remaining HP: it takes 12 damage (25 / 2, rounded down)
            expect(context.p2Base.damage).toBe(12);
            expect(context.p1Base.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });

        it('Supremacy\'s When Played ability should deal damage based on remaining HP, not max HP', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['supremacy#destroy-the-resistance'],
                },
                player2: {
                    base: { card: 'echo-base', damage: 1 },
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.supremacy);
            context.player1.clickCard(context.p2Base);

            // Echo Base has 29 remaining HP (30 - 1 damage): it takes 14 more damage (29 / 2, rounded down)
            expect(context.p2Base.damage).toBe(15);
            expect(context.player2).toBeActivePlayer();
        });

        it('Supremacy\'s When Played ability should deal half damage when the base has a few HP left', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['supremacy#destroy-the-resistance'],
                },
                player2: {
                    base: { card: 'colossus', damage: 21 },
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.supremacy);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(28);
            expect(context.player2).toBeActivePlayer();
        });

        it('Supremacy\'s When Played ability should deal 0 damage when the base has only 1 HP left', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['supremacy#destroy-the-resistance'],
                },
                player2: {
                    base: { card: 'echo-base', damage: 29 },
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.supremacy);
            context.player1.clickCard(context.p2Base);

            // Echo Base has 1 remaining HP: 1 / 2 rounds down to 0 damage
            expect(context.p2Base.damage).toBe(29);
            expect(context.player2).toBeActivePlayer();
        });

        it('Supremacy\'s When Played ability should be able to target its own base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['supremacy#destroy-the-resistance'],
                    base: 'echo-base',
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.supremacy);
            context.player1.clickCard(context.p1Base);

            // Echo Base has 30 remaining HP: it takes 15 damage
            expect(context.p1Base.damage).toBe(15);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
