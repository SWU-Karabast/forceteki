describe('Fell the Dragon', function() {
    integration(function(contextRef) {
        describe('Fell the Dragon\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['fell-the-dragon'],
                        groundArena: ['pyke-sentinel', { card: 'scout-bike-pursuer', upgrades: ['academy-training'], damage: 4 }],
                        spaceArena: ['avenger#hunting-star-destroyer']
                    },
                    player2: {
                        groundArena: ['atst', 'isb-agent'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true }
                    }
                });
            });

            it('should defeat an enemy', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.fellTheDragon);
                expect(context.player1).toBeAbleToSelectExactly([context.avenger, context.atst, context.scoutBikePursuer]);

                context.player1.clickCard(context.atst);
                expect(context.atst).toBeInZone('discard');
            });

            it('should defeat an ally', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.fellTheDragon);
                expect(context.player1).toBeAbleToSelectExactly([context.avenger, context.atst, context.scoutBikePursuer]);

                context.player1.clickCard(context.avenger);
                expect(context.avenger).toBeInZone('discard');
            });
        });
    });
});
