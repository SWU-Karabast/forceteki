describe('Power of the Dark Side', function() {
    integration(function(contextRef) {
        describe('Power of the Dark Side\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['power-of-the-dark-side'],
                        leader: { card: 'iden-versio#inferno-squad-commander', deployed: true }
                    },
                    player2: {
                        groundArena: ['fleet-lieutenant'],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                    }
                });
            });

            it('forces opponent to defeat friendly unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.powerOfTheDarkSide);
                expect(context.player2).toBeAbleToSelectExactly([context.fleetLieutenant, context.sabineWren]);

                context.player2.clickCard(context.fleetLieutenant);
                expect(context.fleetLieutenant).toBeInLocation('discard');
                expect(context.sabineWren.deployed).toBeTrue();
            });
        });

        describe('Power of the Dark Side\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['power-of-the-dark-side'],
                        leader: { card: 'iden-versio#inferno-squad-commander', deployed: true }
                    },
                    player2: {
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                    }
                });
            });

            it('forces opponent to defeat a leader unit if nothing else is available', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.powerOfTheDarkSide);
                expect(context.sabineWren.deployed).toBeFalse();
            });
        });
    });
});
