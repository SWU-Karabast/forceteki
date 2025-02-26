describe('Devastator, Hunting the Rebellion', function () {
    integration(function (contextRef) {
        it('Devestator\'s ability should allow you to assign indirect damage deal to opponents and deal 4 indirect damage to each opponent when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['devastator#hunting-the-rebellion', 'planetary-bombardment'],
                },
                player2: {
                    hand: ['rivals-fall'],
                    groundArena: ['first-order-stormtrooper'],
                    spaceArena: ['cartel-spacer'],
                }
            });

            const { context } = contextRef;

            // Player 1 plays Devastator
            context.player1.clickCard(context.devastator);

            expect(context.player1).toHavePrompt('Distribute 4 indirect damage among targets');
            expect(context.player1).toBeAbleToSelectExactly([context.firstOrderStormtrooper, context.cartelSpacer, context.p2Base]);
            expect(context.player1).not.toHaveChooseNoTargetButton();
            context.player1.setDistributeIndirectDamagePromptState(new Map([
                [context.cartelSpacer, 2],
                [context.p2Base, 2],
            ]));

            expect(context.cartelSpacer.damage).toBe(2);
            expect(context.p2Base.damage).toBe(2);

            // Player 2 passes
            context.player2.passAction();

            // Player 1 plays Planetary Bombardment
            context.player1.clickCard(context.planetaryBombardment);
            context.player1.clickPrompt('Opponent');

            // Player 1 assigns the indirect damage to the opponent
            expect(context.player1).toHavePrompt('Distribute 12 indirect damage among targets');
            expect(context.player1).toBeAbleToSelectExactly([context.firstOrderStormtrooper, context.cartelSpacer, context.p2Base]);
            expect(context.player1).not.toHaveChooseNoTargetButton();
            context.player1.setDistributeIndirectDamagePromptState(new Map([
                [context.p2Base, 11],
                [context.firstOrderStormtrooper, 1],
            ]));

            expect(context.p2Base.damage).toBe(13);

            // Player 2 chooses to deal 1 indirect damage to their opponent
            context.player2.clickPrompt('Opponent');

            // Player 1 assigns the indirect damage because Devastator's ability doesn't affect player 2
            expect(context.player1).toHavePrompt('Distribute 1 indirect damage among targets');
            expect(context.player1).toBeAbleToSelectExactly([context.devastator, context.p1Base]);
            expect(context.player1).not.toHaveChooseNoTargetButton();
            context.player1.setDistributeIndirectDamagePromptState(new Map([
                [context.devastator, 1],
            ]));

            // Player 2 defeats Devastator
            context.player2.clickCard(context.rivalsFall);
            context.player2.clickCard(context.devastator);

            // Player 1 plays Planetary Bombardment and they don't assign indirect damage anymore
            context.player1.moveCard(context.planetaryBombardment, 'hand');
            context.player1.clickCard(context.planetaryBombardment);
            context.player1.clickPrompt('Opponent');

            // Player 2 assigns the indirect damage because Devastator is not in play anymore
            expect(context.player2).toHavePrompt('Distribute 8 indirect damage among targets');
            expect(context.player2).toBeAbleToSelectExactly([context.cartelSpacer, context.p2Base]);
            expect(context.player2).not.toHaveChooseNoTargetButton();
            context.player2.setDistributeIndirectDamagePromptState(new Map([
                [context.p2Base, 8],
            ]));

            expect(context.p2Base.damage).toBe(21);
        });
    });
});
