describe('Dryden Vos, Thumb-Spiking the Scale', function() {
    integration(function(contextRef) {
        it('Dryden Vos\' On Attack ability should optionally deal 1 damage to a friendly unit and give it an Experience token', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['dryden-vos#thumbspiking-the-scale', 'wampa'],
                },
                player2: {
                    groundArena: ['atst'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.drydenVos);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.drydenVos]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.wampa);
            expect(context.wampa.damage).toBe(1);
            expect(context.wampa).toHaveExactUpgradeNames(['experience']);

            expect(context.p2Base.damage).toBe(1);
            expect(context.player2).toBeActivePlayer();
        });

        it('Dryden Vos\' On Attack ability should be able to target itself', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['dryden-vos#thumbspiking-the-scale', 'wampa'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.drydenVos);
            context.player1.clickCard(context.p2Base);

            context.player1.clickCard(context.drydenVos);
            expect(context.drydenVos.damage).toBe(1);
            expect(context.drydenVos).toHaveExactUpgradeNames(['experience']);

            // The Experience token raises power to 2 for this attack
            expect(context.p2Base.damage).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });

        it('Dryden Vos\' On Attack ability should not give an Experience token if the unit does not survive', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['dryden-vos#thumbspiking-the-scale', { card: 'wampa', damage: 4 }],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.drydenVos);
            context.player1.clickCard(context.p2Base);

            context.player1.clickCard(context.wampa);
            expect(context.wampa).toBeInZone('discard', context.player1);

            expect(context.p2Base.damage).toBe(1);
            expect(context.player2).toBeActivePlayer();
        });

        it('Dryden Vos\' On Attack ability should be able to be passed', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['dryden-vos#thumbspiking-the-scale', 'wampa'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.drydenVos);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.drydenVos]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickPrompt('Pass');

            expect(context.wampa.damage).toBe(0);
            expect(context.wampa).toHaveExactUpgradeNames([]);
            expect(context.drydenVos).toHaveExactUpgradeNames([]);

            expect(context.p2Base.damage).toBe(1);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
