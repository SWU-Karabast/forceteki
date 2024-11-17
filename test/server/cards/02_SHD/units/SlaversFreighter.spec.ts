describe('Slaver\'s Freighter', function() {
    integration(function(contextRef) {
        describe('Slaver\'s Freighter\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['slavers-freighter'], // power: 4
                        groundArena: [
                            { card: 'cell-block-guard', exhausted: true }, // power: 3
                            { card: 'count-dooku#darth-tyranus', exhausted: true }, // power: 5
                            { card: 'reinforcement-walker', exhausted: true } // power: 6
                        ],
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', upgrades: ['fallen-lightsaber', 'electrostaff', 'vaders-lightsaber', 'devotion'], exhausted: true }], // power: 4+3+2+3+1
                        spaceArena: [{ card: 'green-squadron-awing', upgrades: ['resilient'] }] // power: 1+0
                    }
                });
            });

            it('should allow another unit with power less than or equal to the number of upgrades on enemy units to be readied.', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.slaversFreighter);

                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.cellBlockGuard, context.greenSquadronAwing, context.countDooku]);

                context.player1.clickCard(context.cellBlockGuard);

                expect(context.cellBlockGuard.exhausted).toBe(false);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
