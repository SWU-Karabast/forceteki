describe('Takedown', function() {
    integration(function(contextRef) {
        describe('Takedown\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['takedown', 'supreme-leader-snoke#shadow-ruler'],
                        groundArena: ['pyke-sentinel', { card: 'academy-defense-walker', upgrades: ['entrenched'] }],
                        leader: { card: 'boba-fett#daimyo', deployed: true, damage: 4 }
                    },
                    player2: {
                        groundArena: ['atst', 'isb-agent'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                    }
                });
            });

            it('should defeat a enemy', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.takedown);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.isbAgent, context.cartelSpacer, context.bobaFett, context.sabineWren]);

                context.player1.clickCard(context.isbAgent);
                expect(context.isbAgent).toBeInZone('discard');
            });

            it('should defeat an ally', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.takedown);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.isbAgent, context.cartelSpacer, context.bobaFett, context.sabineWren]);

                context.player1.clickCard(context.pykeSentinel);
                expect(context.pykeSentinel).toBeInZone('discard');
            });

            it('should defeat a leader', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.takedown);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.isbAgent, context.cartelSpacer, context.bobaFett, context.sabineWren]);

                context.player1.clickCard(context.sabineWren);
                expect(context.sabineWren.deployed).toBeFalse();
            });

            it('should defeat a unit with an hp reducing effect', function () {
                const { context } = contextRef;

                // snoke should add at-st on targets
                context.player1.clickCard(context.supremeLeaderSnoke);
                context.player2.passAction();
                context.player1.clickCard(context.takedown);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.atst, context.isbAgent, context.cartelSpacer, context.bobaFett, context.sabineWren]);

                context.player1.clickCard(context.atst);
                expect(context.atst).toBeInZone('discard');
            });
        });
    });
});
