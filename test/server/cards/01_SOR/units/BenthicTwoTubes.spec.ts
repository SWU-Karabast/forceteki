describe('Benthic Two Tubes', function() {
    integration(function(contextRef) {
        describe('Benthic Two Tubes\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['benthic-two-tubes#partisan-lieutenant', 'battlefield-marine'],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['wampa']
                    },
                });
            });

            it('should give Raid 2 to another Aggression ally', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.benthicTwoTubes);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.greenSquadronAwing);
                expect(context.getChatLogs(2)).toContain('player1 uses Benthic "Two Tubes" to give Raid 2 to Green Squadron A-Wing for this phase');

                context.player2.passAction();

                context.player1.clickCard(context.greenSquadronAwing);
                context.player1.clickCard(context.p2Base);
                // benthic: 2 + a wing: 3+2
                expect(context.p2Base.damage).toBe(7);
            });
        });
    });
});
