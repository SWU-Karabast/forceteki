describe('Steadfast Battalion', function () {
    integration(function () {
        describe('Steadfast Battalion\'s ability', function () {
            const { context } = contextRef;

            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['steadfast-battalion', 'battlefield-marine'],
                        leader: { card: 'ig88#ruthless-bounty-hunter', deployed: true }
                    },
                    player2: {}
                });
            });

            it('should give a unit +2/+2 if you control a leader unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.steadfastBattalion);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.getPower()).toBe(5);

                context.player2.passAction();
                context.player1.clickCard(context.battlefieldMarine);
                // steadfast battalion: 5 + battlefieldMarine: 3+2 = 10
                expect(context.p2Base.damage).toBe(10);
            });
        });

        describe('Steadfast Battalion\'s ability', function () {
            const { context } = contextRef;

            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['steadfast-battalion', 'battlefield-marine'],
                    },
                    player2: {}
                });
            });

            it('should not give a unit +2/+2 if you do not control a leader unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.steadfastBattalion);
                expect(context.battlefieldMarine.getPower()).toBe(3);

                context.player2.passAction();
                context.player1.clickCard(context.battlefieldMarine);
                // steadfast battalion: 5 + battlefieldMarine: 3 = 8
                expect(context.p2Base.damage).toBe(8);
            });
        });
    });
});
