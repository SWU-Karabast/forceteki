describe('Rhokai Gunship', function() {
    integration(function(contextRef) {
        describe('Rhokai Gunship\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['rhokai-gunship']
                    },
                    player2: {
                        spaceArena: ['green-squadron-awing'],
                    }
                });
            });

            it('should deal 1 damage to a unit or a base.', function () {
                const { context } = contextRef;
                context.player1.passAction();

                // kill rhokai gunship
                context.player2.clickCard(context.greenSquadronAwing);
                context.player2.clickCard(context.rhokaiGunship);

                // select a unit or a base
                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.battlefieldMarine, context.p1Base, context.p2Base]);
                expect(context.player1).not.toHaveChooseNoTargetButton();
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(1);
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
