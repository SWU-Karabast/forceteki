describe('Devastator, Hunting the Rebellion', function () {
    integration(function (contextRef) {
        it('Devestator\'s ability should allow you to assign indirect damage deal to opponents and deal 4 indirect damage to each opponent when played', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['devastator#hunting-the-rebellion', 'planetary-bombardment'],
                },
                player2: {
                    hand: ['rivals-fall'],
                    groundArena: ['pyke-sentinel'],
                    spaceArena: ['cartel-spacer'],
                }
            });

            const { context } = contextRef;

            // Player 1 plays Devastator
            context.player1.clickCard(context.devastator);

            expect(context.player1).toHavePrompt('Distribute 4 indirect damage among targets');
            expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.cartelSpacer, context.p2Base]);
            expect(context.player1).not.toHaveChooseNoTargetButton();
            context.player1.setDistributeIndirectDamagePromptState(new Map([
                [context.cartelSpacer, 2],
                [context.p2Base, 2],
            ]));

            expect(context.cartelSpacer.damage).toBe(2);
            expect(context.p2Base.damage).toBe(2);

            // Player 2 defeats Devastator
            context.player2.clickCard(context.rivalsFall);
            context.player2.clickCard(context.devastator);

            // Plauer 1 plays Planetary Bombardment and they don't assign indirect damage anymore
            context.player1.clickCard(context.planetaryBombardment);
            context.player1.clickPrompt('Opponent');

            expect(context.player2).toBeAbleToSelectExactly([context.pykeSentinel, context.cartelSpacer, context.p2Base]);
            expect(context.player2).not.toHaveChooseNoTargetButton();
            context.player2.setDistributeIndirectDamagePromptState(new Map([
                [context.p2Base, 8],
            ]));

            expect(context.p2Base.damage).toBe(10);
        });
    });
});
