describe('Relief Frigate', function () {
    integration(function (contextRef) {
        it('Relief Frigate\'s ability should heal 3 damage from a base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['relief-frigate'],
                    base: { card: 'echo-base', damage: 10 }
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.reliefFrigate);

            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.p1Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(7);
        });

        it('Relief Frigate\'s ability should heal 3 damage from a base (opponent base)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['relief-frigate'],
                    base: { card: 'echo-base', damage: 10 }
                },
                player2: {
                    base: { card: 'jabbas-palace', damage: 10 }
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.reliefFrigate);

            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(7);
        });
    });
});