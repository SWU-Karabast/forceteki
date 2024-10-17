describe('Benthic Two Tubes', function() {
    integration(function(contextRef) {
        describe('Benthic Two Tubes\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['benthic-two-tubes#partisan-lieutenant', 'battlefield-marine'],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
            });

            it('should give Raid 2 to another Aggression ally', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.benthicTwoTubes);
                context.player1.clickCard(context.p2Base);
                // a wing is automatically chosen
                context.player2.passAction();

                context.player1.clickCard(context.greenSquadronAwing);
                // benthic: 2 + a wing: 3+2
                expect(context.p2Base.damage).toBe(7);
            });
        });
    });
});
