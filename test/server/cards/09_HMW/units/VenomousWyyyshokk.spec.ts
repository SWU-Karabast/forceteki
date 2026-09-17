describe('Venomous Wyyyshokk', function() {
    integration(function(contextRef) {
        it('Venomous Wyyyshokk\'s ability should give a weakness token to a damaged unit when defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['takedown'],
                    groundArena: [{ card: 'wampa', damage: 2 }],
                },
                player2: {
                    groundArena: ['venomous-wyyyshokk', 'atst'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.takedown);
            context.player1.clickCard(context.venomousWyyyshokk);

            expect(context.player2).toBeAbleToSelectExactly([context.wampa]);
            expect(context.player2).toHavePassAbilityButton();

            context.player2.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toHaveExactUpgradeNames(['weakness']);
            expect(context.wampa.getPower()).toBe(3);
            expect(context.wampa.getHp()).toBe(4);
        });

        it('Venomous Wyyyshokk\'s ability should give a weakness token to a damaged unit when defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['no-glory-only-results'],
                    groundArena: [{ card: 'wampa', damage: 2 }],
                },
                player2: {
                    groundArena: ['venomous-wyyyshokk', 'atst'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.noGloryOnlyResults);
            context.player1.clickCard(context.venomousWyyyshokk);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toHaveExactUpgradeNames(['weakness']);
            expect(context.wampa.getPower()).toBe(3);
            expect(context.wampa.getHp()).toBe(4);
        });
    });
});