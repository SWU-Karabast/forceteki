describe('Gamorrean Guards', function() {
    integration(function(contextRef) {
        describe('Gamorrean Guards\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['strafing-gunship'],
                        groundArena: ['gamorrean-guards'],
                    },
                    player2: {
                        groundArena: ['wampa', 'battlefield-marine'],
                    }
                });
            });

            it('should give it sentinel while he has a Cunning ally', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(4);

                context.player1.clickCard(context.strafingGunship);
                expect(context.strafingGunship.zoneName).toBe('spaceArena');
                expect(context.player2).toBeActivePlayer();

                context.player2.clickCard(context.battlefieldMarine);
                // Gamorrean Guards automatically selected due to sentinel
                expect(context.battlefieldMarine.zoneName).toBe('discard');
                expect(context.player1).toBeActivePlayer();
                expect(context.gamorreanGuards.damage).toBe(3);
            });
        });
    });
});
