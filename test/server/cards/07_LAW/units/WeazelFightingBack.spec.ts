describe('Weazel, Fighting Back', function() {
    integration(function(contextRef) {
        describe('Weazel, Fighting Back\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['weazel#fighting-back', 'battlefield-marine'],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['wampa']
                    },
                });
            });

            it('should give Raid 2 to another friendly unit for this phase', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.weazelFightingBack);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.battlefieldMarine]);
                context.player1.clickCard(context.greenSquadronAwing);
                expect(context.getChatLogs(2)).toContain('player1 uses Weazel to give Raid 2 to Green Squadron A-Wing for this phase');
                context.player2.passAction();

                context.player1.clickCard(context.greenSquadronAwing);
                context.player1.clickCard(context.p2Base);
                // weazel: 2 + a wing:5 (3 Base Power + Raid 2)
                expect(context.p2Base.damage).toBe(7);

                // Should lose Raid 2 after the phase ends
                context.moveToNextActionPhase();
                context.player1.clickCard(context.greenSquadronAwing);
                context.player1.clickCard(context.p2Base);
                // A wing: 3 (3 Base Power)
                expect(context.p2Base.damage).toBe(10);
            });
        });
    });
});
