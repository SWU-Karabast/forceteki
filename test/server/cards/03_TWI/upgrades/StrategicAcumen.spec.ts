describe('Strategic Acumen', function () {
    integration((contextRef) => {
        describe('Strategic Acumen\'s ability', () => {
            beforeEach(() => {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['strategic-acumen', 'alliance-xwing'],
                        groundArena: ['battlefield-marine'],
                    },
                });
            });

            it('should let the player play a unit for 1 less resources', () => {
                const { context } = contextRef;

                context.player1.clickCard(context.strategicAcumen);
                context.player1.clickCard(context.battlefieldMarine);

                context.player2.passAction();


                // alliance-xwing should be played for 1 less resources
                // expect(context.player1.resources).toBe(2);
                // expect(context.battlefieldMarine).toBeInPlay();
            });
        });
    });
});