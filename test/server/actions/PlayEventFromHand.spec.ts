describe('Play event from hand', function() {
    integration(function(contextRef) {
        describe('When an event is played', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['daring-raid', 'repair'],
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['cartel-spacer'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['imperial-interceptor']
                    }
                });
            });

            it('it should end up in discard and resources should be exhausted', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.wampa);

                expect(context.daringRaid).toBeInZone('discard');
                expect(context.player1.exhaustedResourceCount).toBe(1);

                context.player2.passAction();

                // play a second event with an aspect penalty
                context.player1.clickCard(context.repair);
                context.player1.clickCard(context.wampa);

                expect(context.repair).toBeInZone('discard');
                expect(context.player1.exhaustedResourceCount).toBe(4);
            });

            // TODO: add a test of Restock to make sure it can target itself in the discard pile
        });
    });
});
