describe('Lando Calrissian, Responsible Businessman', function() {
    integration(function(contextRef) {
        describe('Lando Calrissian\'s When Played ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        base: 'chopper-base',
                        hand: ['lando-calrissian#responsible-businessman'],
                        leader: 'hera-syndulla#spectre-two',
                    }
                });
            });

            it('returns up to 2 resources to hand', function () {
                const { context } = contextRef;

                context.player1.setResourceCount(7);

                expect(context.player1.countSpendableResources()).toBe(7);
                context.player1.clickCard(context.landoCalrissian);

                expect(context.player1.countSpendableResources()).toBe(1);
                expect(context.player1).toBeAbleToSelectExactly(context.player1.resources);
                context.player1.clickCard(context.player1.resources.find((card) => card.exhausted));
                context.player1.clickCard(context.player1.resources.find((card) => !card.exhausted));
                context.player1.clickPrompt('Done');

                expect(context.player1.handSize).toBe(2);
                expect(context.player1.countExhaustedResources()).toBe(4);
                expect(context.player1.countSpendableResources()).toBe(1);
            });
        });
    });
});