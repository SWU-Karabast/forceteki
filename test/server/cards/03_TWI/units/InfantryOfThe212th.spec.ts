describe('InfantryOfThe212th', function () {
    integration(function (contextRef) {
        describe('InfantryOfThe212th\'s ability', function () {
            it('should gain Sentinel keyword when Coordinate requirement is met', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['infantry-of-the-212th'],
                        groundArena: ['specforce-soldier', 'specforce-soldier'],
                    },
                    player2: {
                        groundArena: ['specforce-soldier'],
                        leader: { card: 'mace-windu#vaapad-form-master', deployed: true }
                    },
                });
                const { context } = contextRef;

                context.player1.clickCard(context.infantryOfThe212th);
                const doesHaveSentinel = context.infantryOfThe212th.keywords.some((keyword) => keyword.name === 'sentinel');

                expect(doesHaveSentinel).toBe(true);
            });
        });
    });
});