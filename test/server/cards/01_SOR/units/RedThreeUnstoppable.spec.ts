describe('Red Three', function () {
    integration(function (contextRef) {
        describe('Red Three\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['death-trooper', 'battlefield-marine'],
                        spaceArena: ['red-three#unstoppable']
                    },
                    player2: {
                        groundArena: ['advanced-recon-commando']
                    }
                });
            });

            it('should give Raid 1 to friendly heroism unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(4);
            });

            it('should not give Raid 1 to friendly non-heroism unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.deathTrooper);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(3);
            });

            it('should not give Raid 1 to Red Three itself', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.redThree);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(3);
            });

            it('should not give Raid 1 to an enemy heroism unit', function () {
                const { context } = contextRef;

                // Pass to player 2 so they can attack
                context.player1.passAction();
                context.player2.clickCard(context.advancedReconCommando);
                context.player2.clickCard(context.p1Base);
                // Advanced Recon Commando has 4 power, should not be increased by Raid
                expect(context.p1Base.damage).toBe(4);
            });
        });
    });
});
