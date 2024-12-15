describe('Millennium Falcon, Piece of Junk', function () {
    integration(function (contextRef) {
        describe('Millennium Falcon\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['millennium-falcon#piece-of-junk'],
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should enter ready and on regroup phase should have to pay 1 resource or return unit in hand', function () {
                const { context } = contextRef;

                // play millennium falcon, should be ready
                context.player1.clickCard(context.millenniumFalcon);
                expect(context.player2).toBeActivePlayer();
                context.player2.passAction();

                expect(context.millenniumFalcon.exhausted).toBeFalse();
                expect(context.millenniumFalcon).toBeInZone('spaceArena');

                // attack with falcon
                context.player1.clickCard(context.millenniumFalcon);
                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(3);

                // go to regroup phase
                context.player2.passAction();
                context.player1.passAction();

                // skip ramp
                context.player1.clickPrompt('Done');
                context.player2.clickPrompt('Done');

                // should pay 1 resource or return falcon in hand
                expect(context.player1).toHaveEnabledPromptButtons(['Pay 1 resource', 'Return this unit to her owner\'s hand']);
                context.player1.clickPrompt('Pay 1 resource');

                // we paid 1 resource, unit still in arena and can attack
                expect(context.player1).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(1);

                context.player1.clickCard(context.millenniumFalcon);
                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(6);

                // go to regroup phase
                context.player2.passAction();
                context.player1.passAction();

                // skip ramp
                context.player1.clickPrompt('Done');
                context.player2.clickPrompt('Done');

                // return falcon to hand
                expect(context.player1).toHaveEnabledPromptButtons(['Pay 1 resource', 'Return this unit to her owner\'s hand']);
                context.player1.clickPrompt('Return this unit to her owner\'s hand');

                expect(context.player1).toBeActivePlayer();
                expect(context.millenniumFalcon).toBeInZone('hand');
            });

            // TODO CHECK IF ENTERS READY WHEN PLAYED FROM RESOURCES OR DISCARD OR RESCUED FROM CAPTURE
        });
    });
});
