describe('Choose Sides', function() {
    integration(function(contextRef) {
        describe('Choose Sides\'s event ability', function() {
            beforeEach(function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['choose-sides'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'boba-fett#daimyo', deployed: true },
                        resources: 30,
                    },
                    player2: {
                        hand: ['cantina-bouncer'],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true },
                    }
                });
            });

            it('should exchange control of a friendly and enemy units', () => {
                const { context } = contextRef;

                const reset = () => {
                    context.player1.moveCard(context.chooseSides, 'hand');
                };

                // Scenario 1: Only a friendly non-leader unit is in play
                context.player1.clickCard(context.chooseSides);

                expect(context.player2).toBeActivePlayer();
                expect(context.cartelSpacer.controller).toBe(context.player1Object);

                reset();

                // Scenario 2: Only an enemey non-leader unit is in play
                context.player2.clickCard(context.cantinaBouncer);
                context.player2.clickCard(context.cartelSpacer);

                context.player1.clickCard(context.chooseSides);

                expect(context.player2).toBeActivePlayer();
                expect(context.cantinaBouncer.controller).toBe(context.player2Object);

                reset();

                // Scenario 3: Exchange control of a friendly and enemy non-leader units
                context.player2.passAction();
                context.player1.clickCard(context.cartelSpacer);
                context.player2.passAction();

                context.player1.clickCard(context.chooseSides);

                expect(context.player2).toBeActivePlayer();
                expect(context.cartelSpacer.controller).toBe(context.player2Object);
                expect(context.cantinaBouncer.controller).toBe(context.player1Object);

                reset();
            });
        });
    });
});
