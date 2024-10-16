describe('Rival\'s Fall', function() {
    integration(function(contextRef) {
        describe('Rival\'s Fall\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['rivals-fall'],
                        groundArena: ['pyke-sentinel'],
                    },
                    player2: {
                        groundArena: ['atst', 'isb-agent'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'boba-fett#daimyo', deployed: true }
                    }
                });
            });

            it('should defeat a enemy', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.rivalsFall);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.atst, context.isbAgent, context.cartelSpacer, context.bobaFett]);

                context.player1.clickCard(context.atst);
                expect(context.atst).toBeInLocation('discard');
            });

            it('should defeat an ally', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.rivalsFall);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.atst, context.isbAgent, context.cartelSpacer, context.bobaFett]);

                context.player1.clickCard(context.pykeSentinel);
                expect(context.pykeSentinel).toBeInLocation('discard');
            });

            it('should defeat a leader', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.rivalsFall);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.atst, context.isbAgent, context.cartelSpacer, context.bobaFett]);

                context.player1.clickCard(context.bobaFett);
                expect(context.bobaFett.deployed).toBeFalse();
            });
        });
    });
});
