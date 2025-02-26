describe('First Order Stormtrooper', function () {
    integration(function (contextRef) {
        it('First Order Stormtrooper\'s on attack and when defeated ability should deal 1 indirect damaged to a player', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['first-order-stormtrooper'],
                },
                player2: {
                    groundArena: [{ card: 'wampa', upgrades: ['shield'] }],
                    spaceArena: ['cartel-spacer'],
                }
            });

            const { context } = contextRef;

            // Player 1 attacks with First Order Stormtrooper
            context.player1.clickCard(context.firstOrderStormtrooper);
            context.player1.clickCard(context.p2Base);

            // Player 1 chooses to deal 1 indirect damage their opponent
            context.player1.clickPrompt('Opponent');

            expect(context.player2).toHavePrompt('Distribute 1 indirect damage among targets');
            expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.cartelSpacer, context.p2Base]);
            expect(context.player2).not.toHaveChooseNoTargetButton();
            context.player2.setDistributeIndirectDamagePromptState(new Map([
                [context.wampa, 1],
            ]));

            expect(context.wampa.damage).toBe(1);
            expect(context.p2Base.damage).toBe(2);

            // Player 2 defeats First Order Stormtrooper
            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.firstOrderStormtrooper);

            expect(context.firstOrderStormtrooper).toBeInZone('discard');

            // Player 1 chooses to deal 1 indirect damage their opponent
            context.player1.clickPrompt('Opponent');

            expect(context.player2).toHavePrompt('Distribute 1 indirect damage among targets');
            expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.cartelSpacer, context.p2Base]);
            expect(context.player2).not.toHaveChooseNoTargetButton();
            context.player2.setDistributeIndirectDamagePromptState(new Map([
                [context.cartelSpacer, 1],
            ]));

            expect(context.cartelSpacer.damage).toBe(1);
        });
    });
});
