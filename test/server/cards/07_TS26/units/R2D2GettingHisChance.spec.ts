describe('R2-D2, Getting His Chance', function() {
    integration(function(contextRef) {
        it('should deal 2 damage to a base and that base\'s controller draws a card', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['r2d2#getting-his-chance'],
                },
                player2: {
                    hand: [],
                    deck: ['wampa', 'atst'],
                    base: { card: 'echo-base', damage: 3 }
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.r2d2);

            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(5);
            expect(context.player2.hand.length).toBe(1);
        });

        it('can be skipped', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['r2d2#getting-his-chance'],
                },
                player2: {
                    hand: [],
                    deck: ['wampa', 'atst'],
                    base: { card: 'echo-base', damage: 3 }
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.r2d2);

            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickPrompt('Pass');

            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(0);
            expect(context.p2Base.damage).toBe(3);
            expect(context.player1.hand.length).toBe(0);
            expect(context.player2.hand.length).toBe(0);
        });

        it('should allow targeting your own base and you draw a card', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['r2d2#getting-his-chance'],
                    deck: ['wampa', 'atst'],
                    base: { card: 'jabbas-palace', damage: 2 }
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.r2d2);

            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            context.player1.clickCard(context.p1Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(4);
            expect(context.player1.hand.length).toBe(1);
            expect(context.wampa).toBeInZone('hand', context.player1);
        });

        it('should not draw a card if damage is prevented', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['r2d2#getting-his-chance'],
                    deck: ['wampa', 'atst']
                },
                player2: {
                    hand: ['close-the-shield-gate'],
                    deck: ['battlefield-marine'],
                    base: { card: 'echo-base', damage: 2 },
                    hasInitiative: true
                },
            });

            const { context } = contextRef;

            context.player2.clickCard(context.closeTheShieldGate);
            context.player2.clickCard(context.p2Base);

            context.player1.clickCard(context.r2d2);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(2);
            expect(context.player2.hand.length).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
