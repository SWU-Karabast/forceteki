describe('General Draven, Doing What Must Be Done', function () {
    integration(function (contextRef) {
        it('General Draven\'s ability should create a x-wing token', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['general-draven#doing-what-must-be-done'],
                }
            });

            const { context } = contextRef;

            // play general draven and create an x-wing token
            context.player1.clickCard(context.generalDraven);

            expect(context.player2).toBeActivePlayer();

            let xwings = context.player1.findCardsByName('xwing');
            expect(xwings.length).toBe(1);
            expect(xwings).toAllBeInZone('spaceArena');
            expect(xwings.every((tie) => tie.exhausted)).toBeTrue();
            expect(context.player2.getArenaCards().length).toBe(0);

            context.generalDraven.exhausted = false;
            context.player2.passAction();

            // attack with general draven and create an x-wing token
            context.player1.clickCard(context.generalDraven);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            xwings = context.player1.findCardsByName('xwing');
            expect(xwings.length).toBe(2);
        });
    });
});
