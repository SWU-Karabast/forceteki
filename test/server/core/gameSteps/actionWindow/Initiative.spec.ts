describe('Claiming initiative', function() {
    integration(function(contextRef) {
        describe('Claiming initiative', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        resources: ['wampa', 'wampa', 'wampa', 'wampa'],
                        hand: ['moment-of-peace'],
                        groundArena: ['del-meeko#providing-overwatch'],
                        base: { card: 'kestro-city', damage: 0 },
                        deck: ['foundling', 'atst', 'cartel-spacer', 'wampa'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        hand: ['scout-bike-pursuer'],
                        deck: ['pyke-sentinel', 'cartel-spacer', 'wampa'],
                        resources: ['smugglers-aid', 'atst', 'atst', 'atst']
                    }
                });
            });

            it('Should make the one with initiative not be able to take any actions and go first in the next phase.', function () {
                const { context } = contextRef;
                // Case 1 after claiming player 2 can play multiple actions before passing
                context.player1.claimInitiative();
                context.player2.clickCard(context.scoutBikePursuer);

                expect(context.scoutBikePursuer).toBeInLocation('ground arena');
                expect(context.player2).toBeActivePlayer();
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(4);

                context.player2.passAction();
                context.player1.clickPrompt('hello world');

            });
        });
    });
});
