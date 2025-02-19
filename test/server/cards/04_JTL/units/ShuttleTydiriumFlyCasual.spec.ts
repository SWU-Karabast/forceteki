describe('Shuttle Tyridium, Fly Casual', function () {
    integration(function (contextRef) {
        it('Shuttle Tyridium, Fly Casual\'s ability should discard a card from its deck and if its cost is odd should give an experience token to a unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['shuttle-tydirium#fly-casual'],
                    groundArena: ['battlefield-marine'],
                    deck: ['r2d2#ignoring-protocol', 'restored-arc170'],
                },
                player2: {
                    groundArena: ['atst'],
                }
            });
            const { context } = contextRef;

            // Should give an experience token since the discarded card has an odd cost
            context.player1.clickCard(context.shuttleTydiriumFlyCasual);
            context.player1.clickCard(context.player2.base);
            expect(context.player1).toBeAbleToSelectExactly([context.shuttleTydiriumFlyCasual, context.battlefieldMarine, context.atst]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
            expect(context.r2d2).toBeInZone('discard');
            expect(context.player2).toBeActivePlayer();

            // Restore game board
            context.shuttleTydiriumFlyCasual.exhausted = false;
            context.player2.passAction();
            context.player1.clickCard(context.shuttleTydiriumFlyCasual);
            context.player1.clickCard(context.player2.base);

            // Discarded card cost is not odd so ability should not be triggered
            expect(context.restoredArc170).toBeInZone('discard');
            expect(context.player2).toBeActivePlayer();

            // Empty deck
            context.shuttleTydiriumFlyCasual.exhausted = false;
            context.player2.passAction();

            // No card discarded so ability should not be triggered
            context.player1.clickCard(context.shuttleTydiriumFlyCasual);
            context.player1.clickCard(context.player2.base);
            expect(context.player2).toBeActivePlayer();
        });
    });
});

