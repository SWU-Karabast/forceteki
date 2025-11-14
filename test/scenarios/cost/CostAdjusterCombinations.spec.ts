describe('Cost adjuster combinations', function() {
    integration(function (contextRef) {
        describe('Exploit + Starhawk', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hailfire-tank'],
                        spaceArena: ['the-starhawk#prototype-battleship'],
                        groundArena: ['battle-droid', 'clone-trooper']
                    }
                });
            });

            it('should not trigger Starhawk cost adjustment if it is Exploited away', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.hailfireTank);

                context.player1.clickPrompt('Trigger Exploit');
                context.player1.clickCard(context.theStarhawk);
                context.player1.clickCard(context.cloneTrooper);
                context.player1.clickPrompt('Done');

                expect(context.player1.exhaustedResourceCount).toBe(4);
                expect(context.hailfireTank).toBeInZone('groundArena');
            });
        });
    });
});
