describe('Slaver\'s Freighter', function() {
    integration(function(contextRef) {
        describe('Slaver\'s Freighter\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['slavers-freighter'],
                        groundArena: [{ card: 'cell-block-guard', exhausted: true }, { card: 'count-dooku#darth-tyranus', exhausted: true }],
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', upgrades: ['fallen-lightsaber', 'electrostaff'], exhausted: true }],
                        spaceArena: [{ card: 'green-squadron-awing', upgrades: ['resilient'] }]
                    }
                });
            });

            it('should allow a friendly unit with power less than or equal to the number of upgrades on enemy units to be readied.', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.slaversFreighter);

                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.cellBlockGuard, context.greenSquadronAwing]);

                context.player1.clickCard(context.cellBlockGuard);

                expect(context.cellBlockGuard.exhausted).toBe(false);

                expect(context.player2).toBeActivePlayer();
            });

            it('should be optional', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.slaversFreighter);

                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.cellBlockGuard, context.greenSquadronAwing]);

                context.player1.clickPrompt('Pass ability');

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
