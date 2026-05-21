describe('Ziton Moj, Sowing Chaos', function () {
    integration(function (contextRef) {
        describe('Ziton Moj\'s ability', function () {
            it('should deal 1 damage to a friendly unit and 1 damage to an enemy unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['ziton-moj#sowing-chaos'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: ['atst', 'yoda#old-master'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.zitonMoj);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.zitonMoj, context.awing]);
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).not.toHaveChooseNothingButton();
                context.player1.clickCard(context.awing);

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.yoda]);
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).not.toHaveChooseNothingButton();
                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.awing.damage).toBe(1);
                expect(context.atst.damage).toBe(1);
            });

            it('should deal 1 damage to a friendly unit when there are no enemy units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['ziton-moj#sowing-chaos'],
                        spaceArena: ['awing']
                    },
                });
                const { context } = contextRef;

                context.player1.clickCard(context.zitonMoj);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.zitonMoj, context.awing]);
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).not.toHaveChooseNothingButton();
                context.player1.clickCard(context.awing);

                expect(context.player2).toBeActivePlayer();
                expect(context.awing.damage).toBe(1);
            });
        });
    });
});
