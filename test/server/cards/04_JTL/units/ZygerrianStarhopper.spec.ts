describe('Zygerrian Starhopper', function() {
    integration(function(contextRef) {
        it('Zygerrian Starhopper\'s ability should deal 2 indirect damage to a player when defeated', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['avenger#hunting-star-destroyer', 'zygerrian-starhopper'],
                },
                player2: {
                    groundArena: [{ card: 'wampa', upgrades: ['shield'] }],
                    hand: ['vanquish'],
                }
            });

            const { context } = contextRef;

            // Player 2 defeats Zygerrian Starhopper
            context.player1.passAction();
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.zygerrianStarhopper);

            expect(context.player2).toHavePrompt('Distribute 2 indirect damage among targets');
            expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.p2Base]);
            expect(context.player2).not.toHaveChooseNoTargetButton();
            context.player2.setDistributeIndirectDamagePromptState(new Map([
                [context.wampa, 1],
                [context.p2Base, 1]
            ]));

            expect(context.player1).toBeActivePlayer();
            expect(context.wampa.damage).toBe(1);
            expect(context.wampa).toHaveExactUpgradeNames(['shield']);
            expect(context.p2Base.damage).toBe(1);
        });
    });
});
